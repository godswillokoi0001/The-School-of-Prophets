"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, CalendarX, LoaderCircle, PlusCircle, Trash2 } from "lucide-react";
import { saveSessions, deleteSession, addException, deleteException } from "@/app/admin/(shell)/actions/schedule";

export type SessionRow = {
  id: string; day: number; title: string; type: string;
  start_time: string; end_time: string | null;
  description: string; join_url: string; active: boolean; sort_order: number;
};

export type ExceptionRow = {
  id: string; session_id: string; occurrence_date: string;
  action: string; new_start_time: string | null; note: string;
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TYPES = ["Teaching", "Bible Study", "Prayer", "Convergence", "Worship", "Other"];

export function ScheduleEditor({
  initial, exceptions,
}: {
  initial: SessionRow[];
  exceptions: ExceptionRow[];
}) {
  const [rows, setRows] = useState<SessionRow[]>(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [exBusy, setExBusy] = useState(false);
  const [pending, startTransition] = useTransition();

  function update(id: string, patch: Partial<SessionRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function add() {
    setRows((prev) => [
      ...prev,
      {
        id: "",
        day: 1, title: "New session", type: "Teaching",
        start_time: "20:00", end_time: "21:00",
        description: "", join_url: "", active: true,
        sort_order: prev.length + 1,
      },
    ]);
  }

  function move(index: number, dir: -1 | 1) {
    setRows((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((r, i) => ({ ...r, sort_order: i + 1 }));
    });
  }

  async function save() {
    if (!confirm("Publish these changes? Visitors will see them on the Weekly Gatherings page immediately.")) return;
    setBusy(true);
    const res = await saveSessions(rows);
    setBusy(false);
    setMessage(res.ok ? "Saved and live on the site." : res.error || "Failed to save");
    if (res.ok) setRows((prev) => prev.map((r, i) => ({ ...r, sort_order: i + 1 })));
  }

  async function remove(row: SessionRow) {
    if (!confirm(`Delete "${row.title}" from the public schedule? This removes it for all visitors.`)) return;
    if (row.id) {
      setBusy(true);
      await deleteSession(row.id);
      setBusy(false);
    }
    setRows((prev) => prev.filter((r) => r !== row));
  }

  const [exSession, setExSession] = useState(initial[0]?.id ?? "");
  const [exDate, setExDate] = useState("");
  const [exAction, setExAction] = useState<"cancel" | "reschedule">("cancel");
  const [exTime, setExTime] = useState("20:00");
  const [exNote, setExNote] = useState("");

  async function submitException(e: React.FormEvent) {
    e.preventDefault();
    setExBusy(true);
    const res = await addException(exSession, exDate, exAction, exTime, exNote);
    setExBusy(false);
    if (res.ok) {
      setMessage("Exception saved and live.");
      setExNote("");
      startTransition(() => window.location.reload());
    } else setMessage(res.error ?? "Failed");
  }

  return (
    <div>
      <div className="admin-surface p-3">
        {rows.map((r, i) => (
          <div key={r.id || `new-${i}`} className="admin-row py-3">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-12">
              <div className="md:col-span-1">
                <label className="admin-label">Day</label>
                <select className="admin-select" value={r.day} onChange={(e) => update(r.id || String(i), { day: Number(e.target.value) } as never)} aria-label="Day of week">
                  {DAYS.map((d, di) => (
                    <option key={d} value={di}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="admin-label">Title</label>
                <input className="admin-input" value={r.title} onChange={(e) => update(r.id || String(i), { title: e.target.value } as never)} aria-label="Session title" />
              </div>
              <div className="md:col-span-2">
                <label className="admin-label">Type</label>
                <select className="admin-select" value={r.type} onChange={(e) => update(r.id || String(i), { type: e.target.value } as never)} aria-label="Session type">
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="admin-label">Start</label>
                <input className="admin-input" type="time" value={r.start_time} onChange={(e) => update(r.id || String(i), { start_time: e.target.value } as never)} aria-label="Start time (WAT)" />
              </div>
              <div className="md:col-span-1">
                <label className="admin-label">End</label>
                <input className="admin-input" type="time" value={r.end_time ?? ""} onChange={(e) => update(r.id || String(i), { end_time: e.target.value || null } as never)} aria-label="End time (WAT)" />
              </div>
              <div className="md:col-span-3">
                <label className="admin-label">Join link</label>
                <input className="admin-input" value={r.join_url} placeholder="https://meet.google.com/…" onChange={(e) => update(r.id || String(i), { join_url: e.target.value } as never)} aria-label="Join link" />
              </div>
              <div className="md:col-span-1 flex items-end gap-1">
                <button className="p-2 opacity-60 hover:opacity-100" onClick={() => move(i, -1)} aria-label={`Move ${r.title} up`}><ArrowUp size={14} /></button>
                <button className="p-2 opacity-60 hover:opacity-100" onClick={() => move(i, 1)} aria-label={`Move ${r.title} down`}><ArrowDown size={14} /></button>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-12">
              <div className="md:col-span-8">
                <label className="admin-label">Description shown to visitors</label>
                <input className="admin-input" value={r.description} onChange={(e) => update(r.id || String(i), { description: e.target.value } as never)} aria-label="Description" />
              </div>
              <div className="md:col-span-2 flex items-end gap-2 text-xs">
                <label className="flex items-center gap-1">
                  <input type="checkbox" className="accent-gold" checked={r.active} onChange={(e) => update(r.id || String(i), { active: e.target.checked } as never)} />
                  Active
                </label>
              </div>
              <div className="md:col-span-2 flex items-end justify-end">
                <button className="admin-btn admin-btn-danger !py-1" onClick={() => remove(r)}>
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button className="admin-btn admin-btn-ghost" onClick={add}>
            <PlusCircle size={13} /> Add session
          </button>
          <button className="admin-btn admin-btn-gold" onClick={save} disabled={busy || pending}>
            {busy ? <LoaderCircle size={13} className="animate-spin" /> : null}
            Save & publish changes
          </button>
          {message && <span className="text-xs opacity-80">{message}</span>}
        </div>
      </div>

      <section className="admin-surface mt-4 p-4">
        <h2 className="mb-1 font-display text-lg">This-week exceptions</h2>
        <p className="mb-3 text-xs opacity-60">
          Cancel or move one date without changing the weekly pattern. Visitors
          see the note, for example “No Monday teaching this week”.
        </p>
        <form className="flex flex-wrap items-end gap-2" onSubmit={submitException}>
          <div className="min-w-44">
            <label className="admin-label">Session</label>
            <select className="admin-select" value={exSession} onChange={(e) => setExSession(e.target.value)}>
              {initial.map((s) => (
                <option key={s.id} value={s.id}>{DAYS[s.day]} {s.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-label">Date</label>
            <input className="admin-input" type="date" required value={exDate} onChange={(e) => setExDate(e.target.value)} />
          </div>
          <div>
            <label className="admin-label">Action</label>
            <select className="admin-select" value={exAction} onChange={(e) => setExAction(e.target.value as "cancel" | "reschedule")}>
              <option value="cancel">Cancel this week</option>
              <option value="reschedule">Reschedule this date</option>
            </select>
          </div>
          {exAction === "reschedule" && (
            <div>
              <label className="admin-label">New time (WAT)</label>
              <input className="admin-input" type="time" value={exTime} onChange={(e) => setExTime(e.target.value)} />
            </div>
          )}
          <div className="min-w-48 flex-1">
            <label className="admin-label">Note to visitors</label>
            <input className="admin-input" value={exNote} onChange={(e) => setExNote(e.target.value)} placeholder="No Monday teaching this week" />
          </div>
          <button className="admin-btn admin-btn-gold" disabled={exBusy}>
            <CalendarX size={13} /> Apply
          </button>
        </form>
        {exceptions.length > 0 && (
          <ul className="mt-3 text-sm">
            {exceptions.map((x) => (
              <li key={x.id} className="admin-row flex items-center justify-between py-2">
                <span>
                  <span className="admin-badge admin-badge-warn">{x.action}</span>{" "}
                  {x.occurrence_date} · {initial.find((s) => s.id === x.session_id)?.title ?? "session"}{" "}
                  {x.action === "reschedule" && x.new_start_time ? `→ ${x.new_start_time}` : ""}
                  {x.note && <span className="opacity-70"> · “{x.note}”</span>}
                </span>
                <button
                  className="admin-btn admin-btn-ghost !py-1"
                  onClick={async () => {
                    await deleteException(x.id);
                    startTransition(() => window.location.reload());
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
