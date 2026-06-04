import fs from "node:fs";
import path from "node:path";
const ROOT = process.cwd();
const LIMIT = 25 * 1024 * 1024; // Cloudflare Pages per-file limit (25 MiB)

// Collect HTML + their referenced media (reuse simple extraction)
const htmlFiles = [];
(function find(dir){ for (const n of fs.readdirSync(dir)) { const f=path.join(dir,n); const s=fs.statSync(f);
  if (s.isDirectory()){ if(["node_modules",".git",".worktrees","temporary screenshots"].includes(n))continue; find(f);} else if(n.endsWith(".html")) htmlFiles.push(f);} })(ROOT);

const X = "jpe?g|png|webp|avif|gif|mp4|webm|mov";
const re = new RegExp(`"([^"]*\\.(?:${X}))"|'([^']*\\.(?:${X}))'|url\\(\\s*['"]?([^'")]+)['"]?\\s*\\)`, "gi");
const referenced = new Set();
for (const file of htmlFiles) {
  const dir = path.dirname(file); const txt = fs.readFileSync(file,"utf8"); let m;
  while ((m = re.exec(txt)) !== null) {
    let raw = m[1] ?? m[2] ?? m[3]; if (!raw) continue;
    if (/^(https?:)?\/\//i.test(raw)||raw.startsWith("data:")||raw.startsWith("#")) continue;
    const clean = raw.split(/[?#]/)[0];
    if (!new RegExp(`\\.(?:${X})$`,"i").test(clean)) continue;
    let dec; try { dec = decodeURIComponent(clean); } catch { dec = clean; }
    const rel = path.relative(ROOT, path.resolve(dir, dec)).split(path.sep).join("/");
    referenced.add(rel);
  }
}

const over = [];
for (const rel of referenced) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) continue;
  const sz = fs.statSync(abs).size;
  if (sz > LIMIT) over.push({ rel, mb: (sz/1048576).toFixed(1) });
}
over.sort((a,b)=>parseFloat(b.mb)-parseFloat(a.mb));
console.log(`Referenced media files: ${referenced.size}`);
console.log(`Referenced files OVER 25 MiB (will NOT serve on Cloudflare Pages): ${over.length}\n`);
for (const o of over) console.log(`  ${o.mb.padStart(7)} MB  ${o.rel}`);
