"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, PlusCircle, Trash2 } from "lucide-react";
import {
  saveAvailability, deleteRule, addBlockedDate, removeBlockedDate,
  type CallTypeInput,
} from "@/app/admin/(shell)/actions/availability";

type Rule = { id: string; weekday: number; start_time: string; end_time: string; slot_minutes: number; active: boolean; call_type_id: string | null };
type Block = { id: string; date: string; all_day: boolean; reason: string };

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MODES = [
  { v: "phone", l: "Phone call" },
  { v: "whatsapp", l: "WhatsApp call" },
  { v: "meet", l: "Google Meet link" },
  { v: "in_person", l: "In person" },
];

export function AvailabilityEditor({
  rules: initialRules,
  callTypes: initialTypes,
  blocks,
}: {
  rules: Rule[];
  callTypes: CallTypeInput[];
  blocks: Block[];
}) {
  const [rules, setRules] = useState(initialRules);
  const [types, setTypes] = useState(initialTypes);
  const [blocked, setBlocked] = useState(blocks);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [blockDate, setBlockDate] = useState("");
  const [blockAllDay, setBlockAllDay] = useState(true);
  const [blockStart, setBlockStart] = useState("09:00");
  const [blockEnd, setBlockEnd] = useState("17:00");
  const [blockReason, setBlockReason] = useState("");
  const [, startTransition] = useTransition();

  function addRule() {
    setRules((r) => [
      ...r,
      { id: "", weekday: 1, start_time: "10:00", end_time: "17:00", slot_minutes: 30, active: true, call_type_id: null },
    ]);
  }

  async function save() {
    setBusy(true);
    const res = await saveAvailability(rules, types);
    setBusy(false);
    setMessage(res.ok ? "Availability saved." : res.error ?? "Failed");
  }

  async function removeRule(id: string) {
    if (!id) {
      setRules((r) => r.filter((x) => x.id !== id));
      return;
    }
    if (!confirm("Remove this time window? Visitors can no longer book into it.")) return;
    setBusy(true);
    await deleteRule(id);
    setBusy(false);
    setRules((r) => r.filter((x) => x.id !== id));
  }

  async function addBlock(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await addBlockedDate(blockDate, blockAllDay, blockStart, blockEnd, blockReason);
    setBusy(false);
    if (res.ok) {
      setMessage("Blocked date saved.");
      startTransition(() => window.location.reload());
    } else setMessage(res.error ?? "Failed");
  }

  return (
    <div>
      <section className="admin-surface p-4">
        <h2 className="mb-1 font-display text-lg">Working hours</h2>
        <p className="mb-3 text-xs opacity-60">
          All times are WAT (Lagos). Add one or more windows per day; visitors
          can book into slots of the length you choose.
        </p>
        {rules.map((r, i) => (
          <div key={r.id || `new-${i}`} className="admin-row flex flex-wrap items-end gap-2 py-2">
            <div>
              <label className="admin-label">Day</label>
              <select className="admin-select" value={r.weekday} onChange={(e) => setRules(rules.map((x, j) => (j === i ? { ...x, weekday: Number(e.target.value) } : x)))}>
                {DAYS.map((d, di) => (
                  <option key={d} value={di}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-label">From</label>
              <input className="admin-input !w-28" type="time" value={r.start_time} onChange={(e) => setRules(rules.map((x, j) => (j === i ? { ...x, start_time: e.target.value } : x)))} />
            </div>
            <div>
              <label className="admin-label">To</label>
              <input className="admin-input !w-28" type="time" value={r.end_time} onChange={(e) => setRules(rules.map((x, j) => (j === i ? { ...x, end_time: e.target.value } : x)))} />
            </div>
            <div>
              <label className="admin-label">Slot</label>
              <select className="admin-select" value={r.slot_minutes} onChange={(e) => setRules(rules.map((x, j) => (j === i ? { ...x, slot_minutes: Number(e.target.value) } : x)))}>
                {[15, 30, 45, 60].map((m) => (
                  <option key={m} value={m}>{m} min</option>
                ))}
              </select>
            </div>
            <button className="admin-btn admin-btn-danger !py-1" onClick={() => removeRule(r.id)} disabled={busy}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <button className="admin-btn admin-btn-ghost mt-2" onClick={addRule}>
          <PlusCircle size={13} /> Add window
        </button>
      </section>

      <section className="admin-surface mt-4 p-4">
        <h2 className="mb-3 font-display text-lg">Call types</h2>
        {types.map((t, i) => (
          <div key={t.id || `t-${i}`} className="admin-row grid gap-2 py-3 md:grid-cols-6">
            <div className="md:col-span-2">
              <label className="admin-label">Name</label>
              <input className="admin-input" value={t.name} onChange={(e) => setTypes(types.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
            </div>
            <div>
              <label className="admin-label">Minutes</label>
              <input className="admin-input" type="number" min={5} step={5} value={t.duration_minutes} onChange={(e) => setTypes(types.map((x, j) => (j === i ? { ...x, duration_minutes: Number(e.target.value) } : x)))} />
            </div>
            <div>
              <label className="admin-label">Buffer</label>
              <input className="admin-input" type="number" min={0} step={5} value={t.buffer_minutes} onChange={(e) => setTypes(types.map((x, j) => (j === i ? { ...x, buffer_minutes: Number(e.target.value) } : x)))} />
            </div>
            <div>
              <label className="admin-label">How</label>
              <select className="admin-select" value={t.mode} onChange={(e) => setTypes(types.map((x, j) => (j === i ? { ...x, mode: e.target.value } : x)))}>
                {MODES.map((m) => (
                  <option key={m.v} value={m.v}>{m.l}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-3 text-xs">
              <label className="flex items-center gap-1">
                <input type="checkbox" className="accent-gold" checked={t.approval_required} onChange={(e) => setTypes(types.map((x, j) => (j === i ? { ...x, approval_required: e.target.checked } : x)))} />
                Needs approval
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" className="accent-gold" checked={t.active} onChange={(e) => setTypes(types.map((x, j) => (j === i ? { ...x, active: e.target.checked } : x)))} />
                Live
              </label>
            </div>
            <div className="md:col-span-6">
              <label className="admin-label">Description shown on the booking page</label>
              <input className="admin-input" value={t.description} onChange={(e) => setTypes(types.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} />
            </div>
          </div>
        ))}
        <button
          className="admin-btn admin-btn-ghost mt-2"
          onClick={() =>
            setTypes((ts) => [
              ...ts,
              { name: "New call type", slug: `call-type-${ts.length + 1}-${Date.now().toString(36).slice(-4)}`, description: "", duration_minutes: 30, buffer_minutes: 5, mode: "whatsapp", approval_required: false, active: true, sort_order: ts.length + 1 },
            ])
          }
        >
          <PlusCircle size={13} /> Add call type
        </button>
      </section>

      <section className="admin-surface mt-4 p-4">
        <h2 className="mb-1 font-display text-lg">Blocked dates & holidays</h2>
        <form className="mt-2 flex flex-wrap items-end gap-2" onSubmit={addBlock}>
          <div>
            <label className="admin-label">Date</label>
            <input className="admin-input" type="date" required value={blockDate} onChange={(e) => setBlockDate(e.target.value)} />
          </div>
          <label className="flex items-center gap-1 pb-2 text-xs">
            <input type="checkbox" className="accent-gold" checked={blockAllDay} onChange={(e) => setBlockAllDay(e.target.checked)} />
            All day
          </label>
          {!blockAllDay && (
            <>
              <div>
                <label className="admin-label">From</label>
                <input className="admin-input" type="time" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} />
              </div>
              <div>
                <label className="admin-label">To</label>
                <input className="admin-input" type="time" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} />
              </div>
            </>
          )}
          <div className="flex-1 min-w-40">
            <label className="admin-label">Reason (private)</label>
            <input className="admin-input" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Public holiday, travel…" />
          </div>
          <button className="admin-btn admin-btn-ghost" disabled={busy || !blockDate}>Block</button>
        </form>
        {blocked.length > 0 && (
          <ul className="mt-3 text-sm">
            {blocked.map((b) => (
              <li key={b.id} className="admin-row flex items-center justify-between py-1">
                <span>{b.date} · {b.all_day ? "All day" : "Partial"} {b.reason && <span className="opacity-60">· {b.reason}</span>}</span>
                <button
                  className="admin-btn admin-btn-ghost !py-1"
                  onClick={async () => {
                    await removeBlockedDate(b.id);
                    setBlocked((prev) => prev.filter((x) => x.id !== b.id));
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-4 flex items-center gap-3">
        <button className="admin-btn admin-btn-gold" onClick={save} disabled={busy}>
          {busy ? <LoaderCircle size={13} className="animate-spin" /> : null} Save availability
        </button>
        {message && <span className="text-xs opacity-80">{message}</span>}
      </div>
    </div>
  );
}
