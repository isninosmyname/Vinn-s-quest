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
  constructor(url) { this.src = url; this.paused = true; this.ended = false; this.currentTime = 0; this.calls = 0; this.blocked = false; }
  play() { this.calls++; if (this.blocked) return Promise.reject(new Error('Autoplay blocked')); this.paused = false; this.ended = false; return Promise.resolve(); }
  pause() { this.paused = true; }
}
const urls = { forest: 'Grasslands.mp3', volcano: 'Volcano _land.mp3', smallBoss: 'small_boss.mp3', bigBoss: 'Big_Boss.mp3', map: 'Map.mp3', victory: 'Winning.MP3' };
for (const url of Object.values(urls)) assert(fs.statSync(path.resolve(__dirname, '..', url)).size > 0);
const music = new RecordedMusic(urls, url => new FakeAudio(url));
for (const [key, audio] of Object.entries(music.tracks)) assert.equal(audio.loop, key !== 'victory');
music.setTrack('volcano'); music.tracks.volcano.currentTime = 25;
for (let i = 0; i < 600; i++) { assert.equal(music.setTrack('volcano'), false); music.resume(); }
assert.equal(music.tracks.volcano.calls, 1); assert.equal(music.tracks.volcano.currentTime, 25);
music.setTrack('smallBoss'); assert(music.tracks.volcano.paused); assert.equal(music.tracks.smallBoss.calls, 1);
music.tracks.smallBoss.currentTime = 40;
for (let i = 0; i < 600; i++) music.setTrack('smallBoss');
assert.equal(music.tracks.smallBoss.currentTime, 40, 'Boss rounds must not restart the track');
music.setTrack('volcano'); assert.equal(music.tracks.volcano.currentTime, 25, 'Resume exploration');
music.setTrack('smallBoss'); assert.equal(music.tracks.smallBoss.currentTime, 0, 'A new fight starts at the beginning');
music.setTrack('bigBoss'); assert(music.tracks.smallBoss.paused);
music.setTrack('victory');
const victory = music.tracks.victory; victory.ended = true; victory.paused = true; victory.currentTime = 3;
for (let i = 0; i < 100; i++) { music.setTrack('victory'); music.resume(); }
assert.equal(victory.calls, 1, 'Winning music plays once, even with repeated input');
music.setTrack('map'); music.setTrack('victory'); assert.equal(victory.calls, 2); assert.equal(victory.currentTime, 0);
music.setTrack(null); assert(Object.values(music.tracks).every(a => a.paused));
music.tracks.bigBoss.blocked = true; music.setTrack('bigBoss'); assert(music.tracks.bigBoss.paused);
music.tracks.bigBoss.blocked = false; music.resume(); assert(!music.tracks.bigBoss.paused);
assert.equal(Object.values(music.tracks).filter(a => !a.paused).length, 1);
music.dispose(); assert(Object.values(music.tracks).every(a => a.paused));
console.log('PASS: all six music files; exploration/boss/menu/cutscene routing; looping; no overlap or frame/phase restarts; once-only victory; autoplay retry and cleanup.');
