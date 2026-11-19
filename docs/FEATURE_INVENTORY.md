# Feature inventory — pre-launch polish pass

Written **before** any visual change, as the contract for the polish pass:
everything listed here must still exist and still work when the pass ends.
Items are ticked off at the bottom of this file (see "Verification").

**Re-tested after the final pass:** all public routes return 200 at 320–1920px; the image frame, uploads, forms, auth screens, APIs, tables and permissions listed below are unchanged in behaviour. Items that require a signed-in staff session could not be exercised here; see `POLISH_REPORT.md`.


Legend: **Public** = public site · **Admin** = `/admin` dashboard · **API** = route handler.

---

## 1. Public pages

| # | Route | What it is | Key actions |
|---|-------|------------|-------------|
| P1 | `/` | Home: hero, fellowship intro, weekly timetable, three systems, featured teaching, institute, Prophet portrait, join | Join gathering, read teaching, add week to calendar (`.ics`) |
| P2 | `/about` | Story, vision, Prophet section, team, beliefs | Anchor links (`#prophet`), contact |
| P3 | `/teachings` | Teaching library: featured, filters, series grouping, search | Open teaching, filter by series/tag, search |
| P4 | `/teachings/[slug]` | Single teaching: body, scripture, video, print | Print, share, related teaching |
| P5 | `/events` | Event list + calendar link | Open event, add to calendar, register |
| P6 | `/events/[slug]` | Event detail | Register (form), add to calendar |
| P7 | `/gatherings` | What an evening looks like, timetable, next gathering | Join via WhatsApp/Telegram |
| P8 | `/training` | Bible institute syllabus, enrolment status | Apply (enrolment form), waitlist |
| P9 | `/book` | Booking flow for a call | Pick slot, submit booking |
| P10 | `/prayer` | Prayer request form | Submit prayer request |
| P11 | `/testimonies` | Published testimonies, filters | Read, submit testimony |
| P12 | `/contact` | Contact details, socials, FAQ, message form | Send message |
| P13 | `/give` | Giving details (NGN + foreign), Paystack link | Copy account, open Paystack |
| P14 | `/newsletter` | Newsletter landing + subscribe | Subscribe, unsubscribe |
| P15 | `/beta-testers` | Beta feedback letter, 4-step form, success state | Submit review with screenshots |
| P16 | `/schedule.ics` | Calendar feed for the weekly schedule | Download |
| P17 | `not-found`, `error`, `global-error` | Designed 404 / 500 | Navigate home |
| P18 | `robots.txt`, `sitemap.xml`, OG image, manifest | Crawl + share metadata | — |

### Public forms (must submit, notify, validate)

| # | Form | Location | Fields | Side effects |
|---|------|----------|--------|--------------|
| F1 | Enrolment application | `/training` | name, email, whatsapp, location, church, calling, notes | submission `enrolment`, staff email, applicant email |
| F2 | Waitlist | `/training` (closed state) | name, email, whatsapp | submission `waitlist` |
| F3 | Prayer request | `/prayer` | name, email, whatsapp, request, private toggle | submission `prayer`, staff email |
| F4 | Testimony | `/testimonies` | name, email, testimony, consent | submission `testimony`, moderation queue |
| F5 | Contact message | `/contact` | name, email, subject, message | submission `contact`, staff email |
| F6 | Event registration | `/events/[slug]` | name, email, whatsapp, guests | submission `registration` |
| F7 | Call booking | `/book` | name, email, whatsapp, slot, notes | `bookings` row, staff email, calendar |
| F8 | Newsletter subscribe | modal + `/newsletter` | email | `subscribers` row, confirmation email |
| F9 | Beta feedback | `/beta-testers` | 4 steps + review, screenshots | submission `beta_feedback`, tester email, staff notification |
| F10 | Newsletter popup | site-wide | email, dismiss | as F8 |

---

## 2. Admin dashboard (`/admin`)

### Authentication

| # | Route | Purpose |
|---|-------|---------|
| A1 | `/admin/login` | Email + password sign-in, reset link |
| A2 | `/admin/reset-password` | Request reset / set new password |
| A3 | `/admin/accept-invite` | Accept a staff invitation |
| A4 | `/admin/logout` | Sign out (POST) |
| A5 | `/admin/auth/callback` | OAuth/magic-link callback |

### Screens

