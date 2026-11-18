# QA report — design pass

Date: 18 November 2026
Base: `54e34bb` + the uncommitted design pass described below
Stack: Next.js 15.5.29, React 19.1.1, Tailwind 4, Fraunces + Manrope via
`next/font` (self-hosted, Latin subset).

## Summary

| Check | Result | Evidence |
| --- | --- | --- |
| `tsc --noEmit` | **Pass** | 0 errors |
| `eslint .` | **Pass with warnings** | 0 errors, 2 warnings, both pre-existing in admin code |
| `next build` | **Pass** | compiled in 53s; 30 routes; middleware 95.3 kB |
| Home first-load JS | **110 kB** (103 kB shared) | build output |
| Horizontal overflow at 375 / 1440 | **None** | DOM: `scrollWidth - innerWidth = -11` at both widths |
| Console errors on Home | **None** | browser log; one Next advisory about the portrait (below) |
| Banned words in public copy | **0 matches** | ripgrep across `src/app` and `src/components`, excluding admin |
| Lighthouse | **Not run** | no Chrome/Lighthouse available in this environment |
| axe | **Not run** | no axe tooling installed; see "What is not verified" |
| Screenshots at 375 / 1440 | **Blocked** | capture refused while the Freebuff window is minimised |

## What was verified in the running build

Measured in the dev server at `http://localhost:3210` after the redesign:

- **Type:** `h1` renders in Fraunces at 76.8 px / 72.96 px line-height / −2.15 px
  tracking at 1440, and 44 px at 375. Body copy 17 px.
- **Surface:** body background `rgb(242,236,224)`, ink `rgb(16,19,23)`; button
  border-radius `0px` (token applied, not just declared).
- **Layout:** eight distinct sections on the home page, no horizontal scroll at
  either width; the desktop nav is correctly hidden at 375 and the mobile menu
  button is the only navigation affordance.
- **Network:** CSS, fonts (two woff2), crest and portrait all 200. No 404s.
- **Fonts:** no flash of fallback in the measured frame; `font-display: swap`
  plus Next's size-adjusted fallback.

### Contrast (computed, WCAG 2.2 formula)

| Pair | Ratio | Verdict |
| --- | --- | --- |
| Ink `#101317` on parchment `#F2ECE0` | 15.83 | AAA |
| Quiet `#57524A` on parchment | 6.58 | AA |
| Quiet on paper `#FAF6EE` | 7.19 | AA |
| Ember `#8A4A22` on parchment | 5.79 | AA |
| Ember on paper | 6.32 | AA |
| Parchment on ink | 15.83 | AAA |
| Gold-soft `#D9BE86` on ink | 10.34 | AAA |
| Gold `#B0803A` on ink | 5.32 | AA |
| Parchment 60% on ink (small print) | 6.29 | AA |
| **Gold `#B0803A` on parchment** | **2.98** | **Fails for text** |

Action taken: every small gold text/numeral on a light surface was changed to
ember. Gold on light surfaces is now used only for the seal artwork (a graphic,
not text) and hairline rules. The seal at 2.98:1 is the one remaining borderline
graphic; if a stricter reading is required, change `--color-gold` to `#A87432`,
which clears 3:1, at the cost of a slightly browner foil.

## The four acceptance tests

### 1. Squint test

Could not be performed on blurred images because screenshot capture is blocked.
Structural equivalent, verified in the DOM and by reading the composed markup:

- Home: dark type hero with countdown panel → parchment split 7/5 with a
  scripture plate → dark full-bleed timetable → parchment three-column numerals
  → paper teaching catalogue → ink-2 training band → parchment portrait spread →
  paper join block with seal.
- No two consecutive sections share background, column count or alignment. The
  dark bands are separated by at least two light sections at every point.

This is a design claim backed by layout structure, **not** a visual confirmation.

### 2. Template test, page by page

