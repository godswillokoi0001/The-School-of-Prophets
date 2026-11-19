# Polish audit — pre-launch

Audit performed by reading every public page, every admin screen and the shared
components, then loading the site in a browser at 375 / 768 / 1280 / 1920.

Strengths worth protecting: the public site already has a real art direction
(parchment/ink/gold, zero radius, hairline rules, editorial type scale, no card
grids, no emoji, no gradients except photographic scrims). The dashboard shares
the palette but not the discipline. Most of this audit is therefore about the
dashboard, the newsletter modal, images and small craft details.

Severity: **S1** breaks or embarrasses · **S2** visibly off · **S3** polish.

---

## A. Broken or glitchy

| # | Page | Viewport | Sev | Problem | Fix |
|---|------|----------|-----|---------|-----|
| A1 | `/admin` Inbox, Teachings, Events, Subscribers, Audit, Users, Beta | 375 | S1 | Every table is `min-w-[640px]` inside `overflow-x-auto`: on a phone the user sees two columns and must drag sideways. | One shared responsive table pattern: real table ≥768px, stacked rows with labelled fields below. |
| A2 | Admin shell | 375 | S1 | No bottom navigation; Calendar, Inbox and Overview are two taps deep in a drawer. | Fixed bottom bar: Overview · Inbox · Calendar · More, 48px targets, safe-area padding. |
| A3 | Admin drawer | 375 | S2 | Drawer has no Escape close, no scroll lock, no focus return; page behind still scrolls. | Escape + scroll lock + focus to panel, restore on close. |
| A4 | Admin top bar | all | S2 | `bg-ink/90 backdrop-blur` over content — text ghosts through on scroll. | Solid `bg-ink` with hairline border. |
| A5 | `/admin/inbox/[id]` | all | S2 | Payload keys are rendered raw (`overall rating`, `area ratings`, `story consent`, JSON arrays stringified). | Humanise labels, format arrays/booleans/screenshots, keep every value. |
| A6 | `/admin/teachings` | all | S2 | Whole `<tr>` is clickable but not focusable; keyboard users can't open a teaching from the row. | Row link + keyboard handler, visible focus. |
| A7 | `/admin/beta` | 375 | S2 | Summary chips and tables overflow the card. | Grid + stacked table pattern. |
| A8 | Admin editors | all | S3 | Long forms have no sticky save bar; the Publish panel scrolls away on a laptop. | Sticky publish/save rail. (Where the editor already has one, leave it.) |
| A9 | `/teachings` | 375 | S3 | Hover-scale on covers runs even on touch (`group-hover:scale`), causing a jump on tap. | Wrap motion in `hover:hover` media query. |
| A10 | Global | all | S3 | `theme-color` is `#0c1014`, tokens say `#101317`; browser chrome doesn't match the page. | Use the token value. |

## B. Image handling

| # | Page | Sev | Problem | Fix |
|---|------|-----|---------|-----|
| B1 | `ImageEditorModal` (all uploads) | S1 | Upload form defaults to a **16:9 crop**, so every uploaded photo is permanently cropped and never recoverable. Zoom/aspect bake the crop into the stored WebP. | Stop cropping on upload: store the original (rotation only), and frame on display with CSS + focal point. |
| B2 | Media library | S2 | Thumbnails `h-28 w-full object-cover` with no focal point: portraits lose heads. | 1:1 contain-on-tint thumbs, focal honoured, ratio badge. |
| B3 | `Cover` | S2 | `fill` with no ratio contract; callers pass loose aspect classes, so a portrait cover in a 16:10 box decapitates the subject. | `MediaFrame` with an explicit ratio per use, `fit`, focal `object-position`, and `sizes` required. |
| B4 | Teaching/event covers | S2 | `object-cover` everywhere, no focal data, no dimension data. | Ratio system (hero 16:9, portrait 4:5, card 3:2, thumb 1:1, OG 1.91:1) + focal stored in settings, default `50% 30%` for people. |
| B5 | `/` hero | S2 | Full-bleed 100vw hero on a 1920 screen ships a huge image; `sizes` correct but no max width. | `sizes="100vw"` retained; cap the served width via `qualities`/priority only where needed. |
| B6 | All uploads | S3 | Uploads are compressed to WebP at upload time with no width warning, so a 400px phone photo is stretched into a 1400px slot. | Guidance under each upload (recommended size/ratio) and a "too small" warning; never upscale (`contain` + tint). |

## C. Dashboard density

