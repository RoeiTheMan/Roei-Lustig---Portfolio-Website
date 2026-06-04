// Restore quality: re-encode all 17 from masters at NATIVE resolution, CRF 18
// (near-transparent), H.264 high, original audio copied losslessly, +faststart.
// Only the two extreme files are capped to 1080p (shorter edge).
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
const pexec = promisify(execFile);

const SRC = "_vid_src", OUT = "previews-optimized";
// Files capped to 1080p (genuinely oversized): 8K Pelago hero + 3340px QM clip
const CAP_1080 = new Set([
  "hf_20260524_134529_24b9625b-bd68-4a25-aa1b-e3e13dc6b307.mp4",
  "0306(15).mp4",
]);
const CAP_SCALE = "scale='if(gt(iw,ih), -2, min(iw,1080))':'if(gt(iw,ih), min(ih,1080), -2)'";

const files = fs.readdirSync(SRC).filter(f => f.toLowerCase().endsWith(".mp4"));
const mb = b => (b / 1048576).toFixed(1);

for (const f of files) {
  const src = path.join(SRC, f), out = path.join(OUT, f);
  const before = fs.existsSync(out) ? fs.statSync(out).size : 0;
  const args = ["-y", "-i", src];
  if (CAP_1080.has(f)) args.push("-vf", CAP_SCALE);     // cap only the extreme ones
  args.push(
    "-c:v", "libx264", "-profile:v", "high", "-preset", "slow",
    "-crf", "18", "-pix_fmt", "yuv420p",
    "-c:a", "copy",                                       // keep original audio, lossless
    "-movflags", "+faststart", out
  );
  try {
    await pexec("ffmpeg", args, { maxBuffer: 1 << 27 });
    const sz = fs.statSync(out).size;
    console.log(`OK  ${(mb(before)+"->"+mb(sz)+"MB").padEnd(18)} ${CAP_1080.has(f) ? "[capped 1080p]" : "[native]     "} ${f}`);
  } catch (e) {
    console.log(`ERR ${f}: ${String(e.message).split("\n").slice(-3).join(" | ")}`);
  }
}
console.log("QUALITY RE-ENCODE DONE");
