"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard, Inbox, BookOpen, LibraryBig, CalendarDays, Clock,
  CalendarClock, Settings, Image as ImageIcon, Users, Mail, Search, Menu,
  LogOut, Radio, ShieldCheck, PanelLeftClose, PanelLeftOpen, Star, MoreHorizontal,
} from "lucide-react";
import { Crest } from "@/components/Crest";
import { AdminSearch } from "@/components/admin/AdminSearch";
import { NotificationBell, type NotificationItem } from "@/components/admin/NotificationBell";
import { PushSetup } from "@/components/admin/PushSetup";
import type { Role } from "@/lib/admin";

const rank: Record<Role, number> = { viewer: 1, moderator: 2, admin: 3, owner: 4 };

type NavEntry = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  min?: Role;
  badge?: number;
};

type NavGroup = { name: string; items: NavEntry[] };

const GROUPS: NavGroup[] = [
  {
    name: "Overview",
    items: [
      { href: "/admin", label: "Today", icon: LayoutDashboard },
      { href: "/admin/inbox", label: "Inbox", icon: Inbox, min: "moderator" },
    ],
  },
  {
    name: "Content",
    items: [
      { href: "/admin/teachings", label: "Teachings", icon: BookOpen, min: "admin" },
      { href: "/admin/series", label: "Series", icon: LibraryBig, min: "admin" },
      { href: "/admin/events", label: "Events", icon: CalendarDays, min: "admin" },
      { href: "/admin/media", label: "Media library", icon: ImageIcon, min: "admin" },
    ],
  },
  {
    name: "Gatherings",
    items: [
      { href: "/admin/schedule", label: "Weekly rhythm", icon: Clock, min: "admin" },
      { href: "/admin/calendar", label: "Calls & calendar", icon: CalendarClock, min: "moderator" },
      { href: "/admin/availability", label: "Availability", icon: CalendarDays, min: "admin" },
    ],
  },
  {
    name: "Audience",
    items: [
      { href: "/admin/subscribers", label: "Subscribers", icon: Users, min: "admin" },
      { href: "/admin/broadcasts", label: "Newsletters", icon: Mail, min: "admin" },
      { href: "/admin/beta", label: "Beta reviews", icon: Star, min: "moderator" },
    ],
  },
  {
    name: "Site",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings, min: "admin" },
      { href: "/admin/enrolment", label: "Enrolment", icon: ShieldCheck, min: "admin" },
      { href: "/admin/announcements", label: "Announcements", icon: Radio, min: "admin" },
    ],
  },
  {
    name: "Admin",
    items: [
      { href: "/admin/users", label: "Team & roles", icon: Users, min: "admin" },
      { href: "/admin/audit", label: "Audit log", icon: ShieldCheck, min: "moderator" },
      { href: "/admin/settings/privacy", label: "Privacy tools", icon: ShieldCheck, min: "admin" },
    ],
  },
];

const MOBILE_TABS: { href: string; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { href: "/admin", label: "Today", icon: LayoutDashboard },
  { href: "/admin/inbox", label: "Inbox", icon: Inbox },
  { href: "/admin/calendar", label: "Calls", icon: CalendarClock },
];

