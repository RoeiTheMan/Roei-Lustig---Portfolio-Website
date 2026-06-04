import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

// 1. Build a set of all real files (POSIX relative paths, exact case)
function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (["node_modules", ".git", ".worktrees", "temporary screenshots"].includes(name)) continue;
      walk(full, acc);
    } else {
      acc.push(path.relative(ROOT, full).split(path.sep).join("/"));
    }
  }
  return acc;
}
const realFiles = new Set(walk(ROOT));

// 2. Collect HTML files to scan
const htmlFiles = [];
(function findHtml(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (["node_modules", ".git", ".worktrees", "temporary screenshots"].includes(name)) continue;
      findHtml(full);
    } else if (name.endsWith(".html")) {
      htmlFiles.push(full);
    }
  }
})(ROOT);

const mediaExt = /\.(jpe?g|png|webp|avif|gif|mp4|webm|mov)$/i;
const X = "jpe?g|png|webp|avif|gif|mp4|webm|mov";
// Three alternatives, each REQUIRING a media extension immediately before the
// closing delimiter — so prose apostrophes (Director's / you're) can't form a
// span. Catches: double-quoted attrs/strings, single-quoted JS strings, url().
const attrRe = new RegExp(`"([^"]*\\.(?:${X}))"|'([^']*\\.(?:${X}))'|url\\(\\s*['"]?([^'")]+)['"]?\\s*\\)`, "gi");

let problems = [];
let risky = [];
let okCount = 0;

for (const file of htmlFiles) {
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  const dir = path.dirname(file);
  const txt = fs.readFileSync(file, "utf8");
  let m;
  while ((m = attrRe.exec(txt)) !== null) {
    let raw = m[1] ?? m[2] ?? m[3];
    if (!raw) continue;
    if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:") || raw.startsWith("#") || raw.startsWith("mailto:")) continue;
    // strip query/hash
    const clean = raw.split(/[?#]/)[0];
    if (!mediaExt.test(clean)) continue;
    // decode percent-encoding (browser does this before hitting the FS)
    let decoded;
    try { decoded = decodeURIComponent(clean); } catch { decoded = clean; }
    // resolve relative to the HTML file's directory
    const resolvedAbs = path.resolve(dir, decoded);
    const resolvedRel = path.relative(ROOT, resolvedAbs).split(path.sep).join("/");
    // Flag local refs that resolve but carry characters that should be
    // percent-encoded for a case-sensitive static host (raw space, raw &).
    const looksLocal = /^(work|partners|brand_assets|assets)\//i.test(raw) || (!raw.includes("/") );
    const hasRawSpace = / /.test(raw);
    const hasRawAmp = /&(?!amp;)/.test(raw) && !/%26/.test(raw);
    if (realFiles.has(resolvedRel)) {
      okCount++;
      if (hasRawSpace || hasRawAmp) {
        risky.push({ in: rel, raw, why: [hasRawSpace && "raw space", hasRawAmp && "raw &"].filter(Boolean).join(", ") });
      }
    } else {
      // try to find a case-insensitive / near match for diagnosis
      const lower = resolvedRel.toLowerCase();
      const ciMatch = [...realFiles].find(f => f.toLowerCase() === lower);
      problems.push({ in: rel, raw, resolves: resolvedRel, exists: false, caseOnly: ciMatch || null });
    }
  }
}

console.log(`OK references: ${okCount}`);
console.log(`RISKY (resolve locally but unencoded for Cloudflare): ${risky.length}`);
for (const r of risky) console.log(`   ⚠ [${r.in}] ${r.raw}   (${r.why})`);
console.log("");
console.log(`BROKEN references: ${problems.length}\n`);
for (const p of problems) {
  console.log(`✗ [${p.in}]`);
  console.log(`    ref:      ${p.raw}`);
  console.log(`    resolves: ${p.resolves}`);
  if (p.caseOnly) console.log(`    >> exists with different case: ${p.caseOnly}`);
  else console.log(`    >> no file by that name (renamed/typo/missing)`);
  console.log("");
}
