import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
const origin = process.env.FOUNDATION_QA_ORIGIN || "http://127.0.0.1:3105",
  output = process.env.FOUNDATION_QA_OUTPUT || "artifacts/foundations";
const profile = await mkdtemp(path.join(tmpdir(), "debit-credit-foundations-"));
const browser = spawn(
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--remote-debugging-port=9238",
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: "ignore", windowsHide: true },
);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let socket;
let diagnose = async () => {};
const errors = [];
const results = [];
try {
  let page;
  for (let i = 0; i < 80; i++) {
    try {
      page = (
        await (await fetch("http://127.0.0.1:9238/json/list")).json()
      ).find((t) => t.type === "page");
      if (page) break;
    } catch {}
    await sleep(150);
  }
  assert.ok(page, "Chrome start");
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  let id = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const m = JSON.parse(event.data);
    if (m.method === "Runtime.exceptionThrown")
      errors.push(m.params.exceptionDetails.text);
    if (!m.id) return;
    const p = pending.get(m.id);
    if (!p) return;
    clearTimeout(p.timer);
    pending.delete(m.id);
    if (m.error) p.reject(Error(m.error.message));
    else p.resolve(m.result);
  });
  const cdp = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const key = ++id,
        timer = setTimeout(() => {
          pending.delete(key);
          reject(Error(`Timeout ${method}`));
        }, 30000);
      pending.set(key, { resolve, reject, timer });
      socket.send(JSON.stringify({ id: key, method, params }));
    });
  const evaluate = async (expression) => {
    const r = await cdp("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (r.exceptionDetails) throw Error(r.exceptionDetails.text);
    return r.result.value;
  };
  const wait = async (selector) => {
    for (let i = 0; i < 240; i++) {
      if (
        await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`)
      )
        return;
      await sleep(100);
    }
    throw Error(`Missing ${selector}`);
  };
  const click = async (selector) => {
    await wait(selector);
    await evaluate(
      `document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`,
    );
    await sleep(70);
    const p = await evaluate(
      `(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`,
    );
    await cdp("Input.dispatchMouseEvent", {
      type: "mousePressed",
      ...p,
      button: "left",
      clickCount: 1,
    });
    await cdp("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      ...p,
      button: "left",
      clickCount: 1,
    });
    await sleep(50);
  };
  const key = async (key, code = key, virtual = 0, modifiers = 0) => {
    await cdp("Input.dispatchKeyEvent", {
      type: "keyDown",
      key,
      code,
      windowsVirtualKeyCode: virtual,
      modifiers,
    });
    await cdp("Input.dispatchKeyEvent", {
      type: "keyUp",
      key,
      code,
      windowsVirtualKeyCode: virtual,
      modifiers,
    });
  };
  const type = async (selector, value) => {
    await click(selector);
    await key("a", "KeyA", 65, 2);
    await cdp("Input.insertText", { text: String(value) });
    await key("Tab", "Tab", 9);
  };
  const select = async (selector, value) => {
    await click(selector);
    const index = await evaluate(
      `[...document.querySelector(${JSON.stringify(selector)}).options].findIndex(o=>o.value===${JSON.stringify(value)})`,
    );
    assert.ok(index >= 0, value);
    await key("Home", "Home", 36);
    for (let i = 0; i < index; i++) await key("ArrowDown", "ArrowDown", 40);
    await key("Enter", "Enter", 13);
    assert.equal(
      await evaluate(
        `document.querySelector(${JSON.stringify(selector)}).value`,
      ),
      value,
    );
  };
  await mkdir(output, { recursive: true });
  const shot = async (name, selector) => {
    await evaluate("document.fonts.ready");
    await evaluate(selector ? `document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'start',behavior:'instant'})` : "window.scrollTo(0,0)");
    await sleep(200);
    const data = await cdp("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
    });
    await writeFile(`${output}/${name}.png`, Buffer.from(data.data, "base64"));
  };
  diagnose = async () => {
    console.error(
      JSON.stringify({
        errors,
        ui: await evaluate(
          `({title:document.title,url:location.href,text:document.body.innerText.slice(-2000)})`,
        ),
      }),
    );
    await shot("foundation-qa-failure");
  };
  const viewport = async (width, height) => {
    await cdp("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(120);
  };
  await cdp("Page.enable");
  await cdp("Runtime.enable");
  await viewport(1920, 1080);
  await cdp("Page.navigate", { url: `${origin}/ar/bootcamp` });
  await wait(".fdn-node");
  await evaluate(
    "Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))",
  );
  for (const [width, height] of [
    [1920, 1080],
    [1440, 900],
    [1366, 768],
    [430, 932],
    [390, 844],
  ]) {
    await viewport(width, height);
    const state = await evaluate(
      `({width:document.documentElement.scrollWidth,viewport:innerWidth,nodes:document.querySelectorAll('.fdn-node').length,locked:document.querySelectorAll('.fdn-node:disabled').length,broken:[...document.images].filter(i=>!i.naturalWidth).length,background:getComputedStyle(document.querySelector('.fdn-page')).backgroundColor,mobileVertical:innerWidth>700||[...document.querySelectorAll('.fdn-node')].every((n,i,a)=>!i||n.getBoundingClientRect().top>a[i-1].getBoundingClientRect().top)})`,
    );
    assert.ok(state.width <= width, `Map overflow ${width}`);
    assert.equal(state.nodes, 13);
    assert.equal(state.locked, 12);
    assert.equal(state.broken, 0);
    assert.equal(state.mobileVertical, true);
    results.push({ locale: "ar", width, height, ...state });
    await shot(
      width === 1920
        ? "foundation-world-map-1920"
        : width === 390
          ? "foundation-mobile-390"
          : `foundation-map-${width}`,
    );
  }
  await viewport(1366, 768);
  const accountIndex = {
    cash: 0,
    bank: 1,
    inventory: 2,
    equipment: 3,
    receivable: 4,
    payable: 5,
    capital: 6,
    revenue: 7,
    rent: 8,
    cost: 9,
  };
  const boss = [
    {
      accounts: ["cash", "capital"],
      moves: [0, 0],
      lines: [
        ["cash", 100000, 0],
        ["capital", 0, 100000],
      ],
    },
    {
      accounts: ["equipment", "cash"],
      moves: [0, 1],
      lines: [
        ["equipment", 20000, 0],
        ["cash", 0, 20000],
      ],
    },
    {
      accounts: ["inventory", "payable"],
      moves: [0, 0],
      lines: [
        ["inventory", 30000, 0],
        ["payable", 0, 30000],
      ],
    },
    {
      accounts: ["receivable", "revenue", "cost", "inventory"],
      moves: [0, 0, 0, 1],
      lines: [
        ["receivable", 15000, 0],
        ["revenue", 0, 15000],
        ["cost", 10000, 0],
        ["inventory", 0, 10000],
      ],
    },
    {
      accounts: ["rent", "cash"],
      moves: [0, 1],
      lines: [
        ["rent", 5000, 0],
        ["cash", 0, 5000],
      ],
    },
    {
      accounts: ["cash", "receivable"],
      moves: [0, 1],
      lines: [
        ["cash", 15000, 0],
        ["receivable", 0, 15000],
      ],
    },
    {
      accounts: ["payable", "cash"],
      moves: [1, 1],
      lines: [
        ["payable", 10000, 0],
        ["cash", 0, 10000],
      ],
    },
  ];
  const success = async () => {
    await wait(".fdn-task-success");
    assert.equal(
      await evaluate(`!!document.querySelector('.fdn-error')`),
      false,
    );
    await click(".fdn-task-success .fdn-primary");
  };
  const multiple = async (indices) => {
    for (const index of indices)
      await click(`.fdn-account-pieces button:nth-child(${index + 1})`);
    await click(".fdn-account-matcher>.fdn-primary");
    await success();
  };
  const movements = async (indices) => {
    for (let i = 0; i < indices.length; i++)
      await click(
        `.fdn-movement-row:nth-child(${i + 1}) button:nth-child(${indices[i] + 1})`,
      );
    await click(".fdn-movement-game>.fdn-primary");
    await success();
  };
  const choices = async (indices) => {
    for (const index of indices) {
      await click(`.fdn-destinations>button:nth-child(${index + 1})`);
      await success();
    }
  };
  const journal = async (lines, capture = false) => {
    for (let i = 2; i < lines.length; i++) await click(".fdn-add-row");
    for (let i = 0; i < lines.length; i++) {
      const [a, d, c] = lines[i];
      await select(`.fdn-journal-row:nth-child(${i + 2}) select`, a);
      if (d)
        await type(
          `.fdn-journal-row:nth-child(${i + 2}) input[aria-label="مدين السطر ${i + 1}"]`,
          d,
        );
      if (c)
        await type(
          `.fdn-journal-row:nth-child(${i + 2}) input[aria-label="دائن السطر ${i + 1}"]`,
          c,
        );
    }
    if (capture) {
      await shot("foundation-first-journal");
      for (const [width, height] of [[430, 932], [390, 844]]) {
        await viewport(width, height);
        await shot(`foundation-first-journal-mobile-${width}`, ".fdn-journal");
      }
      await viewport(1366, 768);
    }
    await click(".fdn-journal>.fdn-primary");
    await success();
  };
  for (let order = 1; order <= 13; order++) {
    await click(".fdn-node.current");
    await wait(".fdn-mission");
    console.log(`Playing mission ${order}`);
    const names = {
      1: "foundation-mission-1",
      2: "foundation-transaction-game",
      3: "foundation-documents",
      4: "foundation-equation",
      9: "foundation-debit-credit",
      11: "foundation-first-journal",
      13: "foundation-boss",
    };
    if (names[order]) {
      await shot(names[order]);
      assert.ok(await evaluate("document.querySelector('.fdn-mission-layout>.fdn-guide>img').getBoundingClientRect().top < innerHeight - 100"), `Guide visible in mission ${order}`);
      for (const [width, height] of [
        [430, 932],
        [390, 844],
      ]) {
        await viewport(width, height);
        const size = await evaluate(
          "({width:document.documentElement.scrollWidth,viewport:innerWidth})",
        );
        assert.ok(size.width <= width, `Mission ${order} overflow ${width}`);
        await shot(`${names[order]}-mobile-${width}`);
      }
      await viewport(1366, 768);
    }
    if (order === 1 || order === 10) {
      await click(".fdn-money-token");
      await click(".fdn-transfer-game>.fdn-primary");
      await success();
      if (order === 1) await multiple([0, 3]);
      else {
        await movements([0, 1]);
        await movements([0, 1]);
      }
    }
    if (order === 2) await choices([1, 0, 1, 0, 1, 0]);
    if (order === 3) await choices([0, 1, 2, 3, 4]);
    if (order === 4) {
      for (const numbers of [
        [100000, 0, 100000],
        [120000, 20000, 100000],
      ]) {
        for (let i = 0; i < 3; i++)
          await type(
            `.fdn-equation-block:nth-child(${i + 1}) input`,
            numbers[i],
          );
        await click(".fdn-equation>.fdn-primary");
        await success();
      }
    }
    if (order === 5) await choices([0, 0, 0, 0, 0, 1, 2]);
    if (order === 6) await choices([0, 1, 1, 0]);
    if (order === 7) {
      await choices([1]);
      await type(".fdn-equation input", 18000);
      await click(".fdn-equation>.fdn-primary");
      await success();
    }
    if (order === 8)
      for (const moves of [
        [1, 0],
        [0, 0],
        [0, 0],
        [0, 0],
      ])
        await movements(moves);
    if (order === 9) await choices([0, 1, 1, 1, 1, 0]);
    if (order === 11) await journal(boss[1].lines, true);
    if (order === 12) {
      for (let i = 0; i < 5; i++) {
        await click(".fdn-cycle-view .fdn-primary");
        await click(".fdn-cycle-view .fdn-primary");
        await success();
      }
    }
    if (order === 13) {
      for (let i = 0; i < boss.length; i++) {
        console.log(`Boss transaction ${i + 1}`);
        await click(".fdn-document-inspect>.fdn-primary");
        await success();
        await multiple(boss[i].accounts.map((a) => accountIndex[a]));
        await movements(boss[i].moves);
        await journal(boss[i].lines);
      }
    }
    await wait(".fdn-mission-done");
    await click(".fdn-mission-done .fdn-primary");
  }
  await wait(".fdn-result");
  await shot("foundation-boss-result");
  assert.ok(
    await evaluate(
      `document.querySelector('.fdn-result').innerText.includes('تم فتح MIZAN TRADING')`,
    ),
  );
  assert.equal(
    await evaluate(
      `document.querySelector('.fdn-result .fdn-primary').getAttribute('href')`,
    ),
    "/ar/game/first-shift",
  );
  await click(".fdn-books>nav button:nth-child(3)");
  assert.ok(
    await evaluate(
      `document.querySelector('.fdn-books').innerText.includes('135,000')`,
    ),
  );
  await shot("foundation-boss-trial-balance", ".fdn-books");
  await click(".fdn-books>nav button:nth-child(4)");
  assert.ok(
    await evaluate(
      `document.querySelector('.fdn-books').innerText.includes('120,000')`,
    ),
  );
  await shot("foundation-boss-statements", ".fdn-books");
  await cdp("Page.navigate", { url: `${origin}/en/bootcamp` });
  await wait(".fdn-node.completed");
  await viewport(390, 844);
  const en = await evaluate(
    `({width:document.documentElement.scrollWidth,viewport:innerWidth,completed:document.querySelectorAll('.fdn-node.completed').length,dir:document.querySelector('.fdn-page').getAttribute('dir')})`,
  );
  assert.equal(en.completed, 13);
  assert.equal(en.dir, "ltr");
  assert.ok(en.width <= 390);
  await shot("foundation-completed-mobile-en");
  await click(".fdn-map-bottom .fdn-primary");
  await wait(".fdn-mission-done");
  await click(".fdn-mission-done .fdn-primary");
  await wait(".fdn-result");
  await shot("foundation-result-mobile-en");
  assert.deepEqual(errors, []);
  await writeFile(
    `${output}/qa.json`,
    JSON.stringify(
      {
        origin,
        results,
        en,
        errors,
        fullPlaythrough: "12 missions + 28 boss steps via real mouse/keyboard",
        bossTrialBalance: 135000,
        mizanFirstShiftLinkVerified: true,
      },
      null,
      2,
    ),
  );
  console.log(
    "PASS: full real-UI playthrough, all requested screenshots/viewports, bilingual restore, balanced boss books, Mizan unlock, no runtime exceptions.",
  );
} catch (error) {
  await diagnose().catch(() => {});
  throw error;
} finally {
  socket?.close();
  browser.kill();
  if (path.resolve(profile).startsWith(path.resolve(tmpdir()) + path.sep))
    await rm(profile, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 200,
    });
}
