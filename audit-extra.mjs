import { execFile } from "node:child_process";
import { promisify } from "node:util";
const pexec = promisify(execFile);
const BASE = "https://videos.roeilustig.com/";
const FILES = [
  "0306(15).mp4",
  "0316(1).mp4",
  "1224(9).mp4",
  "freepik_video-upscale_2859215733%20(1).mp4",
  "magnific_video-upscale_2897296438%20(1).mp4",
];
async function getRange(url, s, e) {
  const r = await fetch(url, { headers: { Range: `bytes=${s}-${e}` } });
  if (!r.ok && r.status !== 206) throw new Error(`HTTP ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}
async function headSize(url) {
  const r = await fetch(url, { method: "HEAD" });
  return { status: r.status, size: parseInt(r.headers.get("content-length") || "0", 10) };
}
async function moovPosition(url) {
  let offset = 0;
  for (let i = 0; i < 12; i++) {
    const h = await getRange(url, offset, offset + 15);
    if (h.length < 8) return "unknown";
    let size = h.readUInt32BE(0); const type = h.toString("latin1", 4, 8);
    if (size === 1) size = Number(h.readBigUInt64BE(8));
    if (type === "moov") return "front"; if (type === "mdat") return "end";
    if (size <= 0) return "unknown"; offset += size;
  }
  return "unknown";
}
async function probe(url) {
  const { stdout } = await pexec("ffprobe", ["-v","error","-select_streams","v:0",
    "-show_entries","stream=width,height,codec_name:format=duration,bit_rate","-of","json",url],
    { maxBuffer: 1 << 24 });
  const j = JSON.parse(stdout); const s=(j.streams&&j.streams[0])||{}; const f=j.format||{};
  return { w:s.width,h:s.height,codec:s.codec_name,dur:parseFloat(f.duration||"0"),bitrate:parseInt(f.bit_rate||"0",10)};
}
const mb=(b)=>(b/1048576).toFixed(1);
for (const name of FILES) {
  const url = BASE + name;
  try {
    const head = await headSize(url);
    if (head.status === 404) { console.log(`404 MISSING  ${decodeURIComponent(name)}`); continue; }
    const [info, moov] = await Promise.all([probe(url), moovPosition(url)]);
    console.log(`${decodeURIComponent(name).padEnd(48)} ${(mb(head.size)+"MB").padEnd(8)} ${(info.w+"x"+info.h).padEnd(11)} ${(info.dur.toFixed(1)+"s").padEnd(7)} ${((info.bitrate/1e6).toFixed(2)).padEnd(7)} ${(info.codec||"?").padEnd(7)} moov:${moov}`);
  } catch(e){ console.log(`ERR ${decodeURIComponent(name)}: ${e.message}`); }
}
