// Self-contained smoke test. Run with:
//   node tests/smoke.mjs
// Loads playwright from the shared ~/.local/share/playwright-test install — no
// project-local node_modules. Embeds an http.server. Override the import path
// with WCW_PLAYWRIGHT to point at a different playwright install.

import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PW_PATH = process.env.WCW_PLAYWRIGHT
  || path.join(os.homedir(), '.local/share/playwright-test/node_modules/playwright/index.mjs');
const { chromium } = await import(PW_PATH);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = 4824;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js':  'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
  if (urlPath === '/resources') urlPath = '/resources.html';
  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Fall through to 404.html with HTTP 404 status (mirrors CF Pages behavior)
      fs.readFile(path.join(ROOT, '404.html'), (err2, body) => {
        if (err2) { res.writeHead(404); res.end('not found'); return; }
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(body);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
});

await new Promise(r => server.listen(PORT, r));
const BASE = `http://localhost:${PORT}`;

const results = [];
function assert(name, cond, detail) {
  results.push({ name, ok: !!cond, detail: cond ? null : (detail || 'failed') });
}

const browser = await chromium.launch();
const errors = [];

async function fresh() {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(`[${name||'?'}] PAGEERROR: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`CONSOLE: ${m.text()}`); });
  return { ctx, page };
}

let name = '';
try {
  // 1. All 13 slides reachable through reveal gates
  name = '13-slide navigation';
  let { ctx, page } = await fresh();
  await page.goto(BASE + '/');
  for (let i = 1; i <= 13; i++) {
    const active = await page.locator(`#slide-${i}.active`).count();
    if (!active) { assert(name, false, `stuck on slide ${i}`); break; }
    if (i < 13) {
      if (i === 5) await page.click('#reveal-btn-5');
      if (i === 10) { await page.click('#reveal-btn-q1'); await page.click('#reveal-btn-q2'); }
      await page.click('#nextBtn');
    } else {
      assert(name, true);
    }
  }
  await ctx.close();

  // 2. Lang toggle persists across pages
  name = 'lang toggle persists across pages';
  ({ ctx, page } = await fresh());
  await page.goto(BASE + '/');
  const initial = await page.locator('#langToggle').textContent();
  await page.click('#langToggle');
  const toggled = await page.locator('#langToggle').textContent();
  await page.goto(BASE + '/resources');
  const after = await page.locator('#langToggle').textContent();
  assert(name, initial === '中文' && toggled === 'EN' && after === 'EN', `${initial}->${toggled}->${after}`);
  await ctx.close();

  // 3. Reveal-gate blocks advance on slide 5
  name = 'reveal-gate blocks advance';
  ({ ctx, page } = await fresh());
  await page.goto(BASE + '/');
  for (let i = 0; i < 4; i++) await page.click('#nextBtn');
  const disabledBefore = await page.locator('#nextBtn').isDisabled();
  await page.click('#reveal-btn-5');
  const disabledAfter = await page.locator('#nextBtn').isDisabled();
  assert(name, disabledBefore && !disabledAfter);
  await ctx.close();

  // 4. Keyboard nav
  name = 'keyboard arrow keys';
  ({ ctx, page } = await fresh());
  await page.goto(BASE + '/');
  await page.keyboard.press('ArrowRight');
  const onSlide2 = await page.locator('#slide-2.active').count();
  await page.keyboard.press('ArrowLeft');
  const back1 = await page.locator('#slide-1.active').count();
  assert(name, onSlide2 && back1);
  await ctx.close();

  // 5. Home button
  name = 'home button returns to slide 1';
  ({ ctx, page } = await fresh());
  await page.goto(BASE + '/');
  for (let i = 0; i < 3; i++) await page.click('#nextBtn');
  await page.click('#homeBtn');
  const home = await page.locator('#slide-1.active').count();
  assert(name, home);
  await ctx.close();

  // 6. 404 page
  name = '404 page returns 404';
  ({ ctx, page } = await fresh());
  const resp = await page.goto(BASE + '/does-not-exist');
  const code = await page.locator('.notfound-code').textContent();
  assert(name, resp.status() === 404 && code === '404', `status=${resp.status()} code=${code}`);
  await ctx.close();

  // 7. No console errors on either main page
  name = 'no console errors on key pages';
  errors.length = 0;
  ({ ctx, page } = await fresh());
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.goto(BASE + '/resources', { waitUntil: 'networkidle' });
  assert(name, errors.length === 0, errors.join(' | '));
  await ctx.close();

  // 8. resources page has h1
  name = 'resources page has <h1>';
  ({ ctx, page } = await fresh());
  await page.goto(BASE + '/resources');
  const h1count = await page.locator('h1').count();
  assert(name, h1count >= 1, `h1 count=${h1count}`);
  await ctx.close();
} catch (e) {
  assert(name, false, e.message);
}

await browser.close();
server.close();

const passed = results.filter(r => r.ok).length;
const failed = results.filter(r => !r.ok);
for (const r of results) {
  console.log(`${r.ok ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} ${r.name}${r.detail ? ' — ' + r.detail : ''}`);
}
console.log(`\n${passed}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
