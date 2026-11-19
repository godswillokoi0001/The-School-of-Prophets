"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X, ArrowUpRight, ArrowRight } from "lucide-react";
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

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        data-hidden={hidden}
        className="sticky top-0 z-50 border-b border-line bg-paper transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-[hidden=true]:-translate-y-full motion-reduce:transition-none"
      >
        <div className="wrap flex h-16 items-center gap-6 lg:h-[4.5rem]">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5"
            aria-label={`${site.name} home`}
          >
            <Crest className="h-9 w-auto md:h-10" priority />
            <span className="text-[0.95rem] font-semibold leading-[1.1] tracking-[-0.02em] text-ink">
              The School
              <br />
              of Prophets
            </span>
          </Link>

          <nav aria-label="Primary" className="ml-auto hidden items-center gap-1 xl:flex">
            {navGroups.map((group) => {
              const active = isActive(group.href);
              return (
                <div key={group.label} className="group relative flex">
                  <Link
                    href={group.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex items-center gap-1 rounded-md px-2.5 py-2 text-[0.8125rem] font-medium transition-colors ${
                      active ? "text-ink" : "text-quiet hover:bg-parchment hover:text-ink"
                    }`}
                  >
                    {group.label}
                    <ChevronDown
                      aria-hidden="true"
                      className="h-3 w-3 text-quiet/60 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
                    />
                  </Link>

                  <div className="pointer-events-none absolute left-0 top-full z-50 w-[23rem] translate-y-1 rounded-xl border border-line bg-paper p-1.5 opacity-0 shadow-[0_18px_40px_-20px_rgba(15,23,42,0.35)] transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    {group.items.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        {...(item.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="flex gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-parchment"
                      >
                        <item.icon
                          aria-hidden="true"
                          className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                        />
                        <span>
                          <span className="flex items-center gap-1.5 text-[0.875rem] font-medium leading-tight text-ink">
                            {item.label}
                            {item.external && (
                              <ArrowUpRight aria-hidden="true" className="h-3 w-3 text-quiet/60" />
                            )}
                          </span>
                          <span className="mt-0.5 block text-[0.75rem] leading-relaxed text-quiet">
                            {item.description}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 xl:flex">
            <Link href="/give" className="btn btn-outline">
              Give
            </Link>
            <Link href="/gatherings" className="btn btn-ink">
              Join a gathering
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="ml-auto flex min-h-11 items-center gap-2 rounded-lg border border-line px-3 text-[0.8125rem] font-medium text-ink xl:hidden"
          >
            {open ? <X aria-hidden="true" className="h-4 w-4" /> : <Menu aria-hidden="true" className="h-4 w-4" />}
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      {open && (
        <div
          id="mobile-nav"
          className="fixed inset-0 z-40 overflow-y-auto bg-paper text-ink xl:hidden"
        >
          <div className="wrap pb-16 pt-24">
            <nav aria-label="Mobile" className="border-t border-line">
              <Link
                href="/"
                className="flex items-baseline justify-between border-b border-line py-4 text-lg font-semibold"
              >
                Home
                <ArrowRight aria-hidden="true" className="h-4 w-4 text-quiet" />
              </Link>

              {navGroups.map((group) => {
                const expanded = openGroup === group.label;
                return (
                  <div key={group.label} className="border-b border-line">
                    <button
                      type="button"
                      onClick={() => setOpenGroup(expanded ? null : group.label)}
                      aria-expanded={expanded}
                      className="flex w-full items-center justify-between py-4 text-left text-lg font-semibold"
                    >
                      {group.label}
                      <ChevronDown
                        aria-hidden="true"
                        className={`h-4 w-4 text-quiet transition-transform duration-200 ${
                          expanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expanded && (
                      <ul className="pb-3">
                        {group.items.map((item) => (
                          <li key={item.label}>
                            <Link
                              href={item.href}
                              {...(item.external
                                ? { target: "_blank", rel: "noopener noreferrer" }
                                : {})}
                              className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-[0.9375rem] text-quiet hover:bg-parchment hover:text-ink"
                            >
                              <item.icon aria-hidden="true" className="h-4 w-4 text-gold" />
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="mt-6 grid gap-2">
              <Link href="/gatherings" className="btn btn-ink w-full">
                Join a gathering
              </Link>
              <Link href="/give" className="btn btn-outline w-full">
                Give
              </Link>
            </div>
            <p className="mt-6 text-xs text-quiet">
              Founded {site.founded} · Online, weekly · {site.crest}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
