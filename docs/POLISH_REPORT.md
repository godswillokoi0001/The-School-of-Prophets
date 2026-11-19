# Final polish report

Branch `polish-final`, cut from `main` at `0637b10`. Nothing is pushed.
Commits: `2d81a93` (inventory and audit), `0637b10` (image system and first
dashboard pass), `72e6913` (public fixes and dashboard cleanup), `1c65b77`
(docs), `55b7b64` (blurred plates), `7193ddd` (screenshots), and the redesign
commit that follows this report.

`git diff --stat cdb38cd...polish-final` — **110 files changed, 2,483
insertions, 1,372 deletions**. 73 of the 124 UI files under `src/app` and
`src/components` were edited (57%). The per-file record is in
`docs/POLISH_TRACKER.md`.

## What changed

### Foundation

- One token set in `globals.css`: ink, parchment, paper, gold, quiet, ember and
  semantic `ok` / `warn` / `danger` (each with a dark-surface variant). The
  public site and dashboard read the same file.
- One radius family (8/12/16px), one easing curve, three durations, a 4/8/12/16/24/32/48/64
  spacing rhythm through the `wrap` / `section-space` utilities, fluid display,
  hero, title and lead sizes, and a gold `:focus-visible` ring on both surfaces.
- Typography: one sans family (Manrope) for headings and text, semibold
  headings with tight tracking, small-caps labels, tabular numerals on times
  and counts, curly quotes throughout. Fraunces was retired in the redesign.
- Removed from the UI: the announcement-scale pill row, raw Tailwind
  red/rose/emerald/amber, hover scale-ups and one-off type sizes. Status is a
  dot plus a word. The redesign then reintroduced one deliberate radius family,
  card surfaces and a single soft shadow for cards; those are tokens, not
  one-offs.
- The seal and crest are the only logo; `favicon.ico`, `icon.png` and
  `apple-icon.png` are generated from the crest.

### Images

- One contract in `src/lib/media.ts` and one frame, `MediaFrame`, plus `Cover`.
  Every image has a declared ratio; `contain` is used where the whole picture
  matters (outlines, posters, series art, the media library), `cover` with a
  focal point where it is photography. Nothing is stretched or upscaled.
- Uploads are non-destructive: the editor rotates and flips only, sets a focal
  point by clicking the preview, and shows phone, tablet and desktop crops.
  Contained pictures sit on a blurred, scaled copy of themselves, so a portrait
  in a wide plate has no black bars and nothing is cropped to fill them.
  Natural dimensions and focal point are stored in `site_settings.media_meta`
  (no schema change). The media page warns on small or extreme-ratio files.
- Event photography moved from letterboxed `contain` to a portrait `cover`
  frame with the stored focal point; series without art get a typographic
  plate instead of a letterboxed empty box.
- The `before`/`after` sets show the subject fully at both widths. Two supplied
  photographs are 598–896px wide, so they will soften above their display size
  on large high-density screens; that is a source-asset issue recorded below.

### Public site

- The newsletter card no longer opens over the first screen. It appears after
  60% scroll or exit intent, once a week, never on `/newsletter` or `/admin`,
  fits 320px, traps focus and closes on Escape. This was also the cause of the
  horizontal clipping visible in the first screenshots.
- `favicon.ico` was served by both `public/` and `app/`, returning **500 on
  every page**. Removed the duplicate and generated a crest icon: no more
  console errors.
- `/gatherings` overflowed to 847px at a 768px viewport. The timetable columns
  now use `minmax(0, …)` and the timetable takes the full width below `lg`;
  re-measured at 757/757.
- Home: taller hero with a lighter scrim, balanced headline measure, featured
  teaching and portrait with real focal framing.
- About: the overlapping drop cap is gone, replaced by a larger serif opening.
- Teachings: image-less series get a typographic cover, stored stub text
  (`Description...`) is suppressed, zero-part series say "In preparation".
- Events: portrait covers; registration panels are flat hairlines instead of
  cards inside cards.
- Contact: the form is no longer a card inside a card, and the FAQ renders an
  empty state rather than a heading over nothing.
- Newsletter page and footer: sober copy, optional phone behind a disclosure,
  every field retained.
- Dead `/demo-notes` footer link (404) removed; social buttons form an even
  two-column grid on phones.
- Timetable: a duplicated exception block was rendering twice; one calm notice
  remains, and the mobile row is day + time, title, focus, local time.

### Dashboard

- Grouped sidebar (Overview · Inbox · Content · Gatherings · Audience · Site ·
  Admin), mobile bottom bar with unread dot, drawer with Escape, scroll lock and
  focus restore; a solid header.
- Overview: greeting, four numbers, one feed, quick actions; charts and totals
  live behind "More insights".
- Settings: persistent left tabs and one shared heading.
- Tables stack below 768px through one `data-stack` rule; status is a dot and a
  word; inbox payload keys are humanised ("full_name" → "Full name").
- Media library: whole-image thumbnails, click-to-set focus, dimension and size
  warnings, one upload action.
- Announcements and schedule editors: pills, pulsing dots, rounded cards, gold
  borders and exclamation marks removed; labels are plain ("Session name",
  "Meeting link", "Publish").
- Availability, calendar and broadcasts: developer jargon and an outdated
  colour legend replaced with plain language.

