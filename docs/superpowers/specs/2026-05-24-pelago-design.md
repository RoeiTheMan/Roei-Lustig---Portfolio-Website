# Pelago — Portfolio Project Page Design Spec
**Date:** 2026-05-24  
**Tab:** Concepts  
**Page path:** `work/Pelago/index.html`

---

## Project Summary

Pelago is a coastal clothing brand built from scratch — logo, clothes, packaging, and a full campaign. The concept centers on two brand characters (a man and a woman), each embodying the brand's world. The core question: can a complete brand identity be created from nothing, and make you feel something?

---

## Assets

| File | Role |
|------|------|
| `top pelago commercial.mp4` | Hero video + main commercial (center, elevated) |
| `magnific_video-upscale_2897296438 (1).mp4` | Commercial concept (left) |
| `magnific_video-upscale_43QVmwV9Aa.mp4` | Commercial concept (right) |
| `hf_20260524_134529_24b9625b-bd68-4a25-aa1b-e3e13cd6b307.mp4` | Website demo video (16:9) |
| `pelago-logo-082F63_upscaled.jpg` | Identity image 1 — Symbol only |
| `ChatGPT Image Apr 26, 2026, 07_04_27 PM (1)_upscaled.jpg` | Identity image 2 — Full logo |
| `ChatGPT Image Apr 30, 2026, 02_02_55 PM (1)_upscaled.jpg` | Identity image 3 — Print & scale (packaging) |

All video filenames with spaces must be URL-encoded in `src` attributes.

---

## Design Approach

**Portfolio-first.** Full dark palette throughout (`--bg #0a0a0c`, `--card #111114`, `--coral #ff6a3d` accents). No brand color injection. Pelago's identity comes through the assets only.

---

## Grid Card (index.html — Concepts tab)

- Thumbnail: `top pelago commercial.mp4` as `<video>` inside `.thumb` — `width: 100%; height: auto`, no forced aspect ratio, no `.thumb.wide`
- Title: "Pelago"
- Tag/label: "Brand Identity"
- Column width: follow alternating `md:col-span-5` / `md:col-span-7` pattern per guide

---

## Page Structure

### 1. Hero
- Element: `<video>` — `top pelago commercial.mp4`
- Frozen on first frame: `heroBg.addEventListener('loadeddata', () => { heroBg.currentTime = 1; })`
- No autoplay, no loop
- Click opens lightbox
- Full bleed, same pattern as all other project pages

### 2. Nav
- Back arrow link → `/index.html#work`
- Project title: "Pelago"
- Standard portfolio nav pattern

### 3. Brief Section
Two-column grid:
- **Left column:** Project description
  > *Pelago is a coastal clothing brand built from scratch — logo, clothes, packaging, and a full campaign. The concept centers on two brand characters, a man and a woman, each embodying the brand's world. The question behind it all: can a complete brand identity be created from nothing, and make you feel something?*
- **Right column:** Deliverables badge — horizontal pill (`border-radius: 999px`), sailboat symbol only for now (can be expanded later)

### 4. Commercials Section
Three videos side by side — **natural aspect ratios preserved, no cropping, no forced dimensions**.

| Position | File | Treatment |
|----------|------|-----------|
| Left | `magnific_video-upscale_2897296438 (1).mp4` | Standard |
| Center | `top pelago commercial.mp4` | Elevated — `transform: translateY(-12px)`, slightly wider (`flex: 1.4` vs `flex: 1`) |
| Right | `magnific_video-upscale_43QVmwV9Aa.mp4` | Standard |

- All videos: `cursor: zoom-in`, `pointer-events: none` on video element, click on wrapper opens lightbox
- Center labeled "Main"
- Layout: flexbox, `align-items: flex-end` so the elevated center lifts upward

### 5. Website Demo
- File: `hf_20260524_134529_24b9625b-bd68-4a25-aa1b-e3e13cd6b307.mp4`
- Full width, 16:9 natural aspect ratio — `width: 100%; height: auto`
- Click opens lightbox
- Sits below the commercials section

### 6. Identity Section
Three equal columns, each image clickable (opens lightbox), label below each:

| Column | File | Label |
|--------|------|-------|
| 1 | `pelago-logo-082F63_upscaled.jpg` | Symbol |
| 2 | `ChatGPT Image Apr 26, 2026, 07_04_27 PM (1)_upscaled.jpg` | Full Logo |
| 3 | `ChatGPT Image Apr 30, 2026, 02_02_55 PM (1)_upscaled.jpg` | Print & Scale |

- Images: `width: 100%; height: auto` — natural aspect ratios preserved
- All three on a cream/off-white background matches their source (images have light background) — display on dark card background, no background flip

---

## Interactions

- **Lightbox:** All videos and images open a lightbox overlay on click. Closes via × button, backdrop click, or Escape key.
- **Hover:** Video thumbnails show standard portfolio hover treatment (no zoom scale on video thumbnails per guide)
- **Reveal animations:** IntersectionObserver, `translateY(16px)` → 0, `cubic-bezier(0.22,1,0.36,1)`, stagger via `.d1` (0.08s) and `.d2` (0.16s)

---

## Constraints (from guide)
- No `.thumb.wide` — video cards use `.thumb` only
- No forced aspect ratios on any video or image element
- No autoplay/loop on hero video
- URL-encode all filenames with spaces
- Deliverables badge is a horizontal pill, NOT circular
