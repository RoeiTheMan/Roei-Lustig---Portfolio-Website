import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  executablePath: 'C:/Users/roeil/.cache/puppeteer/chrome/win64-148.0.7778.167/chrome-win64/chrome.exe',
  headless: true
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

// Click Concepts tab
await page.evaluate(() => {
  document.querySelector('[data-tab="concepts"]').click();
});
await new Promise(r => setTimeout(r, 1500));

// Scroll to grid
await page.evaluate(() => {
  const panel = document.querySelector('[data-panel="concepts"]');
  if (panel) panel.scrollIntoView({ block: 'start' });
});
await new Promise(r => setTimeout(r, 500));

// Scroll to panel, then screenshot just the grid using absolute page coords
const gridInfo = await page.evaluate(() => {
  const panel = document.querySelector('[data-panel="concepts"]');
  const grid = panel ? panel.querySelector('.grid') : null;
  if (!grid) return null;
  // Use offsetTop chain for absolute position
  let top = 0, el = grid;
  while (el) { top += el.offsetTop; el = el.offsetParent; }
  return { absTop: top, left: grid.getBoundingClientRect().left, width: grid.offsetWidth, height: grid.scrollHeight };
});
if (gridInfo) {
  // Scroll past row 1 (approx 420px + labels) to show rows 2 and 3
  await page.evaluate((t) => window.scrollTo(0, t - 20), gridInfo.absTop);
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'temporary screenshots/screenshot-4-concepts-cards.png', fullPage: false });
} else {
  await page.screenshot({ path: 'temporary screenshots/screenshot-4-concepts-cards.png', fullPage: true });
}
await browser.close();
console.log('done');
