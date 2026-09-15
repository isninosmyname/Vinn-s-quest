const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const cache = new Map();
function source(name) {
  const file = path.resolve(__dirname, '../src/game', name + '.ts');
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} }; cache.set(file, module);
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(js, { module, exports: module.exports, require: id => source(id.replace('./', '')), Math, Date, console }, { filename: file });
  return module.exports;
}
const { Vinn } = source('Vinn');
const { Enemy } = source('Enemy');
const { DuffBoss } = source('DuffBoss');
const { FOREST_LEVELS, DUFF_ARENA } = source('ForestWorld');
const { World1Map } = source('WorldMap');
const ground = [{ x: 0, y: 460, w: 20000 }];
const hero = new Vinn(100, 430);
for (const player of [hero, new Vinn(150, 430, '#ff00ff', 'SPIKY', 'Jhon')]) {
  assert.equal(player.maxHealth, 26);
  assert.equal(player.health, 26);
  player.takeDamage(3); assert.equal(player.health, 23);
  player.reset(100, 430); assert.equal(player.health, 26);
}
hero.collectDoubleJump();
for (let i = 0; i < 3000; i++) hero.update(1 / 60, {}, 19000, ground);
assert(hero.hasDoubleJump && hero.doubleJumpTimer < 11);
hero.collectDoubleJump(); assert.equal(hero.doubleJumpTimer, 60);
for (let i = 0; i < 3601; i++) hero.update(1 / 60, {}, 19000, ground);
assert.equal(hero.hasDoubleJump, false);
hero.update(1 / 60, { c: true, d: true }, 19000, ground);
assert(hero.isCrouching && hero.vx > 0 && hero.vx < 4.5);
assert.equal(hero.bounds.bottom - hero.bounds.top, 38);
hero.update(1 / 60, {}, 19000, ground); assert.equal(hero.bounds.bottom - hero.bounds.top, 89);

// Run the ground route through every level with ordinary jumps only.
assert.equal(FOREST_LEVELS.length, 8);
for (const [i, level] of FOREST_LEVELS.entries()) {
  const p = new Vinn(100, 430); const floor = level.platforms.filter(p => p.y === 460);
  let frames = 0;
  while (p.x < level.length - 100 && frames++ < 20000) {
    const platform = floor.find(q => p.x >= q.x && p.x <= q.x + q.w);
    if (p.onGround && platform && platform.x + platform.w - p.x < 45 && platform.x + platform.w < level.length - 100) p.jump();
    p.update(1 / 60, { d: true }, level.length - 50, floor);
  }
  assert(p.x >= level.length - 100 && p.health === p.maxHealth, 'Ordinary-jump route failed in level ' + (i + 1));
  assert(level.enemies.length >= 10);
}
assert(FOREST_LEVELS[2].enemies.some(e => e.type === 'BEAR'));
assert(FOREST_LEVELS[3].enemies.every(e => e.type === 'TECH'));
assert.equal(FOREST_LEVELS[7].bossType, 'GOLEM');

const wolf = new Enemy(500, 430, 'WOLF'); wolf.update(1 / 60, 100, ground); assert(wolf.hidden);
wolf.update(1 / 60, 320, ground); assert(!wolf.hidden);
const bear = new Enemy(700, 430, 'BEAR'); assert.equal(bear.health, 16);
bear.health = 0; const bx = bear.x; bear.update(1, 0, ground); assert.equal(bear.x, bx);

