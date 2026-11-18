"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Check, ChevronLeft, ChevronRight, LoaderCircle, MessageCircle, Trash2, X } from "lucide-react";
import { bookingAction } from "@/app/admin/(shell)/actions/bookings";
import { AdminModal } from "@/components/admin/AdminModal";

type Booking = {
  id: string; name: string; email: string; whatsapp: string;
  starts_at: string; ends_at: string; status: string; topic: string;
  notes: string; admin_notes: string; cancel_reason: string;
  call_type: string;
};
type GEvent = { title: string; starts_at: string; kind: "gathering" | "event" };
type Detail = Booking | GEvent;

const statusColors: Record<string, string> = {
  confirmed: "bg-emerald-700/60", pending: "bg-amber-700/60",
  cancelled: "bg-red-900/50", completed: "bg-sky-800/60", no_show: "bg-neutral-700",
};

export function CalendarView({
  initialMonth,
  sessions,
}: {
  initialMonth: string;
  sessions: { title: string; day: number; start: string }[];
}) {
  const [month, setMonth] = useState(initialMonth);
  const [view, setView] = useState<"month" | "week" | "day" | "agenda">("month");
  const [anchor, setAnchor] = useState(new Date().toISOString().slice(0, 10));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [events, setEvents] = useState<GEvent[]>([]);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/calendar?month=${month}&date=${anchor}`)
      .then((r) => r.json())
      .then((d) => {
        setBookings(d.bookings ?? []);
        setEvents(d.events ?? []);
      });
  }, [month, anchor]);

  const monthLabel = new Date(`${month}-15T12:00:00+01:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  function shiftMonth(dir: -1 | 1) {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(Date.UTC(y, m - 1 + dir, 15));
    setMonth(d.toISOString().slice(0, 7));
    setAnchor(d.toISOString().slice(0, 10));
  }

  const daysInMonth = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    return new Date(Date.UTC(y, m, 0)).getUTCDate();
  }, [month]);

  function itemsForDay(iso: string) {
    const b = bookings.filter((x) => x.starts_at.slice(0, 10) === iso);
    const e = events.filter((x) => x.starts_at.slice(0, 10) === iso);
    return { bookings: b, events: e };
  }

  const [errorModal, setErrorModal] = useState<string | null>(null);

  function act(id: string, action: string, note = "", newStartsAt?: string) {
    start(async () => {
      setBusy(true);
      const res = await bookingAction(id, action, note, newStartsAt);
      setBusy(false);
      if (!res.ok && res.error) {
        setErrorModal(res.error);
        return;
      }
      window.location.reload();
    });
  }

  const dayBookings = detail && "email" in detail ? bookings.find((b) => b.id === detail.id) : null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button className="admin-btn admin-btn-ghost !px-2" onClick={() => shiftMonth(-1)} aria-label="Previous month"><ChevronLeft size={14} /></button>
        <span className="font-display text-lg">{monthLabel}</span>
        <button className="admin-btn admin-btn-ghost !px-2" onClick={() => shiftMonth(1)} aria-label="Next month"><ChevronRight size={14} /></button>
        <div className="ml-auto flex gap-1">
          {(["month", "week", "day", "agenda"] as const).map((v) => (
            <button
              key={v}
              className={`admin-btn !py-1 ${view === v ? "admin-btn-gold" : "admin-btn-ghost"}`}
              onClick={() => setView(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "month" && (
        <div className="admin-surface p-2">
          <div className="grid grid-cols-7 text-center text-[0.6rem] uppercase tracking-widest opacity-50">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <span key={d} className="py-1">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: daysInMonth }, (_, i) => {
              const iso = `${month}-${String(i + 1).padStart(2, "0")}`;
              const { bookings: b, events: e } = itemsForDay(iso);
              const isToday = iso === new Date().toISOString().slice(0, 10);
              return (
                <button
                  key={iso}
                  onClick={() => { setAnchor(iso); setView("day"); }}
                  className={`min-h-16 border p-1 text-left text-[0.65rem] transition-colors hover:border-gold/50 ${isToday ? "border-gold" : "border-parchment/10"}`}
                >
                  <span className="opacity-50">{i + 1}</span>
                  {b.map((x) => (
                    <span key={x.id} className={`mt-0.5 block truncate rounded px-1 text-[0.55rem] text-white ${statusColors[x.status] ?? "bg-neutral-700"}`}>
                      {new Date(x.starts_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} {x.name}
                    </span>
                  ))}
                  {e.map((x, i) => (
                    <span key={i} className="mt-0.5 block truncate rounded bg-gold/30 px-1 text-[0.55rem] text-white">
                      {x.title}
                    </span>
                  ))}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view === "agenda" && (
        <div className="admin-surface divide-y divide-parchment/10">
          {bookings.length === 0 && <p className="p-4 text-sm opacity-60">No calls booked this month.</p>}
          {bookings.map((b) => (
            <button key={b.id} className="flex w-full items-center gap-3 p-3 text-left text-sm hover:bg-parchment/5" onClick={() => setDetail(b)}>
              <span className={`rounded px-1.5 py-0.5 text-[0.6rem] text-white ${statusColors[b.status] ?? ""}`}>{b.status.replace("_", " ")}</span>
              <span className="w-32 shrink-0 text-xs opacity-70">{new Date(b.starts_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              <span className="min-w-0 flex-1 truncate">{b.name} · {b.call_type}</span>
            </button>
          ))}
          {events.map((e, i) => (
            <div key={i} className="flex items-center gap-3 p-3 text-sm opacity-80">
              <span className="admin-badge">event</span>
              <span className="w-32 shrink-0 text-xs opacity-70">{new Date(e.starts_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              <span className="flex-1 truncate">{e.title}</span>
            </div>
          ))}
        </div>
      )}

      {(view === "day" || view === "week") && (
        <div className="admin-surface divide-y divide-parchment/10">
          <p className="p-3 text-sm opacity-60">
            {view === "week" ? "Week of " : ""}
            {anchor} · {new Date(anchor).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          {view === "week" && (
            <div className="grid grid-cols-7 gap-1 p-2 text-[0.65rem]">
              {Array.from({ length: 7 }, (_, i) => {
                const d = new Date(anchor);
                d.setDate(d.getDate() - d.getDay() + i);
                const iso = d.toISOString().slice(0, 10);
                const { bookings: b } = itemsForDay(iso);
                const session = sessions.filter((s) => s.day === d.getDay());
                return (
                  <button key={iso} className="border border-parchment/10 p-1 text-left hover:border-gold/50" onClick={() => { setAnchor(iso); setView("day"); }}>
                    <span className="opacity-50">{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][d.getDay()]} {d.getDate()}</span>
                    {session.map((s, j) => (
                      <span key={j} className="mt-0.5 block truncate rounded bg-gold/25 px-1 text-[0.55rem]">{s.start} {s.title}</span>
                    ))}
                    {b.map((x) => (
                      <span key={x.id} className={`mt-0.5 block truncate rounded px-1 text-[0.55rem] text-white ${statusColors[x.status] ?? ""}`}>{x.name}</span>
                    ))}
                  </button>
                );
              })}
            </div>
          )}
          {view === "day" && (
            <div className="p-3">
              {itemsForDay(anchor).events.map((e, i) => (
                <p key={i} className="mb-1 text-sm"><span className="admin-badge">event</span> {e.title}</p>
              ))}
              {sessions.filter((s) => s.day === new Date(anchor + "T12:00:00+01:00").getDay()).map((s, i) => (
                <p key={i} className="mb-1 text-sm"><span className="admin-badge admin-badge-warn">weekly</span> {s.start} WAT · {s.title}</p>
              ))}
              {itemsForDay(anchor).bookings.length === 0 && <p className="text-sm opacity-60">No calls this day.</p>}
              {itemsForDay(anchor).bookings.map((b) => (
                <button key={b.id} className="mb-1 block w-full text-left text-sm hover:text-gold-soft" onClick={() => setDetail(b)}>
                  <span className={`rounded px-1.5 py-0.5 text-[0.6rem] text-white ${statusColors[b.status] ?? ""}`}>{b.status.replace("_", " ")}</span>{" "}
                  {new Date(b.starts_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} · {b.name} · {b.call_type}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {detail && "email" in detail && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4" onClick={() => setDetail(null)}>
          <div className="admin-surface max-h-[80vh] w-full overflow-y-auto p-4 sm:max-w-md" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Booking details">
            <div className="flex items-start justify-between">
              <h3 className="font-display text-lg">{dayBookings?.name}</h3>
              <button onClick={() => setDetail(null)} className="p-1 opacity-60" aria-label="Close"><X size={14} /></button>
            </div>
            <p className="text-xs opacity-70">{dayBookings?.call_type} · {dayBookings && new Date(dayBookings.starts_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} WAT</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div><dt className="admin-label">Email</dt><dd>{dayBookings?.email}</dd></div>
              <div><dt className="admin-label">WhatsApp</dt><dd>{dayBookings?.whatsapp}</dd></div>
              <div><dt className="admin-label">Topic</dt><dd>{dayBookings?.topic || "—"}</dd></div>
              <div><dt className="admin-label">Notes from visitor</dt><dd>{dayBookings?.notes || "—"}</dd></div>
            </dl>
            {dayBookings?.whatsapp.replace(/[^\d]/g, "") && (
              <a
                className="admin-btn admin-btn-ghost mt-3"
                href={`https://wa.me/${dayBookings.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent(`Hello ${dayBookings.name}, this is regarding your TSOP call.`)}`}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={13} /> Open WhatsApp
              </a>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {dayBookings?.status === "pending" && (
                <button className="admin-btn admin-btn-gold !py-1" disabled={busy || pending} onClick={() => dayBookings && act(dayBookings.id, "confirm")}>
                  <Check size={12} /> Confirm
                </button>
              )}
              {dayBookings && dayBookings.status !== "completed" && (
                <button className="admin-btn admin-btn-ghost !py-1" disabled={busy} onClick={() => dayBookings && act(dayBookings.id, "completed")}>Mark completed</button>
              )}
              {dayBookings && dayBookings.status === "confirmed" && (
                <button className="admin-btn admin-btn-ghost !py-1" disabled={busy} onClick={() => dayBookings && act(dayBookings.id, "no_show")}>No-show</button>
              )}
              {dayBookings && !["cancelled", "completed"].includes(dayBookings.status) && (
                <>
                  <button className="admin-btn admin-btn-danger !py-1" disabled={busy} onClick={() => dayBookings && act(dayBookings.id, "cancel", reason)}>
                    <Trash2 size={12} /> Cancel
                  </button>
                  <button
                    className="admin-btn admin-btn-ghost !py-1"
                    disabled={busy}
                    onClick={() => {
                      const t = prompt("Move to which time? Copy a slot link like 2026-11-20T15:00:00.000Z");
                      if (t && dayBookings) act(dayBookings.id, "reschedule", reason, new Date(t).toISOString());
                    }}
                  >
                    Reschedule
                  </button>
                </>
              )}
            </div>
            <div className="mt-3">
              <label className="admin-label">Cancellation reason (sent to the person by email)</label>
              <input className="admin-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Prophet is attending a conference" />
            </div>
            <div className="mt-3">
              <label className="admin-label">Private admin notes</label>
              <textarea className="admin-textarea !min-h-16" defaultValue={dayBookings?.admin_notes ?? ""} onBlur={(e) => dayBookings && act(dayBookings.id, "notes", e.target.value)} />
            </div>
          </div>
        </div>
      )}
      {busy && <p className="flex gap-2 text-xs"><LoaderCircle size={12} className="animate-spin" /> Saving…</p>}

      <AdminModal
        open={Boolean(errorModal)}
        onClose={() => setErrorModal(null)}
        title="Calendar Action Notice"
        message={errorModal || ""}
        mode="danger"
      />
    </div>
  );
}
