# New Work Project Guide
_Reference this file at the start of every session where a new project is being added to the work section._

---

## What This Portfolio Is

A personal portfolio for Roei Lustig — director and creative. The work section has three tabs:

- **Default** — placeholder cards, not being touched
- **Concepts** — AI-generated / experimental projects (self-initiated, not client work)
- **Directed** — real commissioned client work

Each project in Concepts or Directed gets its own dedicated page at `work/[ProjectName]/index.html`.

---

## What the User Provides

When starting a new project, the user will give you:
- A folder already created under `work/` with the video file(s) inside
- The project name and type (e.g. "glasses commercial", "Tiffany & Co. commercial")
- A few lines describing the vibe, the brief, and any specific instructions
- Sometimes a thumbnail image for the hero (if not provided, use a video frame — see Hero section below)

If anything is unclear, ask. Do not invent brief copy — the user gives the main lines and you write it from those.

---

## Folder & File Structure

```
work/
  ProjectName/
    index.html          ← the project page
    commercial.mp4      ← or whatever the video is named
    thumbnail.jpg       ← optional, if provided
```

The project name folder may already exist with the video inside when you start.

---

## Step 1 — Add the Card to the Main Grid (`index.html`)

Find the concepts panel:
```html
<!-- Panel: Concepts -->
<div data-panel="concepts" style="display:none;">
  <div class="grid grid-cols-12 gap-5">
    ...existing cards...
  </div>
</div>
```

Add the new card inside the grid, after the last existing card. Column widths alternate for visual rhythm — check what the last card uses and swap (7→5 or 5→7).

**Card structure:**
```html
<a href="work/ProjectName/index.html" class="project col-span-12 md:col-span-5">
  <div class="thumb">
    <video src="work/ProjectName/video.mp4" autoplay muted loop playsinline></video>
    <span class="thumb-tag">Commercial · 2025</span>
    <span class="thumb-play">
      <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor"><path d="M0 0 L11 6 L0 12 Z"/></svg>
    </span>
  </div>
  <div class="mt-4 flex items-start justify-between gap-4">
    <div>
      <h3 class="h-section text-ink text-[22px]">Project Name</h3>
      <p class="text-dim text-[14px] mt-1">One line description.</p>
    </div>
    <span class="mono text-[11px] text-mute mt-1">03</span>
  </div>
</a>
```

**Critical CSS rules for video cards** (already in `index.html`, verify they exist):
```css
.thumb video {
  width: 100%; height: auto; display: block;
  transition: filter 0.6s ease;
  filter: saturate(0.85) contrast(1.02) brightness(0.92);
}
.project:hover .thumb video { filter: saturate(1) contrast(1.05) brightness(1); }
```

- Do NOT use `.thumb.wide` on video cards — that forces a 16:10 aspect ratio and creates black bars
- Use `.thumb` only, and let the video's natural dimensions determine the card height
- Images use `object-fit: cover` — videos use `width: 100%; height: auto`
- No scale transform on video hover (only filter)

---

## Step 2 — Create the Project Page

Copy the structure below exactly. Do not invent a new layout or deviate from this template — consistency across all project pages is intentional.

### Page Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Name — Roei Lustig</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    /* See CSS Variables section below */
  </style>
</head>
<body>
  <!-- NAV -->
  <!-- HERO -->
  <!-- MAIN: Brief + Video Section -->
  <!-- LIGHTBOX -->
  <!-- SCRIPT -->
</body>
</html>
```

---

## CSS Variables (same on every page, do not change)

```css
:root {
  --bg:     #0a0a0c;
  --card:   #111114;
  --border: rgba(255,255,255,0.07);
  --ink:    #f0f0f0;
  --dim:    #888;
  --mute:   #444;
  --coral:  #ff6a3d;
}
```

---

## Nav

```html
<nav id="nav">
  <a href="../../index.html" class="nav-back">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2L4 7L9 12"/></svg>
    Back to work
  </a>
  <span class="nav-logo">R. LUSTIG</span>
