"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Copy, LoaderCircle, Trash2 } from "lucide-react";
import { bulkTeachings, duplicateTeaching } from "@/app/admin/(shell)/actions/teachings";

export type TeachingRow = {
  id: string; title: string; slug: string; status: string;
  series_title: string | null; date_taught: string | null; featured: boolean;
};

const statusBadge: Record<string, string> = {
  published: "admin-badge-ok", scheduled: "admin-badge-warn", draft: "",
};

export function TeachingList({ rows, seriesOptions }: { rows: TeachingRow[]; seriesOptions: { id: string; title: string }[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState(false);
  const [bulkTag, setBulkTag] = useState("");
  const [bulkSeries, setBulkSeries] = useState("");

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function run(action: string, value?: string, confirmMsg?: string) {
    if (confirmMsg && !confirm(confirmMsg)) return;
    start(async () => {
      setBusy(true);
      await bulkTeachings([...selected], action, value);
      setBusy(false);
      window.location.reload();
    });
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="admin-surface mb-3 flex flex-wrap items-center gap-2 p-3 text-xs">
          <span>{selected.size} selected</span>
          <button className="admin-btn admin-btn-ghost !py-1" disabled={pending} onClick={() => run("publish")}>Publish</button>
          <button className="admin-btn admin-btn-ghost !py-1" disabled={pending} onClick={() => run("unpublish")}>Unpublish</button>
          <select className="admin-select !w-auto !py-1" value={bulkSeries} onChange={(e) => { setBulkSeries(e.target.value); if (e.target.value) run("series", e.target.value); }} aria-label="Move to series">
            <option value="">Move to series…</option>
            {seriesOptions.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
          <input className="admin-input !w-32 !py-1" placeholder="Add tag…" value={bulkTag} onChange={(e) => setBulkTag(e.target.value)} aria-label="Tag to add" />
          <button className="admin-btn admin-btn-ghost !py-1" disabled={!bulkTag || pending} onClick={() => run("tag", bulkTag)}>Tag</button>
          <button className="admin-btn admin-btn-danger !py-1" disabled={pending} onClick={() => run("delete", undefined, `Delete ${selected.size} teaching(s)? This cannot be undone.`)}>
            <Trash2 size={12} /> Delete
          </button>
          {busy && <LoaderCircle size={12} className="animate-spin" />}
        </div>
      )}

      <div className="admin-surface overflow-x-auto">
        <table className="admin-table min-w-[640px]">
          <thead>
            <tr>
              <th className="w-8"></th>
              <th>Title</th>
              <th>Series</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="admin-row hover:bg-parchment/5">
                <td>
                  <input type="checkbox" className="accent-gold" checked={selected.has(t.id)} onChange={() => toggle(t.id)} aria-label={`Select ${t.title}`} />
                </td>
                <td>
                  <Link href={`/admin/teachings/${t.slug}`} className="hover:text-gold-soft">
                    {t.title}
                    {t.featured && <span className="ml-1 admin-badge admin-badge-new">Featured</span>}
                  </Link>
                </td>
                <td className="opacity-70">{t.series_title ?? "—"}</td>
                <td><span className={`admin-badge ${statusBadge[t.status] ?? ""}`}>{t.status}</span></td>
                <td className="text-[0.7rem] opacity-70">{t.date_taught ?? "—"}</td>
                <td>
                  <button
                    className="p-1 opacity-60 hover:opacity-100"
                    aria-label={`Duplicate ${t.title}`}
                    onClick={async () => {
                      if (!confirm(`Duplicate "${t.title}" as a new draft?`)) return;
                      setBusy(true);
                      const res = await duplicateTeaching(t.id);
                      setBusy(false);
                      if (res.ok && res.id) window.location.assign(`/admin/teachings/${res.id}`);
                    }}
                  >
                    <Copy size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="p-6 text-center text-sm opacity-60">
            No teachings yet. Use “New teaching” to write the first one.
          </p>
        )}
      </div>
    </div>
  );
}
