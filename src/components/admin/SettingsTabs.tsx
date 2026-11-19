"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin/settings", label: "Overview" },
  { href: "/admin/settings/giving", label: "Giving" },
  { href: "/admin/settings/contact", label: "Contact & social" },
  { href: "/admin/settings/team", label: "Team" },
  { href: "/admin/settings/emails", label: "Email templates" },
  { href: "/admin/settings/notifications", label: "Notifications" },
  { href: "/admin/settings/privacy", label: "Privacy" },
];

export function SettingsTabs() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Settings sections"
      className="mb-4 flex gap-1 overflow-x-auto border-b border-parchment/12 md:flex-col md:overflow-visible md:border-b-0 md:border-r md:pr-3"
    >
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-xs transition-colors md:border-b-0 md:border-l-2 ${
              active
                ? "border-gold text-gold-soft"
                : "border-transparent text-parchment/60 hover:text-parchment"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
