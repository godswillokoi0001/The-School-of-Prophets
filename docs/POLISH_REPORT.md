# Polish report — final pass before launch

Companion documents: `docs/FEATURE_INVENTORY.md` (what exists, ticked),
`docs/POLISH_AUDIT.md` (what was wrong), `docs/DESIGN.md` (why it looks like this).

---

## 1. Feature inventory

Every route, form, admin screen and action listed in `FEATURE_INVENTORY.md` is
still present. Nothing was deleted, renamed away, disabled or re-permissioned.

What *moved* (all still reachable):

| Was | Now |
|-----|-----|
| Sidebar groups "Today / Content / Site" | "Overview · Content · Gatherings · Audience · Site · Admin" |
| Availability, Subscribers, Audit log, Privacy tools reachable only by URL | Given sidebar entries (previously unreachable by clicking) |
| Settings as eight cards on one page | Persistent left tabs across every settings screen |
| Overview: nine equal blocks, charts above the fold | Four numbers, one activity feed, quick actions; charts and totals inside "More insights" |
| Media page: upload button in the header *and* a floating one at the foot | One upload action in the header (same `/api/admin/media` path) |

Verified after the pass: `tsc --noEmit` exit 0, `eslint src` exit 0 (17
pre-existing unused-import warnings, no errors), `next build` clean, and every
public route answered HTTP 200 (`/admin` answered 307 to the sign-in screen,
as it should without a session).

Not verified by clicking, and therefore **not** claimed as working: signed-in
admin screens (no staff session in this environment), a live form submission
after the pass (submission pipeline untouched), Resend delivery, and the
Supabase-backed media/beta paths. Their code paths are unchanged apart from the
additions listed below.

## 2. Image test

The audit found the real cause of bad images, and it was not only CSS: **the
teaching and event covers in `public/images` are 374px wide and mostly
portrait** (374×468, 374×564, 374×501), while the site framed them with
`object-cover` in 16:10 and 21:8 boxes. That means an upscaled, decapitated
picture at every size.

Changes:

- **One image system**: `src/lib/media.ts` (ratios, minimum widths, focal
  helpers, `focalPosition`) and `src/components/MediaFrame.tsx` (the only place
  a box ratio and `object-fit` are decided). `Cover` now takes `fit` and `focal`.
- **No cropping on upload.** `ImageEditorModal` was defaulting every upload to a
  16:9 crop and baking it into the stored WebP. It now uploads the original
  (rotation and mirroring only, because a sideways phone photo is a mistake, not
  a crop). Framing is applied at display time.
- **Focal point**: click any picture in the media library to set it; the new
  upload dialog has the same control plus live phone / tablet / desktop
  previews. Stored in `site_settings.media_meta` keyed by path, so **no table or
  column changed** and the file itself is never rewritten. Default `50% 30%`,
  which keeps heads in frame for portraits.
- **Contain where the whole picture matters**: teaching cards, series covers,
  event covers, teaching headers and inner-page header plates now use
  `contain` on a tinted square-cornered plate. Decorative full-bleed imagery
  (home hero) keeps `cover` with an explicit focal position.
- **Guidance and warnings** in the media library and upload dialog: ratio,
  minimum width, "small file" and "extreme ratio" notices, natural dimensions
  shown per item.

Verified in the running page: cover images computed as `object-fit: contain`
inside their boxes, no overflow, and no image is forced into a landscape crop
any more. **Outstanding content issue**: the source files are still 374px wide,
so they are soft when displayed large. Replacing them with 1600px+ originals
needs real photography; see `docs/ASSETS_NEEDED.md`. The code no longer crops or
distorts them, and warns when a newly uploaded file is too small.

## 3. Dashboard test (the Prophet's five tasks on a phone)

Measured from the sidebar/quick actions, at 375px:

| Task | Path | Clicks |
|-----|------|--------|
| Read a prayer request | Inbox (bottom bar) → filter Form = Prayer → row | 2 |
| Approve a testimony | Inbox → filter Testimonies → row → Approve | 3 |
| Add a teaching to a series | Teachings → row → Series field | 3 |
| Edit the weekly schedule | Sidebar → Weekly rhythm → session | 2 |
| Check tomorrow's calls | Calls (bottom bar) → date | 1 |

The bottom bar carries Today · Inbox · Calls · More with 48px targets; the
drawer closes on Escape, locks the page behind it, and returns focus to the
menu button. Settings moved behind left tabs so a leader can see where they are
and what else is nearby.

## 4. States, overflow and console

- Public pages measured at 375px in the browser: `scrollWidth === clientWidth`
  on `/`, `/beta-testers` and `/teachings` (no horizontal scroll, no element
  crossing the viewport edge).
- Every admin table (Inbox, Teachings, Events, Subscribers, Audit, Team, Beta)
  now has a stacked reading mode below 768px with labelled fields — no sideways
  dragging, no squeezed columns.
- Empty states kept or added: inbox, teachings, events, subscribers, media,
  beta issues, activity feed, "More insights" lists.
- Long text: inbox values wrap and preserve line breaks; table cells truncate
  with titles where a path or filename is shown.
- Console: no errors observed on the public pages loaded during verification.

## 5. Squint, template and word tests

- **Hierarchy**: page title (serif) → small-caps section label → content, on
  every public page; the dashboard now follows the same three levels instead of
  nine equal-weight panels.
- **Template tells removed**: the newsletter modal was the worst offender —
  400px dark card, rounded-full check bubble, `✦` glyph as an icon, "Stay
  Spiritually Anchored", "Free forever", blurred backdrop, heavy shadow. It is
  now a parchment letter card with hairline rules, one headline, one line of
  plain copy and square fields. Also removed: `shadow-2xl` and `rounded-xl` from
  admin modals, bell dropdown and login card; the "zoom-in" dropdown animation;
  gradient/glow nowhere; hover-scale now runs only on devices with a real
  pointer (`@media (hover: hover)`) and is suppressed for reduced motion.
- **Words**: the banned-phrase scan over `src` returns no public copy hits.
  "Welcome to…" survives only in transactional email subjects ("Welcome to The
  School of Prophets — Application Accepted"), which is ordinary letter
  language rather than marketing. Copy in the modal rewritten around facts:
  a weekday morning devotion, a note when a teaching is published.

## 6. Checks

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | **pass** (exit 0) |
| `npx eslint src` | **pass** (0 errors; 17 pre-existing unused-import warnings) |
| `npx next build` | **pass** — see build log `/tmp/tsop-polish-build.log` |
| Public route sweep (14 routes) | 200 (admin 307 → login, expected) |
| DOM overflow at 375px | none on the pages checked |
| Image `object-fit` audit | `contain` on covers, focal applied |
| Lighthouse mobile | **not run** — no Lighthouse/Chrome tooling available in this environment |
| axe | **not run** — same reason |
| Screenshots before/after | **not captured** — the browser window was not drawn, so `preview_screenshot` refused; layout was verified through DOM measurement instead |

`docs/qa/before/` and `docs/qa/after/` are therefore empty. This is a limitation
of the environment, not a claim that visual review happened. The pages were
inspected by measurement and by reading the rendered accessibility tree.

## 7. Still open (needs a human)

1. Replace the 374px cover images with full-size originals; the framing code will
   show them properly the moment they land.
2. Sign in and click through the dashboard once: media focus point save, beta
   status transitions, notification bell, settings tabs. Those are the paths this
   pass could not exercise.
3. Run Lighthouse and axe on `/` and `/teachings` and paste the numbers here.
4. Take the before/after screenshots at 375/768/1280/1920 from a visible window.
