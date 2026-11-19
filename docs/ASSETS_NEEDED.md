# Photography and assets needed

The public site renders the crest, the founder portrait, the home hero plate and
the cover images attached to teachings, series and events in the CMS. Those
covers currently fall back to the archived scene files in `public/images` and
should be replaced with real photographs as they are supplied. Where no image
exists, the page uses type, the seal, or rule-work rather than a placeholder box.

Drop new files into `public/images/`, keep the names below, and tell the
developer which page they belong on. Nothing else needs changing.

## In use now

| File | What it is | Where it appears | Status |
| --- | --- | --- | --- |
| `tsop-crest.webp` / `.png` | The ministry crest, supplied by the client | Header, footer seal centre, favicon, OG image | Real, keep |
| `prophet-portrait.webp` | Prophet Lawrence Iwara, studio portrait | Home, About | Real, but square (1000×1000) and only one frame |
| `desert-walk.webp` | Watchman on a hillside above a village, dusk | Home hero plate | Archive scene, replace with a real gathering or ministry photograph |
| CMS `cover_url` | Cover per teaching, series and event | Teaching cards and pages, series pages, event rows | Archive scenes on seeded entries; upload real covers in the admin |

## Required before launch

### 1. The Prophet, three-quarter portrait
- **Size:** 1200 × 1600 px (3:4), sRGB, under 300 KB as WebP.
- **Shot:** standing or seated, three-quarter turn, looking slightly off-camera,
  plain wall or curtain, no stage lighting, no microphone in frame.
- **Why:** the existing portrait is square and head-on; in a 4:5 frame it is
  cropped tight and appears on two pages at once.
- **Path:** `public/images/prophet-portrait-3x4.webp`

### 2. The Prophet teaching
- **Size:** 2400 × 1350 px (16:9), sRGB.
- **Shot:** mid-sentence at a laptop or lectern, Bible open, face lit from one
  side, screen content not legible, no other ministry's branding visible.
- **Why:** the homepage training band and the teaching detail page currently have
  no image at all. One honest frame of the actual work would carry both.

### 3. A gathering, as it really looks
- **Size:** 2000 × 1125 px (16:9), plus one 1200 × 1500 crop.
- **Shot:** a screenshot of the actual video call with names and faces either
  consented or blurred; OR a photograph of members watching together, taken by a
  member, with written consent from everyone identifiable.
- **Why:** visitors ask what an online gathering looks like. This is the single
  most useful missing image. Do **not** stage it.

### 4. Bible institute cohort
- **Size:** 2000 × 1333 px (3:2).
- **Shot:** the last cohort, however small, in class or on a closing call, with
  consent. If no cohort has been photographed, skip it; the typographic syllabus
  is enough.

### 5. Anniversary gathering
- **Size:** 2000 × 1125 px (16:9).
- **Shot:** the 5th anniversary, 19 September 2026, from the actual event.
- **Why:** the Events page currently has no imagery for its own history.

### 6. Crest as vector
- **File:** `tsop-crest.svg`, exported from the original artwork, single colour
  and full colour versions.
- **Why:** the PNG/WebP crest is used at 16 px (favicon) through 600 px (seal
  watermark). Vector removes the soft edges at small sizes and halves the bytes.

## Files to remove (AI-generated or third-party, no longer referenced)

These are still in `public/images` but are **not rendered anywhere** on the
public site. Delete them at launch so nobody reuses them by accident:

- `desert-dawn.webp`, `desert-walk.webp`
- `prayer-cave.webp`, `prayer-cathedral.webp`, `praying-man.webp`
- `potter.webp`, `crucifixion.webp`, `bible-bedside.webp`
- `shofar-sky.webp`, `shofar-sunset.webp`, `eagle-head.webp`, `eagle-gold.webp`
- `worship-hands.webp` — real-looking but unverified; confirm its source and
  written consent before putting it back. One image contains another ministry's
  banner ("House of Fire"), so the set cannot be assumed to be ours.
- The 14 Facebook-sourced `.jpg` files and `Prophet Lawrence Iwara.jpg` — raw
  originals, unused; keep them out of `public/` in an archive folder.

## Image treatment rules (for whoever adds the files)

- Warm grade, slight desaturation, soft contrast. No filters that change between
  photos.
- 3:4 for portraits, 3:2 or 16:9 for scenes. Never mix ratios within a row.
- Captions in small caps, sentence case, with the event and date.
- Alt text describes what is happening, not "image of".
- Consent: no identifiable face without written permission. This includes
  screenshots of video calls.

## Resolution audit (final polish pass)

Measured widths of the files currently in use:

| File | Pixels | Displayed at | Verdict |
| --- | --- | --- | --- |
| `desert-walk.webp` | 1408 × 768 | full-bleed hero | fine |
| `prophet-portrait.webp` | 1000 × 1000 | 4:5 plate, up to 40vw | fine up to 1440 |
| `worship-hands.webp` | 896 × 1200 | page plate, up to 1200 | soft on a 2× large screen |
| `shofar-sunset.webp` | 598 × 900 | event cover | soft once displayed above ~300px |

Replace `shofar-sunset.webp` and `worship-hands.webp` with the largest originals
available. The site never crops the file, so a portrait original is fine.
