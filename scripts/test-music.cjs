const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const moduleUnderTest = { exports: {} };
const file = path.resolve(__dirname, '../src/game/RecordedMusic.ts');
const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
vm.runInNewContext(js, { module: moduleUnderTest, exports: moduleUnderTest.exports }, { filename: file });
const { RecordedMusic, selectRecordedMusic: select } = moduleUnderTest.exports;

const playing = { state: 'PLAYING', world: 2 };
assert.equal(select(playing), 'volcano');
assert.equal(select({ ...playing, world: 1 }), 'forest');
assert.equal(select({ ...playing, world: 3 }), null);
assert.equal(select({ state: 'TUTORIAL', world: 1 }), 'forest');
for (const state of ['WORLD_MAP', 'WORLD_MAP_TRANSITION']) assert.equal(select({ state, world: 2 }), 'map');
assert.equal(select({ state: 'LEVEL_TRANSITION', world: 2 }), 'victory');
for (const state of ['START_MENU', 'SETTINGS', 'GAMEOVER', 'WORLD1_INTERLUDE', 'WORLD2_INTERLUDE', 'WORLD3_ESCAPE_CUTSCENE', 'ENDING_CUTSCENE']) {
  assert.equal(select({ state, world: 2, boss: { type: 'BLAZE_KING', health: 150, introPlayed: true } }), null);
}
for (const [type, expected] of [['LIVING_VOLCANO', 'smallBoss'], ['BLAZE_KING', 'bigBoss'], ['GOLEM', 'bigBoss'], ['INK_COLOSSUS', 'bigBoss']]) {
  const boss = { type, health: 100, introPlayed: true };
  for (const state of ['PLAYING', 'BOSS_GUIDE', 'BOSS_VS_CUTSCENE']) assert.equal(select({ ...playing, state, boss }), expected);
  assert.equal(select({ ...playing, boss: { ...boss, health: 0 } }), 'volcano');
  assert.equal(select({ ...playing, boss: { ...boss, introPlayed: false } }), type === 'INK_COLOSSUS' ? 'bigBoss' : 'volcano');
}
for (const [kind, expected] of [['BEAR', 'smallBoss'], ['GOLEM', 'bigBoss']]) {
  for (const phase of ['ENTERING', 'ARRIVAL', 'DIALOGUE', 'FIGHT']) assert.equal(select({ state: 'PLAYING', world: 1, room: { kind, phase } }), expected);
  for (const phase of ['OUTSIDE', 'CLEAR']) assert.equal(select({ state: 'PLAYING', world: 1, room: { kind, phase } }), 'forest');
}
for (const phase of ['INTRO', 'MOUNT', 'POLE_RUN', 'RETURN_LEFT', 'STAIR_ASSAULT', 'THROW_BACK']) assert.equal(select({ state: 'PLAYING', world: 1, duff: { phase, health: 4 } }), 'smallBoss');
assert.equal(select({ state: 'PLAYING', world: 1, duff: { phase: 'WAITING', health: 4 } }), 'forest');
assert.equal(select({ state: 'PLAYING', world: 1, duff: { phase: 'ESCAPING', health: 0 } }), 'forest');

