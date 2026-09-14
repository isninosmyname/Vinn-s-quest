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
const { IntroCutscene, World1ClearCutscene, World2ClearCutscene, World3BossCutscene, World3EscapeCutscene } = source('Cutscene');
const { EndingCutscene } = source('EndingCutscene');
const classes = [IntroCutscene, World1ClearCutscene, World2ClearCutscene, World3BossCutscene, World3EscapeCutscene, EndingCutscene];
let runs = 0;
for (const Scene of classes) for (const language of ['en', 'es']) for (const duo of [false, true]) for (const delay of [0, 0.01, 3]) {
    const scene = new Scene(); scene.setLanguage(language, duo);
    scene.update(0);
    for (let i = 0; i < scene.dialogues.length; i++) {
        assert.equal(scene.dialogueIndex, i, Scene.name + ' skipped a line');
        scene.update(delay);
        assert.equal(scene.dialogueIndex, i, Scene.name + ' auto-skipped a line');
        const clock = scene.timer;
        scene.advanceDialogue();
        assert.equal(scene.dialogueIndex, i + 1, Scene.name + ' Space must advance exactly one line');
        assert.equal(scene.timer, clock, Scene.name + ' Space must not reset or advance the clock');
        for (const value of Object.values(scene)) if (typeof value === 'number') assert(Number.isFinite(value));
    }
    for (let i = 0; i < 12; i++) scene.advanceDialogue();
    assert.equal(scene.update(30), true, Scene.name + ' must finish its outro');
    assert.equal(scene.dialogueIndex, scene.dialogues.length);
    runs++;
}

// Known regressions: advance several lines BEFORE any animation frame runs.
const intro = new IntroCutscene(); intro.update(1);
for (let i = 0; i < 5; i++) intro.advanceDialogue();
assert.equal(intro.phase, 'BALCONY_TALK'); assert.equal(intro.queenX, 735);
assert.equal(intro.currentDialogue.text, 'Ahh'); assert.equal(intro.portalSize, 0);
intro.advanceDialogue(); intro.advanceDialogue(); intro.update(0.8);
assert(intro.portalSize > 0 && intro.portalSize < 145);
intro.advanceDialogue(); assert.equal(intro.phase, 'QUEEN_SUCKED_IN');
intro.advanceDialogue(); assert.equal(intro.queenY, intro.portalY);
intro.update(2.7); assert(Math.abs(intro.vinnY - intro.portalY) < 0.000001);
intro.advanceDialogue(); intro.advanceDialogue();
assert.equal(intro.vinnY, 420); assert.equal(intro.queenY, 420);
intro.advanceDialogue(); intro.advanceDialogue();
assert.equal(intro.phase, 'VINN_LANDING'); assert.equal(intro.queenX, 1100);
intro.reset(); assert.equal(intro.timer, 0); assert.equal(intro.dialogueIndex, 0);
intro.update(0); assert.equal(intro.phase, 'WALK_IN'); assert.equal(intro.boss1X, 850);

const w1 = new World1ClearCutscene(); w1.setLanguage('es');
for (let i = 0; i < 7; i++) w1.advanceDialogue();
w1.update(10); assert.equal(w1.dialogueIndex, 7); assert(w1.currentDialogue.text.includes('almuerzo'));
assert(w1.hasCrown && w1.boss1X >= 1100);
const w3 = new World3BossCutscene(); w3.setLanguage('en');
for (let i = 0; i < 7; i++) w3.advanceDialogue();
assert.equal(w3.currentDialogue.text, 'VINN!'); assert(w3.golemSwordDrawn && w3.vinnY > 500);
const ending = new EndingCutscene();
for (let i = 0; i < 9; i++) ending.advanceDialogue();
assert.equal(ending.phase, 'BANQUET_CALL'); assert(ending.vinnStunned); assert.equal(ending.queenX, 1100);

// Spanish covers every newly placed letter and level, without extra spawns.
const { FOREST_NAMES, FOREST_LETTERS } = source('ForestWorld');
const { FOREST_NAMES_ES, FOREST_LETTERS_ES, DUFF_TEXT_ES } = source('ForestText');
assert.equal(FOREST_NAMES_ES.length, FOREST_NAMES.length);
for (let i = 0; i < FOREST_LETTERS.length; i++) assert.equal(FOREST_LETTERS_ES[i].length, FOREST_LETTERS[i].length);
assert(DUFF_TEXT_ES.ESCAPE_DIALOGUE && DUFF_TEXT_ES.ESCAPING);
console.log(`PASS: ${runs} cutscene runs (EN/ES, solo/duo, instant/rapid/normal), continuous clocks, animation checkpoints, endings, replay reset and Spanish coverage.`);
