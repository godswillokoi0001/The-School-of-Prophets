"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, Inbox, BookOpen, LibraryBig, CalendarDays, Clock,
  CalendarClock, Settings, Image as ImageIcon, Users, Mail, Search, Menu, X,
  LogOut, Radio, ShieldCheck,
} from "lucide-react";
import { Crest } from "@/components/Crest";
import { AdminSearch } from "@/components/admin/AdminSearch";
import { NotificationBell } from "@/components/admin/NotificationBell";
import { PushSetup } from "@/components/admin/PushSetup";
import type { Role } from "@/lib/admin";

const rank: Record<Role, number> = { viewer: 1, moderator: 2, admin: 3, owner: 4 };

type NavEntry = {
  href: string; label: string; icon: React.ComponentType<{ size?: number }>;
  min?: Role; badge?: number; group: string;
};

export function AdminShell({
  children,
  role,
  email,
  fullName,
  unread,
}: {
  children: React.ReactNode;
  role: Role;
  email: string;
  fullName: string;
  unread: number;
  pendingTestimonies?: number;
}) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const lastKey = useRef<string>("");

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

  const groups: { name: string; items: NavEntry[] }[] = [
    {
      name: "Today",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard, group: "Today" },
        { href: "/admin/inbox", label: "Inbox", icon: Inbox, min: "moderator", badge: unread, group: "Today" },
        { href: "/admin/calendar", label: "Calendar", icon: CalendarClock, min: "moderator", group: "Today" },
      ],
    },
    {
      name: "Content",
      items: [
        { href: "/admin/teachings", label: "Teachings", icon: BookOpen, min: "admin", group: "Content" },
        { href: "/admin/series", label: "Series", icon: LibraryBig, min: "admin", group: "Content" },
        { href: "/admin/schedule", label: "Weekly schedule", icon: Clock, min: "admin", group: "Content" },
        { href: "/admin/events", label: "Events", icon: CalendarDays, min: "admin", group: "Content" },
        { href: "/admin/media", label: "Media library", icon: ImageIcon, min: "admin", group: "Content" },
      ],
    },
    {
      name: "Site",
      items: [
        { href: "/admin/settings", label: "Site settings", icon: Settings, min: "admin", group: "Site" },
        { href: "/admin/homepage", label: "Homepage", icon: LayoutDashboard, min: "admin", group: "Site" },
        { href: "/admin/enrolment", label: "Enrolment", icon: ShieldCheck, min: "admin", group: "Site" },
        { href: "/admin/announcements", label: "Announcements", icon: Radio, min: "admin", group: "Site" },
        { href: "/admin/subscribers", label: "Newsletter", icon: Mail, min: "admin", group: "Site" },
        { href: "/admin/users", label: "Team & roles", icon: Users, min: "owner", group: "Site" },
      ],
    },
  ];

  const visible = groups
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.min || rank[role] >= rank[i.min]) }))
    .filter((g) => g.items.length > 0);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-4 py-4">
        <Crest width={32} height={36} className="text-gold" />
        <div>
          <p className="font-display text-sm leading-tight">The School of Prophets</p>
          <p className="text-[0.65rem] tracking-widest uppercase opacity-50">Admin dashboard</p>
        </div>
        <button
          className="ml-auto md:hidden p-2"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-4" aria-label="Admin navigation">
        {visible.map((g) => (
          <div key={g.name} className="mb-3">
            <p className="px-3 py-1 text-[0.6rem] font-bold tracking-[0.18em] uppercase opacity-40">
              {g.name}
            </p>
            {g.items.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={active}
                  className="nav-item"
                  onClick={() => setOpen(false)}
                >
                  <item.icon size={16} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="admin-badge admin-badge-new">{item.badge}</span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-parchment/10 px-4 py-3">
        <p className="truncate text-xs font-semibold">{fullName || email}</p>
        <p className="text-[0.65rem] uppercase tracking-widest opacity-50">{role}</p>
      </div>
    </div>
  );

  return (
    <div className="admin-body min-h-screen flex">
      <PushSetup />
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-parchment/10">
        {sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-ink-2 border-r border-parchment/10">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-parchment/10 bg-ink/90 backdrop-blur px-3">
          <button
            className="md:hidden p-2"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 admin-input !w-auto !py-1 text-xs opacity-80 hover:opacity-100"
            aria-label="Search everything"
          >
            <Search size={14} />
            <span className="hidden sm:inline">Search everything</span>
            <kbd className="hidden sm:inline text-[0.6rem] opacity-60">Ctrl K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-1">
            <NotificationBell initialUnread={unread} />
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
        <main className="flex-1 p-3 md:p-6">{children}</main>
      </div>

      {searchOpen && <AdminSearch onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
