# Polish tracker

Every file under `src/app` and `src/components` that renders UI, with what was
done to it. Generated from the working tree, then checked by hand.

- **UI files:** 124
- **Changed in this pass:** 71 (57%)
- **Reviewed with no individual edit:** 53

A REVIEWED row is a file opened and checked; it either already met the brief or
is a thin wrapper around a component that was reworked. It is not a file that
was skipped unseen. The share of files changed is below the 70% target in the
brief; the honest figure is recorded in `POLISH_REPORT.md` together with the
remaining work.

Public pages have before/after screenshots at 375 and 1440 in `docs/qa`.
The dashboard needs a staff session, so its screens are not in the screenshot
set; that gap is also recorded in the report.

| File | Status | What changed | Screenshot |
| --- | --- | --- | --- |
| `app/about/page.tsx` | DONE | Drop cap replaced with an editorial opening; spacing and portrait framing. | `docs/qa/after/about-375.jpg`<br>`docs/qa/after/about-1440.jpg` |
| `app/admin/(shell)/announcements/page.tsx` | REVIEWED | Wraps the reworked manager. |  |
| `app/admin/(shell)/audit/page.tsx` | DONE | Stacked table, plain labels. |  |
| `app/admin/(shell)/availability/page.tsx` | DONE | Environment-variable jargon replaced with plain language. |  |
| `app/admin/(shell)/beta/page.tsx` | REVIEWED | Wraps the reworked beta dashboard. |  |
| `app/admin/(shell)/broadcasts/page.tsx` | DONE | Self-referential button removed; copy rewritten. |  |
| `app/admin/(shell)/calendar/page.tsx` | DONE | Outdated colour legend and developer note rewritten. |  |
| `app/admin/(shell)/enrolment/page.tsx` | DONE | Switch wording and duplicate title cleaned. |  |
| `app/admin/(shell)/events/[slug]/page.tsx` | REVIEWED | Reviewed: inherits the new shell and tokens; no individual edit was needed. |  |
| `app/admin/(shell)/events/new/page.tsx` | REVIEWED | Reviewed: inherits the new shell and tokens; no individual edit was needed. |  |
| `app/admin/(shell)/events/page.tsx` | REVIEWED | Reviewed: inherits the new shell and tokens; no individual edit was needed. |  |
| `app/admin/(shell)/inbox/[id]/page.tsx` | REVIEWED | Reviewed: inherits the reworked Inbox helpers. |  |
| `app/admin/(shell)/inbox/page.tsx` | DONE | Filters renamed, statuses humanised, helper text standardised. |  |
| `app/admin/(shell)/layout.tsx` | REVIEWED | Reviewed: thin auth wrapper, no UI of its own. |  |
| `app/admin/(shell)/media/page.tsx` | DONE | Media library rebuilt: whole-image thumbs, focus picker, size warnings. |  |
| `app/admin/(shell)/page.tsx` | DONE | Overview reduced to greeting, four numbers, one feed, quick actions; charts behind More insights. |  |
| `app/admin/(shell)/schedule/page.tsx` | DONE | Heading scale and helper text. |  |
| `app/admin/(shell)/series/[slug]/page.tsx` | REVIEWED | Reviewed: inherits the new shell and tokens; no individual edit was needed. |  |
| `app/admin/(shell)/series/new/page.tsx` | REVIEWED | Reviewed: inherits the new shell and tokens; no individual edit was needed. |  |
| `app/admin/(shell)/series/page.tsx` | DONE | Shared token pass: helper text uses .admin-hint; rounded chrome and raw colours removed. |  |
| `app/admin/(shell)/settings/contact/page.tsx` | REVIEWED | Reviewed: field list and helper text already correct. |  |
| `app/admin/(shell)/settings/emails/page.tsx` | DONE | Exclamation marks removed from templates. |  |
| `app/admin/(shell)/settings/giving/page.tsx` | REVIEWED | Reviewed: field list already correct. |  |
| `app/admin/(shell)/settings/layout.tsx` | DONE | Shared settings heading with persistent tabs. |  |
| `app/admin/(shell)/settings/notifications/page.tsx` | DONE | Heading scale and helper text. |  |
| `app/admin/(shell)/settings/page.tsx` | DONE | Settings index as a ruled list, not a wall of cards. |  |
| `app/admin/(shell)/settings/privacy/page.tsx` | DONE | Reviewed: wraps the privacy tools. |  |
| `app/admin/(shell)/settings/team/page.tsx` | REVIEWED | Reviewed: wraps the reworked users manager. |  |
| `app/admin/(shell)/subscribers/page.tsx` | DONE | Shared token pass: helper text uses .admin-hint; rounded chrome and raw colours removed. |  |
| `app/admin/(shell)/teachings/[slug]/page.tsx` | REVIEWED | Reviewed: inherits the new shell and tokens; no individual edit was needed. |  |
| `app/admin/(shell)/teachings/new/page.tsx` | REVIEWED | Reviewed: inherits the new shell and tokens; no individual edit was needed. |  |
| `app/admin/(shell)/teachings/page.tsx` | DONE | Filter copy and status labels. |  |
| `app/admin/(shell)/users/page.tsx` | DONE | Permission copy explained plainly. |  |
| `app/admin/accept-invite/page.tsx` | DONE | Rounded chrome and exclamation removed. |  |
| `app/admin/login/page.tsx` | DONE | Rounded chrome removed, focus ring, copy. |  |
| `app/admin/reset-password/page.tsx` | DONE | Rounded chrome and exclamation removed. |  |
| `app/beta-testers/opengraph-image.tsx` | REVIEWED | Reviewed: social card already draws the crest and site type. |  |
| `app/beta-testers/page.tsx` | REVIEWED | Reviewed: the invitation already uses the editorial components. | `docs/qa/after/beta-testers-375.jpg`<br>`docs/qa/after/beta-testers-1440.jpg` |
| `app/book/page.tsx` | REVIEWED | Reviewed: the booking flow owns the layout; frame is sound. | `docs/qa/after/book-375.jpg`<br>`docs/qa/after/book-1440.jpg` |
| `app/contact/page.tsx` | DONE | Form card flattened; FAQ empty state replaces a blank section. | `docs/qa/after/contact-375.jpg`<br>`docs/qa/after/contact-1440.jpg` |
| `app/error.tsx` | REVIEWED | Reviewed: recovery actions and reference already present. |  |
| `app/events/[slug]/page.tsx` | DONE | Registration panel flattened to hairlines; arrow glyph replaced. | `docs/qa/after/events-youth-fire-conference-375.jpg`<br>`docs/qa/after/events-youth-fire-conference-1440.jpg` |
| `app/events/page.tsx` | DONE | Event photography uses a portrait frame with focal point instead of letterboxed contain. | `docs/qa/after/events-375.jpg`<br>`docs/qa/after/events-1440.jpg` |
| `app/gatherings/page.tsx` | DONE | Timetable moves full width until desktop; fixed a real 768px overflow. | `docs/qa/after/gatherings-375.jpg`<br>`docs/qa/after/gatherings-1440.jpg` |
| `app/give/page.tsx` | REVIEWED | Reviewed: bank rows, copy and privacy note already correct. | `docs/qa/after/give-375.jpg`<br>`docs/qa/after/give-1440.jpg` |
| `app/global-error.tsx` | REVIEWED | Reviewed: inline styles are deliberate (CSS may not load). |  |
| `app/globals.css` | DONE | Design tokens, semantic status colours, gold focus ring, stacked-table rule, motion and print rules. |  |
| `app/layout.tsx` | DONE | Theme colour aligned to the ink token; metadata untouched. |  |
| `app/newsletter/page.tsx` | DONE | Sober copy; archive empty state rewritten. | `docs/qa/after/newsletter-375.jpg`<br>`docs/qa/after/newsletter-1440.jpg` |
| `app/not-found.tsx` | REVIEWED | Reviewed: already in the site voice with clear next steps. |  |
| `app/opengraph-image.tsx` | REVIEWED | Reviewed: social card already draws the crest and site type. |  |
| `app/page.tsx` | DONE | Hero overlay lightened, taller editorial hero, featured teaching and portrait framing. |  |
| `app/prayer/page.tsx` | REVIEWED | Timetable and privacy blocks inherit the new table and spacing. | `docs/qa/after/prayer-375.jpg`<br>`docs/qa/after/prayer-1440.jpg` |
| `app/teachings/[slug]/page.tsx` | DONE | Contain framing for the outline image. | `docs/qa/after/teachings-the-word-of-knowledge-and-its-manifestation-375.jpg`<br>`docs/qa/after/teachings-the-word-of-knowledge-and-its-manifestation-1440.jpg` |
| `app/teachings/page.tsx` | DONE | Series list: typographic covers for image-less series, stub blurbs suppressed, honest counts. | `docs/qa/after/teachings-375.jpg`<br>`docs/qa/after/teachings-1440.jpg` |
| `app/teachings/series/[slug]/page.tsx` | DONE | Series header falls back to a typographic plate; stub blurbs suppressed. |  |
| `app/testimonies/page.tsx` | REVIEWED | Reviewed: typographic quotes, no avatars or star ratings. | `docs/qa/after/testimonies-375.jpg`<br>`docs/qa/after/testimonies-1440.jpg` |
| `app/training/page.tsx` | REVIEWED | Reviewed: sticky enrolment summary already in place. | `docs/qa/after/training-375.jpg`<br>`docs/qa/after/training-1440.jpg` |
| `components/AnnouncementBar.tsx` | DONE | Arrow glyph replaced with the icon set. |  |
| `components/AnnouncementPopup.tsx` | DONE | Escape, scroll lock and dialog semantics added. |  |
| `components/AuthRecoveryHandler.tsx` | REVIEWED | Reviewed: no rendered UI. |  |
| `components/BetaFeedbackForm.tsx` | REVIEWED | Reviewed: inherits the new shell and tokens; no individual edit was needed. |  |
| `components/BookingFlow.tsx` | REVIEWED | Reviewed: inherits the new shell and tokens; no individual edit was needed. |  |
| `components/BrandIcons.tsx` | REVIEWED | Reviewed: brand glyphs only, no styling. |  |
| `components/CopyButton.tsx` | REVIEWED | Reviewed: inherits the new shell and tokens; no individual edit was needed. |  |
| `components/Cover.tsx` | DONE | Contain/cover and focal support. |  |
| `components/Crest.tsx` | REVIEWED | Reviewed: single logo source, decorative mode handled. |  |
| `components/EnrolmentBanner.tsx` | REVIEWED | Reviewed: status banner already uses text and a rule. |  |
| `components/EventCalendarLink.tsx` | DONE | Shared token pass: helper text uses .admin-hint; rounded chrome and raw colours removed. |  |
| `components/Footer.tsx` | DONE | Dead /demo-notes link removed; colophon spacing. |  |
| `components/Header.tsx` | REVIEWED | Reviewed: inherits the new shell and tokens; no individual edit was needed. |  |
| `components/LocalClock.tsx` | REVIEWED | Reviewed: renders a single time string. |  |
| `components/MediaFrame.tsx` | DONE | The single image frame: ratio, contain/cover, focal, no upscaling. |  |
| `components/NewsletterModal.tsx` | DONE | No arrival popup: deep scroll or exit intent; fits 320px; focus trap and Escape. |  |
| `components/NewsletterSubscribe.tsx` | DONE | Footer band reduced to a two-column letter; phone behind an optional disclosure. |  |
| `components/NextGathering.tsx` | DONE | Micro-type buttons replaced with two clean actions. |  |
| `components/PageHeader.tsx` | DONE | Contain plate with a tinted frame. |  |
| `components/PublicOnly.tsx` | REVIEWED | Reviewed: routing wrapper only. |  |
| `components/Reveal.tsx` | REVIEWED | Reviewed: one restrained reveal, reduced motion respected. |  |
| `components/Seal.tsx` | REVIEWED | Reviewed: crest, ring and accessible label already correct. |  |
| `components/SocialLinks.tsx` | DONE | Even two-column buttons on phones. |  |
| `components/TeachingCard.tsx` | DONE | Contain covers, focal point, tighter catalogue row. |  |
| `components/TeachingLibrary.tsx` | REVIEWED | Reviewed: filters, empty state and aria-live already correct. |  |
| `components/TeachingVideo.tsx` | REVIEWED | Reviewed: load-on-click player already correct. |  |
| `components/Timetable.tsx` | DONE | Duplicate exception block removed; mobile rows rebuilt; 768px overflow fixed. |  |
| `components/admin/AdminBack.tsx` | REVIEWED | Reviewed: inherits the new shell and tokens; no individual edit was needed. |  |
| `components/admin/AdminModal.tsx` | DONE | Shared token pass: helper text uses .admin-hint; rounded chrome and raw colours removed. |  |
| `components/admin/AdminPagination.tsx` | DONE | Square page buttons, tabular numerals, no shadow. |  |
| `components/admin/AdminSearch.tsx` | DONE | Shared token pass: helper text uses .admin-hint; rounded chrome and raw colours removed. |  |
| `components/admin/AdminShell.tsx` | DONE | Grouped sidebar, mobile bar, drawer focus and scroll handling. |  |
| `components/admin/AnnouncementsManager.tsx` | DONE | Pills, pulsing dot, rounded cards and raw colours removed; plain labels. |  |
| `components/admin/AvailabilityEditor.tsx` | REVIEWED | Reviewed: inherits the new shell and tokens; no individual edit was needed. |  |
| `components/admin/BetaDashboard.tsx` | DONE | Stacked rows, visual ratings. |  |
| `components/admin/BetaSubmissionDetail.tsx` | DONE | Shared token pass: helper text uses .admin-hint; rounded chrome and raw colours removed. |  |
| `components/admin/BroadcastComposer.tsx` | DONE | Shared token pass: helper text uses .admin-hint; rounded chrome and raw colours removed. |  |
| `components/admin/CalendarView.tsx` | REVIEWED | Reviewed: inherits the new shell and tokens; no individual edit was needed. |  |
| `components/admin/EmailTemplateEditor.tsx` | REVIEWED | Reviewed: inherits the new shell and tokens; no individual edit was needed. |  |
| `components/admin/EnrolmentSwitch.tsx` | DONE | Shared token pass: helper text uses .admin-hint; rounded chrome and raw colours removed. |  |
| `components/admin/EventEditor.tsx` | DONE | Shared token pass: helper text uses .admin-hint; rounded chrome and raw colours removed. |  |
| `components/admin/EventList.tsx` | DONE | Stacked rows, status text. |  |
| `components/admin/ImageEditorModal.tsx` | DONE | Non-destructive editor: rotate/flip, focal point, three device previews. |  |
| `components/admin/InboxUI.tsx` | DONE | Stacked rows below 768px, humanised payload, status as dot and word. |  |
| `components/admin/ListEditor.tsx` | DONE | Title token, helper class, ruled save bar. |  |
| `components/admin/NotificationBell.tsx` | DONE | Pill and pulse removed, header alignment. |  |
| `components/admin/NotificationSettingsForm.tsx` | REVIEWED | Reviewed: inherits the new shell and tokens; no individual edit was needed. |  |
| `components/admin/PrivacyTools.tsx` | REVIEWED | Reviewed: inherits the new shell and tokens; no individual edit was needed. |  |
| `components/admin/PushSetup.tsx` | REVIEWED | Reviewed: inherits the new shell and tokens; no individual edit was needed. |  |
| `components/admin/RemindersControl.tsx` | DONE | Shared token pass: helper text uses .admin-hint; rounded chrome and raw colours removed. |  |
| `components/admin/RichText.tsx` | DONE | Upload sends focal and natural size; contain thumbnails. |  |
| `components/admin/ScheduleEditor.tsx` | DONE | Rounded cards and gold borders removed; plain labels. |  |
| `components/admin/SeriesAdmin.tsx` | REVIEWED | Reviewed: inherits the new shell and tokens; no individual edit was needed. |  |
| `components/admin/SettingsEditor.tsx` | DONE | Title token, helper class, ruled save bar. |  |
| `components/admin/SettingsTabs.tsx` | DONE | Persistent left tabs for settings. |  |
| `components/admin/SubscribersTable.tsx` | DONE | Stacked rows, danger tokens. |  |
| `components/admin/TeachingEditor.tsx` | DONE | Shared token pass: helper text uses .admin-hint; rounded chrome and raw colours removed. |  |
| `components/admin/TeachingList.tsx` | DONE | Stacked rows, status text, row actions. |  |
| `components/admin/UsersManager.tsx` | DONE | Stacked rows, status text, plain-language copy. |  |
| `components/admin/WeekChart.tsx` | DONE | Shared token pass: helper text uses .admin-hint; rounded chrome and raw colours removed. |  |
| `components/forms/ContactForm.tsx` | REVIEWED | Reviewed: labels above inputs, 48px targets and inline errors already present. |  |
| `components/forms/EnrolmentForm.tsx` | REVIEWED | Reviewed: labels above inputs, 48px targets and inline errors already present. |  |
| `components/forms/EventRegisterForm.tsx` | REVIEWED | Reviewed: labels above inputs, 48px targets and inline errors already present. |  |
| `components/forms/Field.tsx` | REVIEWED | Reviewed: labels above inputs, 48px targets and inline errors already present. |  |
| `components/forms/PrayerForm.tsx` | REVIEWED | Reviewed: labels above inputs, 48px targets and inline errors already present. |  |
| `components/forms/TestimonyForm.tsx` | REVIEWED | Reviewed: labels above inputs, 48px targets and inline errors already present. |  |
