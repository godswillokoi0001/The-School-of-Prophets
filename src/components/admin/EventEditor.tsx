"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Save, Trash2, CalendarX } from "lucide-react";
import { RichTextEditor, ImagePickerDialog } from "@/components/admin/RichText";
import { saveEvent, deleteEvent, addEventException, type EventInput } from "@/app/admin/(shell)/actions/events";

export function EventEditor({
  initial,
  media,
  exceptions = [],
}: {
  initial: EventInput;
  media: { path: string; alt: string }[];
  exceptions?: { id: string; occurrence_date: string; action: string; new_starts_at: string | null; note: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [exDate, setExDate] = useState("");
  const [exNote, setExNote] = useState("");

  function set<K extends keyof EventInput>(key: K, value: EventInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await saveEvent(form);
    setBusy(false);
    if (res.ok) {
      if (!form.id) router.push(`/admin/events/${form.slug}`);
      else router.refresh();
      setMessage("Saved. Visitors see it within seconds once published.");
    } else setMessage(res.error ?? "Failed to save");
  }

  async function remove() {
    if (!form.id || !confirm("Delete this event? Registrations for it are removed too.")) return;
    setBusy(true);
    const res = await deleteEvent(form.id);
    setBusy(false);
    if (res.ok) {
      router.push("/admin/events");
      router.refresh();
    } else setMessage("Could not delete this event.");
  }

  const localValue = (iso: string | null) => (iso ? iso.slice(0, 16) : "");

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="font-display text-2xl">{form.id ? "Edit event" : "New event"}</h1>
        <button className="admin-btn admin-btn-gold" disabled={busy}>
          {busy ? <LoaderCircle size={13} className="animate-spin" /> : <Save size={13} />} Save
        </button>
      </div>
      {message && <p className="admin-surface mb-3 p-2 text-xs">{message}</p>}

      <div className="admin-surface grid gap-3 p-4 md:grid-cols-2">
        <div>
          <label className="admin-label">Title</label>
          <input className="admin-input" value={form.title} onChange={(e) => set("title", e.target.value)} required />
        </div>
        <div>
          <label className="admin-label">Slug</label>
          <input className="admin-input" value={form.slug} onChange={(e) => set("slug", e.target.value)} pattern="[a-z0-9-]+" required />
        </div>
        <div>
          <label className="admin-label">Starts (WAT)</label>
          <input
            className="admin-input"
            type="datetime-local"
            required
            value={localValue(form.starts_at)}
            onChange={(e) =>
              set("starts_at", e.target.value ? `${e.target.value}:00+01:00` : "")
            }
          />
          <p className="admin-hint">Africa/Lagos time. Visitors see it in their own timezone.</p>
        </div>
        <div>
          <label className="admin-label">Ends (WAT, optional)</label>
          <input
            className="admin-input"
            type="datetime-local"
            value={localValue(form.ends_at)}
            onChange={(e) =>
              set("ends_at", e.target.value ? `${e.target.value}:00+01:00` : null)
            }
          />
        </div>
        <div>
          <label className="admin-label">Format</label>
          <select className="admin-select" value={form.format} onChange={(e) => set("format", e.target.value as EventInput["format"])}>
            <option value="online">Online</option>
            <option value="onsite">Onsite</option>
            <option value="hybrid">Hybrid (online + onsite)</option>
          </select>
        </div>
        <div>
          <label className="admin-label">Location</label>
          <input className="admin-input" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Address, or 'Online'" />
        </div>
        <div className="md:col-span-2">
          <label className="admin-label">Join link (for online)</label>
          <input className="admin-input" value={form.join_url} onChange={(e) => set("join_url", e.target.value)} placeholder="https://meet.google.com/…" />
        </div>
        <div>
          <label className="admin-label">Repeats</label>
          <select className="admin-select" value={form.recurrence} onChange={(e) => set("recurrence", e.target.value as EventInput["recurrence"])}>
            <option value="none">One-off</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly (e.g. the 18 September anniversary)</option>
          </select>
        </div>
        <div>
          <label className="admin-label">Status</label>
          <select className="admin-select" value={form.status} onChange={(e) => set("status", e.target.value as EventInput["status"])}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="admin-label">Registration</label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-gold" checked={form.registration_required} onChange={(e) => set("registration_required", e.target.checked)} />
            Require registration
          </label>
        </div>
        <div>
          <label className="admin-label">Capacity (optional)</label>
          <input className="admin-input" type="number" min={0} value={form.capacity ?? ""} onChange={(e) => set("capacity", e.target.value ? Number(e.target.value) : null)} />
        </div>
        <div className="md:col-span-2">
          <label className="admin-label">Description</label>
          <RichTextEditor value={form.description} onChange={(html) => set("description", html)} ariaLabel="Event description" />
        </div>
        <div>
          <label className="admin-label">Cover image</label>
          <div className="flex gap-2">
            <input className="admin-input" value={form.cover_url ?? ""} onChange={(e) => set("cover_url", e.target.value || null)} aria-label="Cover image URL" />
            <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setPickerOpen(true)}>Choose</button>
          </div>
        </div>
        <div>
          <label className="admin-label">Alt text</label>
          <input className="admin-input" value={form.cover_alt} onChange={(e) => set("cover_alt", e.target.value)} />
        </div>
        <div>
          <label className="admin-label">Featured on home page</label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-gold" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
            Feature this event
          </label>
        </div>
        <div className="md:col-span-2">
          <label className="admin-label">Recap (after the event: text, testimonies, photos)</label>
          <textarea className="admin-textarea !min-h-20" value={form.recap} onChange={(e) => set("recap", e.target.value)} />
        </div>
        <div>
          <label className="admin-label">Recap video link</label>
          <input className="admin-input" value={form.recap_video_url ?? ""} onChange={(e) => set("recap_video_url", e.target.value || null)} />
        </div>
      </div>

      <ImagePickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        list={media}
        onPick={(path) => {
          set("cover_url", path);
          setPickerOpen(false);
        }}
      />

      {form.id && (
        <section className="admin-surface mt-3 p-4">
          <h2 className="mb-1 font-display text-lg">One-date exceptions</h2>
          <p className="mb-2 text-xs opacity-60">
            Cancel or move a single occurrence (for recurring events) without
            changing the pattern.
          </p>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="admin-label">Date</label>
              <input className="admin-input" type="date" value={exDate} onChange={(e) => setExDate(e.target.value)} />
            </div>
            <button
              type="button"
              className="admin-btn admin-btn-danger"
              disabled={busy || !exDate}
              onClick={async () => {
                if (!form.id) return;
                if (!confirm(`Cancel this event on ${exDate}?`)) return;
                setBusy(true);
                const res = await addEventException(form.id, exDate, "cancel", null, exNote);
                setBusy(false);
                if (res.ok) window.location.reload();
                else setMessage(res.error ?? "Failed");
              }}
            >
              <CalendarX size={13} /> Cancel this date
            </button>
            <div className="flex-1 min-w-40">
              <label className="admin-label">Note (optional)</label>
              <input className="admin-input" value={exNote} onChange={(e) => setExNote(e.target.value)} />
            </div>
          </div>
          {exceptions.length > 0 && (
            <ul className="mt-2 text-xs">
              {exceptions.map((x) => (
                <li key={x.id} className="admin-row py-1">
                  <span className="admin-badge admin-badge-warn">{x.action}</span> {x.occurrence_date} {x.note && <span className="opacity-70">“{x.note}”</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {form.id && (
        <button type="button" className="admin-btn admin-btn-danger mt-3" onClick={remove}>
          <Trash2 size={13} /> Delete event
        </button>
      )}
    </form>
  );
}
