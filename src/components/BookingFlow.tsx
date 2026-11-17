"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Check, LoaderCircle } from "lucide-react";

type CallType = {
  id: string; name: string; slug: string; description: string;
  duration_minutes: number; mode: string;
};

export function BookingFlow({ initialTypes }: { initialTypes: CallType[] }) {
  const [types] = useState(initialTypes);
  const [typeId, setTypeId] = useState(initialTypes[0]?.id ?? "");
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<{ startsAt: string; wat: string }[]>([]);
  const [slot, setSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "", topic: "", notes: "" });

  const selectedType = types.find((t) => t.id === typeId);

  const days = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const first = new Date(Date.UTC(y, m - 1, 1));
    const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const out: { iso: string; dow: string; day: string }[] = [];
    for (let i = 0; i < count; i++) {
      const d = new Date(first);
      d.setUTCDate(1 + i);
      out.push({
        iso: d.toISOString().slice(0, 10),
        dow: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][d.getUTCDay()],
        day: String(1 + i),
      });
    }
    return out;
  }, [month]);

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    setSlot("");
    fetch(`/api/book?date=${date}&callType=${typeId}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []))
      .finally(() => setLoading(false));
  }, [date, typeId]);

  function localTime(iso: string) {
    const d = new Date(iso);
    const wat = new Date(d.getTime() + 3600_000);
    const diffMinutes = Math.round((new Date().getTimezoneOffset() * -1) / 60);
    const local = new Date(d.getTime());
    const same =
      diffMinutes === 60 ||
      wat.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) ===
        local.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return same
      ? local.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : `${local.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (${wat.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} WAT)`;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, callTypeId: typeId, startsAt: slot }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.ok) {
      setResult(data.message);
    } else {
      setResult(data.message ?? "Something went wrong.");
      if (data.errors) setErrors(data.errors);
    }
  }

  if (result) {
    return (
      <div className="card flex flex-col items-center gap-3 p-8 text-center">
        <Check size={28} className="text-gold" />
        <p className="font-display text-xl">Thank you</p>
        <p className="opacity-80">{result}</p>
        <Link href="/" className="btn btn-outline">Back to the site</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-6">
      <fieldset>
        <legend className="label mb-3">1 · What kind of call?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {types.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => setTypeId(t.id)}
              className={`border p-3 text-left text-sm transition-colors ${
                typeId === t.id
                  ? "border-gold bg-gold/10"
                  : "border-current/20 hover:border-current/50"
              }`}
              aria-pressed={typeId === t.id}
            >
              <span className="font-semibold">{t.name}</span>
              <span className="mt-1 block text-xs opacity-70">{t.duration_minutes} min · {t.mode.replace("_", " ")}</span>
              <span className="mt-1 block text-xs opacity-60">{t.description}</span>
            </button>
          ))}
          {types.length === 0 && (
            <p className="text-sm opacity-70">
              Booking is being set up. Please use the contact form for now.
            </p>
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label mb-3">2 · Pick a date</legend>
        <div className="flex items-center gap-3">
          <label className="sr-only" htmlFor="month">Month</label>
          <input
            id="month"
            type="month"
            className="input !w-auto"
            value={month}
            min={new Date().toISOString().slice(0, 7)}
            onChange={(e) => {
              setMonth(e.target.value);
              setDate("");
            }}
          />
          <CalendarDays size={16} className="opacity-50" />
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs">
          {days.map((d) => (
            <button
              type="button"
              key={d.iso}
              onClick={() => setDate(d.iso)}
              className={`aspect-square border p-1 transition-colors ${
                date === d.iso ? "border-gold bg-gold text-ink" : "border-current/15 hover:border-current/50"
              }`}
              aria-pressed={date === d.iso}
            >
              <span className="block opacity-50">{d.dow}</span>
              <span className="font-semibold">{d.day}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {date && (
        <fieldset>
          <legend className="label mb-3">3 · Pick a time</legend>
          {loading ? (
            <p className="flex gap-2 text-sm opacity-70"><LoaderCircle size={14} className="animate-spin" /> Checking availability…</p>
          ) : slots.length === 0 ? (
            <p className="text-sm opacity-70">
              No free times on this day. Please try another date.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slots.map((s) => (
                <button
                  type="button"
                  key={s.startsAt}
                  onClick={() => setSlot(s.startsAt)}
                  className={`border px-3 py-2 text-sm transition-colors ${
                    slot === s.startsAt ? "border-gold bg-gold text-ink" : "border-current/20 hover:border-current/50"
                  }`}
                  aria-pressed={slot === s.startsAt}
                >
                  {localTime(s.startsAt)}
                </button>
              ))}
            </div>
          )}
          <p className="hint mt-2">Times show in your timezone, with Lagos time (WAT) noted.</p>
        </fieldset>
      )}

      {slot && (
        <fieldset className="space-y-3">
          <legend className="label mb-3">4 · Your details</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="field">
              <label htmlFor="b-name">Full name</label>
              <input id="b-name" className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {errors.name && <span className="text-xs text-ember">{errors.name}</span>}
            </div>
            <div className="field">
              <label htmlFor="b-email">Email</label>
              <input id="b-email" type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {errors.email && <span className="text-xs text-ember">{errors.email}</span>}
            </div>
            <div className="field">
              <label htmlFor="b-wa">WhatsApp number</label>
              <input id="b-wa" className="input" required value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+234…" />
              {errors.whatsapp && <span className="text-xs text-ember">{errors.whatsapp}</span>}
            </div>
            <div className="field">
              <label htmlFor="b-topic">What would you like to talk about?</label>
              <input id="b-topic" className="input" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
            </div>
            <div className="field sm:col-span-2">
              <label htmlFor="b-notes">Anything else we should know (optional)</label>
              <textarea id="b-notes" className="textarea !min-h-24" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <p className="hint">
            By sending you agree to our privacy policy. Your details are seen
            only by the ministry team. {selectedType ? `${selectedType.duration_minutes} minutes` : ""}.
          </p>
          <button className="btn btn-gold" disabled={busy}>
            {busy ? <LoaderCircle size={14} className="animate-spin" /> : null} Book the call
          </button>
          {result && !busy && <p className="text-sm text-ember">{result}</p>}
        </fieldset>
      )}
    </form>
  );
}