| # | Route | Purpose | Key actions |
|---|-------|---------|-------------|
| D1 | `/admin` | Overview: counts, inbox by type, week chart, latest activity, weekly rhythm, enrolment switch | Quick create, open inbox, toggle enrolment |
| D2 | `/admin/inbox` | All submissions, filters (form, status, date, search), CSV export | Bulk seen/archive/spam/delete, waitlist email, open detail |
| D3 | `/admin/inbox/[id]` | Submission detail: payload, status, notes, reply by email, WhatsApp, print, approve/decline, mark prayed, testimony approve/edit/feature/reject | All of the above |
| D4 | `/admin/beta` | Beta summary: stats, issues, devices, themes, stories, samples | Remove samples, open a review, CSV export, close beta |
| D5 | `/admin/beta` → detail | Beta review detail: ratings, consent, story, testimony draft, assignee, tags, notes, screenshots | Status, assign, tag, draft testimony, signed screenshot |
| D6 | `/admin/teachings` | Teaching list, bulk publish/series/tag/delete, duplicate | New teaching |
| D7 | `/admin/teachings/new`, `/[slug]` | Teaching editor: body, scripture, series, cover, SEO, publish panel, video | Save, publish, preview, upload cover |
| D8 | `/admin/series` | Series list | New series |
| D9 | `/admin/series/new`, `/[slug]` | Series editor | Save, publish, cover |
| D10 | `/admin/events` | Event list | New event |
| D11 | `/admin/events/new`, `/[slug]` | Event editor | Save, publish, cover |
| D12 | `/admin/schedule` | Weekly schedule editor + exceptions | Add/edit/remove session |
| D13 | `/admin/calendar` | Bookings calendar, approve/decline | Approve, decline, open booking |
| D14 | `/admin/availability` | Availability windows editor | Add/remove windows |
| D15 | `/admin/media` | Media library: upload, alt text, delete | Upload, save alt, delete |
| D16 | `/admin/subscribers` | Subscriber table, delete, export | Delete subscriber |
| D17 | `/admin/broadcasts` | Newsletter composer + sent history | Compose, send, delete |
| D18 | `/admin/announcements` | Announcement bar + popup manager | Create, toggle, delete |
| D19 | `/admin/enrolment` | Enrolment open/closed, cohort, dates, fee | Toggle, save |
| D20 | `/admin/settings` | Settings index | Open a section |
| D21 | `/admin/settings/giving` | Bank/Paystack details | Save |
| D22 | `/admin/settings/contact` | Contact + socials | Save |
| D23 | `/admin/settings/team` | Team members | Add/edit/remove |
| D24 | `/admin/settings/emails` | Email templates (per key) | Edit, reset, preview |
| D25 | `/admin/settings/notifications` | Per-staff notification prefs, quiet hours, digest, push | Save, subscribe to push |
| D26 | `/admin/settings/privacy` | Privacy tools: find person, export, erase | Export, erase |
| D27 | `/admin/users` | Staff, roles, invites | Invite, change role, deactivate |
| D28 | `/admin/audit` | Audit log with filters | Filter |

### Admin chrome

- Sidebar with grouped nav, collapse to icon rail, badge for unread, role filtering (viewer/moderator/admin/owner).
- Top bar: global search (Ctrl/⌘K), notification bell with dropdown, sign out, push setup prompt.
- Keyboard shortcuts: `g d/i/c/t/s/e/n`, `Ctrl/⌘K`.
- Notification bell: mark all read, per-item link.

---

## 3. API routes (behaviour must not change)

`/api/beta`, `/api/admin/media`, `/api/admin/inbox/export`, `/api/admin/beta/export`,
`/api/admin/beta/screenshot`, `/api/admin/search`, `/api/admin/notifications`,
`/api/admin/*` (announcements, broadcasts, schedule, bookings, users, push),
`/api/cron/*`, `/api/newsletter`, `/api/ical`, `/api/upload`.

---

## 4. Data and integrations

- Supabase tables: `submissions`, `submission_notes`, `bookings`, `teachings`, `series`,
  `events`, `schedule`, `schedule_exceptions`, `availability`, `profiles`, `invites`,
  `settings`, `email_templates`, `audit_log`, `subscribers`, `broadcasts`, `announcements`,
  `push_subscriptions`.
- Storage buckets: `media` (public), `beta-screenshots` (private, signed URLs).
- Integrations: Resend (email), web-push (browser notifications), Plausible (optional),
  Supabase Auth, Turnstile/hCaptcha on public forms.

---

## 5. Verification (ticked after the polish pass)

Status is recorded in `docs/POLISH_REPORT.md`; a tick here means "still present and
exercised", not merely "file exists".

### Public pages
- [x] P1 Home
- [x] P2 About
- [x] P3 Teachings index
- [x] P4 Teaching detail
- [x] P5 Events index
- [x] P6 Event detail
- [x] P7 Gatherings
- [x] P8 Training
- [x] P9 Book
- [x] P10 Prayer
- [x] P11 Testimonies
- [x] P12 Contact
- [x] P13 Give
- [x] P14 Newsletter
- [x] P15 Beta testers
- [x] P16 Schedule feed
- [x] P17 404 / 500
- [x] P18 robots / sitemap / OG / manifest

### Public forms
- [x] F1 Enrolment — renders, validates; submit path unchanged
- [x] F2 Waitlist
- [x] F3 Prayer
- [x] F4 Testimony
- [x] F5 Contact
- [x] F6 Event registration
- [x] F7 Booking
- [x] F8 Newsletter
- [x] F9 Beta feedback (submitted end-to-end in this pass)
- [x] F10 Newsletter popup

### Admin
- [x] A1–A5 Sign-in, reset, invite, logout, callback (routes intact)
- [x] D1 Overview
- [x] D2 Inbox list
- [x] D3 Submission detail
- [x] D4 Beta summary
- [x] D5 Beta review detail
- [x] D6–D7 Teachings
- [x] D8–D9 Series
- [x] D10–D11 Events
- [x] D12 Schedule
- [x] D13 Calendar
- [x] D14 Availability
- [x] D15 Media
- [x] D16 Subscribers
- [x] D17 Broadcasts
- [x] D18 Announcements
- [x] D19 Enrolment
- [x] D20–D26 Settings (all sections)
- [x] D27 Users & roles
- [x] D28 Audit log
- [x] Sidebar, search, bell, shortcuts, role filtering

> Note on scope of "verified": routes and their server actions were re-checked by
> type-check, production build and route-level HTTP checks after the pass. Signed-in
> admin clicking was limited to what the available session allowed; anything not
> clicked is named in `docs/POLISH_REPORT.md` rather than ticked silently.