const duff = new DuffBoss(DUFF_ARENA); const p = new Vinn(DUFF_ARENA + 100, 430);
duff.update(1 / 60, [p], false); assert.equal(duff.phase, 'INTRO');
duff.startBattle(); duff.update(1.5, [p], false); assert.equal(duff.phase, 'POLE_RUN');
// Standing collides with the high bar; grounded crouching clears it.
p.x = duff.poles[0].x + 40; duff.update(0, [p], false); assert.equal(p.health, p.maxHealth - 1);
p.isHit = false; p.isCrouching = true; duff.update(0, [p], false); assert.equal(p.health, p.maxHealth - 1);
p.x = duff.poles[1].x + 40; duff.update(0, [p], false); assert.equal(p.health, p.maxHealth - 2);
p.isHit = false; p.isCrouching = false; p.y = 290; duff.update(0, [p], false); assert.equal(p.health, p.maxHealth - 2);
p.y = 430;
for (let round = 0; round < 4; round++) {
  p.x = duff.leftButtonX; duff.update(0, [p], true); assert.equal(duff.phase, 'POLE_RUN');
  p.x = duff.rightButtonX; duff.update(0, [p], true); assert.equal(duff.phase, 'RETURN_LEFT');
  duff.update(0, [p], false);
  p.x = duff.leftButtonX; duff.update(0, [p], true); assert.equal(duff.phase, 'POLES_STOPPED');
  duff.update(1, [p], false); assert.equal(duff.phase, 'STAIR_ASSAULT');
  assert.equal(duff.platforms.length, 3);
  // A floor-level sword attack cannot hit the raised boss.
  p.x = duff.x; p.y = 430; p.state = 'ATTACKING'; duff.update(0, [p], false); assert.equal(duff.health, 4 - round);
  p.y = duff.y; duff.update(0, [p], false); assert.equal(duff.health, 3 - round);
  if (round < 3) { assert.equal(duff.phase, 'THROW_BACK'); duff.update(1.3, [p], false); assert.equal(duff.phase, 'POLE_RUN'); assert.equal(p.y, 430); }
}
assert.equal(duff.phase, 'ESCAPE_DIALOGUE');
assert(duff.frozen); duff.update(3, [p], false); assert.equal(duff.phase, 'ESCAPE_DIALOGUE');
duff.advanceDialogue(); assert.equal(duff.phase, 'ESCAPING');
duff.update(1.6, [p], false); assert.equal(duff.phase, 'DEFEATED');
const map = new World1Map(); map.open(4, 4); map.moveSelection(1); assert.equal(map.selectedLevel, 4);
map.open(5, 5, [1, 2, 3, 4]); assert(map.completed.includes(4)); assert.equal(map.selectedLevel, 5);
console.log('PASS: 8 traversable routes, power-up renewal/expiry, crouch clearance, wildlife, map locks and all four Duff rounds.');

const { ForestEncounter } = source('ForestEncounter');
for (const kind of ['BEAR', 'GOLEM']) {
  const room = new ForestEncounter(kind, 7200), hero = new Vinn(6100, 430);
  hero.onGround = true;
  assert.equal(room.bear, null); assert.equal(room.boss, null);
  assert(!room.canEnter([hero])); hero.x = room.doorX - 50; assert(room.canEnter([hero]));
  room.enter(); room.advanceDialogue(); assert.equal(room.phase, 'ENTERING');
  room.updateScene(0.46); assert(room.inside && room.entryReady);
  room.updateScene(0.45); hero.x = room.start + 140;
  assert.equal(room.phase, kind === 'BEAR' ? 'FIGHT' : 'ARRIVAL');
  if (kind === 'GOLEM') {
    room.updateScene(0.75); assert(room.boss.y > -220 && room.boss.y < 460);
    room.advanceDialogue(); assert.equal(room.dialogueIndex, 0); assert.equal(room.boss.y, 460);
    assert.equal(room.dialogue.en, 'This the knight that crushed you?');
    room.advanceDialogue(); assert.equal(room.dialogue.speaker, 'Duff');
    room.advanceDialogue(); assert.equal(room.dialogue.en, 'Well we have the knight. you ready?');
    room.advanceDialogue(); assert.equal(room.phase, 'FIGHT'); assert.equal(room.boss.state, 'FLY_UP');
    room.boss.state = 'FALLING'; room.boss.y = 449;
    room.boss.update(1 / 60, hero.x); assert(room.boss.landingReady);
    room.updateFight(0, [hero]); assert.equal(room.hazards.length, 2);
    assert(room.hazards[0].vx < 0 && room.hazards[1].vx > 0);
    room.updateFight(0, [hero]); assert.equal(room.hazards.length, 2, 'No duplicate landing waves');
    room.hazards = [];
    for (let i = 0; i < 195; i++) { room.updateScene(1 / 60); room.updateFight(1 / 60, [hero]); }
    assert(room.hazards.some(h => h.kind === 'SWORD'), 'Duff must throw swords during the fight');
    room.boss.health = 0;
  } else {
    room.bear.stompCooldown = 0;
    room.bear.update(1 / 60, room.bear.x - 250, room.platforms);
    assert.equal(room.bear.attackKind, 'STOMP'); assert(!room.bear.stompReady);
    for (let i = 0; i < 70; i++) room.bear.update(1 / 60, room.bear.x - 250, room.platforms);
    assert(room.bear.stompReady);
    room.updateFight(0, [hero]); assert.equal(room.hazards.length, 1);
    room.updateFight(0, [hero]); assert.equal(room.hazards.length, 1, 'Only one wave per stomp');
    room.bear.health = 0;
  }
  room.updateFight(0, [hero]); assert(room.cleared); assert.equal(room.hazards.length, 0);
}
// Jump clearance and swept collision, including two-player damage tracking.
const arena = new ForestEncounter('BEAR', 7200); arena.enter(); arena.updateScene(1);
const grounded = new Vinn(6500, 430), jumping = new Vinn(6500, 300);
arena.addWaves(6400, false, 1); arena.updateFight(0.5, [grounded, jumping]);
assert.equal(grounded.health, grounded.maxHealth - 2); assert.equal(jumping.health, jumping.maxHealth);
arena.updateFight(0.01, [grounded, jumping]); assert.equal(grounded.health, grounded.maxHealth - 2);
console.log('PASS: real room entry, bear stomp telegraph, two landing waves, jump clearance, Duff sword support, exit gates and window escape.');

