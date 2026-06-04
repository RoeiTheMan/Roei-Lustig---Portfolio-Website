import fs from "node:fs";

// Project pages only — index.html is already handled with its own cycler/observer JS.
const FILES = [
  "work/Glasses/index.html",
  "work/Action Scenes/index.html",
  "work/Pelago/index.html",
  "work/bugatti/index.html",
  "work/LINQ/index.html",
  "work/QM AQC25 & APS26/index.html",
  "work/Tiffany/index.html",
  "work/blue the chanel/index.html",
];

const tagRe = /<video\b[^>]*>/gi;
let totalChanged = 0;

for (const file of FILES) {
  let txt = fs.readFileSync(file, "utf8");
  let changed = 0;
  txt = txt.replace(tagRe, (tag) => {
    const srcM = tag.match(/\bsrc="([^"]+)"/i);
    if (!srcM) return tag;                       // srcless lightbox (JS-driven) — skip
    const src = srcM[1];
    if (!/videos\.roeilustig\.com\/.+\.mp4$/i.test(src)) return tag;
    const posterUrl = src.replace(/\.mp4$/i, ".jpg");

    let out = tag;
    // 1) force preload="none"
    if (/\bpreload="[^"]*"/i.test(out)) {
      out = out.replace(/\bpreload="[^"]*"/i, 'preload="none"');
    } else {
      out = out.replace(/>$/, ' preload="none">');
    }
    // 2) add poster if missing
    if (!/\bposter="/i.test(out)) {
      out = out.replace(/>$/, ` poster="${posterUrl}">`);
    }
    if (out !== tag) changed++;
    return out;
  });
  if (changed) { fs.writeFileSync(file, txt); totalChanged += changed; }
  console.log(`${changed.toString().padStart(2)}  ${file}`);
}
console.log(`\nTotal <video> tags updated: ${totalChanged}`);
