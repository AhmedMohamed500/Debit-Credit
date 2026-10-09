import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp, mkdir, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';

const profile = await mkdtemp(path.join(tmpdir(), 'debit-credit-city-'));
const browser = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9235', `--user-data-dir=${profile}`, 'about:blank'], {stdio: 'ignore', windowsHide: true});
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
const errors = [];
try {
  let page;
  for (let i = 0; i < 60; i++) {
    try {page = (await (await fetch('http://127.0.0.1:9235/json/list')).json()).find(tab => tab.type === 'page'); if (page) break;} catch {}
    await sleep(200);
  }
  assert.ok(page, 'Chrome did not start');
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {socket.addEventListener('open', resolve, {once: true}); socket.addEventListener('error', reject, {once: true});});
  let nextId = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    if (!message.id) return;
    const callback = pending.get(message.id);
    if (!callback) return;
    clearTimeout(callback.timeout);
    pending.delete(message.id);
    if (message.error) callback.reject(new Error(message.error.message)); else callback.resolve(message.result);
  });
  const cdp = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timeout = setTimeout(() => {pending.delete(id); reject(new Error(`CDP timeout: ${method}`));}, 15000);
    pending.set(id, {resolve, reject, timeout});
    socket.send(JSON.stringify({id, method, params}));
  });
  const evaluate = async expression => {
    const result = await cdp('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  const waitFor = async selector => {
    for (let i = 0; i < 150; i++) {if (await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`)) return; await sleep(100);}
    throw new Error(`Timed out waiting for ${selector}`);
  };
  const click = async selector => {
    await waitFor(selector);
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
    await sleep(200);
    const point = await evaluate(`(() => {const el = document.querySelector(${JSON.stringify(selector)}); const r = el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
    await cdp('Input.dispatchMouseEvent', {type: 'mousePressed', ...point, button: 'left', clickCount: 1});
    await cdp('Input.dispatchMouseEvent', {type: 'mouseReleased', ...point, button: 'left', clickCount: 1});
  };
  await mkdir('artifacts/first-shift-city', {recursive: true});
  const screenshot = async name => {await evaluate('document.fonts.ready'); await sleep(200); const shot = await cdp('Page.captureScreenshot', {format: 'png', captureBeyondViewport: false}); await writeFile(`artifacts/first-shift-city/${name}.png`, Buffer.from(shot.data, 'base64'));};
  await cdp('Page.enable'); await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', {width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false});
  await cdp('Page.navigate', {url: 'http://127.0.0.1:3103/ar/game/first-shift'});
  await click('.fd-start-story'); await click('.fd-enter-company'); await click('.fd-briefing-card button');
  await waitFor('.fsh-portal');
  await evaluate('Promise.all([...document.images].map(img => img.decode().catch(() => {})))');
  const results = [];
  for (const [locale, width, height] of [['ar',1920,1080],['ar',1366,768],['ar',1024,768],['ar',768,1024],['ar',390,844],['ar',320,740],['en',1440,900],['en',390,844]]) {
    await cdp('Emulation.setDeviceMetricsOverride', {width,height,deviceScaleFactor:1,mobile:width<701});
    if (locale === 'en') {await cdp('Page.navigate', {url: 'http://127.0.0.1:3103/en/game/first-shift'}); await waitFor('.fsh-portal');}
    await evaluate('document.fonts.ready'); await evaluate('(() => {document.activeElement?.blur(); window.scrollTo(0,0); const panorama=document.querySelector(".fsh-city-panorama"); panorama.scrollLeft=(panorama.scrollWidth-panorama.clientWidth)/2;})()'); await sleep(200);
    const state = await evaluate(`({width:document.documentElement.scrollWidth,viewport:innerWidth,portals:document.querySelectorAll('.fsh-portal').length,artworkVisible:getComputedStyle(document.querySelector('.fsh-artwork')).display!=='none',artwork:document.querySelector('.fsh-artwork').getAttribute('src'),boyCovered:(()=>{const r=document.querySelector('.fsh-city-stage').getBoundingClientRect();return [[.49,.52],[.49,.65],[.49,.84]].some(([x,y])=>document.elementsFromPoint(r.x+r.width*x,r.y+r.height*y).some(e=>e.closest('.fsh-portal,.fsh-os,.fsh-world-title')));})(),brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),locked:[...document.querySelectorAll('.fsh-portal:disabled')].map(i=>i.getAttribute('aria-label'))})`);
    assert.ok(state.width <= width, `Horizontal overflow: ${locale} ${width}`); assert.equal(state.portals,5); assert.equal(state.artworkVisible,true); assert.equal(state.brokenImages.length,0); assert.equal(state.locked.length,4);
    results.push({locale,width,height,...state});
    await screenshot(`city-${locale}-${width}`);
    assert.equal(state.boyCovered,false, `Boy covered by UI: ${locale} ${width}`);
    assert.equal(state.artwork,'/game/first-shift-world-art.png');
    await click('.fsh-portal-1'); await waitFor('[role="dialog"]');
    assert.ok(await evaluate(`document.querySelector('[role="dialog"]').innerText.includes('INV-1048')`));
    if (width === 1366 || width === 390) await screenshot(`case-${locale}-${width}`);
    await click('.acw-exit'); await waitFor('.fsh-portal');
    await click('.fsh-calculator'); await waitFor('.scene-tool');
    await cdp('Input.dispatchKeyEvent', {type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    await cdp('Input.dispatchKeyEvent', {type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    assert.equal(await evaluate(`!!document.querySelector('.scene-tool')`),false);
  }
  assert.deepEqual(errors,[]);
  await writeFile('artifacts/first-shift-city/qa.json',JSON.stringify({results,errors},null,2));
  console.log('PASS: Arabic/English, eight viewports, original boy/city image, unobstructed character, locked sequence, real file/calculator clicks, Escape, no overflow or broken images.');
} finally {
  socket?.close(); browser.kill();
  if (path.resolve(profile).startsWith(path.resolve(tmpdir()) + path.sep)) await rm(profile, {recursive:true,force:true,maxRetries:5,retryDelay:200});
}
