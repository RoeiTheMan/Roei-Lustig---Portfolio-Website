# Pelago Project Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Pelago grid card to the Concepts tab and build `work/Pelago/index.html` — a full project page with frozen hero, commercials section (main elevated), website demo video, and identity image progression.

**Architecture:** Single `index.html` per page, all styles inline. No build step. Follows the exact same pattern as `work/Glasses/index.html`. New files: `work/Pelago/index.html`. Modified files: `index.html` (one new card in the Concepts panel).

**Tech Stack:** Vanilla HTML/CSS/JS, Tailwind CDN (index.html grid only), Geist + Geist Mono fonts, IntersectionObserver for reveals, custom lightbox overlay.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `index.html` | Modify — append one `<a>` inside `[data-panel="concepts"] .grid` | Pelago grid card (thumbnail video + title + description) |
| `work/Pelago/index.html` | Create | Full project page — hero, nav, brief, commercials, website demo, identity images, lightbox, reveals |

### Asset filenames (URL-encoded for use in `src` attributes)

| Asset | URL-encoded src |
|-------|----------------|
| `top pelago commercial.mp4` | `top%20pelago%20commercial.mp4` |
| `magnific_video-upscale_2897296438 (1).mp4` | `magnific_video-upscale_2897296438%20(1).mp4` |
| `magnific_video-upscale_43QVmwV9Aa.mp4` | `magnific_video-upscale_43QVmwV9Aa.mp4` |
| `hf_20260524_134529_24b9625b-bd68-4a25-aa1b-e3e13cd6b307.mp4` | `hf_20260524_134529_24b9625b-bd68-4a25-aa1b-e3e13cd6b307.mp4` |
| `pelago-logo-082F63_upscaled.jpg` | `pelago-logo-082F63_upscaled.jpg` |
| `ChatGPT Image Apr 26, 2026, 07_04_27 PM (1)_upscaled.jpg` | `ChatGPT%20Image%20Apr%2026%2C%202026%2C%2007_04_27%20PM%20(1)_upscaled.jpg` |
| `ChatGPT Image Apr 30, 2026, 02_02_55 PM (1)_upscaled.jpg` | `ChatGPT%20Image%20Apr%2030%2C%202026%2C%2002_02_55%20PM%20(1)_upscaled.jpg` |

---

## Task 1: Add Pelago grid card to index.html (Concepts tab)

**Files:**
- Modify: `index.html` — inside `[data-panel="concepts"] .grid`, after the Tiffany `</a>` block (line ~930)

The card follows the alternating column pattern. Tiffany is `md:col-span-7`, so Pelago is `md:col-span-5`. Number is `05`.

- [ ] **Step 1: Locate the insertion point**

Run:
```bash
grep -n "Tiffany" "index.html"
```
Expected: line numbers for the Tiffany card. The closing `</a>` of the Tiffany block is the insertion point.

- [ ] **Step 2: Insert the Pelago card after Tiffany's closing `</a>`**

Insert this block:

```html
      <a href="work/Pelago/index.html" class="project col-span-12 md:col-span-5">
        <div class="thumb">
          <video src="work/Pelago/top%20pelago%20commercial.mp4" autoplay muted loop playsinline></video>
          <span class="thumb-tag">Brand Identity · 2025</span>
          <span class="thumb-play">
            <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor"><path d="M0 0 L11 6 L0 12 Z"/></svg>
          </span>
        </div>
        <div class="mt-4 flex items-start justify-between gap-4">
          <div>
            <h3 class="h-section text-ink text-[22px]">Pelago</h3>
            <p class="text-dim text-[14px] mt-1">A coastal clothing brand built from scratch — logo, clothes, packaging, and a full campaign.</p>
          </div>
          <span class="mono text-[11px] text-mute mt-1">05</span>
        </div>
      </a>
```

- [ ] **Step 3: Start the dev server (if not already running)**

```bash
node serve.mjs
```
Expected: server running at http://localhost:3000. If already running, skip.

- [ ] **Step 4: Screenshot and verify the card appears in the Concepts tab**

