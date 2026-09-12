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
p.x = duff.poles[0].x + 40; duff.update(0, [p], false); assert.equal(p.health, 19);
p.isHit = false; p.isCrouching = true; duff.update(0, [p], false); assert.equal(p.health, 19);
p.x = duff.poles[1].x + 40; duff.update(0, [p], false); assert.equal(p.health, 18);
p.isHit = false; p.isCrouching = false; p.y = 290; duff.update(0, [p], false); assert.equal(p.health, 18);
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
assert.equal(duff.phase, 'DEFEATED');
const map = new World1Map(); map.open(4, 4); map.moveSelection(1); assert.equal(map.selectedLevel, 4);
map.open(5, 5, [1, 2, 3, 4]); assert(map.completed.includes(4)); assert.equal(map.selectedLevel, 5);
console.log('PASS: 8 traversable routes, power-up renewal/expiry, crouch clearance, wildlife, map locks and all four Duff rounds.');
