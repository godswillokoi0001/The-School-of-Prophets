"use client";

import { useState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { saveNotificationSettings } from "@/app/admin/(shell)/actions/site-admin";

export function NotificationSettingsForm({
  userId,
  initial,
}: {
  userId: string;
  initial: Record<string, unknown>;
}) {
  const [values, setValues] = useState({
    email_enabled: Boolean(initial.email_enabled ?? true),
    push_enabled: Boolean(initial.push_enabled ?? true),
    sound_enabled: Boolean(initial.sound_enabled ?? true),
    telegram_enabled: Boolean(initial.telegram_enabled ?? false),
    digest: String(initial.digest ?? "none"),
    quiet_start: String(initial.quiet_start ?? ""),
    quiet_end: String(initial.quiet_end ?? ""),
    types: (initial.types ?? { all: true }) as Record<string, boolean>,
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const formTypes = ["all", "enrolment", "prayer", "testimony", "contact", "booking", "registration", "waitlist", "newsletter", "beta_feedback"];

  return (
    <div className="admin-surface max-w-2xl p-4">
      <div className="grid gap-3 md:grid-cols-2">
        {[
          { k: "email_enabled", l: "Email me for new submissions" },
          { k: "push_enabled", l: "Push notification to my phone/browser" },
          { k: "sound_enabled", l: "Play a sound in the dashboard" },
          { k: "telegram_enabled", l: "Also send Telegram messages (requires bot setup)" },
        ].map((f) => (
          <label key={f.k} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-gold"
              checked={values[f.k as "email_enabled"]}
              onChange={(e) => setValues({ ...values, [f.k]: e.target.checked })}
            />
            {f.l}
          </label>
        ))}
        <div>
          <label className="admin-label">Digest</label>
          <select className="admin-select" value={values.digest} onChange={(e) => setValues({ ...values, digest: e.target.value })}>
            <option value="none">None (instant only)</option>
            <option value="daily">Daily summary email</option>
            <option value="weekly">Weekly summary email</option>
          </select>
        </div>
        <div>
          <label className="admin-label">Quiet hours start (0–23)</label>
          <input className="admin-input" type="number" min={0} max={23} value={values.quiet_start} onChange={(e) => setValues({ ...values, quiet_start: e.target.value })} />
        </div>
        <div>
          <label className="admin-label">Quiet hours end (0–23)</label>
          <input className="admin-input" type="number" min={0} max={23} value={values.quiet_end} onChange={(e) => setValues({ ...values, quiet_end: e.target.value })} />
        </div>
      </div>
      <fieldset className="mt-4">
        <legend className="admin-label">Notify me for</legend>
        <div className="flex flex-wrap gap-3 text-xs">
          {formTypes.map((t) => (
            <label key={t} className="flex items-center gap-1 capitalize">
              <input
                type="checkbox"
                className="accent-gold"
                checked={Boolean(values.types[t] ?? t === "all")}
                onChange={(e) => setValues({ ...values, types: { ...values.types, [t]: e.target.checked } })}
              />
              {t === "beta_feedback" ? "beta feedback" : t.replace("_", " ")}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-4 flex items-center gap-3">
        <button
          className="admin-btn admin-btn-gold"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const res = await saveNotificationSettings(userId, {
              email_enabled: values.email_enabled,
              push_enabled: values.push_enabled,
              sound_enabled: values.sound_enabled,
              telegram_enabled: values.telegram_enabled,
              digest: values.digest,
              quiet_start: values.quiet_start ? Number(values.quiet_start) : null,
              quiet_end: values.quiet_end ? Number(values.quiet_end) : null,
              types: values.types,
            });
            setBusy(false);
            setMessage(res.ok ? "Saved." : res.error ?? "Failed");
          }}
        >
          <Save size={13} /> Save
        </button>
        {busy && <LoaderCircle size={13} className="animate-spin" />}
        {message && <span className="text-xs opacity-80">{message}</span>}
      </div>
    </div>
  );
}