```bash
node screenshot.mjs http://localhost:3000 pelago-card
```
Then navigate to the screenshot at `temporary screenshots/screenshot-N-pelago-card.png` and visually confirm the Pelago card appears at position 05 in the Concepts tab.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add Pelago grid card to Concepts tab"
```

---

## Task 2: Create `work/Pelago/index.html` — skeleton, CSS, nav, hero

**Files:**
- Create: `work/Pelago/index.html`

- [ ] **Step 1: Create the file with full CSS and hero section**

Create `work/Pelago/index.html` with this content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pelago — Roei Lustig</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:     #0a0a0c;
      --card:   #111114;
      --border: rgba(255,255,255,0.07);
      --ink:    #f0f0f0;
      --dim:    #888;
      --mute:   #444;
      --coral:  #ff6a3d;
    }

    html { background: var(--bg); color: var(--ink); font-family: 'Geist', sans-serif; -webkit-font-smoothing: antialiased; }
    body { min-height: 100vh; }

    /* ── NAV ── */
    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 50;
      padding: 22px 48px;
      display: flex; align-items: center; justify-content: space-between;
      transition: background 0.4s ease, border-color 0.4s ease;
      border-bottom: 1px solid transparent;
    }
    nav.scrolled {
      background: rgba(10,10,12,0.8);
      backdrop-filter: blur(20px) saturate(140%);
      border-color: var(--border);
    }
    .nav-back {
      display: inline-flex; align-items: center; gap: 10px;
      color: var(--dim); text-decoration: none;
      font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: 0.06em;
      transition: color 0.2s;
    }
    .nav-back:hover { color: var(--ink); }
    .nav-back svg { transition: transform 0.2s cubic-bezier(0.22,1,0.36,1); }
    .nav-back:hover svg { transform: translateX(-4px); }
    .nav-logo { font-family: 'Geist Mono', monospace; font-size: 11px; color: var(--mute); letter-spacing: 0.1em; }

    /* ── HERO ── */
    .hero {
      position: relative; min-height: 60vh;
      display: flex; flex-direction: column; justify-content: flex-end;
      padding: 0 48px 48px; overflow: hidden;
    }
    .hero-bg { position: absolute; inset: 0; overflow: hidden; }
    .hero-bg video {
      position: absolute; inset: 0;
      width: 100%; height: 100%; object-fit: cover;
    }
    .hero-bg::after {
      content: ''; position: absolute; inset: 0; z-index: 1;
      background: linear-gradient(180deg, rgba(10,10,12,0.55) 0%, rgba(10,10,12,0.0) 35%, rgba(10,10,12,0.75) 100%);
    }
    .hero-content { position: relative; z-index: 2; }
    .eyebrow {
      font-family: 'Geist Mono', monospace; font-size: 11px;
      letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.5);
      display: flex; align-items: center; gap: 14px; margin-bottom: 16px;
    }
    .eyebrow::before { content: ''; display: block; width: 20px; height: 1px; background: rgba(255,255,255,0.3); }
    .hero-title {
      font-size: clamp(64px, 10vw, 112px);
      font-weight: 600; letter-spacing: -0.04em; line-height: 0.9;
      color: #fff; margin-bottom: 24px;
    }
    .hero-meta {
      display: flex; align-items: center; gap: 18px;
      font-family: 'Geist Mono', monospace; font-size: 11px;
      color: rgba(255,255,255,0.45); letter-spacing: 0.06em;
    }
    .dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,0.3); flex-shrink: 0; }

    /* ── MAIN ── */
    main { max-width: 1100px; margin: 0 auto; padding: 0 48px; }

    /* ── BRIEF ── */
    .brief {
      display: grid; grid-template-columns: 180px 1fr; gap: 48px;
      padding: 48px 0 40px; border-bottom: 1px solid var(--border);
    }
    .row-label {
      font-family: 'Geist Mono', monospace; font-size: 11px;
      letter-spacing: 0.12em; text-transform: uppercase; color: var(--mute); padding-top: 4px;
    }
    .brief-body { font-size: 16px; line-height: 1.78; font-weight: 300; color: var(--dim); }
    .brief-body strong { color: var(--ink); font-weight: 500; }

    /* ── DELIVERABLES BADGE ── */
    .del-badge {
      display: inline-flex; flex-direction: row; align-items: center;
      height: 34px; padding: 0 16px; border-radius: 999px;
      border: 1px solid var(--border); background: var(--card);
      margin-bottom: 20px; gap: 10px;
    }
    .del-badge-label {
      font-family: 'Geist Mono', monospace; font-size: 10px;
      letter-spacing: 0.12em; text-transform: uppercase; color: var(--mute);
    }
    .del-badge-sep { width: 1px; height: 12px; background: var(--border); }
    .del-badge-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--dim); }
    .del-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--coral); flex-shrink: 0; }
    .del-count { font-family: 'Geist Mono', monospace; font-size: 10px; color: var(--mute); }

    /* ── SECTION HEADINGS ── */
    .section-label {
      font-family: 'Geist Mono', monospace; font-size: 11px;
      letter-spacing: 0.12em; text-transform: uppercase; color: var(--mute);
      margin-bottom: 20px;
    }

    /* ── COMMERCIALS ── */
    .commercials-section { padding: 48px 0 0; }
    .commercials-grid {
      display: flex; align-items: flex-end; gap: 16px;
    }
    .commercial-item { flex: 1; }
    .commercial-item.main { flex: 1.4; transform: translateY(-16px); }
    .commercial-label {
      font-family: 'Geist Mono', monospace; font-size: 10px;
      letter-spacing: 0.1em; text-transform: uppercase; color: var(--mute);
      margin-top: 10px;
    }

    /* ── VIDEO WRAP ── */
    .video-wrap {
      position: relative; border-radius: 10px; overflow: hidden;
      background: #0d0d10; cursor: zoom-in;
      border: 1px solid var(--border);
    }
    .video-wrap video { width: 100%; height: auto; display: block; pointer-events: none; }
    .play-overlay {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      background: rgba(10,10,12,0.25);
      transition: background 0.3s ease;
    }
    .video-wrap:hover .play-overlay { background: rgba(10,10,12,0.42); }
    .play-btn {
      width: 56px; height: 56px; border-radius: 50%;
      background: rgba(255,255,255,0.08); backdrop-filter: blur(14px);
      border: 1px solid rgba(255,255,255,0.12);
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s, transform 0.25s cubic-bezier(0.22,1,0.36,1);
    }
    .video-wrap:hover .play-btn { background: rgba(255,255,255,0.14); transform: scale(1.1); }

    /* ── WEBSITE DEMO ── */
    .demo-section { padding: 32px 0 0; }

    /* ── IDENTITY IMAGES ── */
    .identity-section { padding: 48px 0 100px; }
    .identity-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .identity-item { display: flex; flex-direction: column; gap: 12px; }
    .identity-img-wrap {
      border-radius: 10px; overflow: hidden; cursor: zoom-in;
      border: 1px solid var(--border);
      transition: border-color 0.2s;
    }
    .identity-img-wrap:hover { border-color: rgba(255,255,255,0.16); }
    .identity-img-wrap img { width: 100%; height: auto; display: block; }
    .identity-caption {
      font-family: 'Geist Mono', monospace; font-size: 11px;
      letter-spacing: 0.08em; text-transform: uppercase; color: var(--mute);
    }

    /* ── LIGHTBOX ── */
    .lb-overlay {
      position: fixed; inset: 0; z-index: 1000;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,0); opacity: 0; pointer-events: none;
      transition: opacity 0.3s ease, background 0.35s ease;
    }
    .lb-overlay.active { opacity: 1; pointer-events: all; background: rgba(0,0,0,0.92); }
    .lb-media {
      max-width: 88vw; max-height: 86vh; border-radius: 8px;
      transform: scale(0.9); opacity: 0;
      transition: transform 0.38s cubic-bezier(0.22,1,0.36,1), opacity 0.32s ease;
      box-shadow: 0 40px 100px rgba(0,0,0,0.7); display: none;
    }
    .lb-overlay.active .lb-media.visible { transform: scale(1); opacity: 1; display: block; }
    .lb-close {
      position: absolute; top: 24px; right: 28px;
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: rgba(255,255,255,0.65);
      transition: background 0.2s, color 0.2s, transform 0.2s cubic-bezier(0.22,1,0.36,1);
    }
    .lb-close:hover { background: rgba(255,255,255,0.16); color: #fff; transform: scale(1.1); }

    /* ── REVEAL ── */
    .reveal { opacity: 0; transform: translateY(16px); transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1); }
    .reveal.in { opacity: 1; transform: none; }
    .d1 { transition-delay: 0.08s; }
    .d2 { transition-delay: 0.16s; }

    @media (max-width: 700px) {
      nav { padding: 18px 20px; }
      .hero { padding: 0 20px 36px; min-height: 50vh; }
      main { padding: 0 20px; }
      .brief { grid-template-columns: 1fr; gap: 14px; padding: 36px 0 32px; }
      .commercials-grid { flex-direction: column; align-items: stretch; }
      .commercial-item.main { transform: none; flex: 1; }
      .identity-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

<nav id="nav">
  <a href="../../index.html" class="nav-back">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2L4 7L9 12"/></svg>
    Back to work
  </a>
  <span class="nav-logo">R. LUSTIG</span>
</nav>

<section class="hero" id="heroWrap">
  <div class="hero-bg">
    <video id="heroBg" src="top%20pelago%20commercial.mp4" preload="auto" muted playsinline></video>
  </div>
  <div class="hero-content">
    <div class="eyebrow reveal">Brand Identity · 2025</div>
    <h1 class="hero-title reveal d1">Pelago</h1>
    <div class="hero-meta reveal d2">
      <span>Dir. R. Lustig</span>
      <span class="dot"></span>
      <span>Coastal Clothing Brand</span>
      <span class="dot"></span>
      <span>Concept</span>
    </div>
  </div>
</section>

<!-- Sections added in subsequent tasks -->

</body>
</html>
```

