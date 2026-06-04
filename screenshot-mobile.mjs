import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.join(__dirname, "temporary screenshots");

const url = process.argv[2] || "http://localhost:3000";
const width = parseInt(process.argv[3] || "375", 10);
const label = process.argv[4] || `m${width}`;
const action = process.argv[5] || ""; // "menu" to open hamburger

function nextScreenshotPath(label) {
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const existing = fs.readdirSync(SCREENSHOT_DIR);
  let maxN = 0;
  for (const name of existing) {
    const match = name.match(/^screenshot-(\d+)(?:-.+)?\.png$/);
    if (match) { const n = parseInt(match[1], 10); if (n > maxN) maxN = n; }
  }
  const filename = label ? `screenshot-${maxN + 1}-${label}.png` : `screenshot-${maxN + 1}.png`;
  return path.join(SCREENSHOT_DIR, filename);
}

(async () => {
  const outPath = nextScreenshotPath(label);
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 800, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
    await new Promise(r => setTimeout(r, 1800));
    let fullPage = true;
    if (action === "menu") {
      await page.evaluate(() => document.getElementById("navToggle").click());
      await new Promise(r => setTimeout(r, 700));
      fullPage = false; // capture just the viewport overlay
    }
    // Report any horizontal overflow
    const overflow = await page.evaluate(() => {
      const de = document.documentElement;
      return { scrollW: de.scrollWidth, clientW: de.clientWidth, overflow: de.scrollWidth - de.clientWidth };
    });
    console.log(`Overflow check @${width}: scrollW=${overflow.scrollW} clientW=${overflow.clientW} diff=${overflow.overflow}`);
    await page.screenshot({ path: outPath, fullPage });
    console.log(`Saved: ${outPath}`);
  } finally {
    await browser.close();
  }
})().catch(err => { console.error(err); process.exit(1); });
