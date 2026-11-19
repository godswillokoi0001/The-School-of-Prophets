import Link from "next/link";
import { requireStaff } from "@/lib/admin";

export const dynamic = "force-dynamic";

const links = [
  { href: "/admin/settings/giving", title: "Giving", desc: "Bank details, currency and the Paystack link." },
  { href: "/admin/settings/contact", title: "Contact & social", desc: "WhatsApp, Telegram, phone, email and address." },
  { href: "/admin/settings/team", title: "Team", desc: "Leadership and ministry team members." },
  { href: "/admin/settings/emails", title: "Email templates", desc: "Wording for confirmations, decisions and reminders." },
  { href: "/admin/settings/notifications", title: "Notifications", desc: "Which forms alert you, quiet hours and digest." },
  { href: "/admin/settings/privacy", title: "Privacy", desc: "Find a person, export or erase their data." },
  { href: "/admin/enrolment", title: "Enrolment", desc: "Open or close the cohort, dates and fee note." },
  { href: "/admin/announcements", title: "Announcements", desc: "The site-wide notice and pop-up." },
];

export default async function SettingsIndex() {
  await requireStaff("admin");
  return (
    <div>
      <p className="mb-3 text-sm opacity-70">
        Choose a section. Nothing here is destructive; every change is live within
        seconds.
      </p>
      <ul className="border-t border-parchment/12">
        {links.map((l) => (
          <li key={l.href} className="border-b border-parchment/12">
            <Link
              href={l.href}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3 transition-colors hover:text-gold-soft"
            >
              <span className="font-medium">{l.title}</span>
              <span className="admin-hint">{l.desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
