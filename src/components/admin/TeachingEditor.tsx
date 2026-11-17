"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Copy, Eye, EyeOff, LoaderCircle, Save, Search, Trash2,
} from "lucide-react";
import { RichTextEditor, RichTextView, ImagePickerDialog } from "@/components/admin/RichText";
import {
  saveTeaching, duplicateTeaching, type TeachingInput,
} from "@/app/admin/(shell)/actions/teachings";

type SeriesOption = { id: string; title: string; status: string };

export function TeachingEditor({
  initial,
  seriesOptions,
  media,
}: {
  initial: TeachingInput;
  seriesOptions: SeriesOption[];
  media: { path: string; alt: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<TeachingInput>(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const [pickImage, setPickImage] = useState<"cover" | "body" | null>(null);
  const [seriesQuery, setSeriesQuery] = useState("");
  const [seriesOpen, setSeriesOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  const selectedSeries = useMemo(
    () => seriesOptions.find((s) => s.id === form.series_id) ?? null,
    [seriesOptions, form.series_id],
  );
  const filteredSeries = useMemo(
    () =>
      seriesOptions.filter((s) =>
        s.title.toLowerCase().includes(seriesQuery.toLowerCase()),
      ),
    [seriesOptions, seriesQuery],
  );

  useEffect(() => {
    const t = setInterval(() => {
      if (!dirtyRef.current || !form.title || busy) return;
      try {
        localStorage.setItem(
          `tsop-teaching-draft-${form.slug || "new"}`,
          JSON.stringify(form),
        );
      } catch {
        // storage full; autosave is best-effort
      }
    }, 5000);
    return () => clearInterval(t);
  }, [form, busy]);

  useEffect(() => {
    function beforeUnload(e: BeforeUnloadEvent) {
      if (dirtyRef.current) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, []);

  function set<K extends keyof TeachingInput>(key: K, value: TeachingInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await saveTeaching(form);
    setBusy(false);
      if (res.ok) {
        setDirty(false);
        setMessage("Saved and live on the site within seconds.");
        try {
          localStorage.removeItem(`tsop-teaching-draft-${form.slug || "new"}`);
        } catch { /* ignore */ }
        if (!form.id && res.id) router.push(`/admin/teachings/${res.id}`);
        else router.refresh();
      } else setMessage(res.error ?? "Failed to save");
  }

  const seriesLabel = selectedSeries ? selectedSeries.title : "No series";

  return (
    <form onSubmit={submit} className="mx-auto max-w-4xl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl">
          {form.id ? "Edit teaching" : "New teaching"}
        </h1>
        <div className="flex gap-2">
          <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setPreview(!preview)}>
            {preview ? <EyeOff size={13} /> : <Eye size={13} />} {preview ? "Edit" : "Preview"}
          </button>
          <button className="admin-btn admin-btn-gold" disabled={busy}>
            {busy ? <LoaderCircle size={13} className="animate-spin" /> : <Save size={13} />} Save
          </button>
        </div>
      </div>
      {message && <p className="admin-surface mb-3 p-2 text-xs">{message}</p>}
      {!form.id && (
        <p className="admin-surface mb-3 p-2 text-[0.7rem] opacity-70">
          Drafts autosave to this device every few seconds. Nothing is public
          until you set the status to Published.
        </p>
      )}

      {preview ? (
        <article className="admin-surface p-6">
          <h2 className="font-display text-3xl">{form.title || "Untitled"}</h2>
          <p className="mt-1 text-xs opacity-60">
            {form.speaker} · {form.date_taught ?? "not dated"} {form.part_number ? `· Part ${form.part_number}` : ""} {selectedSeries ? `· ${selectedSeries.title}` : ""}
          </p>
          {form.summary && <p className="mt-3 opacity-80">{form.summary}</p>}
          <RichTextView html={form.body} />
        </article>
      ) : (
        <>
          <section className="admin-surface p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="admin-label">Title</label>
                <input className="admin-input" value={form.title} onChange={(e) => set("title", e.target.value)} required />
              </div>
              <div>
                <label className="admin-label">Web address (slug)</label>
                <input className="admin-input" value={form.slug} onChange={(e) => set("slug", e.target.value)} pattern="[a-z0-9-]+" title="Lowercase letters, numbers and hyphens" required />
                <p className="admin-hint">Changing this after publishing creates a redirect from the old address automatically.</p>
              </div>
              <div className="relative">
                <label className="admin-label">Series</label>
                <div className="flex gap-2">
                  <input
                    className="admin-input"
                    value={seriesOpen ? seriesQuery : seriesLabel}
                    onChange={(e) => {
                      setSeriesQuery(e.target.value);
                      setSeriesOpen(true);
                    }}
                    onFocus={() => setSeriesOpen(true)}
                    onBlur={() => setTimeout(() => setSeriesOpen(false), 150)}
                    placeholder="Search or leave empty…"
                    aria-label="Series search"
                  />
                  {form.series_id && (
                    <button type="button" className="admin-btn admin-btn-ghost" onClick={() => set("series_id", null)} aria-label="Clear series">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                {seriesOpen && (
                  <ul className="admin-surface absolute z-20 mt-1 max-h-48 w-full overflow-y-auto p-1">
                    <li>
                      <button type="button" className="block w-full px-3 py-2 text-left text-xs hover:bg-parchment/5" onClick={() => { set("series_id", null); setSeriesOpen(false); }}>
                        No series
                      </button>
                    </li>
                    {filteredSeries.map((s) => (
                      <li key={s.id}>
                        <button type="button" className="block w-full px-3 py-2 text-left text-xs hover:bg-parchment/5" onClick={() => { set("series_id", s.id); setSeriesOpen(false); }}>
                          {s.title} <span className="opacity-50">({s.status})</span>
                        </button>
                      </li>
                    ))}
                    <li>
                      <button type="button" className="block w-full px-3 py-2 text-left text-xs admin-link" onClick={() => { router.push("/admin/series/new"); }}>
                        <Search size={11} className="inline" /> Create new series
                      </button>
                    </li>
                  </ul>
                )}
              </div>
              <div>
                <label className="admin-label">Part number in series</label>
                <input className="admin-input" type="number" min={0} value={form.part_number ?? ""} onChange={(e) => set("part_number", e.target.value ? Number(e.target.value) : null)} />
                <p className="admin-hint">Leave empty for a standalone teaching.</p>
              </div>
              <div>
                <label className="admin-label">Date taught</label>
                <input className="admin-input" type="date" value={form.date_taught ?? ""} onChange={(e) => set("date_taught", e.target.value || null)} />
              </div>
              <div>
                <label className="admin-label">Speaker</label>
                <input className="admin-input" value={form.speaker} onChange={(e) => set("speaker", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="admin-label">Summary (shown on cards and search results)</label>
                <textarea className="admin-textarea !min-h-20" value={form.summary} onChange={(e) => set("summary", e.target.value)} maxLength={320} />
              </div>
            </div>
          </section>

          <section className="mt-3">
            <label className="admin-label">Body</label>
            <RichTextEditor
              value={form.body}
              onChange={(html) => set("body", html)}
              onImagePick={() => setPickImage("body")}
            />
          </section>

          <section className="admin-surface mt-3 grid gap-3 p-4 md:grid-cols-2">
            <div>
              <label className="admin-label">Cover image</label>
              <div className="flex gap-2">
                <input className="admin-input" value={form.cover_url ?? ""} onChange={(e) => set("cover_url", e.target.value || null)} placeholder="Upload or paste a link" aria-label="Cover image URL" />
                <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setPickImage("cover")}>Choose</button>
              </div>
              {form.cover_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.cover_url} alt={form.cover_alt} className="mt-2 h-28 w-full object-cover" />
              )}
            </div>
            <div>
              <label className="admin-label">Alt text (required)</label>
              <input className="admin-input" value={form.cover_alt} onChange={(e) => set("cover_alt", e.target.value)} placeholder="Describe the image for people who cannot see it" />
              <label className="admin-label mt-3">Share image (social)</label>
              <div className="flex gap-2">
                <input className="admin-input" value={form.share_image_url ?? ""} onChange={(e) => set("share_image_url", e.target.value || null)} aria-label="Share image URL" />
                <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setPickImage("cover")}>Choose</button>
              </div>
            </div>
            <div>
              <label className="admin-label">Tags / topics (comma separated)</label>
              <input className="admin-input" value={form.tags.join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} />
            </div>
            <div>
              <label className="admin-label">Scripture references (comma separated)</label>
              <input className="admin-input" value={form.scripture.join(", ")} onChange={(e) => set("scripture", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} />
            </div>
            <div>
              <label className="admin-label">YouTube link</label>
              <input className="admin-input" value={form.youtube_url ?? ""} onChange={(e) => set("youtube_url", e.target.value || null)} placeholder="https://youtube.com/watch?v=…" />
            </div>
            <div>
              <label className="admin-label">Audio file or link</label>
              <input className="admin-input" value={form.audio_url ?? ""} onChange={(e) => set("audio_url", e.target.value || null)} />
            </div>
            <div>
              <label className="admin-label">PDF notes link</label>
              <input className="admin-input" value={form.pdf_url ?? ""} onChange={(e) => set("pdf_url", e.target.value || null)} />
            </div>
            <div>
              <label className="admin-label">Featured on home page</label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="accent-gold" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
                Feature this teaching
              </label>
            </div>
          </section>

          <section className="admin-surface mt-3 p-4">
            <label className="admin-label">Extra links</label>
            {form.links.map((l, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input className="admin-input w-40" value={l.label} placeholder="Label" onChange={(e) => set("links", form.links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} aria-label="Link label" />
                <input className="admin-input flex-1" value={l.url} placeholder="https://…" onChange={(e) => set("links", form.links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} aria-label="Link URL" />
                <button type="button" className="admin-btn admin-btn-ghost" onClick={() => set("links", form.links.filter((_, j) => j !== i))} aria-label="Remove link">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button type="button" className="admin-btn admin-btn-ghost" onClick={() => set("links", [...form.links, { label: "", url: "" }])}>
              Add link
            </button>
          </section>

          <section className="admin-surface mt-3 grid gap-3 p-4 md:grid-cols-3">
            <div>
              <label className="admin-label">Status</label>
              <select className="admin-select" value={form.status} onChange={(e) => set("status", e.target.value as TeachingInput["status"])}>
                <option value="draft">Draft (private)</option>
                <option value="scheduled">Schedule for later</option>
                <option value="published">Published</option>
              </select>
            </div>
            {form.status === "scheduled" && (
              <div>
                <label className="admin-label">Publish at</label>
                <input className="admin-input" type="datetime-local" value={form.publish_at?.slice(0, 16) ?? ""} onChange={(e) => set("publish_at", e.target.value ? new Date(e.target.value).toISOString() : null)} required />
                <p className="admin-hint">The teaching goes live automatically at this time.</p>
              </div>
            )}
            <div>
              <label className="admin-label">SEO title</label>
              <input className="admin-input" value={form.seo_title ?? ""} onChange={(e) => set("seo_title", e.target.value || null)} placeholder={form.title} />
            </div>
            <div className="md:col-span-3">
              <label className="admin-label">SEO description</label>
              <input className="admin-input" value={form.seo_description ?? ""} onChange={(e) => set("seo_description", e.target.value || null)} maxLength={160} />
            </div>
          </section>
        </>
      )}

      {form.id && (
        <button
          type="button"
          className="admin-btn admin-btn-ghost mt-3"
          onClick={async () => {
            if (!form.id || !confirm("Create a duplicate draft of this teaching?")) return;
            setBusy(true);
            const res = await duplicateTeaching(form.id);
            setBusy(false);
            if (res.ok && res.id) router.push(`/admin/teachings/${res.id}`);
          }}
        >
          <Copy size={13} /> Duplicate teaching
        </button>
      )}

      <ImagePickerDialog
        open={pickImage !== null}
        onClose={() => setPickImage(null)}
        list={media}
        onPick={(path) => {
          if (pickImage === "cover") set("cover_url", path);
          else set("body", `${form.body}<p><img src="${path}" alt=""></p>`);
          setPickImage(null);
        }}
      />
    </form>
  );
}
