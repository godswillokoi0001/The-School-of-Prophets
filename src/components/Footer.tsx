import Link from "next/link";
import { Mail } from "lucide-react";
import {
  FacebookIcon,
  TelegramIcon,
  YouTubeIcon,
  WhatsAppIcon,
} from "@/components/BrandIcons";
import { Seal } from "@/components/Seal";
import { NewsletterSubscribe } from "@/components/NewsletterSubscribe";
import { navGroups } from "@/config/nav";
import { site, socialLinks } from "@/config/site";
import { sessions, dayNames } from "@/content/schedule";
import { formatTimeWAT } from "@/lib/time";

const iconFor = {
  whatsapp: WhatsAppIcon,
  telegram: TelegramIcon,
  facebookGroup: FacebookIcon,
  facebookPage: FacebookIcon,
  youtube: YouTubeIcon,
} as const;

export function Footer() {
  return (
    <footer className="border-t border-line bg-parchment">
      <div className="wrap py-10 md:py-12">
        <div className="card p-6 sm:p-8">
          <NewsletterSubscribe variant="card" />
        </div>
      </div>

      <div className="wrap grid gap-10 border-t border-line py-12 md:grid-cols-12 md:gap-8 md:py-14">
        <div className="md:col-span-4">
          <Link href="/" className="inline-flex items-center gap-3" aria-label={`${site.name} home`}>
            <Seal size={56} idKey="footer" />
            <span className="text-base font-semibold leading-tight tracking-tight">
              The School
              <br />
              of Prophets
            </span>
          </Link>
          <p className="measure mt-4 text-sm leading-relaxed text-quiet">
            An interdenominational prophetic fellowship led by {site.leader}.
            Founded {site.founded}, gathering online every week.
          </p>
          <p className="label mt-4 text-ember">Watchers · Daniel 4:17</p>
        </div>

        <nav aria-label="Sitemap" className="md:col-span-3">
          <p className="label text-quiet">Pages</p>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              ...navGroups.map((g) => ({ label: g.label, href: g.href })),
              { label: "Testimonies", href: "/testimonies" },
              { label: "Newsletter", href: "/newsletter" },
            ].map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="text-quiet transition-colors hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-2">
          <p className="label text-quiet">The week</p>
          <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-quiet">
            {sessions.map((s) => (
              <li key={s.id}>
                <span className="block font-medium text-ink">{dayNames[s.day]}</span>
                {s.title}, {formatTimeWAT(s.start)} WAT
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="label text-quiet">The community</p>
          <ul className="mt-3 space-y-2.5 text-sm">
            {socialLinks.map((link) => {
              const href = link.href || link.fallbackHref;
              const external = href.startsWith("http");
              const Icon = iconFor[link.key];
              return (
                <li key={link.key}>
                  <a
                    href={href}
                    {...(external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
                    className="inline-flex items-center gap-2 text-quiet transition-colors hover:text-ink"
                  >
                    <Icon aria-hidden="true" className="h-4 w-4 text-gold" />
                    {link.label}
                    {!link.href && <span className="text-quiet/60">· by request</span>}
                  </a>
                </li>
              );
            })}
          </ul>
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center gap-2 text-sm text-quiet transition-colors hover:text-ink"
          >
            <Mail aria-hidden="true" className="h-4 w-4 text-gold" />
            Write to the team
          </Link>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="wrap flex flex-col gap-2 py-5 text-[0.75rem] text-quiet sm:flex-row sm:items-center sm:justify-between">
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Gatherings are free · Giving is voluntary</span>
            {site.credit.name && (
              <span>
                {site.credit.label}{" "}
                {site.credit.href ? (
                  <a href={site.credit.href} className="underline underline-offset-2 hover:text-ink">
                    {site.credit.name}
                  </a>
                ) : (
                  site.credit.name
                )}
              </span>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