- [ ] **Step 2: Screenshot the hero**

Ensure dev server is running (`node serve.mjs`), then:
```bash
node screenshot.mjs http://localhost:3000/work/Pelago/index.html pelago-hero
```
Open the screenshot at `temporary screenshots/screenshot-N-pelago-hero.png`. Confirm: dark background, large "Pelago" title, frozen video frame visible.

- [ ] **Step 3: Commit**

```bash
git add work/Pelago/index.html
git commit -m "feat: Pelago page skeleton — nav, hero, CSS"
```

---

## Task 3: Add brief section and deliverables badge

**Files:**
- Modify: `work/Pelago/index.html` — add `<main>` with brief section after `</section>` (hero close tag)

- [ ] **Step 1: Insert `<main>` with brief and deliverables after the closing `</section>` of the hero**

```html
<main>
  <div class="brief">
    <div class="row-label reveal">Brief</div>
    <div class="reveal d1">
      <div class="del-badge">
        <span class="del-badge-label">Deliverables</span>
        <span class="del-badge-sep"></span>
        <div class="del-badge-item">
          <span class="del-dot"></span>
          <span>Brand Identity</span>
        </div>
      </div>
      <p class="brief-body">
        Pelago is a <strong>coastal clothing brand built from scratch</strong> — logo, clothes, packaging, and a full campaign. The concept centers on two brand characters, a man and a woman, each embodying the brand's world. The question behind it all: <strong>can a complete brand identity be created from nothing, and make you feel something?</strong>
      </p>
    </div>
  </div>
```