const { Boss } = source('Boss');
for (const fps of [30, 60, 120]) {
  const golem = new Boss(6500, -200, 'GOLEM'); golem.state = 'FALLING';
  let frames = 0;
  while (golem.state === 'FALLING' && frames < fps * 2) { golem.update(1 / fps, 6400); frames++; }
  assert(frames / fps >= 0.9 && frames / fps <= 0.95, 'Golem descent should take about 0.92 seconds');
  assert.equal(golem.y, 460); assert.equal(golem.state, 'STUNNED'); assert(golem.landingReady);
  golem.landingReady = false; golem.update(1 / fps, 6400); assert(!golem.landingReady);
}
console.log('PASS: slower Golem descent at 30/60/120 FPS; landing stun and shockwave signal preserved.');

// Health recovery: full boss-entry refill, timed rest, interruption and caps.
for (const fps of [30, 60, 120]) {
  const p = new Vinn(100, 430); p.health = 10;
  for (let i = 0; i < 5 * fps; i++) p.recover(1 / fps, true);
  assert.equal(p.health, 10, 'Rest delay must not heal early');
  for (let i = 0; i < 3 * fps; i++) p.recover(1 / fps, true);
  assert.equal(p.health, 13);
  p.recover(1, false); assert.equal(p.restTimer, 0);
  p.recover(4, true); assert.equal(p.health, 13);
  p.takeDamage(2); assert.equal(p.restTimer, 0);
  p.recover(30, true); assert.equal(p.health, 11, 'No healing while hit');
  p.isHit = false; p.recover(100, true); assert.equal(p.health, p.maxHealth);
  p.health = 0; p.recover(100, true); assert.equal(p.health, 0, 'Waiting does not revive a defeated player');
  p.restoreHealth(); assert.equal(p.health, 26); assert(!p.isHit);
}
const entryBoss = new DuffBoss(1000), tired = new Vinn(1100, 430), fallen = new Vinn(1150, 430);
tired.health = 2; fallen.health = 0;
entryBoss.update(0, [tired, fallen], false); assert.equal(tired.health, 26); assert.equal(fallen.health, 26);
tired.health = 9; entryBoss.startBattle(); entryBoss.update(1.5, [tired, fallen], false);
assert.equal(tired.health, 9, 'Do not refill health every boss phase');