</nav>
```

- "Back to work" is on the LEFT with a back arrow that slides left on hover
- "R. LUSTIG" is on the RIGHT in muted monospace
- Nav gains blur + border on scroll via `.scrolled` class

---

## Hero

The hero is a full-bleed section (not inside `<main>`) with a video or image as background.

**If thumbnail provided:** use `background: url('thumbnail.jpg') center/cover no-repeat` on `.hero-bg`

**If no thumbnail (most common):** use a video element as a static first frame:
```html
<section class="hero">
  <div class="hero-bg">
    <video id="heroBg" src="video.mp4" preload="auto" muted playsinline></video>
  </div>
  <div class="hero-content">
    <div class="eyebrow reveal">Commercial · 2025</div>
    <h1 class="hero-title reveal d1">Project Name</h1>
    <div class="hero-meta reveal d2">
      <span>Dir. R. Lustig</span>
      <span class="dot"></span>
      <span>Studio Commercial</span>
      <span class="dot"></span>
      <span>Tel Aviv</span>
    </div>
  </div>
</section>
```

JS to freeze the hero video on first frame (no autoplay/loop):
```js
const heroBg = document.getElementById('heroBg');
heroBg.addEventListener('loadeddata', () => { heroBg.currentTime = 1; });
heroBg.load();
```

**Hero CSS details:**
- `min-height: 60vh`
- Title: `clamp(64px, 10vw, 112px)`, `font-weight: 600`, `letter-spacing: -0.04em`, `line-height: 0.9`
- Eyebrow: `Geist Mono`, `11px`, `letter-spacing: 0.14em`, uppercase, with `::before` horizontal line (`width: 20px; height: 1px`)
- Gradient overlay via `.hero-bg::after`: `linear-gradient(180deg, rgba(10,10,12,0.55) 0%, rgba(10,10,12,0.0) 35%, rgba(10,10,12,0.75) 100%)`
- The video inside `.hero-bg` uses `object-fit: cover` — cropping is acceptable here (it's decorative)

---

## Brief Section

```html
<main>
  <div class="brief">
    <div class="row-label reveal">Brief</div>
    <p class="brief-body reveal d1">
      User-provided copy. Use <strong>bold</strong> for key phrases.
    </p>
  </div>
```

- Two-column grid: `180px 1fr`, gap `48px`
- `border-bottom: 1px solid var(--border)` (not border-top)
- Row label: `Geist Mono`, `11px`, `letter-spacing: 0.12em`, `color: var(--mute)`
- Body: `16px`, `font-weight: 300`, `line-height: 1.78`, `color: var(--dim)`

---

## Deliverables Badge

A horizontal pill above the video. Not circular — inline pill shape:

```html
<div class="del-badge reveal">
  <span class="del-badge-label">Deliverables</span>
  <span class="del-badge-sep"></span>
  <div class="del-badge-item">
    <span class="del-dot"></span>
    <span>Commercial Video</span>
    <span class="del-count">×1</span>
  </div>
</div>
```

CSS:
```css
.del-badge {
  display: inline-flex; flex-direction: row; align-items: center;
  height: 34px; padding: 0 16px; border-radius: 999px;
  border: 1px solid var(--border); background: var(--card);
  margin-bottom: 20px; gap: 10px;
}
.del-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--coral); }
.del-count { font-family: 'Geist Mono'; font-size: 10px; color: var(--mute); }
```

---

## Video Player

```html
<div class="video-wrap reveal" id="videoWrap">
  <video id="vid" src="video.mp4" preload="metadata" playsinline></video>
  <div class="play-overlay">
    <div class="play-btn">
      <svg width="16" height="18" viewBox="0 0 16 18" fill="white" style="margin-left:2px">
        <path d="M1 1L15 9L1 17V1Z"/>
      </svg>
    </div>
  </div>
</div>
<div class="video-caption reveal d1">
  <span>Project Name — Commercial 2025</span>
  <span>Dir. Roei Lustig</span>
