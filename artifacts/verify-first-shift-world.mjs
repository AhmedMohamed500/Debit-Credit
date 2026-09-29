import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp, mkdir, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';

const edge = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profile = await mkdtemp(path.join(tmpdir(), 'debit-credit-world-'));
const browser = spawn(edge, ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-software-rasterizer', '--disable-dev-shm-usage', '--no-first-run', '--remote-allow-origins=*', '--remote-debugging-port=9231', `--user-data-dir=${profile}`, 'about:blank'], {stdio: 'ignore', windowsHide: true});
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
try {
  let page;
  for (let i = 0; i < 40; i++) {
    try {
      const tabs = await (await fetch('http://127.0.0.1:9231/json/list')).json();
      page = tabs.find(tab => tab.type === 'page');
      if (page) break;
    } catch {}
    await sleep(250);
  }
  assert.ok(page, 'Edge CDP page was not available');
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {socket.addEventListener('open', resolve, {once: true}); socket.addEventListener('error', reject, {once: true});});
  let nextId = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const callback = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) callback.reject(new Error(message.error.message));
    else callback.resolve(message.result);
  });
  const cdp = (method, params = {}) => new Promise((resolve, reject) => {const id = ++nextId; pending.set(id, {resolve, reject}); socket.send(JSON.stringify({id, method, params})); setTimeout(() => {if (pending.has(id)) {pending.delete(id); reject(new Error(`CDP timeout: ${method}`));}}, 5000);});
  const evaluate = async expression => (await cdp('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true})).result.value;
  const waitFor = async selector => {
    for (let i = 0; i < 100; i++) {
      if (await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`)) return;
      await sleep(100);
    }
    throw new Error(`Timed out waiting for ${selector}`);
  };
  const click = async selector => {await waitFor(selector); await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);};
  const screenshot = async name => {
    await mkdir('artifacts/first-shift-world', {recursive: true});
    const image = await cdp('Page.captureScreenshot', {format: 'png', captureBeyondViewport: false});
    await writeFile(`artifacts/first-shift-world/${name}.png`, Buffer.from(image.data, 'base64'));
  };
  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', {width: 1672, height: 941, deviceScaleFactor: 1, mobile: false});
  await cdp('Page.navigate', {url: 'http://127.0.0.1:3102/ar/game/first-shift'});
  await click('.fd-start-story');
  await click('.fd-enter-company');
  await click('.fd-briefing-card button');
  await waitFor('.fsh-portal');
  await evaluate('document.fonts.ready');
  await screenshot('first-shift-desktop-ar');
  const desktop = await evaluate('({width: document.documentElement.scrollWidth, viewport: innerWidth, artwork: document.querySelector(".fsh-artwork")?.getAttribute("src"), portals: [...document.querySelectorAll(".fsh-portal")].map(button => ({label: button.getAttribute("aria-label"), status: button.dataset.status, disabled: button.disabled}))})');
  assert.ok(desktop.width <= desktop.viewport);
  assert.equal(desktop.artwork, '/game/first-shift-world-art.png');
  assert.equal(desktop.portals.length, 5);
  await cdp('Emulation.setDeviceMetricsOverride', {width: 1366, height: 768, deviceScaleFactor: 1, mobile: false});
  await sleep(400);
  await screenshot('desktop-1366-ar');
  const laptop = await evaluate('({width: document.documentElement.scrollWidth, viewport: innerWidth, portalCount: document.querySelectorAll(".fsh-portal").length})');
  assert.ok(laptop.width <= laptop.viewport);
  assert.equal(laptop.portalCount, 5);
  await cdp('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 1, mobile: true});
  await sleep(400);
  await screenshot('first-shift-mobile-ar');
  const mobile = await evaluate('({width: document.documentElement.scrollWidth, viewport: innerWidth, artworkVisible: getComputedStyle(document.querySelector(".fsh-artwork")).display !== "none", portalCount: document.querySelectorAll(".fsh-portal").length})');
  assert.ok(mobile.width <= mobile.viewport);
  assert.equal(mobile.artworkVisible, false);
  assert.equal(mobile.portalCount, 5);
  await writeFile('artifacts/first-shift-world/qa.json', JSON.stringify({desktop, laptop, mobile}, null, 2));
  console.log('PASS: desktop world artwork, five interactive portals, and mobile mission map.');
} finally {
  socket?.close();
  browser.kill();
  if (path.resolve(profile).startsWith(path.resolve(tmpdir()) + path.sep)) await rm(profile, {recursive: true, force: true, maxRetries: 5, retryDelay: 200});
}
