import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.join(__dirname, "temporary screenshots");

const url = process.argv[2] || "http://localhost:3000";
const label = process.argv[3] || "";

function nextScreenshotPath(label) {
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const existing = fs.readdirSync(SCREENSHOT_DIR);
  let maxN = 0;
  for (const name of existing) {
    const match = name.match(/^screenshot-(\d+)(?:-.+)?\.png$/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > maxN) maxN = n;
    }
  }
  const n = maxN + 1;
  const filename = label ? `screenshot-${n}-${label}.png` : `screenshot-${n}.png`;
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
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`Saved: ${outPath}`);
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error(err);
  process.exit(1);
});
