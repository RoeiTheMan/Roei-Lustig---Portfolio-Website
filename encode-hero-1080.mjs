// RESERVE: re-encode ONLY named hero files at 1080p / CRF 20 (sharper than the
// default 720p/CRF23). Overwrites that file in previews-optimized/ + its poster,
// so you only re-upload the one or two files you bumped.
//
// Usage (run from project root):
//   node encode-hero-1080.mjs "top pelago commercial.mp4" "0322.mp4"
//   node encode-hero-1080.mjs "hf_20260524_134529_24b9625b-bd68-4a25-aa1b-e3e13dc6b307.mp4"
//
// Source is _vid_src/<name> (already downloaded). If missing, it re-fetches from R2.

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
const pexec = promisify(execFile);

const BASE = "https://videos.roeilustig.com/";
const SRC = "_vid_src", OUT = "previews-optimized", POST = path.join("previews-optimized", "posters");

const names = process.argv.slice(2);
if (!names.length) { console.error('Pass one or more filenames, e.g.: node encode-hero-1080.mjs "0322.mp4"'); process.exit(1); }

// Encode a filename for the R2 URL: spaces -> %20, keep RFC3986 unreserved + parens
const enc = (n) => n.split("").map(c => /[A-Za-z0-9\-_.!~*'()]/.test(c) ? c : encodeURIComponent(c)).join("");
const SCALE = "scale='if(gt(iw,ih), -2, min(iw,1080))':'if(gt(iw,ih), min(ih,1080), -2)'";
const mb = (b) => (b / 1048576).toFixed(1);

for (const name of names) {
  const src = path.join(SRC, name), out = path.join(OUT, name);
  const poster = path.join(POST, name.replace(/\.mp4$/i, ".jpg"));
  try {
    if (!fs.existsSync(src)) {
      console.log(`  fetching ${name} from R2 ...`);
      const r = await fetch(BASE + enc(name));
      if (!r.ok) throw new Error(`R2 HTTP ${r.status}`);
      fs.writeFileSync(src, Buffer.from(await r.arrayBuffer()));
    }
    const before = fs.existsSync(out) ? fs.statSync(out).size : 0;
    await pexec("ffmpeg", ["-y", "-i", src, "-vf", SCALE,
      "-c:v", "libx264", "-profile:v", "high", "-preset", "slow",
      "-crf", "20", "-pix_fmt", "yuv420p", "-an", "-movflags", "+faststart", out],
      { maxBuffer: 1 << 26 });
    await pexec("ffmpeg", ["-y", "-i", src, "-frames:v", "1", "-q:v", "3", "-vf", SCALE, poster],
      { maxBuffer: 1 << 24 });
    console.log(`OK  ${name}: 720p ${mb(before)}MB -> 1080p ${mb(fs.statSync(out).size)}MB  (re-upload this file + its .jpg)`);
  } catch (e) { console.log(`ERR ${name}: ${e.message}`); }
}
