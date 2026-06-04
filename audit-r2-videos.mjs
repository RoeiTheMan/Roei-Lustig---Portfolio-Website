import { execFile } from "node:child_process";
import { promisify } from "node:util";
const pexec = promisify(execFile);

const BASE = "https://videos.roeilustig.com/";

// Unique referenced videos (raw filename, already URL-encoded as in HTML)
const FILES = [
  "glasses%20commercial.mp4",
  "1.%20LINQ%20-%20Website%20Demo_.mp4",
  "10.%20LINQ%20-%20Logo%20Animation.mp4",
  "top%20pelago%20commercial.mp4",
  "magnific_video-upscale_43QVmwV9Aa.mp4",
  "hf_20260524_134529_24b9625b-bd68-4a25-aa1b-e3e13dc6b307.mp4",
  "video-50ef3414.mp4",
  "0602.mp4",
  "output-03614f78d1b64e038eba9cbeafeab362.mp4",
  "0322.mp4",
  "updated.mp4",
  "1113.mp4",
];

// Read a byte range from the URL via fetch (R2 supports range)
async function getRange(url, start, end) {
  const r = await fetch(url, { headers: { Range: `bytes=${start}-${end}` } });
  if (!r.ok && r.status !== 206) throw new Error(`HTTP ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

async function headSize(url) {
  const r = await fetch(url, { method: "HEAD" });
  return parseInt(r.headers.get("content-length") || "0", 10);
}

// Walk top-level MP4 atoms to determine if 'moov' comes before 'mdat' (faststart)
async function moovPosition(url) {
  let offset = 0;
  for (let i = 0; i < 12; i++) {
    const head = await getRange(url, offset, offset + 15);
    if (head.length < 8) return "unknown";
    let size = head.readUInt32BE(0);
    const type = head.toString("latin1", 4, 8);
    let headerLen = 8;
    if (size === 1) { size = Number(head.readBigUInt64BE(8)); headerLen = 16; }
    if (type === "moov") return "front";   // moov before any mdat → faststart
    if (type === "mdat") return "end";     // mdat first → moov is at the end
    if (size <= 0) return "unknown";
    offset += size;
  }
  return "unknown";
}

async function probe(url) {
  const { stdout } = await pexec("ffprobe", [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=width,height,codec_name,r_frame_rate,bit_rate:format=duration,bit_rate",
    "-of", "json", url,
  ], { maxBuffer: 1 << 24 });
  const j = JSON.parse(stdout);
  const s = (j.streams && j.streams[0]) || {};
  const f = j.format || {};
  return {
    w: s.width, h: s.height, codec: s.codec_name,
    fps: s.r_frame_rate,
    dur: parseFloat(f.duration || "0"),
    bitrate: parseInt(f.bit_rate || s.bit_rate || "0", 10),
  };
}

const mb = (b) => (b / 1048576).toFixed(1);
const rows = [];
for (const name of FILES) {
  const url = BASE + name;
  const decoded = decodeURIComponent(name);
  try {
    const [size, info, moov] = await Promise.all([headSize(url), probe(url), moovPosition(url)]);
    rows.push({ decoded, size, ...info, moov });
  } catch (e) {
    rows.push({ decoded, error: e.message });
  }
}

// Print table
const pad = (s, n) => String(s).padEnd(n);
console.log(
  pad("FILE", 42), pad("SIZE", 8), pad("DIMS", 11), pad("DUR", 7),
  pad("MBPS", 7), pad("CODEC", 7), "MOOV"
);
console.log("-".repeat(95));
for (const r of rows) {
  if (r.error) { console.log(pad(r.decoded, 42), "ERROR:", r.error); continue; }
  const flag = r.moov === "end" ? "END ⚠ faststart fixable" : (r.moov === "front" ? "front ✓" : r.moov);
  console.log(
    pad(r.decoded, 42),
    pad(mb(r.size) + "MB", 8),
    pad(`${r.w}x${r.h}`, 11),
    pad(r.dur.toFixed(1) + "s", 7),
    pad((r.bitrate / 1e6).toFixed(2), 7),
    pad(r.codec, 7),
    flag
  );
}

// Summary buckets
console.log("\n--- SUMMARY ---");
const over5 = rows.filter(r => !r.error && r.size > 5 * 1048576);
const moovEnd = rows.filter(r => r.moov === "end");
console.log(`Over 5MB (re-encode candidates): ${over5.length}`);
over5.forEach(r => console.log(`   ${mb(r.size)}MB  ${r.decoded}`));
console.log(`moov at END (lossless remux fixes, may avoid re-encode): ${moovEnd.length}`);
moovEnd.forEach(r => console.log(`   ${r.decoded}`));
const total = rows.reduce((a, r) => a + (r.size || 0), 0);
console.log(`Total payload of all referenced videos: ${mb(total)}MB`);
