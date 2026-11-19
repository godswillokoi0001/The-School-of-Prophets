# Decisions

One line per judgement call made during the final polish pass. No question was
put to the client; each decision is reversible.

1. **Branch.** All work is on `polish-final`, cut from `main` at `0637b10`.
   `main` is untouched.
2. **Media metadata stays in `site_settings.media_meta`.** Focal points and
   natural sizes are keyed by stored path. No migration, no schema change.
3. **Uploads are never cropped.** The editor rotates and flips only; framing is
   a display decision. Existing files on disk are untouched.
4. **Whole-image content is `contain`; photography is `cover` with a focal
   point.** Posters, flyers, outlines and series art keep their whole frame on a
   tinted plate. Event and prophet photography uses `cover` with a default
   focus of 50% / 30%, so heads are not cut. Where a contained picture cannot
   fill its box, the space is filled by a blurred, scaled copy of the same file
   rather than a flat black bar; the original is still uncropped.
5. **Status is a word with a dot**, not a coloured pill. Colour is reserved for
   status and never used decoratively.
6. **One radius family, not zero.** The first pass removed every radius; the
   modern product direction supersedes that. Controls and nav items use 12px,
   cards and panels 16px, badges are pills, and the seal remains a drawing.
   Nothing else gets a custom radius.
7. **The newsletter card no longer opens on arrival.** It waits for 60% scroll
   or exit intent, once a week, and never on the newsletter or admin pages. It
   fits a 320px screen and traps focus.
8. **The footer subscribe band was shortened, not removed.** Every field is
   still collected; the phone number sits behind an optional disclosure.
9. **The public "sample" labels stay.** They are honest about placeholder
   content and removing them would claim facts the ministry has not supplied.
10. **`/favicon.ico` was served by both `public/` and `app/`.** The `public` copy
    was removed and the app copy replaced with an icon built from the crest;
    this removed a 500 on every page.
11. **Admin tables stack below 768px** through one `data-stack` rule instead of
    per-screen markup, so every table behaves the same.
12. **The dashboard keeps a dark app shell.** The public site is a light
    surface; the admin is the same tokens inverted, dense and dark like a
    working tool. The login screen follows the dashboard, not the site.
13. **Seed records with stub text (`Description...`) are suppressed in the UI**
    rather than edited in the database; the records and their routes remain.
14. **Charts and secondary statistics stay available** behind "More insights"
    on the overview instead of being removed.
15. **`docs/qa/before` is generated from commit `cdb38cd`**, the state before
    this pass, by checking out `src/` at that commit, capturing, and restoring.
16. **The visual language is a modern product UI** (chosen 19 November 2026):
    white and near-white surfaces, one sans family for headings and text,
    card-based grids, one radius family, compact controls and a tighter
    section rhythm. The ink/parchment/gold palette and the crest are kept, so
    the institution is recognisable; the serif display face and the wide
    editorial bands are gone. Home, teachings, events, contact, training and
    the page header were rebuilt; every other screen inherits the tokens.
