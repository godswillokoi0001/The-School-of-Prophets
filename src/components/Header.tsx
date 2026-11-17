"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X, ArrowUpRight } from "lucide-react";
import { Crest } from "@/components/Crest";
import { navGroups } from "@/config/nav";
import { site } from "@/config/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    setOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-ink text-parchment">
      <div className="hidden border-b border-parchment/10 lg:block">
        <div className="wrap flex items-center justify-between py-1.5">
          <p className="label text-gold/90">{site.crest}</p>
          <p className="label text-parchment/45">
            Founded {site.founded} · Gathering weekly, online
          </p>
        </div>
      </div>

      <div className="wrap flex items-center gap-4 py-3">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
          aria-label={`${site.name} home`}
        >
          <Crest className="h-11 w-auto md:h-12" priority />
          <span className="font-display text-[1.05rem] leading-[1.05] tracking-tight">
            The School
            <br />
            of Prophets
          </span>
        </Link>

        <nav aria-label="Primary" className="ml-auto hidden items-center gap-1 xl:flex">
          {navGroups.map((group) => {
            const active = isActive(group.href);
            return (
              <div key={group.label} className="group relative">
                <Link
                  href={group.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-1.5 px-3 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.13em] transition-colors ${
                    active ? "text-gold" : "text-parchment/70 hover:text-parchment"
                  }`}
                >
                  {group.label}
                  <ChevronDown
                    aria-hidden="true"
                    className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
                  />
                </Link>

                <div className="pointer-events-none absolute left-0 top-full z-50 w-[21rem] translate-y-1 border border-parchment/15 bg-ink opacity-0 shadow-2xl transition-all duration-150 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <div className="h-0.5 w-full bg-gold/70" />
                  <ul className="py-2">
                    {group.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          {...(item.external
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                          className="flex gap-3 px-4 py-2.5 transition-colors hover:bg-parchment/[0.06]"
                        >
                          <item.icon
                            aria-hidden="true"
                            className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                          />
                          <span>
                            <span className="flex items-center gap-1.5 text-sm font-medium text-parchment">
                              {item.label}
                              {item.external && (
                                <ArrowUpRight aria-hidden="true" className="h-3 w-3 text-parchment/40" />
                              )}
                            </span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-parchment/45">
                              {item.description}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </nav>

        <Link href="/gatherings" className="btn btn-gold ml-auto hidden xl:ml-3 xl:inline-flex">
          Join a gathering
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="ml-auto flex items-center gap-2 border border-parchment/25 px-3 py-2 xl:hidden"
        >
          {open ? <X aria-hidden="true" className="h-4 w-4" /> : <Menu aria-hidden="true" className="h-4 w-4" />}
          <span className="label">{open ? "Close" : "Menu"}</span>
        </button>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-4.75rem)] overflow-y-auto border-t border-parchment/10 bg-ink xl:hidden"
        >
          <nav aria-label="Mobile" className="wrap py-4">
            <Link
              href="/"
              className="flex items-center justify-between border-b border-parchment/10 py-4"
            >
              <span className="font-display text-2xl">Home</span>
              <Crest className="h-7 w-auto opacity-60" decorative />
            </Link>

            {navGroups.map((group) => {
              const expanded = openGroup === group.label;
              return (
                <div key={group.label} className="border-b border-parchment/10">
                  <button
                    type="button"
                    onClick={() => setOpenGroup(expanded ? null : group.label)}
                    aria-expanded={expanded}
                    className="flex w-full items-center justify-between py-4 text-left"
                  >
                    <span className="font-display text-2xl">{group.label}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-4 w-4 text-gold transition-transform ${expanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  {expanded && (
                    <ul className="pb-3">
                      <li>
                        <Link
                          href={group.href}
                          className="flex items-center gap-3 py-2 text-sm text-gold"
                        >
                          <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                          Open {group.label}
                        </Link>
                      </li>
                      {group.items.map((item) => (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            {...(item.external
                              ? { target: "_blank", rel: "noopener noreferrer" }
                              : {})}
                            className="flex items-center gap-3 py-2 text-sm text-parchment/70"
                          >
                            <item.icon aria-hidden="true" className="h-4 w-4 text-parchment/40" />
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}

            <Link href="/gatherings" className="btn btn-gold mt-6 w-full">
              Join a gathering
            </Link>
            <p className="label mt-6 text-parchment/40">{site.crest}</p>
          </nav>
        </div>
      )}
    </header>
  );
}
