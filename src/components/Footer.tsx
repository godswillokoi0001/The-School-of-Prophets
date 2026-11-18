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
    <footer className="bg-ink text-parchment">
      <div className="wrap border-b border-parchment/12 py-10">
        <NewsletterSubscribe variant="inline" />
      </div>

      <div className="wrap grid gap-12 py-14 md:grid-cols-12 md:py-16">
        <div className="md:col-span-4">
          <Link href="/" className="inline-flex items-center gap-4" aria-label={`${site.name} home`}>
            <Seal size={84} idKey="footer" />
            <span className="font-display text-xl leading-tight">
              The School
              <br />
              of Prophets
            </span>
          </Link>
          <p className="measure mt-6 text-sm leading-relaxed text-parchment/55">
            An interdenominational prophetic fellowship led by {site.leader}.
            Founded {site.founded}, gathering online every week.
          </p>
          <p className="label mt-6 text-gold-soft/80">Watchers · Daniel 4:17</p>
        </div>

        <nav aria-label="Sitemap" className="md:col-span-3">
          <p className="label text-parchment/35">Pages</p>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              ...navGroups.map((g) => ({ label: g.label, href: g.href })),
              { label: "Testimonies", href: "/testimonies" },
              { label: "Newsletter", href: "/newsletter" },
            ].map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="link-quiet text-parchment/65 hover:text-parchment">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-2">
          <p className="label text-parchment/35">The week</p>
          <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-parchment/60">
            {sessions.map((s) => (
              <li key={s.id}>
                <span className="block text-parchment/85">{dayNames[s.day]}</span>
                {s.title}, {formatTimeWAT(s.start)} WAT
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="label text-parchment/35">The community</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {socialLinks.map((link) => {
              const href = link.href || link.fallbackHref;
              const external = href.startsWith("http");
              const Icon = iconFor[link.key];
              return (
                <li key={link.key}>
                  <a
                    href={href}
                    {...(external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
                    className="link-quiet inline-flex items-center gap-2 text-parchment/65 hover:text-parchment"
                  >
                    <Icon aria-hidden="true" className="h-3.5 w-3.5 text-gold/70" />
                    {link.label}
                    {!link.href && <span className="text-parchment/30">· by request</span>}
                  </a>
                </li>
              );
            })}
          </ul>
          <Link
            href="/contact"
            className="mt-5 inline-flex items-center gap-2 text-sm text-parchment/65 hover:text-parchment"
          >
            <Mail aria-hidden="true" className="h-3.5 w-3.5 text-gold/70" />
            Write to the team
          </Link>
        </div>
      </div>

      <div className="border-t border-parchment/12">
        <div className="wrap flex flex-col gap-2 py-5 text-[0.7rem] tracking-wide text-parchment/60 sm:flex-row sm:items-center sm:justify-between">
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Gatherings are free · Giving is voluntary</span>
            {site.credit.name && (
              <span>
                {site.credit.label}{" "}
                {site.credit.href ? (
                  <a href={site.credit.href} className="link-quiet text-parchment/60">
                    {site.credit.name}
                  </a>
                ) : (
                  site.credit.name
                )}
              </span>
            )}
            <Link href="/demo-notes" className="link-quiet">
              Re-brand notes
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