| Page | Would a reviewer flag AI/template? | Why not |
| --- | --- | --- |
| Home | No | No badge, no gradient, no three-up icon row, no stats band, no newsletter hero. Opens with a statement and one action. Timetable is the centrepiece. |
| About | No | Long-read with drop cap, margin notes, hairline timeline, numbered vision. No image triptych, no crucifixion scene. |
| Gatherings | No | Timetable first, prose "what to expect", covenant as numbered rules on ink. |
| Teachings | No | Publisher's catalogue: hairline rows, quiet text filters, typographic series list. No card grid, no images. |
| Teaching detail | No | Scripture set as a typographic plate instead of a hero image; reading measure 64ch; series navigation in the margin. |
| Series | No | One-column catalogue, count in the margin. |
| Training | No | Long read with sticky enrolment summary; syllabus as numerals, no icons; calm form. |
| Events | No | Date-led list with rules; photography removed rather than faked. |
| Prayer, Give, Contact, Book, Testimonies, Newsletter | Partial | They inherit the new header/footer/tokens but keep earlier body compositions; see "Remaining work". |
| 404 / error / 500 | No | Written in the site's voice, no illustration, one action each. |

### 3. Word test

`grep -riE "welcome to|unlock|elevate|seamless|empower|embark|tapestry|transform your|more than just|whether you're|journey|discover"` over
public pages and components returns **0**. Exclamations were removed from public
copy. "Welcome to The School of Prophets" still appears in **transactional email
templates** (`src/lib/email-templates.ts`, `src/lib/notify.ts`) because changing
sent mail is an admin/product decision; flag it if the rule is meant to cover
email too.

### 4. Details test

Verified by inspection of the shipped CSS:

- Custom `::selection` (gold on ink), styled scrollbar, `:focus-visible` 2 px
  ember ring with 3 px offset, `:active` translate on buttons.
- Buttons minimum height 44 px; mobile menu and close controls 44 × 44 px.
- `prefers-reduced-motion` disables transitions and smooth scrolling.
- Print stylesheet removes chrome, forces ink on white, prints link URLs.
- Form controls have designed hover/focus/disabled states, labels above inputs,
  inline errors; newsletter has a real error and success state.

Not performed: an interactive keyboard pass, form error/success submission in
this turn, network throttling, and window resizing by hand. The forms were
previously exercised after the zod 4 upgrade (valid payload `{ok:true}`, 422
field errors, honeypot silence, testimony consent rejection); that was before
this redesign and was not repeated.

## What is not verified, and why

1. **Lighthouse mobile scores.** Chrome/Lighthouse is not installed in this
   environment. The build is 103 kB shared JS with no client-side data library;
   the home page is server-rendered with one client countdown and one client
   library filter. Do not quote a score until it is measured.
2. **axe / automated a11y.** Not installed. Contrast was computed manually (table
   above); landmarks, heading order and skip link are present in markup.
3. **Screenshots at 375 / 1440.** `preview_screenshot` refuses while the Freebuff
   window is minimised ("it has not been drawn yet"). Foreground the window and
   re-run the capture; no code change is needed.
4. **Visual review of the redesign.** Because of (3), the new compositions have
   been verified structurally and numerically, not by eye.

## Known issues

- **Portrait LCP advisory.** Next reports `prophet-portrait.webp` as the LCP
  element and suggests `priority`. It sits below the fold on Home; adding
  `priority` would preload an off-screen image and hurt the real LCP. Left as is
  deliberately.
- **Admin warnings (2).** Pre-existing in another workstream; no errors. The
  public site carries none.
- **Gold on parchment at 2.98:1** for the seal artwork only (see above).
- **Missing photography and copy.** See `docs/ASSETS_NEEDED.md` and
  `docs/CONTENT_NEEDED.md`. The pages are built to look intentional without the
  missing images; they are not placeholders.

## Remaining work, in order

1. Foreground the browser, capture 375/1440 for every page, and critique against
   the checklist; adjust spacing and any composition that reads as a template.
2. Give Prayer, Give, Contact, Book, Testimonies and Newsletter the same
   page-by-page treatment as About and Gatherings. They currently inherit tokens
   but not new compositions.
3. Run Lighthouse mobile and axe once Chrome tooling is available; attach the
   JSON reports to this file.
4. Replace `public/images` AI scenes with the real photographs listed in
   `ASSETS_NEEDED.md`, then delete the unused files.
5. Confirm the content in `CONTENT_NEEDED.md`, especially the Prophet's bio,
   training fees and giving details.