const { VOLCANO_LEVELS, VOLCANO_NAMES, VOLCANO_NAMES_ES } = source('VolcanoWorld');
assert.equal(VOLCANO_LEVELS.length, 10); assert.equal(VOLCANO_NAMES.length, 10); assert.equal(VOLCANO_NAMES_ES.length, 10);
assert.equal(new Set(VOLCANO_LEVELS.map(l => JSON.stringify(l.platforms))).size, 10);
for (const [i, level] of VOLCANO_LEVELS.entries()) {
  const p = new Vinn(100, 430), floor = level.platforms.filter(p => p.y === 460);
  let frames = 0;
  while (p.x < level.length - 100 && frames++ < 20000) {
    const platform = floor.find(q => p.x >= q.x && p.x <= q.x + q.w);
    if (p.onGround && platform && platform.x + platform.w - p.x < 45 && platform.x + platform.w < level.length - 100) p.jump();
    p.update(1 / 60, { d: true }, level.length - 50, floor);
  }
  assert(p.x >= level.length - 100 && p.health === p.maxHealth, 'Volcano route ' + (i + 1));
  assert(level.enemies.every(e => floor.some(p => e.x >= p.x && e.x <= p.x + p.w)));
}
assert.equal(VOLCANO_LEVELS.filter(l => l.isBoss).length, 2);
assert.equal(VOLCANO_LEVELS[4].bossType, 'LIVING_VOLCANO');
assert.equal(VOLCANO_LEVELS[9].bossType, 'BLAZE_KING');
const volcanoMap = new World1Map(2); volcanoMap.open(10, 10, [1, 2]);
assert.equal(volcanoMap.getSelectedNode().level, 10); volcanoMap.moveSelection(1); assert.equal(volcanoMap.selectedLevel, 10);
volcanoMap.open(1, 3); volcanoMap.selectAt(70 + 9 * 86 + 30, 85); assert.equal(volcanoMap.selectedLevel, 1);
volcanoMap.selectAt(70 + 2 * 86 + 30, 85); assert.equal(volcanoMap.selectedLevel, 3);
const { WorldMapTransition } = source('WorldMapTransition');
const transition = new WorldMapTransition([1, 2, 3, 4, 5, 6, 7, 8]);
assert.equal(transition.phase, 'PLANT'); transition.update(1.2); assert.equal(transition.phase, 'RUN');
transition.update(1.3); assert(transition.heroX > 1000); assert.equal(transition.phase, 'FUSE');
transition.update(0.6); assert.equal(transition.phase, 'EXPLODE');
transition.update(1.2); assert.equal(transition.phase, 'REVEAL'); assert.equal(transition.volcano.levelCount, 10);
assert(transition.update(1.6));
console.log('PASS: idle healing and boss refill; ten distinct traversable Volcano levels; map locks; plant/run/explosion/Volcano reveal.');

