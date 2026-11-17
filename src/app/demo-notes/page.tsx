import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Re-brand notes",
  description:
    "How this site is built, and how another church or ministry can re-skin it by editing one config file and the content files.",
  robots: { index: false, follow: false },
};

const files = [
  {
    path: "src/config/site.ts",
    role: "Identity",
    detail:
      "Name, wordmark, founder, founding date, timezone, social links, navigation, default SEO.",
  },
  {
    path: "src/content/schedule.ts",
    role: "Weekly rhythm",
    detail:
      "Sessions with a weekday and a WAT start time. The countdown, timetable and .ics feed all read from here.",
  },
  {
    path: "src/content/teachings.ts",
    role: "Library",
    detail:
      "Series and teachings. A teaching with a YouTube id gets a click-to-load player; without one it shows written notes.",
  },
  {
    path: "src/content/events.ts",
    role: "Events",
    detail: "Upcoming and past gatherings, with dates in WAT.",
  },
  {
    path: "src/content/ministry.ts",
    role: "Training and giving",
    detail:
      "Enrolment open/closed, cohort note, syllabus, bank details and Paystack link.",
  },
  {
    path: "src/content/faq.ts",
    role: "Copy",
    detail: "FAQ entries and the four-part covenant shown on the gatherings page.",
  },
  {
    path: "src/content/testimonies.ts",
    role: "Testimonies",
    detail: "Approved testimonies only. Delete the sample entries before launch.",
  },
  {
    path: "src/app/globals.css",
    role: "Design tokens",
    detail:
      "Palette, fonts and the small component layer (buttons, fields, tags). Change the four colour tokens to re-skin the palette.",
  },
];

export default function DemoNotesPage() {
  return (
    <>
      <PageHeader
        label="Re-brand notes"
        title="One config, one content folder."
        lead="This site is built so another ministry can take it without touching layout code: identity lives in one config file, and everything an admin edits lives in typed content files."
      />

      <section className="wrap py-14 md:py-20">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink/25">
                <th className="label py-3 pr-4 text-quiet">File</th>
                <th className="label py-3 pr-4 text-quiet">What it controls</th>
                <th className="label py-3 text-quiet">Notes</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.path} className="border-b border-ink/12 align-top">
                  <td className="py-4 pr-4 font-mono text-xs">{file.path}</td>
                  <td className="py-4 pr-4 font-display text-lg">{file.role}</td>
                  <td className="py-4 text-quiet">{file.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl">Before you hand it over</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-quiet">
              <li>· Replace the sample teachings, events and testimonies.</li>
              <li>· Confirm the weekly clock times in the schedule file.</li>
              <li>· Add the real WhatsApp and Telegram invite links.</li>
              <li>· Fill in the bank details, or leave the placeholder in place.</li>
              <li>· Set FORMS_INBOX and RESEND_API_KEY so forms reach a real inbox.</li>
              <li>· Add real photographs, graded to one tone. No stock imagery.</li>
              <li>· Get written consent for every testimony and quote that appears.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-display text-2xl">How the pieces fit</h2>
            <p className="mt-4 text-sm leading-relaxed text-quiet">
              The schedule stores wall-clock times in West Africa Time (UTC+1).
              The visitor&apos;s browser converts them with Intl, so nothing is
              hard-coded to one country. The countdown, timetable, Google Calendar
              link and .ics feed all derive from the same session list.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-quiet">
              Forms post to route handlers that validate with zod, reject filled
              honeypots and rate limit by address. Nothing is written to a public
              page.
            </p>
            <Link href="/" className="link-underline mt-6 inline-block text-sm font-semibold">
              Back to the site →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
