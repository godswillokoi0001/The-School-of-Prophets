"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  Clock,
  ExternalLink,
  Inbox,
  MessageSquare,
  Volume2,
  VolumeX,
} from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  created_at: string;
  status: string;
};

const typeLabels: Record<string, string> = {
  enrolment: "Training Application",
  waitlist: "Waitlist Signup",
  prayer: "Prayer Request",
  testimony: "Testimony",
  contact: "Contact Message",
  registration: "Event Registration",
  booking: "Call Booking",
  newsletter: "Newsletter Subscription",
};

function formatTimeAgo(isoString: string) {
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(isoString).toLocaleDateString("en-GB", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function NotificationBell({
  initialUnread = 0,
  initialNotifications = [],
  userRole = "admin",
}: {
  initialUnread?: number;
  initialNotifications?: NotificationItem[];
  userRole?: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>(initialNotifications);
  const [unread, setUnread] = useState(initialUnread);
  const [open, setOpen] = useState(false);
  const [sound, setSound] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("tsop-notification-sound");
    setSound(stored === "1");

    const sb = createSupabaseBrowser();
    const channel = sb
      .channel("admin-live-submissions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "submissions" },
        (payload) => {
          const row = (payload.new ?? {}) as Record<string, unknown>;
          const type = String(row.type ?? "contact");

          // Non-owners must NEVER receive training/enrolment notifications
          if (type === "enrolment" && userRole !== "owner") {
            return;
          }

          const payloadObj = (row.payload as Record<string, unknown>) ?? {};
          const name = String(
            payloadObj.name ?? payloadObj.fullName ?? "Someone",
          );
          const label = typeLabels[type] ?? type;

          const newItem: NotificationItem = {
            id: String(row.id),
            type,
            title: `New ${label} from ${name}`,
            subtitle: String(
              payloadObj.message ??
                payloadObj.prayerRequest ??
                payloadObj.notes ??
                payloadObj.email ??
                "",
            ),
            created_at: new Date().toISOString(),
            status: "new",
          };

          setItems((prev) => [newItem, ...prev].slice(0, 15));
          setUnread((u) => u + 1);

          if (sound && "AudioContext" in window) {
            try {
              const ctx = new AudioContext();
              const osc = ctx.createOscillator();
              osc.frequency.value = 880;
              osc.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.15);
            } catch {
              // ignore
            }
          }

          if (
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            new Notification("The School of Prophets", { body: newItem.title });
          }
        },
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [sound, userRole]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  function toggleSound() {
    const next = !sound;
    setSound(next);
    localStorage.setItem("tsop-notification-sound", next ? "1" : "0");
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open) {
            setUnread(0);
          }
        }}
        className="relative p-2 text-parchment/70 hover:text-parchment transition-colors rounded-lg hover:bg-parchment/5"
        aria-label={`Notifications, ${unread} unread`}
        title="Notifications"
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute 0 top-0.5 right-0.5 min-w-[1.1rem] h-[1.1rem] bg-gold px-1 flex items-center justify-center text-[0.6rem] font-bold text-ink rounded-full shadow-sm animate-pulse">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-84 sm:w-96 rounded-xl border border-gold/30 bg-[#161411] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-parchment/10 bg-black/40 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-semibold text-parchment">
                Notifications
              </span>
              {items.filter((i) => i.status === "new").length > 0 && (
                <span className="admin-badge admin-badge-gold text-[0.65rem] !py-0.5">
                  {items.filter((i) => i.status === "new").length} New
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {items.some((i) => i.status === "new") && (
                <button
                  type="button"
                  onClick={() => {
                    setItems((prev) =>
                      prev.map((i) => ({ ...i, status: "read" })),
                    );
                    setUnread(0);
                  }}
                  className="text-[0.68rem] text-gold hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={toggleSound}
                className="text-xs text-parchment/50 hover:text-parchment p-1 rounded"
                title={
                  sound
                    ? "Mute notification chime"
                    : "Enable notification chime"
                }
              >
                {sound ? (
                  <Volume2 size={14} className="text-gold" />
                ) : (
                  <VolumeX size={14} />
                )}
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-parchment/5">
            {items.length === 0 ? (
              <div className="p-6 text-center text-xs opacity-60">
                <Inbox
                  size={28}
                  className="mx-auto mb-2 opacity-40 text-gold"
                />
                <p>No recent submissions yet.</p>
                <p className="mt-1 text-[0.7rem]">
                  When visitors fill forms on the site, they will appear right
                  here.
                </p>
              </div>
            ) : (
              items.map((item) => {
                const label = typeLabels[item.type] ?? item.type;
                const isNew = item.status === "new";
                return (
                  <Link
                    key={item.id}
                    href={`/admin/inbox/${item.id}`}
                    onClick={() => {
                      setOpen(false);
                      setItems((prev) =>
                        prev.map((i) =>
                          i.id === item.id ? { ...i, status: "read" } : i,
                        ),
                      );
                      setUnread((u) => Math.max(0, u - 1));
                    }}
                    className="block p-3.5 hover:bg-gold/10 transition-colors text-left group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="admin-badge !py-0.5 text-[0.6rem] uppercase tracking-wider">
                          {label}
                        </span>
                        {isNew && (
                          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                        )}
                      </div>
                      <span className="text-[0.65rem] opacity-50 shrink-0">
                        {formatTimeAgo(item.created_at)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-parchment group-hover:text-gold transition-colors line-clamp-1">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="mt-0.5 text-[0.7rem] opacity-60 line-clamp-1">
                        {item.subtitle}
                      </p>
                    )}
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-parchment/10 bg-black/40 p-2.5 text-center">
            <Link
              href="/admin/inbox"
              onClick={() => setOpen(false)}
              className="text-xs text-gold hover:underline font-semibold inline-flex items-center gap-1.5"
            >
              <span>Open Ministry Inbox</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
