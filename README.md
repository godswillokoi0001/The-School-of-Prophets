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

Four endpoints, all in `src/app/api/`: `contact`, `prayer`, `testimony`,
`enrolment`.

- Validated with zod in `src/lib/schemas.ts`.
- Honeypot field plus per-address rate limiting (4 submissions per 10 minutes).
- Prayer requests are never rendered on the site. Private requests are marked in
  the email subject.
- Testimonies require the consent checkbox and are held for approval — they are
  never published automatically.

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
