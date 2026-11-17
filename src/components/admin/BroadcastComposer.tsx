"use client";

import { useState } from "react";
import { Copy, LoaderCircle, Send } from "lucide-react";
import { sendBroadcast, snippetFor } from "@/app/admin/(shell)/actions/site-admin";

type RefOption = { kind: "teaching" | "event"; id: string; label: string };

export function BroadcastComposer({ options }: { options: RefOption[] }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [segment, setSegment] = useState("all");
  const [scheduled, setScheduled] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [snippet, setSnippet] = useState("");
  const [ref, setRef] = useState(options[0]?.id ?? "");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (scheduled && !confirm(`Schedule for ${scheduled}?`)) return;
    if (!scheduled && !confirm(`Send to the "${segment}" segment now? This cannot be undone.`)) return;
    setBusy(true);
    const res = await sendBroadcast(subject, body, segment, scheduled || undefined);
    setBusy(false);
    setMessage(res.ok ? res.message ?? "Done." : res.error ?? "Failed");
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <form onSubmit={send} className="admin-surface p-4">
        <h2 className="mb-3 font-display text-lg">Email broadcast</h2>
        <label className="admin-label">Subject</label>
        <input className="admin-input mb-3" required value={subject} onChange={(e) => setSubject(e.target.value)} />
        <label className="admin-label">Message</label>
        <textarea className="admin-textarea mb-3" required value={body} onChange={(e) => setBody(e.target.value)} />
        <label className="admin-label">Send to</label>
        <select className="admin-select mb-3" value={segment} onChange={(e) => setSegment(e.target.value)}>
          <option value="all">All subscribers</option>
          <option value="waitlist">Waitlist entries</option>
          <option value="applicants">Applicants</option>
        </select>
        <label className="admin-label">Schedule (optional)</label>
        <input className="admin-input mb-3" type="datetime-local" value={scheduled} onChange={(e) => setScheduled(e.target.value)} />
        <button className="admin-btn admin-btn-gold" disabled={busy}>
          <Send size={13} /> {scheduled ? "Schedule" : "Send now"}
        </button>
        {busy && <LoaderCircle size={13} className="ml-2 animate-spin" />}
        {message && <p className="mt-2 text-xs opacity-80">{message}</p>}
      </form>

      <div className="admin-surface p-4">
        <h2 className="mb-3 font-display text-lg">WhatsApp / Telegram snippet</h2>
        <p className="mb-2 text-xs opacity-60">
          The community lives on WhatsApp and Telegram. Generate a ready-to-copy
          announcement for any teaching or event.
        </p>
        <div className="flex gap-2">
          <select className="admin-select" value={ref} onChange={(e) => setRef(e.target.value)} aria-label="Choose teaching or event">
            {options.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
          <button
            className="admin-btn admin-btn-ghost"
            onClick={async () => {
              const option = options.find((o) => o.id === ref);
              if (!option) return;
              setBusy(true);
              const res = await snippetFor(option.kind, ref);
              setBusy(false);
              setSnippet(res.ok ? res.text : "Not found.");
            }}
          >
            Generate
          </button>
        </div>
        {snippet && (
          <>
            <textarea className="admin-textarea mt-3 font-mono text-xs" value={snippet} readOnly aria-label="Generated snippet" />
            <button
              className="admin-btn admin-btn-gold mt-2"
              onClick={() => navigator.clipboard.writeText(snippet)}
            >
              <Copy size={13} /> Copy
            </button>
          </>
        )}
      </div>
    </div>
  );
}