// Background volcano: dormant entry, upward arcs, warning, crouch-safe beam,
// exposed-core damage, repeat cycles, defeat cleanup, and Blaze's repeating assist.
const { LivingVolcano } = source('LivingVolcano');
const { VOLCANO_GUIDES, bossName } = source('VolcanoText');
for (const lang of ['en', 'es']) {
  for (const type of ['LIVING_VOLCANO', 'BLAZE_KING']) {
    assert.equal(VOLCANO_GUIDES[lang][type].length, 3);
    assert(VOLCANO_GUIDES[lang][type].every(p => p.title && p.text));
    assert(!bossName(type, lang).includes('_'));
  }
}
for (const fps of [30, 60, 120]) {
  const dt = 1 / fps;
  const mountain = new Boss(4300, 460, 'LIVING_VOLCANO');
  assert.equal(mountain.maxHealth, 120);
  mountain.update(20, 4000); assert.equal(mountain.volcano.phase, 'SLEEP');
  assert(!mountain.takeDamage(10), 'Cannot hit dormant background boss');
  mountain.state = 'VOLCANO_ATTACK';
  let sawUp = false, sawDown = false, warnings = 0, beamFrames = 0, exposedFrames = 0;
  let previousPhase = 'SLEEP';
  for (let f = 0; f < 30 * fps; f++) {
    mountain.update(dt, 4050);
    const v = mountain.volcano;
    sawUp ||= v.embers.some(e => e.vy < 0 && e.y < 126);
    sawDown ||= v.embers.some(e => e.vy > 0 && e.y > 126);
    if (v.phase === 'WARNING') warnings++;
    if (v.phase === 'BEAM') {
      beamFrames++;
      if (previousPhase !== 'BEAM') assert(warnings / fps >= 1.75, 'Warning before damage');
      const standing = new Vinn(4000, 430), crouched = new Vinn(4100, 430), jumping = new Vinn(4050, 340);
      crouched.isCrouching = true;
      v.hitPlayers([standing, crouched, jumping]);
      assert.equal(standing.health, 22); assert.equal(crouched.health, 26); assert.equal(jumping.health, 26);
      v.hitPlayers([standing]); assert.equal(standing.health, 22, 'Respect invulnerability frames');
    }
    if (v.phase === 'EXPOSED') exposedFrames++;
    if (v.phase !== 'EXPOSED') assert(!mountain.takeDamage(1));
    previousPhase = v.phase;
  }
  assert(sawUp && sawDown, 'Fireballs must rise from the crater AND fall');
  assert(beamFrames / fps >= 3 && exposedFrames / fps >= 9.8, 'Repeated complete attack cycles');
  while (mountain.state !== 'DIZZY') mountain.update(dt, 4300);
  assert(mountain.takeDamage(10)); assert.equal(mountain.health, 110);
  mountain.isHit = false; assert(mountain.takeDamage(110));
  assert.equal(mountain.state, 'DEFEATED'); assert.equal(mountain.volcano.phase, 'SLEEP');
  assert.equal(mountain.volcano.embers.length, 0); mountain.update(10, 4300); assert.equal(mountain.state, 'DEFEATED');

  const blaze = new Boss(6500, 300, 'BLAZE_KING');
  blaze.update(30, 6200); assert.equal(blaze.state, 'IDLE');
  blaze.state = 'WALKING'; blaze.health = 59;
  let rises = 0, beams = 0, normalBetween = false, previous = 'WALKING', priorBeam = 'SLEEP';
  for (let f = 0; f < 65 * fps; f++) {
    blaze.update(dt, 6250);
    assert.notEqual(blaze.state, 'ANGRY_TRANSITION');
    if (blaze.state === 'VOLCANO_RISE' && previous !== blaze.state) rises++;
    if (blaze.volcano.phase === 'BEAM' && priorBeam !== 'BEAM') beams++;
    if (beams >= 1 && blaze.state === 'RAINING_FIRE') normalBetween = true;
    if (blaze.state.startsWith('VOLCANO_')) assert(!blaze.takeDamage(10));
    previous = blaze.state; priorBeam = blaze.volcano.phase;
  }
  assert(rises >= 2 && beams >= 2 && normalBetween, 'Blaze assist repeats with normal combat between beams');
  while (blaze.state !== 'DIZZY') blaze.update(dt, 6250);
  assert(blaze.takeDamage(100)); blaze.update(dt, 6250);
  assert.equal(blaze.state, 'DEFEATED'); assert.equal(blaze.volcano.phase, 'SLEEP');
}
const projectileTest = new LivingVolcano(4300); projectileTest.start(true); projectileTest.update(0.3, 4200);
const ember = projectileTest.embers[0], victim = new Vinn(ember.x, ember.y + 30);
projectileTest.hitPlayers([victim]); assert.equal(victim.health, 23);
console.log('PASS: EN/ES boss guides; volcano arcs/beam/crouch/core; repeated Blaze assists; no rage boost; defeat cleanup at 30/60/120 FPS.');

const { clearBossArena } = source('BossArena');
for (const retained of [null, new Enemy(700, 430, 'BEAR')]) {
  const enemies = { current: [new Enemy(200,430,'WOLF'), new Enemy(400,430,'TECH'), ...(retained ? [retained] : [])] };
  const flames = { current: [{x:100}] }, swords = { current: [{x:300}] };
  clearBossArena(enemies, [flames,swords], retained);
  assert.equal(enemies.current.length, retained ? 1 : 0);
  if(retained) assert.equal(enemies.current[0],retained, 'Do not remove the cave boss');
  assert.equal(flames.current.length,0); assert.equal(swords.current.length,0);
}
console.log('PASS: boss entry clears approach enemies/projectiles and preserves the cave boss.');