| # | Area | Sev | Problem | Fix |
|---|------|-----|---------|-----|
| C1 | Overview | S1 | Nine blocks of equal weight, four "create" buttons of equal weight, charts above the fold, ministry portal cards duplicating the sidebar. A leader cannot see what matters in ten seconds. | Greeting, 4 numbers, one activity feed, quick actions; charts and secondary stats inside "More insights". |
| C2 | Sidebar | S1 | Three groups, mixed logic (Beta feedback sits in "Today", schedule under Content), and **Availability, Subscribers, Audit log, Privacy tools are unreachable from the sidebar**. | Grouped IA: Overview · Content · Gatherings · Audience · Site · Admin; every existing route reachable. |
| C3 | Settings | S2 | A grid of eight equal cards, no sense of where you are or what else is nearby. | Persistent left tabs on every settings screen. |
| C4 | Lists | S2 | Five buttons per row in Teachings, three in Events; bulk bar appears above the table and pushes it down. | Row "…" menu, bulk actions only on selection, sticky header. |
| C5 | Badges | S2 | Nine badge colours including `admin-badge-bad` for "private", "priority", "declined" and "spam" alike. | Status as small text with a dot; colour only for meaning (new/ok/warn/bad). |
| C6 | Admin radius | S3 | Mixed `rounded`, `rounded-lg`, `rounded-xl`, `rounded-full`, `rounded-sm` against a public site that is deliberately square. | Radius 0 everywhere except true circles (avatars, dots). |
| C7 | Admin labels | S2 | "Payload", "Slug", "Beta feedback", "Ministry Portals & Content" — developer/agency language. | "Inbox", "Web address", "Beta reviews", plain group names. |

## D. AI / template tells

| # | Page | Sev | Problem | Fix |
|---|------|-----|---------|-----|
| D1 | Newsletter modal | S1 | The worst offender: 400px dark card, rounded-full check bubble, `✦` glyph used as an icon, "Stay Spiritually Anchored", "Free forever", "daily spiritual nourishment", blurred backdrop, heavy shadow, 10px uppercase labels everywhere. | Rebuild as a parchment/ink letter card: crest-free, serif headline, one line of plain copy, real fields, hairline rule, no blur, no shadow, no glyph icons. |
| D2 | Newsletter modal copy | S1 | "Welcome to the Fellowship", "spiritually anchored", "spiritual nourishment" — hype-adjacent, three tidy promises. | "A short letter each morning": name the actual content (daily devotion, new teaching alert), no promises. |
| D3 | Admin | S2 | `shadow-md`, `bg-gold/10` tint pills, `rounded-full` avatars, emoji-free but icon-in-a-bubble patterns. | Flat surfaces, 1px borders, dot statuses. |
| D4 | Public | S3 | `✦` sparkle glyphs and `&rarr;` inside buttons read as generated filler. | Remove glyphs; use text or the one icon set. |
| D5 | Public copy | S3 | Banned-phrase scan: no "Seamless/Empower/Journey/Unlock" in public copy. "Welcome to…" only survives in transactional emails (legitimate). | Keep transactional wording; fix any public instance. |

## E. Consistency

| # | Area | Sev | Problem | Fix |
|---|------|-----|---------|-----|
| E1 | Buttons | S2 | Public `.btn` (11px/600/uppercase/44px) vs admin `.admin-btn` (12px/600/uppercase/36px) vs ad-hoc `admin-btn border-red-500/40` and `rounded` chips. | Same button scale where sizes align: primary, secondary, quiet, destructive; S/M/L; one hover/active/disabled. |
| E2 | Focus | S2 | Public focus ring is ember, admin inputs use gold outline, admin links/buttons have none. | One focus ring token (gold on ink, ember on parchment), applied to every interactive element. |
| E3 | Motion | S3 | Two easings declared (`--ease-out`, `--ease`), durations 120/160/200/260/280/300/560/700/900. | One easing, three durations; hover-only motion behind `hover:hover`. |
| E4 | Numerals | S3 | Admin counters are serif, not tabular; column of numbers jitters. | `tabular-nums` on every count, date and time. |
| E5 | Tables | S2 | Header opacity 0.6, row padding 0.6rem, no sticky header, zebra-free but no hover token on some screens. | One table spec: 44px rows, sticky head, hairline dividers, hover tint. |
| E6 | Spacing | S3 | Cards use `p-2`, `p-3`, `p-4` interchangeably at the same level. | 4/8/12/16/24/32 with one card padding (16). |

---

## Order of work

1. **A** — responsive tables, mobile nav, drawer behaviour, payload labels, top bar.
2. **B** — image system (`MediaFrame`), non-destructive upload, focal point, upload guidance.
3. **C** — sidebar IA, settings tabs, overview reduction, badge/table/radius discipline.
4. **D** — newsletter modal redesign and copy pass.
5. **E** — tokens, focus, motion, numerals, spacing.
6. Regression, screenshots, report.

Before/after screenshots live in `docs/qa/before` and `docs/qa/after`.