</div>
```

**Critical rules:**
- `cursor: zoom-in` on `.video-wrap` — clicking opens the lightbox, not inline play
- `pointer-events: none` on the video element inside the wrap
- **No forced `aspect-ratio`** on `.video-wrap` — let the video's natural dimensions determine height
- `width: 100%; display: block` on the video element
- `max-width: 560px; margin: 0 auto` for portrait videos; omit for landscape
- Caption: `Geist Mono`, `11px`, `display: flex; justify-content: space-between`, `max-width` matching the wrap
- Play button: frosted glass (`background: rgba(255,255,255,0.08); backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.12)`)
- On hover: play button turns coral (`background: var(--coral)`) and scales up

---

## Lightbox

Every project page has a lightbox. Clicking the video wrap opens it. Background darkens, video plays centered.

```html
<div class="lb-overlay" id="lb">
  <button class="lb-close" id="lbClose">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 1l12 12M13 1L1 13"/></svg>
  </button>
  <video class="lb-vid" id="lbVid" src="video.mp4" controls playsinline></video>
</div>
```

JS:
```js
const lb = document.getElementById('lb');
const lbVid = document.getElementById('lbVid');

document.getElementById('videoWrap').addEventListener('click', () => {
  lb.classList.add('active');
  lbVid.play();
});

function closeLb() {
  lb.classList.remove('active');
  lbVid.pause();
  lbVid.currentTime = 0;
}

document.getElementById('lbClose').addEventListener('click', closeLb);
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
```

Close behavior: × button, clicking the dark backdrop, or pressing Escape.

---

## Reveal Animations

```css
.reveal { opacity: 0; transform: translateY(16px); transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1); }
.reveal.in { opacity: 1; transform: none; }
.d1 { transition-delay: 0.08s; }
.d2 { transition-delay: 0.16s; }
```

IntersectionObserver adds `.in` when elements enter the viewport. Apply `.reveal` to all content elements, stagger with `.d1` and `.d2`.

---

## Aspect Ratio Rules (Critical)

| Location | Rule |
|----------|------|
| Hero background | `object-fit: cover` — cropping is fine, it's decorative |
| Grid card thumbnail (video) | `width: 100%; height: auto` — NO forced aspect ratio, NO cropping |
| Grid card thumbnail (image) | `object-fit: cover` with `.thumb.wide` (16:10) |
| Project page video player | No forced aspect ratio — let the video's natural size determine height |
| Lightbox video | `max-width: 88vw; max-height: 86vh` — browser handles the ratio |

---

## Naming Conventions

- Folder names: match whatever the user created (respect capitalisation — `Glasses`, `Tiffany`, `bugatti`, `LINQ`)
- Video filenames with spaces: URL-encode in `src` attributes (`glasses%20commercial.mp4`)
- Parentheses in filenames are fine in HTML src attributes (`1224(9).mp4`)

---

## Checklist When Adding a New Project

- [ ] Card added to concepts panel in `index.html` with correct column width and card number
- [ ] Project page created at `work/ProjectName/index.html`
- [ ] Nav: "Back to work" left, "R. LUSTIG" right
- [ ] Hero: video frozen on first frame (or thumbnail if provided)
- [ ] Brief: user-provided copy, formatted with `<strong>` on key phrases
- [ ] Deliverables: horizontal pill badge (not circular)
- [ ] Video player: natural aspect ratio, no cropping, `cursor: zoom-in`
- [ ] Lightbox: click opens overlay, Escape/backdrop/× closes
- [ ] Caption: two-column with project name left, "Dir. Roei Lustig" right
- [ ] Screenshot and verify both the project page and the grid card

---

## Skill Reminders (for Claude)

**Before any coding action:** invoke `superpowers:brainstorming` — no exceptions, no matter how small the task seems. If the task looks too simple to need it, that's exactly when you need it.

**Before writing any frontend code:** invoke `frontend-design` — every session, no exceptions.

**If you skipped either skill and the user gets frustrated:** immediately suggest setting up hook enforcement so that file edits are blocked until the skills have been invoked. This makes compliance automatic and removes the temptation to rationalize around it. Offer to set it up via the `update-config` skill.
