/*
  Responsive QA audit (docs/QA-RESPONSIVE.md).

  Scrolls the static export at a set of viewports and reports, per viewport:
  horizontal page overflow, elements past the viewport edge, text clipped in
  its own box, text under 11px, tap targets under 24px and console/network
  errors. Optionally saves one screenshot per scroll step.

  Not a project dependency. Run it ad hoc:
    npm run build && npx serve out -l 4173      (or: python3 -m http.server 4173 -d out)
    npm i --no-save playwright-core
    node scripts/qa/responsive-audit.mjs

  Env: BASE (http://localhost:4173), PATHS ("/,/en/"), ONLY ("390x844,844x390"),
  REDUCED=1 (prefers-reduced-motion), SHOTS=1 (save screenshots),
  OUT (scripts/qa/out), CHROMIUM (executable path, optional).
*/
import fs from "node:fs";
import { chromium } from "playwright-core";

const BASE = process.env.BASE ?? "http://localhost:4173";
const OUT = process.env.OUT ?? new URL("./out/", import.meta.url).pathname;
const PATHS = (process.env.PATHS ?? "/,/en/").split(",");
const ONLY = process.env.ONLY?.split(",");
const REDUCED = process.env.REDUCED === "1";
const SHOTS = process.env.SHOTS === "1";

// Touch devices first, then mouse. Landscape phones are where pinned scenes break.
const VIEWPORTS = [
  [320, 568, true],
  [360, 740, true],
  [375, 667, true],
  [390, 844, true],
  [430, 932, true],
  [667, 375, true],
  [844, 390, true],
  [768, 1024, true],
  [820, 1180, true],
  [1024, 768, true],
  [1024, 1366, true],
  [1280, 720, false],
  [1366, 768, false],
  [1440, 900, false],
  [1920, 1080, false],
  [2560, 1440, false],
].map(([width, height, touch]) => ({ name: `${width}x${height}`, width, height, touch }));

/** Runs in the page: findings for what is on screen at the current scroll. */
function inspect() {
  const vw = document.documentElement.clientWidth;
  const out = [];
  const describe = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += `#${el.id}`;
    const cls = [...el.classList].slice(0, 2).join(".");
    if (cls) s += `.${cls}`;
    const scope = el.closest("section[id], header, footer, nav");
    return scope ? `${scope.id ? `#${scope.id}` : scope.tagName.toLowerCase()} > ${s}` : s;
  };
  const clipped = (el) => {
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (/(hidden|clip|auto|scroll)/.test(cs.overflowX + cs.overflow)) {
        const r = a.getBoundingClientRect();
        if (r.right <= vw + 1 && r.left >= -1) return true;
      }
    }
    return false;
  };
  for (const el of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || el.closest(".visually-hidden")) {
      continue;
    }
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height || r.bottom < 0 || r.top > innerHeight) continue;
    const text = el.textContent.trim().slice(0, 40);
    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());

    if ((r.right > vw + 1 || r.left < -1) && !el.closest("svg") && !clipped(el)) {
      out.push({ type: "overflow-x", el: describe(el), detail: `L${r.left | 0} R${r.right | 0}` });
    }
    if (ownText && el.scrollWidth > el.clientWidth + 2 && /(hidden|clip)/.test(cs.overflowX)) {
      if (cs.textOverflow !== "ellipsis") {
        out.push({ type: "text-clip", el: describe(el), detail: text });
      }
    }
    if (ownText && !el.closest("svg") && parseFloat(cs.fontSize) < 11 && cs.opacity !== "0") {
      out.push({ type: "tiny-text", el: describe(el), detail: `${cs.fontSize} ${text}` });
    }
    const interactive = "a[href], button, input, select, textarea, summary, [role=button]";
    if (el.matches(interactive) && !el.closest("[aria-hidden=true]") && cs.opacity !== "0") {
      if (r.width < 24 || r.height < 24) {
        out.push({
          type: "tap-small",
          el: describe(el),
          detail: `${r.width | 0}x${r.height | 0} ${text}`,
        });
      }
    }
  }
  return out;
}

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {},
);
const report = {};

for (const vp of VIEWPORTS.filter((v) => !ONLY || ONLY.includes(v.name))) {
  for (const path of PATHS) {
    const key = `${vp.name}${path === "/" ? "" : path.replaceAll("/", "_")}${REDUCED ? "-rm" : ""}`;
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.touch,
      hasTouch: vp.touch,
      reducedMotion: REDUCED ? "reduce" : "no-preference",
    });
    const page = await context.newPage();
    const errors = new Set();
    page.on("console", (m) => m.type() === "error" && errors.add(m.text()));
    page.on("pageerror", (e) => errors.add(`pageerror: ${e.message}`));
    page.on("response", (r) => r.status() >= 400 && errors.add(`${r.status()} ${r.url()}`));
    await page.goto(BASE + path, { waitUntil: "networkidle" });

    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const step = Math.round(vp.height * 0.8);
    const findings = new Map();
    for (let y = 0, i = 0; y < height + step; y += step, i++) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(350);
      if (SHOTS) await page.screenshot({ path: `${OUT}${key}-${String(i).padStart(3, "0")}.png` });
      for (const f of await page.evaluate(inspect)) {
        const id = `${f.type}|${f.el}`;
        if (!findings.has(id)) findings.set(id, { ...f, y });
      }
    }
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    report[key] = { overflow, errors: [...errors], findings: [...findings.values()] };
    console.log(`${key}: overflow ${overflow}px, ${findings.size} findings, ${errors.size} errors`);
    await context.close();
  }
}

fs.writeFileSync(`${OUT}report${REDUCED ? "-rm" : ""}.json`, JSON.stringify(report, null, 1));
await browser.close();
