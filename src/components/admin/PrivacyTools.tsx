"use client";

import { useState } from "react";
import { LoaderCircle, Search, Trash2, Download } from "lucide-react";
import { personSearch, erasePerson } from "@/app/admin/(shell)/actions/site-admin";

type Row = { kind: string; id: string; summary: string; payload: Record<string, unknown> };

export function PrivacyTools() {
  const [term, setTerm] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div>
      <div className="admin-surface p-4">
        <h2 className="mb-1 font-display text-lg">Find a person</h2>
        <p className="mb-3 text-xs opacity-60">
          Search by email or WhatsApp number to see everything we hold, then
          export it (data access request) or erase it (delete-on-request). This
          is logged in the audit log.
        </p>
        <div className="flex gap-2">
          <input className="admin-input flex-1" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="email or phone…" aria-label="Search person" />
          <button
            className="admin-btn admin-btn-gold"
            disabled={busy || term.length < 3}
            onClick={async () => {
              setBusy(true);
              setRows(await personSearch(term.trim()));
              setBusy(false);
            }}
          >
            <Search size={13} /> Search
          </button>
          <button
            className="admin-btn admin-btn-ghost"
            disabled={rows.length === 0}
            onClick={() => {
              const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `tsop-data-${term}.json`;
              a.click();
            }}
          >
            <Download size={13} /> Export
          </button>
        </div>
        {busy && <LoaderCircle size={13} className="mt-2 animate-spin" />}
      </div>

      {rows.length > 0 && (
        <div className="admin-surface mt-4 p-4">
          <h3 className="mb-2 font-display text-base">{rows.length} record(s)</h3>
          <ul className="text-sm">
            {rows.map((r) => (
              <li key={`${r.kind}-${r.id}`} className="admin-row py-2">
                <span className="admin-badge">{r.kind}</span> {r.summary}
                <details className="mt-1 text-xs opacity-60">
                  <summary className="cursor-pointer">View stored data</summary>
                  <pre className="mt-1 whitespace-pre-wrap break-all">{JSON.stringify(r.payload, null, 2)}</pre>
                </details>
              </li>
            ))}
          </ul>
          <button
            className="admin-btn admin-btn-danger mt-3"
            disabled={busy}
            onClick={async () => {
              if (!confirm(`Erase all data for "${term}"? This cannot be undone and is logged.`)) return;
              setBusy(true);
              const res = await erasePerson(rows.map((r) => r.id));
              setBusy(false);
              setMessage(res.ok ? `Erased ${res.count} record(s).` : res.error ?? "Failed");
              if (res.ok) setRows([]);
            }}
          >
            <Trash2 size={13} /> Erase this person
          </button>
        </div>
      )}
      {message && <p className="mt-3 text-xs opacity-80">{message}</p>}
      <div className="admin-surface mt-4 p-4 text-xs opacity-70">
        <p className="mb-1 font-semibold">Data retention (server-side)</p>
        <p>
          Auto-delete spam after 30 days and auto-archive prayer requests can be
          scheduled with Supabase pg_cron; the SQL is included in the README
          backup section. Backups run daily from Supabase (enable in the
          Supabase dashboard under Database → Backups).
        </p>
      </div>
    </div>
  );
}