export function AdminShell({
  children,
  role,
  email,
  fullName,
  unread,
  notifications = [],
}: {
  children: React.ReactNode;
  role: Role;
  email: string;
  fullName: string;
  unread: number;
  pendingTestimonies?: number;
  notifications?: NotificationItem[];
}) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const lastKey = useRef<string>("");
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tsop_admin_sidebar_collapsed");
      if (saved === "1") setCollapsed(true);
    } catch {
      // ignore
    }
  }, []);

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("tsop_admin_sidebar_collapsed", next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }

  // Close the drawer on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Drawer: lock the page, close on Escape, move focus in and back out.
  useEffect(() => {
    if (!open) return;
    const menuButton = menuButtonRef.current;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      (previous ?? menuButton)?.focus();
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if (lastKey.current === "g") {
        const map: Record<string, string> = {
          d: "/admin", i: "/admin/inbox", c: "/admin/calendar",
          t: "/admin/teachings", s: "/admin/schedule", e: "/admin/events",
          n: "/admin/teachings/new",
        };
        const href = map[e.key];
        if (href) {
          window.location.assign(href);
          lastKey.current = "";
          return;
        }
      }
      if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      lastKey.current = e.key;
      setTimeout(() => (lastKey.current = ""), 800);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const normalizedRole = ((role || "owner").toLowerCase().trim()) as Role;
  const userRank = rank[normalizedRole] ?? 4;

  const visible = GROUPS.map((g) => ({
    ...g,
    items: g.items
      .filter((i) => !i.min || userRank >= (rank[i.min] ?? 1))
      .map((i) => (i.href === "/admin/inbox" ? { ...i, badge: unread } : i)),
  })).filter((g) => g.items.length > 0);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

  const renderNav = (isMobile = false) => {
    const isMini = !isMobile && collapsed;
    return (
      <div className="flex h-full flex-col">
        <div className={`flex items-center border-b border-parchment/10 px-4 py-3.5 ${isMini ? "justify-center" : "gap-3"}`}>
          <Link href="/admin" className="flex shrink-0 items-center gap-3" title="The School of Prophets">
            <Crest width={30} height={34} className="shrink-0 text-gold" />
            {!isMini && (
              <div>
                <p className="text-sm font-semibold leading-tight tracking-tight text-parchment">The School of Prophets</p>
                <p className="text-[0.62rem] uppercase tracking-widest opacity-50">Admin dashboard</p>
              </div>
            )}
          </Link>

          {isMobile ? (
            <button
              className="ml-auto p-2 text-parchment/70 hover:text-parchment"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <MoreHorizontal size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleCollapse}
              className={`p-1.5 text-parchment/50 transition-colors hover:bg-parchment/10 hover:text-parchment ${
                isMini ? "hidden" : "ml-auto"
              }`}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={15} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Admin navigation">
          {visible.map((g) => (
            <div key={g.name} className="mb-3">
              {!isMini && (
                <p className="px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.18em] opacity-40">
                  {g.name}
                </p>
              )}
              <div className="space-y-0.5">
                {g.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-active={active}
                      aria-current={active ? "page" : undefined}
                      title={isMini ? item.label : undefined}
                      className={`nav-item relative ${isMini ? "justify-center !px-0" : ""}`}
                      onClick={() => setOpen(false)}
                    >
                      <item.icon size={16} />
                      {!isMini && <span className="flex-1">{item.label}</span>}
                      {item.badge && item.badge > 0 ? (
                        isMini ? (
                          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gold" />
                        ) : (
                          <span className="admin-badge admin-badge-new">{item.badge}</span>
                        )
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={`border-t border-parchment/10 ${isMini ? "p-3 text-center" : "px-4 py-3"}`}>
          {!isMini ? (
            <>
              <p className="truncate text-xs font-semibold text-parchment">{fullName || email}</p>
              <p className="text-[0.65rem] uppercase tracking-widest text-gold">{role}</p>
            </>
          ) : (
            <div
              className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-gold/15 text-xs font-bold text-gold"
              title={`${fullName || email} (${role})`}
            >
              {(fullName || email || "A")[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="admin-body flex min-h-screen">
      <PushSetup />

      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 z-20 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-parchment/10 bg-ink-2 transition-[width] duration-200 md:flex ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {renderNav(false)}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Admin menu"
            tabIndex={-1}
            className="absolute left-0 top-0 h-full w-64 border-r border-parchment/10 bg-ink-2 outline-none"
          >
            {renderNav(true)}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-parchment/10 bg-ink px-3 md:px-5">
          <button
            ref={menuButtonRef}
            className="p-2 text-parchment/70 hover:text-parchment md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu size={18} />
          </button>

          {collapsed && (
            <button
              type="button"
              onClick={toggleCollapse}
              className="hidden p-1.5 text-parchment/60 transition-colors hover:bg-parchment/10 hover:text-parchment md:flex"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen size={16} />
            </button>
          )}

          <button
            onClick={() => setSearchOpen(true)}
            className="admin-input !flex !w-auto items-center gap-2 !rounded-lg !py-1.5 text-xs opacity-80 hover:opacity-100"
            aria-label="Search everything"
          >
            <Search size={14} />
            <span className="hidden sm:inline">Search everything</span>
            <kbd className="hidden text-[0.6rem] opacity-60 sm:inline">Ctrl K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-1">
            <NotificationBell initialUnread={unread} initialNotifications={notifications} userRole={role} />
            <form action="/admin/logout" method="post">
              <button
                type="submit"
                className="p-2 opacity-70 hover:opacity-100"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 px-3 pb-24 pt-4 md:p-8 md:pb-8">{children}</main>
      </div>

      {/* Mobile: the four places a leader actually goes */}
      <nav
        aria-label="Quick navigation"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-parchment/10 bg-ink-2 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {MOBILE_TABS.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-12 flex-col items-center justify-center gap-1 py-1.5 text-[0.6rem] uppercase tracking-[0.1em] ${
                active ? "text-gold-soft" : "text-parchment/55"
              }`}
            >
              <tab.icon size={17} />
              {tab.label}
              {tab.href === "/admin/inbox" && unread > 0 && (
                <span className="absolute right-[28%] top-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
              )}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-12 flex-col items-center justify-center gap-1 py-1.5 text-[0.6rem] uppercase tracking-[0.1em] text-parchment/55"
          aria-label="More sections"
        >
          <Menu size={17} />
          More
        </button>
      </nav>

      {searchOpen && <AdminSearch onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
