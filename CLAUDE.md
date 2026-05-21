# Workplace Culture in America Workshop (W10)

Bilingual (Simplified Chinese primary, English subtitle) workshop slide deck and resource page for Chinatown Service Center. For use by Employment Outreach Specialist — projected on screen, 30-minute session.

## Tech Stack
Vanilla HTML/CSS/JS — no build step, no framework.

## Structure
```
index.html       — 13-slide projection deck (click + keyboard navigation)
resources.html   — bilingual resource reference page
404.html         — branded bilingual 404 page
app.js           — slide nav, reveal gates, language toggle (delegated data-action)
resources.js     — resources page lang toggle + QR + SW register
notfound.js      — 404 page lang init
styles.css       — shared design system (CSS variables, typography, components)
print.css        — print-friendly styles for resources page
qrcode.min.js    — client-side QR code generator (local copy)
sw.js            — service worker (cache-first, offline support)
og.png           — 1200x630 social-card image (generated via tests/smoke or build pipeline)
_headers         — Cloudflare Pages security headers
robots.txt       — crawl rules
sitemap.xml      — sitemap for the two pages
build.sh         — copies all the above into dist/ for deploy
tests/smoke.mjs  — self-contained Playwright smoke test (8 checks)
```

**Production deploy:** `./build.sh && wrangler pages deploy dist --project-name workplace-culture-workshop --branch main` — never deploy from project root (keeps CLAUDE.md, tests/, .wrangler/ off prod and avoids CF Pages' 7-day edge cache for removed paths).

## Entry Point
`index.html`

## Slides (13 total, linear flow)
1. Title: 美国职场文化 / Workplace Culture in America
2. Agenda (3 topics: Expectations / Relationships / Communication)
3. Punctuality — 8:55/9:00/9:05 traffic-light visual
4. Dress Code Basics — Business Casual / Casual / Uniform
5. Activity: What Would You Do? (single-scenario + 3-choice reveal)
6. Relationships at Work — first names, small talk, boundaries
7. Saying No & Asking for Help — politely speaking up
8. Taking Initiative — proactive habits US employers reward
9. Social Media & Work — what NOT to post (2×2 grid)
10. True/False Quiz (multi-phase reveal: Q1 → answer → Q2 → answer)
11. China vs US Workplace — comparison table (respectful framing)
12. CSC Services
13. Resources + QR code → resources.html

## Navigation
- Click anywhere → advance (regular slides)
- Arrow keys ← → also navigate
- Interactive slides (5, 10): must click reveal button before advancing

## Visual Design
Burgundy + warm gold palette — distinct from suite siblings (navy, dark navy, teal/amber, forest green/gold)
- Background: `#fff8f3` (cream)
- Primary: `#9f1239` (burgundy)
- Primary-dark: `#6b0f28`
- Accent: `#be7a2d` (warm gold)
- Text: `#2a1820` (near-black, burgundy undertone)

## Icons
All icons are inline Lucide SVGs — no emoji in icon positions.
- Agenda cards (slide 2): 40px, `color: var(--accent)`
- Topic badges: 16px
- Icon grid (slide 9): 36px, `color: var(--primary)`
- Service cards (slide 12): 32px, `color: var(--primary)`
Use `aria-hidden="true"` on every SVG.

## Responsive
`@media (max-width: 768px)` block at end of styles.css:
- All multi-column grids collapse to 1-column
- `main-title` 64px → 40px; `zh-headline` 48px → 32px
- Slide padding reduced

## Bilingual
- Language toggle stored in `localStorage` key `wcw_lang`
- `body.zh` class switches `.en`/`.zh` spans via CSS (`display: none`)
- Simplified Chinese (zh-CN); font: PingFang SC, Noto Sans SC, Microsoft YaHei
- `html[lang]` attribute updated on toggle + init function

## Deployment
Cloudflare Pages → `workplace-culture-workshop.pages.dev`

```
./build.sh   # builds curated dist/
wrangler pages deploy dist --project-name workplace-culture-workshop --branch main
```

**Before deploying:** bump `CACHE` version in `sw.js` (e.g. `v4` → `v5`) to invalidate cached assets on visitor devices.

## Tests
Self-contained Playwright smoke (no project-local node_modules):
```
node tests/smoke.mjs   # resolves playwright from ~/.local/share/playwright-test/
```
Covers 13-slide nav, reveal gates, lang persistence, keyboard nav, home button, 404 page, console-error baseline.

## CSP
Strict — no `'unsafe-inline'` on `script-src`. All JS in external files (`app.js`, `resources.js`, `notfound.js`). Inline `onclick=` handlers replaced with `data-action="kebab-name"` + delegated body listeners. `'unsafe-inline'` retained only on `style-src` (low-risk inline `style=""` attrs for one-off layout overrides).

## Hub Integration
After build, add card to `csc-workshops` hub `index.html` (next number) and bump that project's `sw.js` CACHE. This workshop is W10 in the curriculum series — Phase 3: Workplace Success.