class FakeAudio {
  constructor(url) { this.src = url; this.paused = true; this.calls = 0; this.blocked = false; this.listeners = {}; this.unlocked = false; this.gesture = true; }
  set src(url) { this.url = url; this.currentTime = 0; this.ended = false; }
  get src() { return this.url; }
  addEventListener(event, fn) { this.listeners[event] = fn; }
  removeEventListener(event) { delete this.listeners[event]; }
  play() {
    this.calls++;
    if (this.blocked || (!this.gesture && !this.unlocked)) return Promise.reject(new Error('Autoplay blocked'));
    this.unlocked = true;
    this.listeners.loadedmetadata?.();
    if (this.pendingNext) { const pending = this.pendingNext; this.pendingNext = null; return pending; }
    this.paused = false; this.ended = false; return Promise.resolve();
  }
  pause() { this.paused = true; }
}
const urls = { forest: 'Grasslands.mp3', volcano: 'Volcano _land.mp3', smallBoss: 'small_boss.mp3', bigBoss: 'Big_Boss.mp3', map: 'Map.mp3', victory: 'Winning.MP3' };
for (const url of Object.values(urls)) assert(fs.statSync(path.resolve(__dirname, '..', url)).size > 0);
(async () => {
  const created = [];
  const music = new RecordedMusic(urls, url => { const audio = new FakeAudio(url); created.push(audio); return audio; });
  const player = music.player;
  music.setTrack('volcano'); player.currentTime = 25;
  for (let i = 0; i < 600; i++) { assert.equal(music.setTrack('volcano'), false); music.resume(); }
  assert.equal(player.calls, 1); assert.equal(player.currentTime, 25);
  player.gesture = false; // Walking into the arena is not a new browser gesture.
  music.setTrack('smallBoss'); await Promise.resolve();
  assert.equal(player.src, urls.smallBoss); assert.equal(player.loop, true); assert(!player.paused);
  assert.equal(created.length, 1, 'Switches must reuse the already-unlocked media element');
  player.currentTime = 40;
  for (let i = 0; i < 600; i++) music.setTrack('smallBoss');
  assert.equal(player.currentTime, 40, 'Boss rounds must not restart the track');
  music.setTrack('volcano'); assert.equal(player.currentTime, 25, 'Resume exploration');
  music.setTrack('smallBoss'); assert.equal(player.currentTime, 0, 'New fight starts from the beginning');
  music.setTrack('bigBoss'); assert.equal(player.src, urls.bigBoss);
  music.setTrack('victory'); assert.equal(player.loop, false);
  const victoryCalls = player.calls;
  player.ended = true; player.paused = true; player.currentTime = 3;
  for (let i = 0; i < 100; i++) { music.setTrack('victory'); music.resume(); }
  assert.equal(player.calls, victoryCalls, 'Winning plays once, even with repeated input');
  music.setTrack('map'); music.setTrack('victory'); assert.equal(player.calls, victoryCalls + 2); assert.equal(player.currentTime, 0);
  music.setTrack(null); assert(player.paused);
  player.blocked = true; music.setTrack('bigBoss'); await Promise.resolve(); await Promise.resolve();
  assert(player.paused); assert(music.playbackError, 'Surface blocked playback instead of silently losing music');
  player.blocked = false; music.resume(); await Promise.resolve(); assert(!player.paused); assert.equal(music.playbackError, null);

  // Reproduce all small-boss entrances after browser activation has expired.
  for (const context of [
    { state: 'PLAYING', world: 1, duff: { phase: 'INTRO', health: 4 } },
    { state: 'PLAYING', world: 1, room: { kind: 'BEAR', phase: 'FIGHT' } },
    { state: 'PLAYING', world: 2, boss: { type: 'LIVING_VOLCANO', health: 120, introPlayed: true } }
  ]) {
    music.setTrack(context.world === 1 ? 'forest' : 'volcano');
    music.setTrack(select(context)); await Promise.resolve();
    assert.equal(player.src, urls.smallBoss); assert(!player.paused); assert.equal(music.playbackError, null);
  }
  // An aborted previous track must not mark the currently playing track as failed.
  let rejectOld;
  player.pendingNext = new Promise((_, reject) => { rejectOld = reject; });
  music.setTrack('forest'); music.setTrack('smallBoss');
  rejectOld(new Error('Old request aborted')); await Promise.resolve(); await Promise.resolve();
  assert.equal(music.playbackError, null); assert(!player.paused);
  music.dispose(); assert(player.paused); music.resume(); music.setTrack('forest'); assert(player.paused);
  console.log('PASS: all six assets and music routes; one unlocked player across all small bosses; loop/position preservation; no frame restarts; once-only victory; visible errors/retry; stale request protection and cleanup.');
})().catch(error => { console.error(error); process.exitCode = 1; });