Note: `</main>` is added in a later task once all sections are inside it.

- [ ] **Step 2: Screenshot the brief section**

```bash
node screenshot.mjs http://localhost:3000/work/Pelago/index.html pelago-brief
```
Confirm: two-column layout (label left, text right), deliverables pill badge visible above the brief text, coral dot present.

- [ ] **Step 3: Commit**

```bash
git add work/Pelago/index.html
git commit -m "feat: Pelago page — brief section and deliverables badge"
```

---

## Task 4: Add commercials section (3 videos, main elevated)

**Files:**
- Modify: `work/Pelago/index.html` — add commercials section inside `<main>`, after the brief `</div>`

- [ ] **Step 1: Insert the commercials section**

Add this block after the brief closing `</div>` (still inside `<main>`):

```html
  <section class="commercials-section">
    <p class="section-label reveal">Commercials</p>
    <div class="commercials-grid">

      <div class="commercial-item reveal">
        <div class="video-wrap" data-lb-src="magnific_video-upscale_2897296438%20(1).mp4" data-lb-type="video">
          <video src="magnific_video-upscale_2897296438%20(1).mp4" preload="metadata" muted playsinline></video>
          <div class="play-overlay">
            <div class="play-btn">
              <svg width="13" height="15" viewBox="0 0 13 15" fill="white" style="margin-left:2px"><path d="M1 1L12 7.5L1 14V1Z"/></svg>
            </div>
          </div>
        </div>
        <p class="commercial-label">Concept</p>
      </div>

      <div class="commercial-item main reveal d1">
        <div class="video-wrap" data-lb-src="top%20pelago%20commercial.mp4" data-lb-type="video">
          <video src="top%20pelago%20commercial.mp4" preload="metadata" muted playsinline></video>
          <div class="play-overlay">
            <div class="play-btn">
              <svg width="13" height="15" viewBox="0 0 13 15" fill="white" style="margin-left:2px"><path d="M1 1L12 7.5L1 14V1Z"/></svg>
            </div>
          </div>
        </div>
        <p class="commercial-label">Main</p>
      </div>

      <div class="commercial-item reveal d2">
        <div class="video-wrap" data-lb-src="magnific_video-upscale_43QVmwV9Aa.mp4" data-lb-type="video">
          <video src="magnific_video-upscale_43QVmwV9Aa.mp4" preload="metadata" muted playsinline></video>
          <div class="play-overlay">
            <div class="play-btn">
              <svg width="13" height="15" viewBox="0 0 13 15" fill="white" style="margin-left:2px"><path d="M1 1L12 7.5L1 14V1Z"/></svg>
            </div>
          </div>
        </div>
        <p class="commercial-label">Concept</p>
      </div>

    </div>
  </section>
```

