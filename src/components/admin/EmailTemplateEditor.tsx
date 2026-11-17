"use client";

import { useState } from "react";
import { LoaderCircle, Save, Send } from "lucide-react";
import { saveEmailTemplate, testEmailTemplate } from "@/app/admin/(shell)/actions/site-admin";

type Template = { key: string; label: string; subject: string; body: string };

export function EmailTemplateEditor({ templates }: { templates: Template[] }) {
  const [active, setActive] = useState(templates[0]?.key ?? "");
  const [draft, setDraft] = useState(templates[0] ?? { key: "", label: "", subject: "", body: "" });
  const [busy, setBusy] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [message, setMessage] = useState("");

  function pick(key: string) {
    const t = templates.find((x) => x.key === key);
    if (t) {
      setActive(key);
      setDraft(t);
      setMessage("");
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-[200px_1fr]">
      <div className="admin-surface p-2">
        {templates.map((t) => (
          <button
            key={t.key}
            onClick={() => pick(t.key)}
            className={`block w-full px-3 py-2 text-left text-sm hover:bg-parchment/5 ${active === t.key ? "text-gold-soft" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div>
        <div className="admin-surface p-4">
          <p className="mb-2 text-xs opacity-60">
            Placeholders: {"{{name}}"}, {"{{type}}"}, {"{{time}}"}, {"{{reason}}"}, {"{{link}}"}.
          </p>
          <label className="admin-label">Subject</label>
          <input className="admin-input mb-3" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
          <label className="admin-label">Body</label>
          <textarea className="admin-textarea !min-h-48" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            className="admin-btn admin-btn-gold"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              const res = await saveEmailTemplate(active, draft.subject, draft.body);
              setBusy(false);
              setMessage(res.ok ? "Template saved." : res.error ?? "Failed");
            }}
          >
            <Save size={13} /> Save template
          </button>
          <input className="admin-input !w-56" placeholder="Send a test to…" value={testTo} onChange={(e) => setTestTo(e.target.value)} aria-label="Test recipient" />
          <button
            className="admin-btn admin-btn-ghost"
            disabled={busy || !testTo}
            onClick={async () => {
              setBusy(true);
              const res = await testEmailTemplate(testTo, draft.subject, draft.body);
              setBusy(false);
              setMessage(res.ok ? "Test email sent." : res.error ?? res.result ?? "Failed");
            }}
          >
            <Send size={13} /> Test send
          </button>
          {busy && <LoaderCircle size={13} className="animate-spin" />}
          {message && <span className="text-xs opacity-80">{message}</span>}
        </div>
      </div>
    </div>
  );
}
