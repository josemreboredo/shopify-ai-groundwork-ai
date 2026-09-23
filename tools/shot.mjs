/**
 * Screenshot a page of the running app over the Chrome DevTools Protocol.
 *
 * There is no browser tool in an agent session, and every layout claim made by
 * reading the stylesheet during this project's UX work was either wrong or
 * unverifiable — screenshots caught a button that never rendered, a table still
 * clipping its own text, and a "fixed" count that had reintroduced the bug it
 * closed. So: look at the page.
 *
 *   node tools/shot.mjs <url> <out.png> [width] [full|viewport|<css-selector>]
 *
 * Set PORT_OFFSET to a distinct number per concurrent run so two Chromes do not
 * collide on the debugging port.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const [url, out, widthArg = '1440', mode = 'full'] = process.argv.slice(2);
if (!url || !out) {
  console.error('usage: node tools/shot.mjs <url> <out.png> [width] [full|viewport|<selector>]');
  process.exit(1);
}

const width = Number(widthArg);
const port = 9333 + Number(process.env.PORT_OFFSET ?? 0);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--hide-scrollbars', '--force-color-profile=srgb', 'about:blank',
], { stdio: 'ignore' });

async function target() {
  for (let i = 0; i < 50; i++) {
    try {
      const pages = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).filter((t) => t.type === 'page');
      if (pages[0]?.webSocketDebuggerUrl) return pages[0].webSocketDebuggerUrl;
    } catch { /* not up yet */ }
    await sleep(200);
  }
  throw new Error('Chrome did not come up — is it installed at the path above?');
}

const ws = new WebSocket(await target());
await new Promise((r) => { ws.onopen = r; });
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m.error); pending.delete(m.id); }
};
const send = (method, params = {}) => new Promise((res) => {
  const n = ++id;
  pending.set(n, res);
  ws.send(JSON.stringify({ id: n, method, params }));
});

await send('Page.enable');
// A real phone viewport below 700, so a mobile screenshot is a mobile render
// rather than a narrow desktop one.
await send('Emulation.setDeviceMetricsOverride', { width, height: 1200, deviceScaleFactor: 2, mobile: width < 700 });
await send('Page.navigate', { url });
await sleep(2500);

let clip;
if (mode === 'full') {
  const m = await send('Page.getLayoutMetrics');
  clip = { x: 0, y: 0, width, height: Math.min(Math.ceil(m.cssContentSize.height), 12000), scale: 1 };
} else if (mode !== 'viewport') {
  const r = await send('Runtime.evaluate', {
    expression: `(() => { const el = document.querySelector(${JSON.stringify(mode)}); if (!el) return null;
      const b = el.getBoundingClientRect(); return JSON.stringify({ x: b.x + scrollX, y: b.y + scrollY, width: b.width, height: b.height }); })()`,
    returnByValue: true,
  });
  if (!r.result?.value) throw new Error(`no element matches ${mode}`);
  clip = { ...JSON.parse(r.result.value), scale: 1 };
}

const shot = await send('Page.captureScreenshot', { format: 'png', ...(clip ? { clip, captureBeyondViewport: true } : {}) });
fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
console.log(out, clip ? `${Math.round(clip.width)}x${Math.round(clip.height)}` : 'viewport');
ws.close();
chrome.kill();