- [ ] **Step 2: Screenshot the commercials section**

```bash
node screenshot.mjs http://localhost:3000/work/Pelago/index.html pelago-commercials
```
Confirm: 3 videos side by side, center video visually higher than the flanking two. All three preserve natural aspect ratios (no black bars, no cropping).

- [ ] **Step 3: Commit**

```bash
git add work/Pelago/index.html
git commit -m "feat: Pelago page — commercials section, main video elevated"
```

---

## Task 5: Add website demo video section

**Files:**
- Modify: `work/Pelago/index.html` — add demo section after commercials section, still inside `<main>`

- [ ] **Step 1: Insert the website demo section**

Add after the commercials `</section>`:

```html
  <section class="demo-section">
    <p class="section-label reveal">Website</p>
    <div class="video-wrap reveal d1" data-lb-src="hf_20260524_134529_24b9625b-bd68-4a25-aa1b-e3e13cd6b307.mp4" data-lb-type="video">
      <video src="hf_20260524_134529_24b9625b-bd68-4a25-aa1b-e3e13cd6b307.mp4" preload="metadata" muted playsinline></video>
      <div class="play-overlay">
        <div class="play-btn">
          <svg width="16" height="18" viewBox="0 0 16 18" fill="white" style="margin-left:2px"><path d="M1 1L15 9L1 17V1Z"/></svg>
        </div>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: Screenshot the website demo section**

```bash
node screenshot.mjs http://localhost:3000/work/Pelago/index.html pelago-demo
```
Confirm: 16:9 video spans full width of the content column, natural aspect ratio preserved, no forced height.

- [ ] **Step 3: Commit**

```bash
git add work/Pelago/index.html
git commit -m "feat: Pelago page — website demo video section"
```

---

## Task 6: Add identity images section and close `<main>`

**Files:**
- Modify: `work/Pelago/index.html` — add identity section after demo section, then close `</main>`

- [ ] **Step 1: Insert the identity section**

Add after the demo `</section>`:

```html
  <section class="identity-section">
    <p class="section-label reveal">Identity</p>
    <div class="identity-grid">

      <div class="identity-item reveal">
        <div class="identity-img-wrap" data-lb-src="pelago-logo-082F63_upscaled.jpg" data-lb-type="image">
          <img src="pelago-logo-082F63_upscaled.jpg" alt="Pelago — Symbol" />
        </div>
        <span class="identity-caption">Symbol</span>
      </div>

      <div class="identity-item reveal d1">
        <div class="identity-img-wrap" data-lb-src="ChatGPT%20Image%20Apr%2026%2C%202026%2C%2007_04_27%20PM%20(1)_upscaled.jpg" data-lb-type="image">
          <img src="ChatGPT%20Image%20Apr%2026%2C%202026%2C%2007_04_27%20PM%20(1)_upscaled.jpg" alt="Pelago — Full Logo" />
        </div>
        <span class="identity-caption">Full Logo</span>
      </div>

      <div class="identity-item reveal d2">
        <div class="identity-img-wrap" data-lb-src="ChatGPT%20Image%20Apr%2030%2C%202026%2C%2002_02_55%20PM%20(1)_upscaled.jpg" data-lb-type="image">
          <img src="ChatGPT%20Image%20Apr%2030%2C%202026%2C%2002_02_55%20PM%20(1)_upscaled.jpg" alt="Pelago — Print &amp; Scale" />
        </div>
        <span class="identity-caption">Print &amp; Scale</span>
      </div>

    </div>
  </section>

