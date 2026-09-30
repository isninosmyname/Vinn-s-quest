const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const cache = new Map();
function source(name) {
  if (cache.has(name)) return cache.get(name).exports;
  const module = { exports: {} }; cache.set(name, module);
  const file = path.resolve(__dirname, '../src/game', name + '.ts');
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(js, { module, exports: module.exports, require: id => source(id.replace('./', '')), Math, Date, console }, { filename: file });
  return module.exports;
}
const { Lives, LIFE_WAIT_MS, makeCoins, drawCoin } = source('Lives');
const { Vinn } = source('Vinn');
const { DeathScene } = source('DeathScene');
const { LavaRescue } = source('LavaRescue');
const { FOREST_LEVELS } = source('ForestWorld');
const { VOLCANO_LEVELS } = source('VolcanoWorld');
const lives = new Lives(null, 0);
assert.equal(lives.lives, 3);
for (let i = 0; i < 80; i++) assert(lives.collect('coin-' + i));
assert.equal(lives.collect('coin-0'), false); assert.equal(lives.coins, 80);
assert.equal(lives.buy(0), false);
lives.lose(100); lives.lose(100); lives.lose(100);
assert.equal(lives.lives, 0); assert.equal(lives.lose(100), false);
assert.equal(lives.secondsLeft(100), 300);
const recoveryDeadline = lives.refillAt;
for (const price of [5, 10, 15]) {
  assert.equal(lives.price, price);
  const before = lives.coins; assert(lives.buy(200));
  assert.equal(lives.coins, before - price); assert.equal(lives.lives, 1);
  lives.lose(300);
  assert.equal(lives.refillAt, recoveryDeadline, 'Buying and losing a single life must not restart recovery');
}
const refreshed = new Lives(lives.save(), 400);
assert.equal(refreshed.lives, 0); assert.equal(refreshed.price, 20);
assert.equal(refreshed.coins, 50); assert.equal(refreshed.collect('coin-0'), false);
refreshed.tick(recoveryDeadline - 1); assert.equal(refreshed.lives, 0);
refreshed.tick(recoveryDeadline); assert.equal(refreshed.lives, 3); assert.equal(refreshed.price, 5);
assert.equal(refreshed.coins, 50);
refreshed.lose(recoveryDeadline + 100); refreshed.lose(recoveryDeadline + 200);
assert.equal(refreshed.refillAt, 0, 'The new set is not exhausted yet');
refreshed.lose(recoveryDeadline + 300);
assert.equal(refreshed.refillAt, recoveryDeadline + 300 + LIFE_WAIT_MS, 'Exhausting three restored lives starts the next timer');
const noCoins = new Lives(null, 0); noCoins.lose(0); noCoins.lose(0); noCoins.lose(0);
assert.equal(noCoins.buy(0), false); assert.equal(noCoins.coins, 0);
assert.equal(new Lives(noCoins.save(), LIFE_WAIT_MS + 100).lives, 3, 'Waiting works with no animation frames');
const expiredPrice = new Lives(lives.save(), 400);
expiredPrice.buy(500); expiredPrice.tick(500 + LIFE_WAIT_MS);
assert.equal(expiredPrice.lives, 3); assert.equal(expiredPrice.price, 5);
assert.equal(new Lives('broken').lives, 3);
for (const [world, levels] of [[1, FOREST_LEVELS], [2, VOLCANO_LEVELS]]) for (const [index, level] of levels.entries()) {
  const coins = makeCoins(world, index + 1, level.platforms, level.length);
  assert(coins.length >= 5);
  assert.equal(new Set(coins.map(c => c.id)).size, coins.length);
  assert(coins.every(c => level.platforms.some(p => c.x >= p.x && c.x < p.x + p.w && c.y === p.y - 55)));
  assert(coins.every(c => c.x < level.length - 1000));
  assert.deepEqual(coins, makeCoins(world, index + 1, level.platforms, level.length));
}
const hero = new Vinn(100, 430);
hero.isHit = true; hero.y = 610; hero.onGround = false;
hero.update(1 / 60, {}, 2000, []);
assert.equal(hero.health, 13); assert.equal(hero.x, 100); assert(hero.y < 430);
hero.y = 610; hero.update(1 / 60, {}, 2000, []); assert.equal(hero.health, 0);
hero.update(1 / 60, { ' ': true }, 2000, []); assert.equal(hero.health, 0, 'Space cannot bypass lives');
hero.reset(100, 430); hero.lavaFalls = true; hero.y = 610;
hero.update(1 / 60, {}, 2000, []);
assert.equal(hero.health, 26); assert(hero.y > 600, 'Lava does not use ordinary fall respawn');
for (const fps of [30, 60, 120]) for (const secondPlayer of [false, true]) for (let pattern = 0; pattern < 3; pattern++) {
  hero.reset(100, 430); hero.y = 500;
  const rescue = new LavaRescue(hero, secondPlayer, pattern);
  rescue.press(' '); assert.equal(rescue.step, 0);
  for (const key of rescue.keys) { rescue.update(.1); rescue.press(key); }
  for (let frame = 0; frame < fps * 2; frame++) rescue.update(1 / fps);
  assert.equal(rescue.result, 'ESCAPED'); assert(rescue.finished);
  rescue.resolve(); assert.equal(hero.health, 13); assert.equal(hero.x, 100); assert.equal(hero.y, 390);
  rescue.resolve(); assert.equal(hero.health, 13, 'Resolve is one-shot');
  hero.reset(100, 430); const failure = new LavaRescue(hero, secondPlayer, pattern);
  for (let frame = 0; frame < fps * 6; frame++) failure.update(1 / fps);
  assert.equal(failure.result, 'SUNK'); assert(failure.finished);
  failure.press(failure.keys[0]); assert.equal(failure.step, 0);
  failure.resolve(); assert.equal(hero.health, 0);
}
hero.reset(100, 430); hero.health = 1;
const lastChance = new LavaRescue(hero, false, 0);
lastChance.press('d'); assert.equal(lastChance.step, 0); assert(lastChance.time > 0);
lastChance.keys.forEach(k => lastChance.press(k)); lastChance.update(2); lastChance.resolve();
assert.equal(hero.health, 1, 'A successful combination always survives');
const labels = [];
const ctx = new Proxy({}, {
  get(target, key) {
    if (key in target) return target[key];
    if (key === 'createLinearGradient') return () => ({ addColorStop() {} });
    if (key === 'fillText') return text => labels.push(text);
    return (...args) => args.forEach(a => { if (typeof a === 'number') assert(Number.isFinite(a), key + ' must be finite'); });
  },
  set(target, key, value) { target[key] = value; return true; }
});
for (const language of ['en', 'es']) for (const gameOver of [false, true]) for (const cause of ['NORMAL', 'LAVA']) {
  const scene = new DeathScene(gameOver, hero, 300, 440, cause);
  for (let frame = 0; frame < 360; frame++) { scene.update(1 / 60); scene.draw(ctx, language, gameOver ? 0 : 2); }
  assert(scene.ready); const pose = JSON.stringify(scene.pose); scene.update(100);
  assert.equal(JSON.stringify(scene.pose), pose, 'Death must not loop');
  if (gameOver || cause === 'LAVA') assert.equal(scene.pose.alpha, 0);
  if (cause === 'LAVA') assert.equal(scene.pose.spin, 0);
  const lava = new LavaRescue(hero, false, 0);
  for (let frame = 0; frame < 360; frame++) { lava.update(1 / 60); lava.draw(ctx, language); }
  drawCoin(ctx, 40, 80, 1);
}
assert(labels.includes('YOU DIED!')); assert(labels.includes('¡HAS MUERTO!'));
assert(labels.includes('GAME OVER')); assert(labels.includes('FIN DEL JUEGO'));
console.log('Lives, coin economy, expiry, falls, lava rescue (solo/co-op, 30/60/120 fps), and EN/ES one-shot death rendering passed.');
