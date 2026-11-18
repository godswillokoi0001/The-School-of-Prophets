"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, CalendarX, LoaderCircle, PlusCircle, Trash2 } from "lucide-react";
import { saveSessions, deleteSession, addException, deleteException } from "@/app/admin/(shell)/actions/schedule";
import { AdminModal } from "@/components/admin/AdminModal";

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

  // In-app modal state (replacing window.confirm/alert)
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: "danger" | "warning" | "info" | "success";
    confirmLabel?: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    variant: "info",
  });

  function updateIndex(index: number, patch: Partial<SessionRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function add() {
    setRows((prev) => [
      ...prev,
      {
        id: "",
        day: 1,
        title: "New Gathering Session",
        type: "Teaching",
        start_time: "20:00",
        end_time: "21:00",
        description: "",
        join_url: "",
        active: true,
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

  function requestSave() {
    setModalConfig({
      isOpen: true,
      title: "Publish Schedule Changes",
      description: "Are you ready to publish these weekly sessions? Visitors will see the changes on the Weekly Gatherings page and calendar immediately.",
      variant: "info",
      confirmLabel: "Publish Now",
      onConfirm: async () => {
        setModalConfig((m) => ({ ...m, isOpen: false }));
        setBusy(true);
        const res = await saveSessions(rows);
        setBusy(false);
        if (res.ok) {
          setMessage("Saved and published live to the website.");
          setRows((prev) => prev.map((r, i) => ({ ...r, sort_order: i + 1 })));
        } else {
          setModalConfig({
            isOpen: true,
            title: "Failed to Save Schedule",
            description: res.error || "An error occurred while saving the schedule.",
            variant: "danger",
            confirmLabel: "Close",
            onConfirm: () => setModalConfig((m) => ({ ...m, isOpen: false })),
          });
        }
      },
    });
  }

  function requestRemove(index: number) {
    const row = rows[index];
    setModalConfig({
      isOpen: true,
      title: "Delete Gathering Session",
      description: `Are you sure you want to delete "${row.title || "this session"}"? It will be removed for all visitors on the website.`,
      variant: "danger",
      confirmLabel: "Delete Session",
      onConfirm: async () => {
        setModalConfig((m) => ({ ...m, isOpen: false }));
        if (row.id) {
          setBusy(true);
          await deleteSession(row.id);
          setBusy(false);
        }
        setRows((prev) => prev.filter((_, i) => i !== index));
        setMessage(`Deleted "${row.title}".`);
      },
    });
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
    } else {
      setModalConfig({
        isOpen: true,
        title: "Failed to Save Exception",
        description: res.error ?? "Failed to save schedule exception.",
        variant: "danger",
        confirmLabel: "Close",
        onConfirm: () => setModalConfig((m) => ({ ...m, isOpen: false })),
      });
    }
  }

  return (
    <div>
      <AdminModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        description={modalConfig.description}
        variant={modalConfig.variant}
        confirmLabel={modalConfig.confirmLabel}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig((m) => ({ ...m, isOpen: false }))}
      />

      <div className="admin-surface p-3">
        {rows.map((r, i) => (
          <div key={r.id || `session-row-${i}`} className="admin-row py-3 border-b border-parchment/10 last:border-b-0">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-12">
              <div className="md:col-span-2">
                <label className="admin-label">Day of Week</label>
                <select
                  className="admin-select"
                  value={r.day}
                  onChange={(e) => updateIndex(i, { day: Number(e.target.value) })}
                  aria-label="Day of week"
                >
                  {DAYS.map((d, di) => (
                    <option key={d} value={di}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="admin-label">Session Title</label>
                <input
                  className="admin-input"
                  value={r.title}
                  placeholder="e.g. Convergence Night"
                  onChange={(e) => updateIndex(i, { title: e.target.value })}
                  aria-label="Session title"
                />
              </div>

              <div className="md:col-span-2">
                <label className="admin-label">Type</label>
                <select
                  className="admin-select"
                  value={r.type}
                  onChange={(e) => updateIndex(i, { type: e.target.value })}
                  aria-label="Session type"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="admin-label">Start (WAT)</label>
                <input
                  className="admin-input"
                  type="time"
                  value={r.start_time}
                  onChange={(e) => updateIndex(i, { start_time: e.target.value })}
                  aria-label="Start time (WAT)"
                />
              </div>

              <div className="md:col-span-1">
                <label className="admin-label">End (WAT)</label>
                <input
                  className="admin-input"
                  type="time"
                  value={r.end_time ?? ""}
                  onChange={(e) => updateIndex(i, { end_time: e.target.value || null })}
                  aria-label="End time (WAT)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="admin-label">Join Link</label>
                <input
                  className="admin-input"
                  value={r.join_url}
                  placeholder="https://meet.google.com/…"
                  onChange={(e) => updateIndex(i, { join_url: e.target.value })}
                  aria-label="Join link"
                />
              </div>

              <div className="md:col-span-1 flex items-end gap-1">
                <button
                  type="button"
                  className="p-2 opacity-60 hover:opacity-100 disabled:opacity-20"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  aria-label={`Move ${r.title} up`}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  className="p-2 opacity-60 hover:opacity-100 disabled:opacity-20"
                  disabled={i === rows.length - 1}
                  onClick={() => move(i, 1)}
                  aria-label={`Move ${r.title} down`}
                >
                  <ArrowDown size={14} />
                </button>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-12">
              <div className="md:col-span-8">
                <label className="admin-label">Description shown to visitors</label>
                <input
                  className="admin-input"
                  value={r.description}
                  placeholder="Brief note on what takes place in this gathering..."
                  onChange={(e) => updateIndex(i, { description: e.target.value })}
                  aria-label="Description"
                />
              </div>
              <div className="md:col-span-2 flex items-end gap-2 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    className="accent-gold h-4 w-4 rounded"
                    checked={r.active}
                    onChange={(e) => updateIndex(i, { active: e.target.checked })}
                  />
                  <span>Active publicly</span>
                </label>
              </div>
              <div className="md:col-span-2 flex items-end justify-end">
                <button
                  type="button"
                  className="admin-btn admin-btn-danger !py-1 text-xs"
                  onClick={() => requestRemove(i)}
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-parchment/10">
          <button type="button" className="admin-btn admin-btn-ghost" onClick={add}>
            <PlusCircle size={13} /> Add Session
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-gold"
            onClick={requestSave}
            disabled={busy || pending}
          >
            {busy ? <LoaderCircle size={13} className="animate-spin" /> : null}
            Save & Publish Schedule
          </button>
          {message && <span className="text-xs font-semibold text-gold ml-2">{message}</span>}
        </div>
      </div>

      <section className="admin-surface mt-6 p-4">
        <h2 className="mb-1 font-display text-lg">One-Off Schedule Exceptions</h2>
        <p className="mb-3 text-xs opacity-60">
          Cancel or move a single date without modifying the weekly recurring pattern. Visitors
          will see the special notice (e.g. “No Monday teaching this week due to Convergence”).
        </p>
        <form className="flex flex-wrap items-end gap-2" onSubmit={submitException}>
          <div className="min-w-44 flex-1">
            <label className="admin-label">Session</label>
            <select
              className="admin-select"
              value={exSession}
              onChange={(e) => setExSession(e.target.value)}
            >
              {initial.map((s) => (
                <option key={s.id} value={s.id}>{DAYS[s.day]} {s.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-label">Date</label>
            <input
              className="admin-input"
              type="date"
              required
              value={exDate}
              onChange={(e) => setExDate(e.target.value)}
            />
          </div>
          <div>
            <label className="admin-label">Action</label>
            <select
              className="admin-select"
              value={exAction}
              onChange={(e) => setExAction(e.target.value as "cancel" | "reschedule")}
            >
              <option value="cancel">Cancel this date</option>
              <option value="reschedule">Reschedule this date</option>
            </select>
          </div>
          {exAction === "reschedule" && (
            <div>
              <label className="admin-label">New Time (WAT)</label>
              <input
                className="admin-input"
                type="time"
                value={exTime}
                onChange={(e) => setExTime(e.target.value)}
              />
            </div>
          )}
          <div className="min-w-48 flex-1">
            <label className="admin-label">Note to visitors</label>
            <input
              className="admin-input"
              value={exNote}
              onChange={(e) => setExNote(e.target.value)}
              placeholder="e.g. Postponed to 9 PM WAT"
            />
          </div>
          <button type="submit" className="admin-btn admin-btn-gold" disabled={exBusy}>
            <CalendarX size={13} /> Apply Exception
          </button>
        </form>
        {exceptions.length > 0 && (
          <ul className="mt-4 text-sm divide-y divide-parchment/10">
            {exceptions.map((x) => (
              <li key={x.id} className="admin-row flex items-center justify-between py-2.5">
                <span>
                  <span className="admin-badge admin-badge-warn mr-2">{x.action}</span>
                  <strong>{x.occurrence_date}</strong> · {initial.find((s) => s.id === x.session_id)?.title ?? "Session"}{" "}
                  {x.action === "reschedule" && x.new_start_time ? `→ ${x.new_start_time} WAT` : ""}
                  {x.note && <span className="opacity-70 ml-1">· “{x.note}”</span>}
                </span>
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost !py-1 text-xs"
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