</main>
```

- [ ] **Step 2: Screenshot the identity section**

```bash
node screenshot.mjs http://localhost:3000/work/Pelago/index.html pelago-identity
```
Confirm: 3 equal-width image columns, each with label below. Images display at natural aspect ratio (all are square/near-square from source).

- [ ] **Step 3: Commit**

```bash
git add work/Pelago/index.html
git commit -m "feat: Pelago page — identity images section"
```

---

## Task 7: Wire all JavaScript — nav scroll, hero freeze, lightbox, reveals

**Files:**
- Modify: `work/Pelago/index.html` — add lightbox HTML and `<script>` block before `</body>`

The lightbox is generic: it reads `data-lb-src` and `data-lb-type` from the clicked element's wrapper to know which asset to show, and whether to use a `<video>` or `<img>` element inside the overlay.

- [ ] **Step 1: Add the lightbox HTML and script block before `</body>`**

```html
<!-- LIGHTBOX -->
<div class="lb-overlay" id="lb">
  <button class="lb-close" id="lbClose">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 1l12 12M13 1L1 13"/></svg>
  </button>
  <video class="lb-media" id="lbVid" controls playsinline style="display:none;"></video>
  <img class="lb-media" id="lbImg" alt="" style="display:none;" />
</div>

<script>
  // Nav scroll
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 30), { passive: true });

  // Reveal
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  // Hero freeze
  const heroBg = document.getElementById('heroBg');
  heroBg.addEventListener('loadeddata', () => { heroBg.currentTime = 1; });
  heroBg.load();

  // Lightbox
  const lb = document.getElementById('lb');
  const lbVid = document.getElementById('lbVid');
  const lbImg = document.getElementById('lbImg');
  const lbClose = document.getElementById('lbClose');

  document.querySelectorAll('[data-lb-src]').forEach(el => {
    el.addEventListener('click', () => {
      const src = el.dataset.lbSrc;
      const type = el.dataset.lbType;
      lbVid.classList.remove('visible');
      lbImg.classList.remove('visible');
      if (type === 'video') {
        lbVid.src = src;
        lbVid.classList.add('visible');
        lbVid.play();
      } else {
        lbImg.src = src;
        lbImg.classList.add('visible');
      }
      lb.classList.add('active');
    });
  });

  function closeLb() {
    lb.classList.remove('active');
    lbVid.pause();
    lbVid.currentTime = 0;
    lbVid.src = '';
    lbImg.src = '';
    lbVid.classList.remove('visible');
    lbImg.classList.remove('visible');
  }

  lbClose.addEventListener('click', closeLb);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
</script>
```

- [ ] **Step 2: Screenshot to verify page loads without JS errors**

```bash
node screenshot.mjs http://localhost:3000/work/Pelago/index.html pelago-wired
```
Check the screenshot renders correctly (hero frozen, reveals triggered by IntersectionObserver).

- [ ] **Step 3: Commit**

```bash
git add work/Pelago/index.html
git commit -m "feat: Pelago page — lightbox, hero freeze, reveals, nav scroll"
```

---

## Task 8: Full-page QA screenshots

**Files:**
- No code changes — screenshot and verify only

- [ ] **Step 1: Screenshot the full page at desktop width**

```bash
node screenshot.mjs http://localhost:3000/work/Pelago/index.html pelago-final
```

Read the screenshot. Check all of:
- Hero: frozen first frame from `top pelago commercial.mp4`, title "Pelago" visible
- Brief: two-column layout, deliverables pill, no layout breaks
- Commercials: 3 videos side by side, center card elevated (~16px), natural aspect ratios preserved
- Website demo: full-width, 16:9
- Identity: 3 equal columns, labels below each image
- No forced black bars on any video or image

- [ ] **Step 2: Screenshot the Concepts tab on the homepage**

```bash
node screenshot.mjs http://localhost:3000 pelago-card-final
```

Read the screenshot. Navigate to Concepts tab if needed. Confirm Pelago card (#05) appears, video thumbnail loads, `md:col-span-5` column width.

- [ ] **Step 3: If any issues found — fix and re-screenshot**

Re-screenshot until no visible issues remain.

- [ ] **Step 4: Final commit**

```bash
git add index.html work/Pelago/index.html
git commit -m "feat: Pelago — complete project page and grid card"
```
