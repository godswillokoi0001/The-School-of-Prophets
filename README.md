# The School of Prophets

The website for The School of Prophets (TSOP), an online interdenominational
prophetic fellowship led by Prophet Lawrence Iwara.

Built with Next.js (App Router), TypeScript and Tailwind CSS v4. No database, no
CMS account and no external service is required to run it.

---

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint
npm run typecheck
```

Node 20 or newer.

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you have. Everything is
optional for local development.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL used for metadata, sitemap and Open Graph. |
| `RESEND_API_KEY` | Sends form submissions by email (https://resend.com). |
| `FORMS_INBOX` | The mailbox that receives submissions. |
| `FORMS_FROM` | Verified sender, e.g. `TSOP Website <hello@yourdomain.org>`. Defaults to Resend's onboarding sender. |
| `FORMS_WEBHOOK_URL` | Optional webhook (Zapier, Make, n8n, Slack) that receives submissions as JSON. |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Enables Plausible analytics. Leave empty for no analytics at all. |

Without `RESEND_API_KEY`/`FORMS_INBOX` or a webhook, submissions still validate
and are written to the server log (`[forms] ...`), so nothing breaks in local
testing. For production, set at least one of them.

## Editing content

No code knowledge needed beyond editing values in a file. All copy and data lives
in `src/content/`:

| File | What an admin edits |
| --- | --- |
| `site.ts` (in `src/config/`) | Ministry name, wordmark, founder, founding date, social links. |
| `nav.ts` (in `src/config/`) | The header menus, their links and icons. |
| `schedule.ts` | The weekly sessions: weekday, title, time in WAT, focus. |
| `teachings.ts` | Series and teachings (title, scripture, summary, outline, YouTube id). |
| `events.ts` | Upcoming and past events. |
| `ministry.ts` | Enrolment open/closed, cohort note, syllabus, bank details, Paystack link. |
| `testimonies.ts` | Approved testimonies only. |
| `faq.ts` | FAQ answers and the fellowship covenant. |

### Turning enrolment on and off

In `src/content/ministry.ts` set `status: "open"` or `status: "closed"`. The
training page form switches between *Submit application* and *Join the waitlist*
automatically, and the banner on the home page follows it.

### Adding a teaching

Add an entry to `teachings` in `src/content/teachings.ts`. Use an existing series
slug from `seriesList`. If you have the YouTube id (the part after `v=`), put it
in `youtubeId`; the page then shows a player that loads only when pressed. Without
one, the page shows the written outline and points to the channel.

### Adding a session to the schedule

Add an entry to `sessions` in `src/content/schedule.ts`:

```ts
{
  id: "tuesday-prayer",
  day: 2,                 // 0 = Sunday … 6 = Saturday
  title: "Prayer",
  focus: "One sentence on what happens.",
  start: "21:00",         // West Africa Time
  end: "22:00",
  durationMinutes: 60,
}
```

The countdown, timetable, Google Calendar links and `/schedule.ics` all read from
this list. Remove `needsConfirmation: true` once a time is confirmed with the
Prophet; the asterisk and the draft note disappear with it.

### Serving a session link

There is no login and no member database. Session links live in the WhatsApp
community, as they already do. Put the current invite link in
`src/config/site.ts` (`whatsappInvite`, `telegramInvite`). While those are empty,
every join button routes to `/contact` and says "Request the invite", so no
visitor ever lands on a dead link.

## Forms

Public endpoints live in `src/app/api/`: `submit`, `contact`, `prayer`,
`testimony`, `enrolment`, `book` and `beta`. All of them share
`src/lib/submit-core.ts`.

- Validated with zod in `src/lib/schemas.ts`.
- Honeypot field plus per-address rate limiting (4 submissions per 10 minutes).
- Prayer requests are never rendered on the site. Private requests are marked in
  the email subject.
- Testimonies require the consent checkbox and are held for approval — they are
  never published automatically.

## Beta testing

`/beta-testers` is the invited-members review page. It is `noindex` and not in
the header navigation; share the link directly with the fellowship. It uses the
same pipeline as every other form: `form_definitions.type = 'beta_feedback'`,
one row per review in `submissions` with a JSON payload — no new table.

**Run the migration once** in the Supabase SQL editor:
`supabase/migrations/0004_beta_feedback.sql`. It adds the form definition, three
workflow states, the private `beta-screenshots` bucket, the confirmation and
"we fixed it" email templates, the open/closed setting, and closes the old
`submissions` read policy so anonymous clients can insert a form but never read
responses.

### Reviewing responses

- **Inbox → Beta feedback** filters the same submissions list. Opening a review
  shows a dedicated view: the rating bars, area scores, every issue with its
  screenshots, the story and its consent, device/browser, and the tester's
  contact details.
- **`/admin/beta`** is the summary: totals, average, distribution, per-area
averages, issues by page and severity, device/browser counts, counted themes,
  and a Stories tab.
- Workflow is New → Seen → Triaged → In progress → Fixed / Won't fix → Archived,
  with assignee, internal notes and tags (bug, design, content, feature request,
  praise).
- Ratings of 1–2 and any "Something broke" issue are flagged **Priority** in the
  bell, the email subject (`[Priority] New beta review: 2/5 from …`) and the
  inbox.
- Notifications fire on every review through the existing channels: email to all
  active owners/admins/moderators plus `NOTIFY_EMAILS`/`FORMS_INBOX`, Web Push
  to subscribed devices, the Realtime bell, and Telegram if configured. Per-user
  channel choices live in **Settings → My notifications**; `beta_feedback` is
  listed as a type there.
- Screenshots are re-encoded server-side (which strips EXIF/GPS), stored in the
  private `beta-screenshots` bucket, and served to signed-in staff through
  `/api/admin/beta/screenshot`, which returns a 120-second signed URL.
- **Export CSV** on `/admin/beta` writes every review (ratings, issues, consent)
  and records the export in the audit log.
- Viewers can read ratings and text; email, phone and WhatsApp are masked for
  that role in the review view.

### Closing the beta

`/admin/beta` → **Stop accepting feedback**. The setting is
`site_settings.beta_feedback = {"status":"closed"}`. The form is replaced by a
thank-you message, the API refuses new reviews, and the page can be unlinked
from wherever it was shared. Nothing already received is deleted. **Reopen the
beta** reverses it.

### Stories → testimonies

Stories live on the review payload (`story`, `story_consent`, `display_name`). In
`/admin/beta → Stories` you can edit lightly for typos, approve, choose the
display name according to the consent on record, and **Create testimony**. That
inserts a draft in the existing Testimonies inbox (`submissions.type =
'testimony'`, status `new`) using the name or `Anonymous`. It is disabled when
the consent is `private`. Nothing appears on `/testimonies` until it is approved
there.

### Sample data

`supabase/seed.sql` includes one review labelled **`[sample] Ada`** so the
dashboard and stories tab can be inspected. **Remove N samples** on `/admin/beta`
deletes every row with `payload.isSample = true` in one click. Tests written by
`node scripts/beta-check.mjs` are labelled the same way.

### Checks

```bash
npm run typecheck
node scripts/beta-check.mjs          # against the running dev server
BASE=http://localhost:3210 node scripts/beta-check.mjs
```

The script checks validation errors, the honeypot, the duplicate-email window,
the per-IP limit, screenshot rejection and that anonymous clients cannot reach
the beta data, export or screenshots. Email, push and Realtime delivery need
`RESEND_API_KEY`, VAPID keys and Supabase configured; the script reports those
as unverified rather than pretending they ran.

### Choices worth knowing

- **CAPTCHA** reuses the existing optional Turnstile check: set
  `TURNSTILE_SECRET_KEY` and send `turnstileToken`. There is no visible widget by
  default so the page stays calm; the honeypot, timing, rate limit and duplicate
  window still apply.
- **Rate limiting** is in-memory (5 per hour per IP/path, as before for other
  forms), so it resets when the server restarts; use a shared store if the site
  is ever deployed across several instances.
- **Viewer masking** is enforced in the review view, not by column-level SQL
  grants, so staff using the service role still see everything they moderate.
- The page's Open Graph card is generated at
  `/beta-testers/opengraph-image` and composes the supplied crest and headline.

## Deploy

**Vercel (recommended)**

1. Push the repository to GitHub.
2. Import it in Vercel; the defaults are correct for Next.js.
3. Add the environment variables above.
4. Deploy, then set `NEXT_PUBLIC_SITE_URL` to the final domain and redeploy so
   canonical URLs and the sitemap are correct.

Any Node host works (`npm run build && npm run start`). The forms need a server;
a fully static export would lose them.

## Accessibility and performance

- Semantic landmarks, skip link, visible focus rings, AA-checked ink/parchment
  contrast.
- Scroll reveals are disabled under `prefers-reduced-motion`.
- YouTube is loaded only on click; no video autoplays; fonts are self-hosted by
  `next/font`; images are served as AVIF/WebP.
- Every page has its own metadata, and the site has Open Graph cards, a sitemap,
  robots rules and `Church` / `Article` / `FAQPage` structured data.

## Re-branding for another ministry

See `/demo-notes` on the site, or the table above. In short: edit
`src/config/site.ts`, the `src/content/` files, the colour tokens at the top of
`src/app/globals.css`, and replace `public/images/tsop-crest.webp`. Nothing in
the layout assumes the name, the timezone or the number of weekly sessions.

## Photography

Images live in `public/images/` and are referenced by name from the content files:

| File | Used on |
| --- | --- |
| `tsop-crest.webp` | Header, footer, watermarks, About, 404. The only logo on the site. |
| `prophet-portrait.webp` | About, the Prophet section. |
| `desert-walk.webp` | Home hero background. |
| `prayer-cathedral.webp`, `praying-man.webp`, `prayer-cave.webp` | Prayer, home intro, teaching imagery. |
| `worship-hands.webp` | Home closing band, Gatherings, Testimonies. |
| `potter.webp` | Training (home band and page header). |
| `desert-dawn.webp`, `desert-walk.webp` | Faith teaching, Contact. |
| `eagle-head.webp`, `eagle-gold.webp` | About header, Give, Discernment teaching. |
| `shofar-sunset.webp`, `shofar-sky.webp` | Anniversary, Events. |
| `bible-bedside.webp` | Teachings header and the Word of Knowledge teaching. |
| `crucifixion.webp` | About, "Why the prophetic". |

The supplied set is a mix of the Prophet's portrait and symbolic scenes. The
scenes are used as editorial artwork, not captioned as photographs of the
fellowship. One supplied image (a prostration photo carrying another ministry's
event banner) was not used. To swap an image, replace the file and keep the name.

## Still needed from the ministry

These are deliberately shown as marked placeholders rather than invented:

1. Two or three sentences of biography for the Prophet.
2. Confirmed clock times for the weekly sessions (currently marked with `*`).
3. WhatsApp and Telegram invite links.
4. Bank details (and Paystack link, if wanted), plus training costs.
5. Written approval for the 5th Anniversary pull quote.
6. Written consent for every testimony before it is published.
7. Confirmed wording for the FAQ answers marked `[confirm]`.
8. More real photographs of the fellowship gathering, when available.
