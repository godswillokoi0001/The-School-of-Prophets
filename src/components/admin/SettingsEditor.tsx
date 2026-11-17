"use client";

import { useState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { saveSetting } from "@/app/admin/(shell)/actions/settings";
import { UploadButton } from "@/components/admin/RichText";
import { AdminBack } from "@/components/admin/AdminBack";

type Field =
  | { key: string; label: string; type: "text" | "textarea" | "number" | "date"; hint?: string; placeholder?: string }
  | { key: string; label: string; type: "toggle"; hint?: string }
  | { key: string; label: string; type: "select"; options: { value: string; label: string }[]; hint?: string }
  | { key: string; label: string; type: "image"; hint?: string };

export function SettingsEditor({
  settingKey,
  title,
  description,
  fields,
  initial,
  backHref = "/admin/settings",
  backLabel = "Back to settings",
}: {
  settingKey: string;
  title: string;
  description: string;
  fields: Field[];
  initial: Record<string, unknown>;
  backHref?: string;
  backLabel?: string;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  function set(key: string, value: unknown) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await saveSetting(settingKey, values);
    setBusy(false);
    setMessage(res.ok ? "Saved. The site updates within seconds." : res.error ?? "Failed");
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl">
      <AdminBack href={backHref} label={backLabel} />
      <h1 className="font-display text-2xl">{title}</h1>
      <p className="mb-4 text-xs opacity-60">{description}</p>
      <div className="admin-surface grid gap-4 p-4 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className={f.type === "textarea" ? "md:col-span-2" : ""}>
            <label className="admin-label" htmlFor={`f-${f.key}`}>{f.label}</label>
            {f.type === "toggle" ? (
              <label className="flex items-center gap-2 text-sm">
                <input
                  id={`f-${f.key}`}
                  type="checkbox"
                  className="accent-gold"
                  checked={Boolean(values[f.key])}
                  onChange={(e) => set(f.key, e.target.checked)}
                />
                {Boolean(values[f.key]) ? "On" : "Off"}
              </label>
            ) : f.type === "select" ? (
              <select
                id={`f-${f.key}`}
                className="admin-select"
                value={String(values[f.key] ?? "")}
                onChange={(e) => set(f.key, e.target.value)}
              >
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : f.type === "textarea" ? (
              <textarea
                id={`f-${f.key}`}
                className="admin-textarea"
                value={String(values[f.key] ?? "")}
                onChange={(e) => set(f.key, e.target.value)}
              />
            ) : f.type === "image" ? (
              <div className="flex gap-2">
                <input
                  id={`f-${f.key}`}
                  className="admin-input"
                  value={String(values[f.key] ?? "")}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder="/images/… or pick from library"
                />
                <UploadButton
                  label="Upload"
                  setBusy={setBusy}
                  onUploaded={(p) => set(f.key, p)}
                />
              </div>
            ) : (
              <input
                id={`f-${f.key}`}
                className="admin-input"
                type={f.type}
                value={String(values[f.key] ?? "")}
                placeholder={f.placeholder}
                onChange={(e) => set(f.key, e.target.value)}
              />
            )}
            {f.hint && <p className="admin-hint">{f.hint}</p>}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button className="admin-btn admin-btn-gold" disabled={busy}>
          {busy ? <LoaderCircle size={13} className="animate-spin" /> : <Save size={13} />} Save
        </button>
        {message && <span className="text-xs opacity-80">{message}</span>}
      </div>
    </form>
  );
}
