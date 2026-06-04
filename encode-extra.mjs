import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
const pexec = promisify(execFile);

const BASE = "https://videos.roeilustig.com/";
const SRC = "_vid_src", OUT = "previews-optimized", POST = path.join("previews-optimized", "posters");
for (const d of [SRC, OUT, POST]) fs.mkdirSync(d, { recursive: true });

// decoded filename -> URL-encoded path on R2
const FILES = {
  "0306(15).mp4": "0306(15).mp4",
  "0316(1).mp4": "0316(1).mp4",
  "1224(9).mp4": "1224(9).mp4",
  "freepik_video-upscale_2859215733 (1).mp4": "freepik_video-upscale_2859215733%20(1).mp4",
  "magnific_video-upscale_2897296438 (1).mp4": "magnific_video-upscale_2897296438%20(1).mp4",
};

async function download(url, dest) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
}
const SCALE = "scale='if(gt(iw,ih), -2, min(iw,720))':'if(gt(iw,ih), min(ih,720), -2)'";
const mb = (b) => (b / 1048576).toFixed(1);

for (const [name, enc] of Object.entries(FILES)) {
  const url = BASE + enc, src = path.join(SRC, name), out = path.join(OUT, name);
  const poster = path.join(POST, name.replace(/\.mp4$/i, ".jpg"));
  try {
    if (!fs.existsSync(src)) await download(url, src);
    const inSize = fs.statSync(src).size;
    await pexec("ffmpeg", ["-y","-i",src,"-vf",SCALE,"-c:v","libx264","-profile:v","high",
      "-preset","slow","-crf","23","-pix_fmt","yuv420p","-an","-movflags","+faststart",out],
      { maxBuffer: 1 << 26 });
    await pexec("ffmpeg", ["-y","-i",src,"-frames:v","1","-q:v","3","-vf",SCALE,poster],
      { maxBuffer: 1 << 24 });
    console.log(`OK  ${name}: ${mb(inSize)}MB -> ${mb(fs.statSync(out).size)}MB | poster ${(fs.statSync(poster).size/1024).toFixed(0)}KB`);
  } catch (e) { console.log(`ERR ${name}: ${e.message}`); }
}
console.log("extra batch done");
