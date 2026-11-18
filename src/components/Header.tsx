"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X, ArrowUpRight } from "lucide-react";
import { Crest } from "@/components/Crest";
import { navGroups } from "@/config/nav";
import { site } from "@/config/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

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

  // Retract on scroll down, return on scroll up. Never while a menu is open.
  useEffect(() => {
    const onScroll = () => {
      if (open) return;
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (y < 120) setHidden(false);
      else if (delta > 6) setHidden(true);
      else if (delta < -4) setHidden(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        data-hidden={hidden}
        className="sticky top-0 z-50 bg-ink text-parchment transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-[hidden=true]:-translate-y-full motion-reduce:transition-none"
      >
        <div className="hidden border-b border-parchment/10 lg:block">
          <div className="wrap flex items-center justify-between py-1.5">
            <p className="label text-gold-soft/90">{site.crest}</p>
            <p className="label text-parchment/55">
              Founded {site.founded} · Online, weekly
            </p>
          </div>
        </div>

        <div className="wrap flex items-center gap-4 py-3.5">
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

          <nav aria-label="Primary" className="ml-auto hidden items-stretch gap-1 xl:flex">
            {navGroups.map((group) => {
              const active = isActive(group.href);
              return (
                <div key={group.label} className="group relative flex">
                  <Link
                    href={group.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex items-center gap-1.5 px-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
                      active ? "text-gold-soft" : "text-parchment/65 hover:text-parchment"
                    }`}
                  >
                    {group.label}
                    <ChevronDown
                      aria-hidden="true"
                      className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
                    />
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-3 bottom-0 h-px bg-gold transition-opacity ${
                        active ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </Link>

                  <div className="pointer-events-none absolute left-0 top-full z-50 w-[22rem] -translate-y-1 border border-parchment/15 border-t-gold/40 bg-ink opacity-0 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <p className="label border-b border-parchment/10 px-4 py-2.5 text-parchment/35">
                      {group.label}
                    </p>
                    <ul>
                      {group.items.map((item) => (
                        <li key={item.label} className="border-b border-parchment/[0.07] last:border-0">
                          <Link
                            href={item.href}
                            {...(item.external
                              ? { target: "_blank", rel: "noopener noreferrer" }
                              : {})}
                            className="flex gap-3 px-4 py-3 transition-colors hover:bg-parchment/[0.05]"
                          >
                            <item.icon
                              aria-hidden="true"
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/80"
                            />
                            <span>
                              <span className="flex items-center gap-1.5 font-display text-[0.98rem] leading-tight text-parchment">
                                {item.label}
                                {item.external && (
                                  <ArrowUpRight aria-hidden="true" className="h-3 w-3 text-parchment/35" />
                                )}
                              </span>
                              <span className="mt-0.5 block text-[0.72rem] leading-relaxed text-parchment/60">
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

          <Link href="/gatherings" className="btn btn-gold ml-auto hidden xl:ml-4 xl:inline-flex">
            Join a gathering
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="ml-auto flex min-h-11 items-center gap-2 border border-parchment/25 px-3 xl:hidden"
          >
            {open ? <X aria-hidden="true" className="h-4 w-4" /> : <Menu aria-hidden="true" className="h-4 w-4" />}
            <span className="label">{open ? "Close" : "Menu"}</span>
          </button>
        </div>
      </header>

      {open && (
        <div
          id="mobile-nav"
          className="fixed inset-0 z-40 overflow-y-auto bg-ink text-parchment xl:hidden"
        >
          <div className="wrap pb-16 pt-24">
            <nav aria-label="Mobile">
              <Link
                href="/"
                className="flex items-baseline justify-between border-b border-parchment/15 py-4"
              >
                <span className="font-display text-3xl">Home</span>
                <span className="label text-parchment/30">01</span>
              </Link>

              {navGroups.map((group, index) => {
                const expanded = openGroup === group.label;
                return (
                  <div key={group.label} className="border-b border-parchment/15">
                    <button
                      type="button"
                      onClick={() => setOpenGroup(expanded ? null : group.label)}
                      aria-expanded={expanded}
                      className="flex w-full items-baseline justify-between py-4 text-left"
                    >
                      <span className="font-display text-3xl">{group.label}</span>
                      <ChevronDown
                        aria-hidden="true"
                        className={`h-4 w-4 text-gold transition-transform duration-200 ${
                          expanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expanded && (
                      <ul className="pb-4">
                        {group.items.map((item) => (
                          <li key={item.label}>
                            <Link
                              href={item.href}
                              {...(item.external
                                ? { target: "_blank", rel: "noopener noreferrer" }
                                : {})}
                              className="flex items-center gap-3 py-2.5 text-[0.95rem] text-parchment/70"
                            >
                              <item.icon aria-hidden="true" className="h-3.5 w-3.5 text-gold/70" />
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    <span className="sr-only">Section {index + 2}</span>
                  </div>
                );
              })}
            </nav>

            <Link href="/gatherings" className="btn btn-gold mt-8 w-full">
              Join a gathering
            </Link>
            <p className="label mt-8 text-parchment/35">{site.crest}</p>
          </div>
        </div>
      )}
    </>
  );
}
