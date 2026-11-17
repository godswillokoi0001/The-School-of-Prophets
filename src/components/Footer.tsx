import Link from "next/link";
import { Mail } from "lucide-react";
import {
  FacebookIcon,
  TelegramIcon,
  YouTubeIcon,
  WhatsAppIcon,
} from "@/components/BrandIcons";
import { Crest } from "@/components/Crest";
import { navGroups } from "@/config/nav";
import { site, socialLinks } from "@/config/site";

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
      <div className="wrap grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-4">
          <Link href="/" className="flex items-center gap-3">
            <Crest className="h-14 w-auto" decorative />
            <span className="font-display text-xl leading-tight">
              The School
              <br />
              of Prophets
            </span>
          </Link>
          <p className="measure mt-5 text-sm leading-relaxed text-parchment/60">
            An interdenominational prophetic fellowship led by {site.leader}.
            Taught in the Word, moved by the Spirit, built on prayer.
          </p>
          <p className="label mt-6 text-gold/80">Watchers · Daniel 4:17</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 md:col-span-5">
          {navGroups.slice(0, 2).map((group) => (
            <nav key={group.label} aria-label={group.label}>
              <p className="label text-parchment/40">{group.label}</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {group.items.slice(0, 4).map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 text-parchment/70 transition-colors hover:text-parchment"
                    >
                      <item.icon aria-hidden="true" className="h-3.5 w-3.5 text-gold/60" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="md:col-span-3">
          <p className="label text-parchment/40">The community</p>
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
                    className="flex items-center gap-2 text-parchment/70 transition-colors hover:text-parchment"
                  >
                    <Icon aria-hidden="true" className="h-4 w-4 text-gold/70" />
                    {link.label}
                    {!link.href && <span className="text-parchment/35">· by request</span>}
                  </a>
                </li>
              );
            })}
          </ul>
          <Link href="/contact" className="btn btn-outline mt-6 text-parchment">
            <Mail aria-hidden="true" className="h-4 w-4" />
            Contact us
          </Link>
        </div>
      </div>

      <div className="border-t border-parchment/10">
        <div className="wrap flex flex-col gap-3 py-6 text-xs text-parchment/45 sm:flex-row sm:items-center sm:justify-between">
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-2">
            Interdenominational · Founded {site.founded}
          </p>
        </div>
      </div>
    </footer>
  );
}
