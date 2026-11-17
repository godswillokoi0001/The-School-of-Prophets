import { ArrowUpRight } from "lucide-react";
import {
  FacebookIcon,
  TelegramIcon,
  WhatsAppIcon,
  YouTubeIcon,
} from "@/components/BrandIcons";
import { socialLinks } from "@/config/site";
import { site } from "@/config/site";

const iconFor = {
  whatsapp: WhatsAppIcon,
  telegram: TelegramIcon,
  facebookGroup: FacebookIcon,
  facebookPage: FacebookIcon,
  youtube: YouTubeIcon,
} as const;

export type SocialLinkOverride = {
  whatsapp?: string;
  telegram?: string;
  facebookGroup?: string;
  facebookPage?: string;
  youtube?: string;
};

/** Build the social link list from live contact settings when provided. */
export function resolveSocialLinks(overrides?: SocialLinkOverride) {
  if (!overrides) return socialLinks;
  return socialLinks.map((link) => {
    const value = overrides[link.key];
    return value
      ? { ...link, href: value, fallbackHref: value }
      : link;
  });
}

export function SocialLinks({
  variant = "row",
  className = "",
  links,
}: {
  variant?: "row" | "list" | "icons";
  className?: string;
  links?: SocialLinkOverride;
}) {
  const resolved = resolveSocialLinks(links);
  if (variant === "icons") {
    return (
      <ul className={`flex flex-wrap gap-2 ${className}`}>
        {resolved.map((link) => {
          const href = link.href || link.fallbackHref;
          const external = href.startsWith("http");
          const Icon = iconFor[link.key];
          return (
            <li key={link.key}>
              <a
                href={href}
                {...(external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
                aria-label={link.label}
                title={link.label}
                className="flex h-10 w-10 items-center justify-center border border-current/25 transition-colors hover:border-current/60 hover:bg-current/10"
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
              </a>
            </li>
          );
        })}
      </ul>
    );
  }

  if (variant === "list") {
    return (
      <ul className={`divide-y divide-ink/15 ${className}`}>
        {resolved.map((link) => {
          const href = link.href || link.fallbackHref;
          const external = href.startsWith("http");
          const Icon = iconFor[link.key];
          return (
            <li key={link.key}>
              <a
                href={href}
                {...(external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
                className="group flex items-center gap-4 py-4 transition-colors hover:text-ember"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-ink/20 text-ember transition-colors group-hover:border-ember/50 group-hover:bg-ember/5">
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </span>
                <span className="flex-1">
                  <span className="font-display text-lg leading-tight">{link.label}</span>
                  <span className="mt-0.5 block text-xs text-quiet">
                    {link.href ? link.note : "Invite link by request"}
                  </span>
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-quiet/60"
                />
              </a>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className={`flex flex-wrap gap-3 ${className}`}>
      {resolved.map((link) => {
        const href = link.href || link.fallbackHref;
        const external = href.startsWith("http");
        const Icon = iconFor[link.key];
        return (
          <li key={link.key}>
            <a
              href={href}
              {...(external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
              className="btn btn-outline"
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {link.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

