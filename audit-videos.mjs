import fs from "node:fs";
import path from "node:path";
const ROOT = process.cwd();
const R2 = "https://videos.roeilustig.com/";

// Collect HTML files
const htmlFiles = [];
(function find(dir){ for (const n of fs.readdirSync(dir)) { const f=path.join(dir,n); const s=fs.statSync(f);
  if (s.isDirectory()){ if(["node_modules",".git",".worktrees","temporary screenshots"].includes(n))continue; find(f);} else if(n.endsWith(".html")) htmlFiles.push(f);} })(ROOT);

// Match any quoted string OR url() that ends in .mp4 (covers src=, source, JS arrays)
const re = /"([^"]*\.mp4)"|'([^']*\.mp4)'|url\(\s*['"]?([^'")]+\.mp4)['"]?\s*\)/gi;

// Encode filename for URL: spaces and other unsafe chars, but keep ()-,. readable like existing refs
function encodeName(name){
  return name.split("").map(ch => {
    if (/[A-Za-z0-9\-_.!~*'()]/.test(ch)) return ch; // RFC3986 unreserved + sub-delims kept
    return encodeURIComponent(ch);
  }).join("");
}

const rows = [];           // {file, raw, basename, newUrl, existsOnDisk}
const byBasename = {};      // basename -> Set of disk source paths (collision check)

for (const file of htmlFiles) {
  const relFile = path.relative(ROOT, file).split(path.sep).join("/");
  const dir = path.dirname(file);
  const txt = fs.readFileSync(file, "utf8");
  let m;
  while ((m = re.exec(txt)) !== null) {
    const raw = m[1] ?? m[2] ?? m[3];
    if (!raw) continue;
    if (/^https?:\/\//i.test(raw)) continue; // already absolute (e.g. already-migrated)
    const clean = raw.split(/[?#]/)[0];
    let decoded; try { decoded = decodeURIComponent(clean); } catch { decoded = clean; }
    const basename = decoded.split("/").pop();
    const resolvedAbs = path.resolve(dir, decoded);
    const relDisk = path.relative(ROOT, resolvedAbs).split(path.sep).join("/");
    const exists = fs.existsSync(resolvedAbs);
    const newUrl = R2 + encodeName(basename);
    rows.push({ file: relFile, raw, basename, relDisk, exists, newUrl });
    (byBasename[basename] ??= new Set()).add(relDisk);
  }
}

// Report
console.log(`Total .mp4 references found: ${rows.length}`);
const uniqueNames = Object.keys(byBasename).sort();
console.log(`Unique .mp4 filenames: ${uniqueNames.length}\n`);

// Collision check (critical for a FLAT bucket)
const collisions = uniqueNames.filter(n => byBasename[n].size > 1);
if (collisions.length) {
  console.log("⚠️  FILENAME COLLISIONS (same name, different folders — flat bucket will clash):");
  for (const n of collisions) { console.log(`   ${n}`); for (const p of byBasename[n]) console.log(`       ${p}`); }
  console.log("");
} else {
  console.log("✅ No filename collisions — every referenced .mp4 basename is unique.\n");
}

// Missing-on-disk check
const missing = rows.filter(r => !r.exists);
if (missing.length) {
  console.log("⚠️  Referenced but NOT found on disk:");
  for (const r of missing) console.log(`   [${r.file}] ${r.raw}  ->  ${r.relDisk}`);
  console.log("");
}

// Mapping grouped by file
console.log("================ OLD → NEW MAPPING (by file) ================");
let lastFile = "";
for (const r of rows) {
  if (r.file !== lastFile) { console.log(`\n### ${r.file}`); lastFile = r.file; }
  console.log(`  OLD: ${r.raw}`);
  console.log(`  NEW: ${r.newUrl}`);
}