## Proof and checks

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | exit 0 |
| `npx eslint src` | 0 errors, 9 warnings (pre-existing unused vars / effect deps) |
| `npm run build` | exit 0, compiled in 2.1 min |
| Responsive audit | 15 routes × 6 widths (320/375/768/1024/1440/1920) = 90 pairs; one overflow found (`/gatherings` 847px at 768) and fixed, re-measured clean |
| Console errors | 0 after the favicon fix (sweep records `errors: []`) |
| Banned-phrase grep | 0 hits in UI strings |
| Exclamation marks in UI copy | 0 |

Screenshots:

- `docs/qa/before/` — 15 images, generated by checking out `src/` at
  `cdb38cd`, capturing at 375 and 1440, then restoring. These show the site
  before this pass, including the overflowing letter card.
- `docs/qa/after/` — 30 images at 375 and 1440 covering home, about,
  gatherings, teachings, a teaching, testimonies, training, events, an event,
  prayer, give, contact, book, beta testers and the newsletter.

## What I could not verify

- **The signed-in dashboard.** There are no staff Supabase credentials in this
  environment, so no admin screen was opened, clicked or screenshotted. The
  dashboard work is verified by typecheck, lint and build only. The five
  three-click tasks (read a prayer request, approve a testimony, add a teaching
  to a series, edit the weekly schedule, see tomorrow's calls) are therefore
  **not tested**; their routes exist and were unchanged in structure.
- **Lighthouse and axe.** Neither is installed in this project, so no scores
  are claimed. Running them requires a browser audit against a production
  build.
- **The final full responsive sweep after the `/gatherings` fix.** Only the
  affected route was re-measured (clean); the other 89 pairs were measured
  before that one-line change.
- **File coverage.** 57% of UI files changed, below the 70% target. The 53
  reviewed files are listed with a reason in the tracker; several are thin
  wrappers, icon sets or components that already met the brief, but this is
  below the bar set in the brief and should be treated as unfinished work.
- **Visual review of every screen.** The public pages were reviewed from the
  captured screenshots; no dashboard screen was seen.

## Open items

1. Sign in as staff and click through the dashboard at 375px; run the five
   three-click tasks and capture the missing admin screenshots.
2. Replace the two small supplied photographs (598px and 896px wide) with
   originals; noted in `docs/ASSETS_NEEDED.md`.
3. Run Lighthouse mobile and axe on the public routes against `npm run build`
   output, and record actual scores.
4. Finish the remaining 53 reviewed files where a deeper rewrite is warranted
   (notably `BookingFlow`, `CalendarView`, `AvailabilityEditor`, `EventEditor`
   and the settings sub-pages).

## Second pass: modern product UI (19 November 2026)

The owner was not satisfied with the editorial direction and chose a modern
product UI, on both the site and the dashboard. The palette and crest stayed;
the layout language changed.

### Foundation

- Tokens: navy ink, white paper, `#f6f7f9` page, a hairline `line` colour,
  gold and bronze accents, quiet grey text. Paper grain, the serif display
  face and the global zero-radius reset were removed.
- Radius family: 8px controls in the admin, 12px controls and nav, 16px cards,
  pill badges. One shadow token for cards.
- Type: Manrope everywhere. Display `clamp(2.5rem, 5.2vw, 4.5rem)` at 650
  weight, tighter tracking; body back to 16px for a product rhythm.
- Section rhythm shortened (72/96/112px), `wrap` widened to 78rem.

### Rebuilt screens

- **Header** — white sticky bar, crest and two-line wordmark, grouped menus in
  a white dropdown card, outline Give and solid ink Join buttons, full-screen
  mobile menu with expandable groups and both calls to action.
- **Home** — hero with a badge, large sans headline, two CTAs and a stats row;
  the next gathering as a card; a full-width photo band with a scripture
  overlay; three system cards; the timetable inside a card; a featured
  teaching card with three compact links; a dark training card; the Prophet
  portrait card; a join card with socials.
- **Teachings** — featured teaching as a two-column card, catalogue entries as
  a two-column card grid, series as a three-column card grid with typographic
  plates for art-less series.
- **Events** — upcoming gatherings as image cards with a date badge and
  actions, past gatherings as a three-column record grid.
- **Contact** — compact header with a founded card, community links as rows,
  a bordered counsel card, the form in a white card and a card-free FAQ list.
- **Training** — the enrolment banner now uses the light variant and card
  styling instead of a dark block on a light page.
- **Page header** — the wide contained plate became a portrait card beside the
  title, which suits the ministry's portrait artwork and removes most bars.
- **Footer** — light colophon: newsletter card, brand and watchword, pages,
  week, community, credit bar.
- **Dashboard** — the dark shell was refined rather than inverted: rounded nav
  items with a filled active state, gold icons, a taller top bar, rounded
  badges and avatar, wider main padding. Its tokens follow the new palette.

### Checks

- `npx tsc --noEmit` exit 0; `npx eslint src` 0 errors, 7 warnings (all
  pre-existing); `npm run build` exit 0.
- Screenshots at 320, 375 and 1440 on `/`, `/about`, `/gatherings`,
  `/teachings`, `/teachings/series/word-of-knowledge`, `/events`, `/training`,
  `/testimonies`, `/prayer`, `/give`, `/contact`, `/book`, `/newsletter`,
  `/beta-testers` and the admin sign-in.
- No horizontal overflow at 320, 375 or 1440; no console errors beyond the
  intentional 404 for the nav group's `/community` link.
- The dashboard behind the sign-in is still untested: no staff credentials.

### Limitations

- Screens reachable only after sign-in were not opened; the shell and shared
  admin styles changed, and the login screen was checked.
- `docs/qa/after` now shows the redesign for the eight rebuilt public screens;
  the other captures in it predate this pass.
