import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
const pexec = promisify(execFile);

const BASE = "https://videos.roeilustig.com/";
const SRC = "_vid_src";                 // downloaded originals (temp)
const OUT = "previews-optimized";       // re-encoded H.264 (upload these)
const POST = path.join(OUT, "posters"); // first-frame JPGs (upload these too)
for (const d of [SRC, OUT, POST]) fs.mkdirSync(d, { recursive: true });

// decoded filename -> URL-encoded path on R2 (as referenced in HTML)
const FILES = {
  "glasses commercial.mp4": "glasses%20commercial.mp4",
  "1. LINQ - Website Demo_.mp4": "1.%20LINQ%20-%20Website%20Demo_.mp4",
  "10. LINQ - Logo Animation.mp4": "10.%20LINQ%20-%20Logo%20Animation.mp4",
  "top pelago commercial.mp4": "top%20pelago%20commercial.mp4",
  "magnific_video-upscale_43QVmwV9Aa.mp4": "magnific_video-upscale_43QVmwV9Aa.mp4",
  "hf_20260524_134529_24b9625b-bd68-4a25-aa1b-e3e13dc6b307.mp4": "hf_20260524_134529_24b9625b-bd68-4a25-aa1b-e3e13dc6b307.mp4",
  "video-50ef3414.mp4": "video-50ef3414.mp4",
  "0602.mp4": "0602.mp4",
  "output-03614f78d1b64e038eba9cbeafeab362.mp4": "output-03614f78d1b64e038eba9cbeafeab362.mp4",
  "0322.mp4": "0322.mp4",
  "updated.mp4": "updated.mp4",
  "1113.mp4": "1113.mp4",
};

async function download(url, dest) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download ${url} -> HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return buf.length;
}

// 720p on the SHORTER edge, never upscale, even dims, yuv420p, no audio, faststart
const SCALE = "scale='if(gt(iw,ih), -2, min(iw,720))':'if(gt(iw,ih), min(ih,720), -2)'";
const mb = (b) => (b / 1048576).toFixed(1);

const results = [];
for (const [name, enc] of Object.entries(FILES)) {
  const url = BASE + enc;
  const src = path.join(SRC, name);
  const out = path.join(OUT, name);
  const posterName = name.replace(/\.mp4$/i, ".jpg");
  const poster = path.join(POST, posterName);
  try {
    const inSize = fs.existsSync(src) ? fs.statSync(src).size : await download(url, src);
    // Re-encode to H.264
    await pexec("ffmpeg", [
      "-y", "-i", src,
      "-vf", SCALE,
      "-c:v", "libx264", "-profile:v", "high", "-preset", "slow",
      "-crf", "23", "-pix_fmt", "yuv420p",
      "-an", "-movflags", "+faststart",
      out,
    ], { maxBuffer: 1 << 26 });
    // First-frame poster
    await pexec("ffmpeg", [
      "-y", "-i", src, "-frames:v", "1", "-q:v", "3",
      "-vf", SCALE, poster,
    ], { maxBuffer: 1 << 24 });
    const outSize = fs.statSync(out).size;
    const pSize = fs.statSync(poster).size;
    results.push({ name, inSize, outSize, pSize, posterName });
    console.log(`OK  ${name}: ${mb(inSize)}MB -> ${mb(outSize)}MB  | poster ${(pSize/1024).toFixed(0)}KB`);
  } catch (e) {
    results.push({ name, error: e.message });
    console.log(`ERR ${name}: ${e.message}`);
  }
}

console.log("\n==== SUMMARY ====");
let inT = 0, outT = 0, pT = 0;
for (const r of results) {
  if (r.error) { console.log(`  FAILED ${r.name}: ${r.error}`); continue; }
  inT += r.inSize; outT += r.outSize; pT += r.pSize;
}
console.log(`Videos: ${mb(inT)}MB -> ${mb(outT)}MB   Posters total: ${mb(pT)}MB`);
console.log(`Saved ${mb(inT - outT)}MB on video (${((1 - outT/inT) * 100).toFixed(0)}% smaller)`);
