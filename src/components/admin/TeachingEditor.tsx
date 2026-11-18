"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Copy, Edit3, ExternalLink, Eye, EyeOff, Headphones,
  LoaderCircle, Music, Play, Save, Search, Trash2, Upload, Video,
} from "lucide-react";
import { RichTextEditor, RichTextView, ImagePickerDialog, UploadButton } from "@/components/admin/RichText";
import { saveTeaching, duplicateTeaching, type TeachingInput } from "@/app/admin/(shell)/actions/teachings";
import { AdminBack } from "@/components/admin/AdminBack";
import { AdminModal } from "@/components/admin/AdminModal";
import { extractYouTubeId } from "@/lib/data";

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
  const [audioBusy, setAudioBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const [pickImage, setPickImage] = useState<"cover" | "social" | "body" | null>(null);
  const [seriesQuery, setSeriesQuery] = useState("");
  const [seriesOpen, setSeriesOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [savedModal, setSavedModal] = useState<{
    isOpen: boolean;
    slug: string;
    status: string;
  }>({
    isOpen: false,
    slug: "",
    status: "",
  });

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
        // autosave is best-effort
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

  async function handleAudioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("alt", `Audio recording for ${form.title || file.name}`);
      const res = await fetch("/api/admin/media", { method: "POST", body: formData });
      const data = await res.json();
      if (data.path) {
        set("audio_url", data.path);
        setMessage("Audio recording uploaded successfully.");
      } else {
        setErrorModal(data.error || "Failed to upload audio file.");
      }
    } catch (err) {
      console.error("[TeachingEditor] Audio upload error:", err);
    } finally {
      setAudioBusy(false);
      e.target.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await saveTeaching(form);
    setBusy(false);
    if (res.ok) {
      setDirty(false);
      setMessage("Saved and published to the website.");
      try {
        localStorage.removeItem(`tsop-teaching-draft-${form.slug || "new"}`);
      } catch {
        // ignore
      }

      setSavedModal({
        isOpen: true,
        slug: form.slug,
        status: form.status,
      });

      if (!form.id && res.id) {
        router.push(`/admin/teachings/${form.slug || res.id}`);
      }
    } else {
      setMessage(res.error ?? "Failed to save teaching");
    }
  }

  const seriesLabel = selectedSeries ? selectedSeries.title : "No series";
  const youtubeId = extractYouTubeId(form.youtube_url);

  return (
    <form onSubmit={submit} className="mx-auto max-w-4xl">
      <AdminModal
        isOpen={savedModal.isOpen}
        title="Teaching Saved Successfully!"
        description={`"${form.title}" is saved with status: ${savedModal.status.toUpperCase()}.\n\nIt is now accessible in the teaching library.`}
        variant="success"
        confirmLabel={savedModal.status === "published" ? "View Live on Website →" : "Close"}
        cancelLabel="Back to Teachings List"
        onConfirm={() => {
          setSavedModal((m) => ({ ...m, isOpen: false }));
          if (savedModal.status === "published") {
            window.open(`/teachings/${savedModal.slug}`, "_blank");
          }
        }}
        onCancel={() => {
          setSavedModal((m) => ({ ...m, isOpen: false }));
          router.push("/admin/teachings");
        }}
      />

      <AdminBack href="/admin/teachings" label="Back to teachings" />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl">
          {form.id ? "Edit teaching" : "New teaching"}
        </h1>
        <div className="flex gap-2">
          <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setPreview(!preview)}>
            {preview ? <EyeOff size={13} /> : <Eye size={13} />} {preview ? "Edit" : "Live Preview"}
          </button>
          <button className="admin-btn admin-btn-gold" disabled={busy}>
            {busy ? <LoaderCircle size={13} className="animate-spin mr-1" /> : <Save size={13} className="mr-1" />}
            Save & Publish
          </button>
        </div>
      </div>

      {message && <p className="admin-surface mb-3 p-3 text-xs font-semibold text-gold border border-gold/30 rounded">{message}</p>}

      {preview ? (
        /* FAITHFUL PUBLIC SITE TEACHING PREVIEW */
        <article className="admin-surface p-6 sm:p-8 rounded-xl border border-gold/40 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gold">
            <span>Teachings</span>
            <span>/</span>
            {selectedSeries && (
              <>
                <span>{selectedSeries.title}</span>
                <span>/</span>
              </>
            )}
            <span className="opacity-70">{form.title || "Untitled Teaching"}</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl text-parchment font-semibold leading-tight">
            {form.title || "Untitled Teaching"}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-parchment/60">
            <span>{form.date_taught || "Undated"}</span>
            <span>·</span>
            <span>{form.speaker}</span>
            {form.scripture.length > 0 && (
              <>
                <span>·</span>
                <span className="text-ember font-semibold">{form.scripture.join(", ")}</span>
              </>
            )}
            {selectedSeries && (
              <>
                <span>·</span>
                <span className="admin-badge admin-badge-gold">{selectedSeries.title}</span>
              </>
            )}
          </div>

          {/* Hero Cover Image Preview */}
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-ink/80 border border-parchment/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.cover_url || "/images/bible-bedside.webp"}
              alt={form.cover_alt || form.title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Summary Box */}
          {form.summary && (
            <div className="rounded-lg bg-black/40 border-l-4 border-gold p-4 text-sm leading-relaxed text-parchment/90">
              {form.summary}
            </div>
          )}

          {/* Video Player Preview */}
          {youtubeId ? (
            <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-parchment/10 shadow-lg">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                title={form.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : form.youtube_url ? (
            <div className="p-4 rounded-lg bg-black/30 border border-parchment/10 text-xs">
              <span className="text-gold font-semibold">YouTube URL: </span>
              <a href={form.youtube_url} target="_blank" rel="noreferrer" className="underline">{form.youtube_url}</a>
            </div>
          ) : null}

          {/* Audio Player Preview */}
          {form.audio_url && (
            <div className="p-4 rounded-lg bg-gold/10 border border-gold/30">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gold uppercase tracking-wider">
                <Headphones size={15} />
                <span>Audio Recording Preview</span>
              </div>
              <audio controls className="w-full mt-2" src={form.audio_url}>
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Outline / Body Notes */}
          <div className="border-t border-parchment/10 pt-6">
            <h3 className="font-display text-xl font-semibold mb-4 text-gold">Outline & Notes</h3>
            <RichTextView html={form.body} />
          </div>

          {/* Extra Links Preview */}
          {form.links.length > 0 && (
            <div className="border-t border-parchment/10 pt-6">
              <h4 className="font-display text-lg font-semibold mb-3 text-gold">Study Resources & Links</h4>
              <ul className="space-y-2">
                {form.links.map((l, i) => (
                  <li key={i}>
                    <a href={l.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-gold hover:underline inline-flex items-center gap-1.5">
                      <span>{l.label || l.url}</span>
                      <ExternalLink size={12} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>
      ) : (
        /* EDITING FORM */
        <>
          <section className="admin-surface p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="admin-label">Title</label>
                <input
                  className="admin-input"
                  value={form.title}
                  placeholder="e.g. The Power of Kingdom Intercession"
                  onChange={(e) => set("title", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="admin-label">Web address (slug)</label>
                <input
                  className="admin-input"
                  value={form.slug}
                  placeholder="the-power-of-kingdom-intercession"
                  onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))}
                  pattern="[a-z0-9-]+"
                  title="Lowercase letters, numbers and hyphens"
                  required
                />
                <p className="admin-hint">Unique URL path for this teaching.</p>
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
                    onBlur={() => setTimeout(() => setSeriesOpen(false), 180)}
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
                  <ul className="admin-surface absolute z-20 mt-1 max-h-48 w-full overflow-y-auto p-1 shadow-xl">
                    <li>
                      <button type="button" className="block w-full px-3 py-2 text-left text-xs hover:bg-parchment/5" onClick={() => { set("series_id", null); setSeriesOpen(false); }}>
                        No series (Standalone teaching)
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
                      <button type="button" className="block w-full px-3 py-2 text-left text-xs admin-link font-semibold" onClick={() => { router.push("/admin/series/new"); }}>
                        + Create new series
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

          <section className="mt-4">
            <label className="admin-label font-semibold text-sm">Teaching Notes & Transcript Body</label>
            <RichTextEditor
              value={form.body}
              onChange={(html) => set("body", html)}
              onImagePick={() => setPickImage("body")}
            />
          </section>

          {/* MEDIA, COVERS & RECORDINGS */}
          <section className="admin-surface mt-4 grid gap-4 p-4 md:grid-cols-2">
            {/* 1. Main Cover Image */}
            <div className="space-y-2">
              <label className="admin-label font-semibold">Cover image (Main page & cards)</label>
              <div className="flex gap-2">
                <input
                  className="admin-input flex-1"
                  value={form.cover_url ?? ""}
                  onChange={(e) => set("cover_url", e.target.value || null)}
                  placeholder="https://… or upload"
                />
                <button type="button" className="admin-btn admin-btn-ghost text-xs" onClick={() => setPickImage("cover")}>
                  Library
                </button>
                <UploadButton
                  label="Upload & Crop"
                  aspectPreset="16:9"
                  setBusy={setBusy}
                  onUploaded={(path, alt) => {
                    set("cover_url", path);
                    if (alt) set("cover_alt", alt);
                  }}
                />
              </div>
              {form.cover_url && (
                <div className="relative mt-2 h-32 w-full rounded overflow-hidden border border-parchment/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.cover_url} alt={form.cover_alt} className="h-full w-full object-cover" />
                </div>
              )}
              <div>
                <label className="admin-label text-xs">Alt text for cover</label>
                <input
                  className="admin-input"
                  value={form.cover_alt}
                  onChange={(e) => set("cover_alt", e.target.value)}
                  placeholder="Describe the cover image"
                />
              </div>
            </div>

            {/* 2. Separate Social Share Image */}
            <div className="space-y-2">
              <label className="admin-label font-semibold">Social Share Image (OpenGraph / Previews)</label>
              <div className="flex gap-2">
                <input
                  className="admin-input flex-1"
                  value={form.share_image_url ?? ""}
                  onChange={(e) => set("share_image_url", e.target.value || null)}
                  placeholder="Leave empty to use main cover"
                />
                <button type="button" className="admin-btn admin-btn-ghost text-xs" onClick={() => setPickImage("social")}>
                  Library
                </button>
                <UploadButton
                  label="Upload & Crop"
                  aspectPreset="16:9"
                  setBusy={setBusy}
                  onUploaded={(path) => set("share_image_url", path)}
                />
              </div>
              {form.share_image_url && (
                <div className="relative mt-2 h-32 w-full rounded overflow-hidden border border-parchment/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.share_image_url} alt="Social share image preview" className="h-full w-full object-cover" />
                </div>
              )}
              <p className="admin-hint">Optional: Specify a different custom graphic for Twitter/WhatsApp previews.</p>
            </div>

            {/* 3. YouTube link */}
            <div>
              <label className="admin-label flex items-center gap-1.5 font-semibold">
                <Video size={14} className="text-ember" /> YouTube Video link
              </label>
              <input
                className="admin-input"
                value={form.youtube_url ?? ""}
                onChange={(e) => set("youtube_url", e.target.value || null)}
                placeholder="https://youtube.com/watch?v=… or https://youtu.be/…"
              />
              {youtubeId && (
                <p className="admin-hint text-emerald-400">✓ Video ID detected: {youtubeId}</p>
              )}
            </div>

            {/* 4. Audio recording */}
            <div>
              <label className="admin-label flex items-center gap-1.5 font-semibold">
                <Headphones size={14} className="text-gold" /> Audio Recording (MP3 / URL)
              </label>
              <div className="flex gap-2">
                <input
                  className="admin-input flex-1"
                  value={form.audio_url ?? ""}
                  onChange={(e) => set("audio_url", e.target.value || null)}
                  placeholder="https://… or upload audio file"
                />
                <label className="admin-btn admin-btn-ghost cursor-pointer text-xs inline-flex items-center">
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    disabled={audioBusy}
                    onChange={handleAudioUpload}
                  />
                  {audioBusy ? <LoaderCircle size={12} className="animate-spin mr-1" /> : <Upload size={12} className="mr-1" />}
                  Upload Audio
                </label>
              </div>
              {form.audio_url && (
                <audio controls className="w-full mt-2 h-9" src={form.audio_url}>
                  Audio preview
                </audio>
              )}
            </div>

            <div>
              <label className="admin-label">Scripture references (comma separated)</label>
              <input
                className="admin-input"
                value={form.scripture.join(", ")}
                placeholder="e.g. Daniel 4:17, 1 Corinthians 14:1"
                onChange={(e) => set("scripture", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
              />
            </div>

            <div>
              <label className="admin-label">Tags / topics (comma separated)</label>
              <input
                className="admin-input"
                value={form.tags.join(", ")}
                placeholder="e.g. Prophecy, Intercession, Hearing God"
                onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
              />
            </div>

            <div>
              <label className="admin-label">PDF study notes link</label>
              <input className="admin-input" value={form.pdf_url ?? ""} onChange={(e) => set("pdf_url", e.target.value || null)} placeholder="https://…" />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2.5 text-sm cursor-pointer p-2 rounded hover:bg-gold/10 transition-colors border border-parchment/10 w-full">
                <input
                  type="checkbox"
                  className="accent-gold h-4 w-4 rounded"
                  checked={form.featured}
                  onChange={(e) => set("featured", e.target.checked)}
                />
                <div>
                  <span className="font-semibold text-parchment block">Featured on Home Page</span>
                  <span className="text-[0.7rem] opacity-60">Puts this teaching in the spotlight on the website home screen.</span>
                </div>
              </label>
            </div>
          </section>

          {/* EXTRA LINKS */}
          <section className="admin-surface mt-4 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="admin-label font-semibold">Study Resources & Extra Links</label>
              <button
                type="button"
                className="admin-btn admin-btn-ghost text-xs !py-1"
                onClick={() => set("links", [...form.links, { label: "", url: "" }])}
              >
                + Add Link
              </button>
            </div>
            {form.links.map((l, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input
                  className="admin-input w-44"
                  value={l.label}
                  placeholder="e.g. Presentation Slides"
                  onChange={(e) => set("links", form.links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                />
                <input
                  className="admin-input flex-1"
                  value={l.url}
                  placeholder="https://…"
                  onChange={(e) => set("links", form.links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
                />
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost text-xs"
                  onClick={() => set("links", form.links.filter((_, j) => j !== i))}
                  title="Remove link"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </section>

          {/* PUBLICATION STATUS & SEO */}
          <section className="admin-surface mt-4 grid gap-4 p-4 md:grid-cols-3">
            <div>
              <label className="admin-label font-semibold">Publication Status</label>
              <select
                className="admin-select"
                value={form.status}
                onChange={(e) => set("status", e.target.value as TeachingInput["status"])}
              >
                <option value="published">Published (Live on Website)</option>
                <option value="draft">Draft (Private in Dashboard)</option>
                <option value="scheduled">Scheduled for later</option>
              </select>
            </div>
            {form.status === "scheduled" && (
              <div>
                <label className="admin-label font-semibold">Publish Date & Time</label>
                <input
                  className="admin-input"
                  type="datetime-local"
                  value={form.publish_at?.slice(0, 16) ?? ""}
                  onChange={(e) => set("publish_at", e.target.value ? new Date(e.target.value).toISOString() : null)}
                  required
                />
              </div>
            )}
            <div>
              <label className="admin-label">SEO title (optional)</label>
              <input
                className="admin-input"
                value={form.seo_title ?? ""}
                onChange={(e) => set("seo_title", e.target.value || null)}
                placeholder={form.title}
              />
            </div>
            <div className="md:col-span-3">
              <label className="admin-label">SEO description (optional)</label>
              <input
                className="admin-input"
                value={form.seo_description ?? ""}
                onChange={(e) => set("seo_description", e.target.value || null)}
                maxLength={160}
                placeholder="Brief summary for Google search results"
              />
            </div>
          </section>
        </>
      )}

      {form.id && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="admin-btn admin-btn-ghost"
            onClick={async () => {
              if (!form.id) return;
              setBusy(true);
              const res = await duplicateTeaching(form.id);
              setBusy(false);
              if (res.ok && res.id) router.push(`/admin/teachings/${res.id}`);
            }}
          >
            <Copy size={13} className="mr-1" /> Duplicate Teaching Draft
          </button>
        </div>
      )}

      <ImagePickerDialog
        open={pickImage !== null}
        onClose={() => setPickImage(null)}
        list={media}
        onPick={(path) => {
          if (pickImage === "cover") set("cover_url", path);
          else if (pickImage === "social") set("share_image_url", path);
          else set("body", `${form.body}<p><img src="${path}" alt=""></p>`);
          setPickImage(null);
        }}
      />

      <AdminModal
        open={Boolean(errorModal)}
        onClose={() => setErrorModal(null)}
        title="Notice"
        message={errorModal || ""}
        mode="danger"
      />
    </form>
  );
}
