"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LoaderCircle, Save, Trash2, CalendarX, Eye, X } from "lucide-react";
import { RichTextEditor, ImagePickerDialog, UploadButton } from "@/components/admin/RichText";
import { saveEvent, deleteEvent, addEventException, type EventInput } from "@/app/admin/(shell)/actions/events";
import { AdminBack } from "@/components/admin/AdminBack";
import { AdminModal } from "@/components/admin/AdminModal";

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

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalMode, setModalMode] = useState<"danger" | "warning" | "info" | "success">("warning");
  const [modalConfirmLabel, setModalConfirmLabel] = useState<string | undefined>(undefined);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

  function set<K extends keyof EventInput>(key: K, value: EventInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openConfirm(opts: {
    title: string;
    message: string;
    mode: "danger" | "warning" | "info" | "success";
    confirmLabel?: string;
    onConfirm: () => Promise<void>;
  }) {
    setModalTitle(opts.title);
    setModalMessage(opts.message);
    setModalMode(opts.mode);
    setModalConfirmLabel(opts.confirmLabel);
    setPendingAction(() => opts.onConfirm);
    setModalOpen(true);
  }

  function openAlert(title: string, msg: string, mode: "danger" | "info" | "success" = "danger") {
    setModalTitle(title);
    setModalMessage(msg);
    setModalMode(mode);
    setModalConfirmLabel(undefined);
    setPendingAction(null);
    setModalOpen(true);
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
    } else {
      openAlert("Failed to Save", res.error ?? "Could not save event.", "danger");
    }
  }

  function promptRemove() {
    if (!form.id) return;
    openConfirm({
      title: "Delete Event",
      message: `Permanently delete "${form.title}"? Any existing registrations will also be removed.`,
      mode: "danger",
      confirmLabel: "Delete Event",
      onConfirm: async () => {
        setBusy(true);
        const res = await deleteEvent(form.id!);
        setBusy(false);
        if (res.ok) {
          router.push("/admin/events");
          router.refresh();
        } else {
          openAlert("Delete Failed", "Could not delete this event.", "danger");
        }
      },
    });
  }

  const localValue = (iso: string | null) => (iso ? iso.slice(0, 16) : "");

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl">
      <AdminBack href="/admin/events" label="Back to events" />
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">{form.id ? "Edit event" : "New event"}</h1>
          <p className="admin-hint">Full access to modify title, dates, recurrence and cover image.</p>
        </div>
        <div className="flex items-center gap-2">
          {form.slug && (
            <a
              href={`/events`}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn admin-btn-ghost text-xs"
            >
              <Eye size={13} /> View on site
            </a>
          )}
          <button className="admin-btn admin-btn-gold" disabled={busy}>
            {busy ? <LoaderCircle size={13} className="animate-spin" /> : <Save size={13} />} Save
          </button>
        </div>
      </div>
      {message && <p className="admin-surface mb-3 p-2 text-xs border border-gold/30 text-gold">{message}</p>}

      <div className="admin-surface grid gap-3 p-4 md:grid-cols-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="admin-label !mb-0">Title *</label>
            <span className="text-[10px] opacity-60">
              {Math.max(0, 100 - (form.title?.length ?? 0))} chars left
            </span>
          </div>
          <input className="admin-input" maxLength={100} value={form.title} onChange={(e) => set("title", e.target.value)} required />
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
          <label className="admin-label">Join link (for online sessions)</label>
          <input className="admin-input" value={form.join_url} onChange={(e) => set("join_url", e.target.value)} placeholder="https://meet.google.com/… or YouTube stream" />
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

        {/* Cover Image with upload, crop, rotate & preview */}
        <div className="md:col-span-2 rounded border border-ink/20 bg-parchment/5 p-3">
          <label className="admin-label">Cover Image</label>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <input
              className="admin-input !w-auto flex-1 min-w-[200px]"
              value={form.cover_url ?? ""}
              onChange={(e) => set("cover_url", e.target.value || null)}
              placeholder="e.g. /images/worship-hands.webp or upload"
              aria-label="Cover image URL"
            />
            <UploadButton
              label="Upload / Edit"
              setBusy={setBusy}
              onUploaded={(path) => set("cover_url", path)}
            />
            <button
              type="button"
              className="admin-btn admin-btn-ghost text-xs"
              onClick={() => setPickerOpen(true)}
            >
              Choose Existing
            </button>
            {form.cover_url && (
              <button
                type="button"
                className="admin-btn admin-btn-danger !p-1.5"
                title="Remove cover image"
                onClick={() => set("cover_url", null)}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Cover image live preview */}
          {form.cover_url && (
            <div className="mt-3 flex items-center gap-3">
              <div className="relative h-24 w-40 overflow-hidden rounded border border-gold/40 bg-black/30">
                <Image
                  src={form.cover_url}
                  alt={form.cover_alt || form.title}
                  fill
                  className="object-cover"
                  unoptimized={form.cover_url.startsWith("/api/") || form.cover_url.startsWith("blob:")}
                />
              </div>
              <div className="text-xs opacity-75">
                <p className="font-semibold text-parchment">Cover image preview</p>
                <p className="text-[0.7rem] opacity-60 break-all">{form.cover_url}</p>
              </div>
            </div>
          )}

          <div className="mt-2">
            <label className="admin-label">Image Alt Text</label>
            <input
              className="admin-input text-xs"
              value={form.cover_alt}
              onChange={(e) => set("cover_alt", e.target.value)}
              placeholder="Descriptive alt text for accessibility"
            />
          </div>
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
        <div className="md:col-span-2">
          <label className="admin-label">Recap video link (YouTube URL)</label>
          <input className="admin-input" value={form.recap_video_url ?? ""} onChange={(e) => set("recap_video_url", e.target.value || null)} placeholder="https://youtube.com/watch?v=…" />
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
              onClick={() => {
                if (!form.id || !exDate) return;
                openConfirm({
                  title: "Cancel Date Occurrence",
                  message: `Cancel this event on ${exDate}?`,
                  mode: "warning",
                  confirmLabel: "Cancel Date",
                  onConfirm: async () => {
                    setBusy(true);
                    const res = await addEventException(form.id!, exDate, "cancel", null, exNote);
                    setBusy(false);
                    if (res.ok) window.location.reload();
                    else openAlert("Error", res.error ?? "Failed", "danger");
                  },
                });
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
        <button type="button" className="admin-btn admin-btn-danger mt-3" onClick={promptRemove}>
          <Trash2 size={13} /> Delete event
        </button>
      )}

      {/* Admin Modal Dialog */}
      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
        mode={modalMode}
        confirmLabel={modalConfirmLabel}
        onConfirm={
          pendingAction
            ? async () => {
                await pendingAction();
                setModalOpen(false);
              }
            : undefined
        }
      />
    </form>
  );
}
