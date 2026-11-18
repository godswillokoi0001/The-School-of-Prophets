"use client";

import { useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CalendarX,
  CheckCircle2,
  Clock,
  LoaderCircle,
  PlusCircle,
  Save,
  Trash2,
} from "lucide-react";
import { saveSessions, deleteSession, addException, deleteException } from "@/app/admin/(shell)/actions/schedule";
import { AdminModal } from "@/components/admin/AdminModal";

export type SessionRow = {
  id: string;
  day: number;
  title: string;
  type: string;
  start_time: string;
  end_time: string | null;
  description: string;
  join_url: string;
  active: boolean;
  sort_order: number;
};

export type ExceptionRow = {
  id: string;
  session_id: string;
  occurrence_date: string;
  action: string;
  new_start_time: string | null;
  note: string;
};

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const TYPES = ["Teaching", "Bible Study", "Prayer", "Convergence", "Worship", "Other"];

export function ScheduleEditor({
  initial,
  exceptions: initialExceptions,
}: {
  initial: SessionRow[];
  exceptions: ExceptionRow[];
}) {
  const [rows, setRows] = useState<SessionRow[]>(initial);
  const [exceptions, setExceptions] = useState<ExceptionRow[]>(initialExceptions);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [exBusy, setExBusy] = useState(false);
  const [pending, startTransition] = useTransition();

  // In-app modal state
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

  function addSession(defaultDay = 1) {
    setRows((prev) => [
      ...prev,
      {
        id: "",
        day: defaultDay,
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
      description:
        "Are you ready to publish these weekly sessions? Changes will be immediately reflected on the Weekly Gatherings page, Homepage, and calendar feeds.",
      variant: "info",
      confirmLabel: "Publish Now",
      onConfirm: async () => {
        setModalConfig((m) => ({ ...m, isOpen: false }));
        setBusy(true);
        const res = await saveSessions(rows);
        setBusy(false);
        if (res.ok) {
          setMessage("Saved and published live to the website.");
          setTimeout(() => setMessage(""), 4000);
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
        setTimeout(() => setMessage(""), 3000);
      },
    });
  }

  // Exception form state
  const [exSession, setExSession] = useState(rows[0]?.id ?? "");
  const [exDate, setExDate] = useState("");
  const [exAction, setExAction] = useState<"cancel" | "reschedule">("cancel");
  const [exTime, setExTime] = useState("20:00");
  const [exNote, setExNote] = useState("");

  async function submitException(e: React.FormEvent) {
    e.preventDefault();
    if (!exSession || !exDate) return;
    setExBusy(true);
    const res = await addException(exSession, exDate, exAction, exTime, exNote);
    setExBusy(false);
    if (res.ok) {
      setExceptions((prev) => [
        {
          id: crypto.randomUUID(),
          session_id: exSession,
          occurrence_date: exDate,
          action: exAction,
          new_start_time: exAction === "reschedule" ? exTime : null,
          note: exNote,
        },
        ...prev,
      ]);
      setExNote("");
      setMessage("Exception notice published live to the website.");
      setTimeout(() => setMessage(""), 4000);
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
    <div className="space-y-8">
      <AdminModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        description={modalConfig.description}
        variant={modalConfig.variant}
        confirmLabel={modalConfig.confirmLabel}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig((m) => ({ ...m, isOpen: false }))}
      />

      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gold/30 bg-ink-2 p-4">
        <div>
          <h2 className="font-display text-lg text-parchment">Weekly Gatherings Timetable</h2>
          <p className="text-xs opacity-60">
            {rows.length} recurring session{rows.length === 1 ? "" : "s"} scheduled in WAT.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {message && (
            <span className="flex items-center gap-1.5 text-xs text-gold font-medium">
              <CheckCircle2 size={14} /> {message}
            </span>
          )}
          <button
            type="button"
            className="admin-btn admin-btn-ghost text-xs"
            onClick={() => addSession(1)}
          >
            <PlusCircle size={13} /> Add Session
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-gold text-xs"
            onClick={requestSave}
            disabled={busy || pending}
          >
            {busy ? <LoaderCircle size={13} className="animate-spin" /> : <Save size={13} />}
            Publish Schedule
          </button>
        </div>
      </div>

      {/* Sessions Grid: Well-Arranged Clean Cards */}
      <div className="space-y-4">
        {rows.map((r, i) => (
          <div
            key={r.id || `session-${i}`}
            className={`rounded-lg border p-4 transition-colors ${
              r.active
                ? "border-parchment/15 bg-ink/70 hover:border-gold/40"
                : "border-dashed border-parchment/10 bg-ink/30 opacity-70"
            }`}
          >
            {/* Header of session card */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-parchment/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-gold/15 px-2.5 py-1 text-xs font-bold text-gold uppercase tracking-wider">
                  {DAYS[r.day] ?? "Any Day"}
                </span>
                <span className="rounded bg-parchment/10 px-2 py-0.5 text-[0.68rem] text-parchment/70 uppercase">
                  {r.type}
                </span>
                <span className="text-xs text-parchment/60 font-mono">
                  {r.start_time} {r.end_time ? `– ${r.end_time}` : ""} WAT
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-parchment/80 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-gold h-4 w-4 rounded"
                    checked={r.active}
                    onChange={(e) => updateIndex(i, { active: e.target.checked })}
                  />
                  <span>Active</span>
                </label>
                <div className="flex items-center gap-1 border-l border-parchment/10 pl-2">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    className="p-1 opacity-50 hover:opacity-100 disabled:opacity-20"
                    title="Move up"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    disabled={i === rows.length - 1}
                    onClick={() => move(i, 1)}
                    className="p-1 opacity-50 hover:opacity-100 disabled:opacity-20"
                    title="Move down"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => requestRemove(i)}
                    className="p-1 text-red-400 opacity-60 hover:opacity-100 ml-1"
                    title="Delete session"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-12">
              <div className="md:col-span-4">
                <label className="admin-label">Session Title</label>
                <input
                  className="admin-input"
                  value={r.title}
                  placeholder="e.g. Convergence Night"
                  onChange={(e) => updateIndex(i, { title: e.target.value })}
                />
              </div>

              <div className="md:col-span-3">
                <label className="admin-label">Day of Week</label>
                <select
                  className="admin-select"
                  value={r.day}
                  onChange={(e) => updateIndex(i, { day: Number(e.target.value) })}
                >
                  {DAYS.map((d, di) => (
                    <option key={d} value={di}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="admin-label">Gathering Type</label>
                <select
                  className="admin-select"
                  value={r.type}
                  onChange={(e) => updateIndex(i, { type: e.target.value })}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="admin-label">Start (WAT)</label>
                    <input
                      className="admin-input"
                      type="time"
                      value={r.start_time}
                      onChange={(e) => updateIndex(i, { start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="admin-label">End (WAT)</label>
                    <input
                      className="admin-input"
                      type="time"
                      value={r.end_time ?? ""}
                      onChange={(e) => updateIndex(i, { end_time: e.target.value || null })}
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-7">
                <label className="admin-label">Description / Focus (shown on site)</label>
                <input
                  className="admin-input"
                  value={r.description}
                  placeholder="e.g. We wait on the Lord, open the scriptures, and pray in the Spirit."
                  onChange={(e) => updateIndex(i, { description: e.target.value })}
                />
              </div>

              <div className="md:col-span-5">
                <label className="admin-label">Live Gathering Link (Google Meet / Zoom)</label>
                <input
                  className="admin-input"
                  value={r.join_url}
                  placeholder="https://meet.google.com/..."
                  onChange={(e) => updateIndex(i, { join_url: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SCHEDULE EXCEPTIONS & NOTICES SECTION */}
      <section className="rounded-lg border border-gold/30 bg-ink-2 p-5">
        <div className="mb-4 border-b border-parchment/10 pb-3">
          <div className="flex items-center gap-2 text-gold">
            <CalendarX size={18} />
            <h2 className="font-display text-lg text-parchment">
              Schedule Exceptions & Holiday Cancellations
            </h2>
          </div>
          <p className="mt-1 text-xs opacity-60">
            Cancel or reschedule a specific date without modifying your recurring weekly rhythm.
            When added, a prominent notice immediately appears on the website Homepage and Gatherings Timetable.
          </p>
        </div>

        <form onSubmit={submitException} className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-12 items-end">
          <div className="md:col-span-4">
            <label className="admin-label">Affected Session</label>
            <select
              className="admin-select"
              value={exSession}
              onChange={(e) => setExSession(e.target.value)}
              required
            >
              <option value="">Select a gathering…</option>
              {rows.map((s) => (
                <option key={s.id || s.title} value={s.id}>
                  {DAYS[s.day]} · {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="admin-label">Specific Date</label>
            <input
              type="date"
              className="admin-input"
              value={exDate}
              onChange={(e) => setExDate(e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="admin-label">Action</label>
            <select
              className="admin-select"
              value={exAction}
              onChange={(e) => setExAction(e.target.value as "cancel" | "reschedule")}
            >
              <option value="cancel">Cancel this session</option>
              <option value="reschedule">Reschedule time</option>
            </select>
          </div>

          {exAction === "reschedule" && (
            <div className="md:col-span-2">
              <label className="admin-label">New Time (WAT)</label>
              <input
                type="time"
                className="admin-input"
                value={exTime}
                onChange={(e) => setExTime(e.target.value)}
              />
            </div>
          )}

          <div className={exAction === "reschedule" ? "md:col-span-12" : "md:col-span-4"}>
            <label className="admin-label">Reason / Public Note</label>
            <div className="flex items-center gap-2">
              <input
                className="admin-input flex-1"
                placeholder="e.g. Cancelled for All-Night Vigil"
                value={exNote}
                onChange={(e) => setExNote(e.target.value)}
              />
              <button
                type="submit"
                disabled={exBusy || !exSession || !exDate}
                className="admin-btn admin-btn-gold whitespace-nowrap text-xs"
              >
                {exBusy ? <LoaderCircle size={13} className="animate-spin" /> : <CalendarX size={13} />}
                Add Notice
              </button>
            </div>
          </div>
        </form>

        {/* Active Exceptions List */}
        {exceptions.length > 0 && (
          <div className="mt-5 border-t border-parchment/10 pt-4">
            <h3 className="font-display text-sm text-parchment mb-2">Active Schedule Exceptions:</h3>
            <div className="space-y-2">
              {exceptions.map((x) => {
                const session = rows.find((s) => s.id === x.session_id);
                return (
                  <div
                    key={x.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded bg-ink/60 border border-parchment/10 p-3 text-xs"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`admin-badge uppercase font-bold text-[0.65rem] ${
                          x.action === "cancel" ? "admin-badge-bad" : "admin-badge-warn"
                        }`}
                      >
                        {x.action === "cancel" ? "Cancelled" : `Rescheduled to ${x.new_start_time} WAT`}
                      </span>
                      <span className="font-semibold text-parchment">{x.occurrence_date}</span>
                      <span className="opacity-75">
                        · {session?.title || "Weekly Session"}
                      </span>
                      {x.note && (
                        <span className="text-parchment/60 italic">— &ldquo;{x.note}&rdquo;</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost !py-1 text-xs text-red-400 hover:text-red-300"
                      onClick={async () => {
                        await deleteException(x.id);
                        setExceptions((prev) => prev.filter((item) => item.id !== x.id));
                      }}
                    >
                      <Trash2 size={12} className="inline mr-1" /> Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
