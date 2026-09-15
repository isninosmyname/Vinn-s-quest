// Optional browser QA against an already-running localhost game and a
// separate Chromium profile launched with remote debugging on port 9223.
const fs = require('node:fs');
const action = process.argv[2] || 'inspect';
(async () => {
  const tabs = await (await fetch('http://127.0.0.1:9223/json/list')).json();
  const tab = tabs.find(t => t.type === 'page' && t.url.includes('localhost:5173')) || tabs.find(t => t.type === 'page');
  const socket = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  let id = 0; const pending = new Map(); const errors = [];
  socket.addEventListener('message', event => {
    const data = JSON.parse(event.data);
    if (data.id) { const p = pending.get(data.id); pending.delete(data.id); data.error ? p.reject(data.error) : p.resolve(data.result); }
    if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.text);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => { pending.set(++id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const delay = ms => new Promise(r => setTimeout(r, ms));
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 700, deviceScaleFactor: 1, mobile: false });
  if (!tab.url.includes('localhost:5173')) { await send('Page.navigate', { url: 'http://localhost:5173' }); await delay(1800); }
  if (action.startsWith('encounter-')) { await send('Page.navigate', { url: 'http://localhost:5173/scripts/encounter-qa.html' }); await delay(1500); }
  if (action.startsWith('volcano-')) { await send('Page.navigate', { url: 'http://localhost:5173/scripts/volcano-qa.html' }); await delay(1500); }
  for (let attempt = 0; attempt < 40; attempt++) {
    if (await evaluate('!!document.querySelector("canvas")')) break;
    await delay(500);
  }
  if (!await evaluate('!!document.querySelector("canvas")')) throw new Error('Game did not render: ' + await evaluate('document.body.innerText'));
  const click = async text => {
    const point = await evaluate(`(() => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === ${JSON.stringify(text)}); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 }; })()`);
    if (!point) throw new Error('Missing button: ' + text);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point }); await delay(200);
  };
  const key = async (key, type) => send('Input.dispatchKeyEvent', { type, key, code: key === ' ' ? 'Space' : 'Key' + key.toUpperCase(), windowsVirtualKeyCode: key === ' ' ? 32 : key.toUpperCase().charCodeAt(0) });
  const tap = async k => { await key(k, 'keyDown'); await delay(100); await key(k, 'keyUp'); };
  if (action.startsWith('volcano-')) {
    if (action === 'volcano-map') await click('Volcano map');
    else if (action === 'volcano-bomb') { await click('Forest bomb'); await delay(3250); await click('Pause / resume'); }
    else {
      await click(action === 'volcano-blaze' ? 'Blaze assist (59 HP)' : 'Living volcano');
      if (action === 'volcano-spanish') await click('EN / ES');
      if (action !== 'volcano-arcs') await key('c','keyDown');
      const desired = action === 'volcano-arcs' ? 'ERUPT' : 'BEAM';
      if (action === 'volcano-arcs') await delay(1600);
      else for (let i=0;i<130;i++) {
        const state = await evaluate('JSON.parse(document.querySelector("#status").textContent)');
        if (state.phase === desired) break;
        await delay(100);
      }
      await click('Pause / resume'); await key('c','keyUp');
    }
  }
  if (action.startsWith('encounter-')) {
    if (action === 'encounter-duff' || action === 'encounter-escape') {
      await click('Duff final hit'); await tap(' '); await delay(400);
      if (action === 'encounter-escape') { await tap(' '); await delay(700); }
    } else {
      const golem = action !== 'encounter-bear';
      await click(golem ? 'Golem fortress' : 'Bear cave');
      if (action === 'encounter-spanish') await click('EN / ES');
      await tap('e');
      for (let i = 0; i < 60; i++) {
        if (await evaluate(`document.querySelector('#status').textContent.includes('${golem ? 'DIALOGUE' : 'FIGHT'}')`)) break;
        await delay(200);
      }
      if (action === 'encounter-fight') { await tap(' '); await tap(' '); await tap(' '); await delay(3400); }
      if (!golem) {
        await key('d', 'keyDown'); await delay(650); await key('d', 'keyUp');
        for (let i = 0; i < 60; i++) {
          const visible = await evaluate('JSON.parse(document.querySelector("#status").textContent)');
          if (visible.bearAttack === 'STOMP' && visible.attackTime > 0.65) break;
          await delay(100);
        }
      }
    }
  }
  if (action === 'spanish') {
    await send('Page.reload'); await delay(1800);
    await click('SETTINGS'); await click('ES'); await click('VOLVER AL MENÚ'); await click('JUGAR');
    for (let i = 0; i < 7; i++) { await key(' ', 'keyDown'); await key(' ', 'keyUp'); await delay(40); }
    await delay(800);
  }
  if (action === 'cutscene') {
    await click('PLAY'); await delay(2200);
    for (let i = 0; i < 5; i++) { await key(' ', 'keyDown'); await key(' ', 'keyUp'); await delay(40); }
    await delay(500);
  }
  if (action === 'portal') {
    for (let i = 0; i < 3; i++) { await key(' ', 'keyDown'); await key(' ', 'keyUp'); await delay(40); }
    await delay(650);
  }
  if (action === 'finish-cutscene') {
    for (let i = 0; i < 18; i++) { await key(' ', 'keyDown'); await key(' ', 'keyUp'); await delay(40); }
    await delay(3500);
    for (let i = 0; i < 40; i++) {
      if (await evaluate('document.body.innerText.includes("Vinn has landed")')) break;
      await delay(500);
    }
  }
  if (action === 'tutorial') { await click('PLAY'); await click('SKIP CUTSCENE'); }
  if (action === 'walk') {
    await key('d', 'keyDown'); await delay(600); await key('w', 'keyDown'); await key('w', 'keyUp');
    await delay(1500); await key('d', 'keyUp'); await key(' ', 'keyDown'); await delay(5000); await key(' ', 'keyUp');
  }
  if (action === 'map') await click('OPEN WORLD MAP');
  if (action === 'enter') {
    await key(' ', 'keyDown'); await key(' ', 'keyUp'); await delay(800);
  }
  if (action === 'letter') {
    await key('d', 'keyDown'); await delay(480); await key('d', 'keyUp'); await key('e', 'keyDown'); await key('e', 'keyUp'); await delay(300);
  }
  const state = await evaluate(`(() => {
    const canvas = document.querySelector('canvas'); if (!canvas) return null;
    let fiber = canvas[Object.keys(canvas).find(k => k.startsWith('__reactFiber'))];
    while (fiber && fiber.type?.name !== 'App') fiber = fiber.return;
    const refs = []; let hook = fiber?.memoizedState;
    while (hook) { const v = hook.memoizedState?.current; if (v && typeof v.x === 'number' && typeof v.health === 'number') refs.push({x:v.x,y:v.y,health:v.health,state:v.state}); if (v && typeof v.dialogueIndex === 'number') refs.push({phase:v.phase,index:v.dialogueIndex,clock:v.timer,line:v.currentDialogue}); hook = hook.next; }
    return { refs, buttons: [...document.querySelectorAll('button')].map(b => b.textContent.trim()), text: document.body.innerText.slice(-700) };
  })()`);
  const capture = await send('Page.captureScreenshot', { format: 'png' });
  const file = '/tmp/vinn-qa-' + action + '.png'; fs.writeFileSync(file, Buffer.from(capture.data, 'base64'));
  console.log(JSON.stringify({ state, errors, screenshot: file }, null, 2)); socket.close();
})().catch(error => { console.error(error); process.exit(1); });
