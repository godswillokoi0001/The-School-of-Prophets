"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

type Item = { id: string; kind: string; label: string; at: number };

function labelFor(row: Record<string, unknown>) {
  const type = String(row.type ?? row.kind ?? "update");
  const name = (row.payload as Record<string, string> | null)?.name ?? "";
  const pretty = type.replace(/_/g, " ");
  return name ? `New ${pretty} from ${name}` : `New ${pretty} submission`;
}

export function NotificationBell({ initialUnread }: { initialUnread: number }) {
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const [sound, setSound] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("tsop-notification-sound");
    setSound(stored === "1");
    const sb = createSupabaseBrowser();
    const channel = sb
      .channel("admin-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "submissions" },
        (payload) => {
          const row = (payload.new ?? {}) as Record<string, unknown>;
          const item = {
            id: String(row.id ?? Math.random()),
            kind: String(row.type ?? "submission"),
            label: labelFor(row),
            at: Date.now(),
          };
          setItems((prev) => [item, ...prev].slice(0, 20));
          setUnread((u) => u + 1);
          if (sound && "AudioContext" in window) {
            try {
              const ctx = new AudioContext();
              const osc = ctx.createOscillator();
              osc.frequency.value = 880;
              osc.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.12);
            } catch {
              // ignore audio failures
            }
          }
          if (
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            new Notification("The School of Prophets", { body: item.label });
          }
        },
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, [sound]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open) setUnread(0);
        }}
        className="relative p-2 opacity-80 hover:opacity-100"
        aria-label={`Notifications, ${unread} unread`}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 min-w-4 bg-gold px-1 text-center text-[0.55rem] font-bold text-ink rounded-full">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 admin-surface p-2 shadow-xl">
          {items.length === 0 && (
            <p className="p-3 text-xs opacity-60">
              No live notifications yet. New submissions will appear here the
              moment they arrive.
            </p>
          )}
          {items.map((it) => (
            <Link
              key={it.id}
              href="/admin/inbox"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-xs hover:bg-parchment/5"
            >
              {it.label}
              <span className="block text-[0.6rem] opacity-50">
                {new Date(it.at).toLocaleTimeString()}
              </span>
            </Link>
          ))}
          <button
            onClick={() => {
              localStorage.setItem(
                "tsop-notification-sound",
                sound ? "0" : "1",
              );
              setSound(!sound);
            }}
            className="mt-1 block w-full px-3 py-2 text-left text-[0.65rem] uppercase tracking-widest opacity-60 hover:opacity-100"
          >
            Sound on submission: {sound ? "on" : "off"}
          </button>
        </div>
      )}
    </div>
  );
}
