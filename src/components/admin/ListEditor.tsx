"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, PlusCircle, Save, Trash2 } from "lucide-react";
import { AdminBack } from "@/components/admin/AdminBack";

type Field = {
  key: string;
  label: string;
  type: "text" | "textarea" | "toggle" | "number" | "image";
  width?: "full" | "half" | "small";
};

export function ListEditor<Row extends Record<string, unknown>>({
  title,
  description,
  fields,
  rows: initialRows,
  saveAction,
  deleteAction,
  newRow,
}: {
  title: string;
  description: string;
  fields: Field[];
  rows: Row[];
  saveAction: (rows: Row[]) => Promise<{ ok: boolean; error?: string }>;
  deleteAction?: (id: string) => Promise<{ ok: boolean; error?: string }>;
  newRow: () => Row;
}) {
  const [rows, setRows] = useState(initialRows);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  function set(rowIndex: number, key: string, value: unknown) {
    setRows((prev) => prev.map((r, i) => (i === rowIndex ? { ...r, [key]: value } : r)));
  }

  async function save() {
    setBusy(true);
    const res = await saveAction(rows);
    setBusy(false);
    setMessage(res.ok ? "Saved." : res.error ?? "Failed");
    if (res.ok) start(() => window.location.reload());
  }

  return (
    <div className="mx-auto max-w-3xl">
      <AdminBack href="/admin/settings" label="Back to settings" />
      <h1 className="font-display text-2xl">{title}</h1>
      <p className="mb-4 text-xs opacity-60">{description}</p>
      <div className="admin-surface p-3">
        {rows.map((row, i) => (
          <div key={i} className="admin-row py-3">
            <div className="grid gap-2 md:grid-cols-2">
              {fields.map((f) => (
                <div key={f.key} className={f.width === "full" ? "md:col-span-2" : f.width === "small" ? "md:col-span-1" : ""}>
                  <label className="admin-label">{f.label}</label>
                  {f.type === "toggle" ? (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="accent-gold"
                        checked={Boolean(row[f.key])}
                        onChange={(e) => set(i, f.key, e.target.checked)}
                      />
                      {String(row[f.key] ?? "") === "" && f.key === "sort_order" ? "" : ""}
                      {Boolean(row[f.key]) ? "Yes" : "No"}
                    </label>
                  ) : f.type === "textarea" ? (
                    <textarea
                      className="admin-textarea !min-h-16"
                      value={String(row[f.key] ?? "")}
                      onChange={(e) => set(i, f.key, e.target.value)}
                    />
                  ) : f.type === "image" ? (
                    <input
                      className="admin-input"
                      value={String(row[f.key] ?? "")}
                      onChange={(e) => set(i, f.key, e.target.value)}
                      placeholder="/images/… or a link from the media library"
                    />
                  ) : (
                    <input
                      className="admin-input"
                      type={f.type}
                      value={String(row[f.key] ?? "")}
                      onChange={(e) =>
                        set(i, f.key, f.type === "number" ? Number(e.target.value) : e.target.value)
                      }
                    />
                  )}
                </div>
              ))}
            </div>
            {deleteAction && "id" in row && typeof row.id === "string" && row.id && (
              <button
                className="admin-btn admin-btn-danger mt-2 !py-1"
                onClick={async () => {
                  if (!confirm("Delete this item permanently?")) return;
                  setBusy(true);
                  await deleteAction(row.id as string);
                  setBusy(false);
                  setRows((prev) => prev.filter((_, j) => j !== i));
                }}
              >
                <Trash2 size={12} /> Delete
              </button>
            )}
          </div>
        ))}
        {rows.length === 0 && <p className="p-4 text-center text-sm opacity-60">Nothing yet — add the first one.</p>}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button className="admin-btn admin-btn-ghost" onClick={() => setRows((r) => [...r, newRow()])}>
          <PlusCircle size={13} /> Add
        </button>
        <button className="admin-btn admin-btn-gold" onClick={save} disabled={busy || pending}>
          {busy ? <LoaderCircle size={13} className="animate-spin" /> : <Save size={13} />} Save
        </button>
        {message && <span className="text-xs opacity-80">{message}</span>}
      </div>
    </div>
  );
}
