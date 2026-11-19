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
   focus of 50% / 30%, so heads are not cut.
5. **Status is a word with a dot**, not a coloured pill. Colour is reserved for
   status and never used decoratively.
6. **One radius: zero.** Rounded cards, pills and avatars were removed. The only
   circles left are the six-pixel status dot and the seal, which are drawings,
   not chrome.
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
12. **The dashboard keeps its dark palette.** It shares the public tokens; the
    admin shell is the same ink and parchment, only denser.
13. **Seed records with stub text (`Description...`) are suppressed in the UI**
    rather than edited in the database; the records and their routes remain.
14. **Charts and secondary statistics stay available** behind "More insights"
    on the overview instead of being removed.
15. **`docs/qa/before` is generated from commit `cdb38cd`**, the state before
    this pass, by checking out `src/` at that commit, capturing, and restoring.
