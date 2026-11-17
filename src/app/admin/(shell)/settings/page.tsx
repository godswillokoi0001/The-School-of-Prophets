import Link from "next/link";
import { requireStaff } from "@/lib/admin";

export const dynamic = "force-dynamic";

const cards = [
  { href: "/admin/enrolment", title: "Enrolment", desc: "Open/close cohort applications, dates, fee note, waitlist." },
  { href: "/admin/announcements", title: "Announcement Pop-up", desc: "Site-wide popup modal and notice banner for visitors." },
  { href: "/admin/settings/giving", title: "Giving details", desc: "Bank account details, currency and Paystack link." },
  { href: "/admin/settings/contact", title: "Contact & socials", desc: "WhatsApp, Telegram invites, phone, email and address." },
  { href: "/admin/settings/team", title: "Team & leaders", desc: "Leadership and ministry team members." },
  { href: "/admin/settings/emails", title: "Email templates", desc: "Confirmation, acceptance, decline, waitlist, reminders." },
  { href: "/admin/settings/notifications", title: "My notifications", desc: "Which forms alert you, quiet hours, digest." },
  { href: "/admin/settings/privacy", title: "Privacy tools", desc: "Search a person, export or erase their data." },
];

export default async function SettingsIndex() {
  await requireStaff("admin");
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 font-display text-2xl">Site settings</h1>
      <p className="mb-4 text-xs opacity-60">
        Everything else the admin team may need. Changes are live on the site
        within seconds and recorded in the audit log.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="admin-surface p-4 transition-colors hover:border-gold/50">
            <p className="font-semibold">{c.title}</p>
            <p className="text-xs opacity-60">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
