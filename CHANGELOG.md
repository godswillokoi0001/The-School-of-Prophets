# CHANGELOG

## 1.1.0 — photography, iconography and navigation

- The supplied crest is now the only logo: header, footer, page watermarks and the
  404. The earlier geometric SVG mark was removed.
- Added the Prophet's portrait to the About page and his section on the site.
- Placed the supplied photography across every page: hero background, intro,
  training, teaching cards, teaching pages, events, prayer, give, contact,
  testimonies and the closing band. Images are converted to WebP at 82 quality
  and sized for mobile data.
- Replaced text-only chips with an icon system (lucide for UI icons, drawn brand
  marks for WhatsApp, Telegram, Facebook and YouTube): timetable rows, formats,
  systems, covenant, giving, privacy, FAQ and buttons.
- Header navigation rebuilt as five hover menus with icons and descriptions, plus
  a mobile accordion. The footer now reflects the same groups.

## 1.0.0 — initial build

### Phase 0: audit

The workspace contained no repository — only the attached crest image. There was
therefore no existing stack, template or content to salvage, and no template to
remove.

**Decision:** build on Next.js (App Router) + TypeScript + Tailwind CSS v4, with
content in typed files rather than a hosted CMS. This keeps the site cheap to
host, fast on mobile data, and editable without an account or a build pipeline
that can break. Forms use route handlers with zod, a honeypot and rate limiting,
and deliver by Resend or webhook when configured.

### What was built

- Ink/parchment design system with Fraunces + Manrope, an original geometric
  eagle SVG mark (used as the nav mark, watermark and favicon), and the supplied
  crest used as the brand plate.
- Home, About, Weekly Gatherings, Teachings (index, series, single), Training,
  Events, Testimonies, Prayer, Give, Contact/Join, Re-brand notes and a 404.
- `NextGathering` countdown with WAT → visitor timezone conversion,
  `Timetable`, `/schedule.ics` feed and Google Calendar links.
- Filterable teaching library (series, format, search) with click-to-load
  YouTube embeds.
- Four validated forms; enrolment switches between application and waitlist from
  one content value.
- Per-page metadata, Open Graph image, sitemap, robots, JSON-LD (Church, Article,
  FAQPage), privacy-friendly analytics behind a config flag.
- White-label configuration: identity in `src/config/site.ts`, copy in
  `src/content/`, palette tokens in `globals.css`.

### Deliberately not invented

Sample teachings, events and testimonies are labelled as samples in the UI.
Weekly times awaiting confirmation carry a visible `*`. Bank details, the
Prophet's biography, invite links and training costs render as marked
placeholders instead of plausible-looking fiction.
