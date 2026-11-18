"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Edit3, LoaderCircle, Save, Trash2 } from "lucide-react";
import { ImagePickerDialog, UploadButton } from "@/components/admin/RichText";
import { saveSeries, reorderSeries, deleteSeries, type SeriesInput } from "@/app/admin/(shell)/actions/teachings";
import { AdminBack } from "@/components/admin/AdminBack";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminPagination } from "@/components/admin/AdminPagination";

export type SeriesRow = {
  id: string; title: string; slug: string; description: string;
  status: string; sort_order: number; featured: boolean; teaching_count: number;
};

export function SeriesList({ initial }: { initial: SeriesRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [busy, setBusy] = useState(false);
  const [pickId, setPickId] = useState<string | null>(null);
  const [media, setMedia] = useState<{ path: string; alt: string }[]>([]);
  const [coverDraft, setCoverDraft] = useState<{ id: string; url: string } | null>(null);

  const pagedRows = rows.slice((page - 1) * pageSize, page * pageSize);

  function move(index: number, dir: -1 | 1) {
    const actualIndex = (page - 1) * pageSize + index;
    setRows((prev) => {
      const next = [...prev];
      const target = actualIndex + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[actualIndex], next[target]] = [next[target], next[actualIndex]];
      return next;
    });
  }

  async function persistOrder() {
    setBusy(true);
    await reorderSeries(rows.map((r) => r.id));
    setBusy(false);
    window.location.reload();
  }

  async function setCover(id: string, url: string) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    await saveSeries({
      id, title: row.title, slug: row.slug, description: row.description,
      cover_url: url, cover_alt: "", status: row.status as SeriesInput["status"],
      sort_order: row.sort_order, featured: row.featured,
    });
    window.location.reload();
  }

  async function loadMedia() {
    const res = await fetch("/api/admin/media");
    if (res.ok) setMedia((await res.json()).list ?? []);
  }

  return (
    <div>
      <div className="admin-surface p-2">
        {pagedRows.map((s, i) => (
          <div
            key={s.id}
            onClick={() => router.push(`/admin/series/${s.slug}`)}
            className="admin-row flex flex-wrap items-center gap-2 py-3 px-2 cursor-pointer hover:bg-gold/10 transition-colors group rounded"
          >
            <div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
              <button className="opacity-50 hover:opacity-100" onClick={() => move(i, -1)} aria-label={`Move ${s.title} up`}><ArrowUp size={12} /></button>
              <button className="opacity-50 hover:opacity-100" onClick={() => move(i, 1)} aria-label={`Move ${s.title} down`}><ArrowDown size={12} /></button>
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-parchment group-hover:text-gold transition-colors block">
                {s.title}
              </span>
              <span className="block truncate text-[0.7rem] opacity-60">{s.description || "No description"}</span>
            </div>
            <span className="admin-badge text-xs">{s.teaching_count} teachings</span>
            <span className={`admin-badge text-xs uppercase ${s.status === "published" ? "admin-badge-ok" : s.status === "archived" ? "admin-badge-warn" : ""}`}>
              {s.status}
            </span>
            {s.featured && <span className="admin-badge admin-badge-new">Featured</span>}
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="admin-btn admin-btn-ghost !py-1 text-xs"
                onClick={() => router.push(`/admin/series/${s.slug}`)}
              >
                <Edit3 size={12} className="mr-1" /> Edit
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-ghost !py-1 text-xs"
                onClick={async () => {
                  await loadMedia();
                  setCoverDraft({ id: s.id, url: "" });
                  setPickId(s.id);
                }}
              >
                Cover
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="p-6 text-center text-sm opacity-60">No series yet.</p>
        )}
      </div>
      {rows.length > pageSize && (
        <AdminPagination
          currentPage={page}
          onPageChange={setPage}
          totalItems={rows.length}
          pageSize={pageSize}
        />
      )}
      <div className="mt-3 flex gap-2">
        <button className="admin-btn admin-btn-gold" onClick={persistOrder} disabled={busy}>
          {busy ? <LoaderCircle size={13} className="animate-spin" /> : null} Save order
        </button>
      </div>
      <ImagePickerDialog
        open={pickId !== null}
        onClose={() => setPickId(null)}
        list={media}
        onPick={(path) => {
          if (coverDraft) setCover(coverDraft.id, path);
          setPickId(null);
          setCoverDraft(null);
        }}
      />
    </div>
  );
}

export function SeriesEditor({ initial }: { initial: SeriesInput }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [media, setMedia] = useState<{ path: string; alt: string }[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await saveSeries(form);
    setBusy(false);
    if (res.ok) {
      router.push("/admin/series");
      router.refresh();
    } else setMessage(res.error ?? "Failed");
  }

  async function confirmRemove() {
    setDeleteModalOpen(false);
    if (!form.id) return;
    setBusy(true);
    const res = await deleteSeries(form.id);
    setBusy(false);
    if (res.ok) {
      router.push("/admin/series");
      router.refresh();
    } else setMessage(res.error ?? "Failed");
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl">
      <AdminModal
        isOpen={deleteModalOpen}
        title="Delete Series"
        description="Are you sure you want to delete this series? Teachings in it will stay intact in your library, but will lose their series tag."
        variant="danger"
        confirmLabel="Delete Series"
        onConfirm={confirmRemove}
        onCancel={() => setDeleteModalOpen(false)}
      />
      <AdminBack href="/admin/series" label="Back to series" />
      <h1 className="mb-3 font-display text-2xl">{form.id ? "Edit series" : "New series"}</h1>
      {message && <p className="admin-surface mb-3 p-2 text-xs">{message}</p>}
      <div className="admin-surface grid gap-3 p-4 md:grid-cols-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="admin-label !mb-0">Title *</label>
            <span className="text-[10px] opacity-60">
              {Math.max(0, 100 - (form.title?.length ?? 0))} chars left
            </span>
          </div>
          <input className="admin-input" maxLength={100} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div>
          <label className="admin-label">Slug</label>
          <input className="admin-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} pattern="[a-z0-9-]+" required />
        </div>
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="admin-label !mb-0">Description</label>
            <span className="text-[10px] opacity-60">
              {Math.max(0, 280 - (form.description?.length ?? 0))} chars left
            </span>
          </div>
          <textarea className="admin-textarea !min-h-20" maxLength={280} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="admin-label">Cover image</label>
          <div className="flex gap-2">
            <input className="admin-input" value={form.cover_url ?? ""} onChange={(e) => setForm({ ...form, cover_url: e.target.value || null })} aria-label="Cover image URL" />
            <button
              type="button"
              className="admin-btn admin-btn-ghost"
              onClick={async () => {
                const res = await fetch("/api/admin/media");
                if (res.ok) setMedia((await res.json()).list ?? []);
                setPickerOpen(true);
              }}
            >
              Choose
            </button>
            <UploadButton label="Upload" setBusy={setBusy} onUploaded={(p) => setForm({ ...form, cover_url: p })} />
          </div>
        </div>
        <div>
          <label className="admin-label">Alt text</label>
          <input className="admin-input" value={form.cover_alt} onChange={(e) => setForm({ ...form, cover_alt: e.target.value })} />
        </div>
        <div>
          <label className="admin-label">Status</label>
          <select className="admin-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as SeriesInput["status"] })}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div>
          <label className="admin-label">Featured</label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-gold" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Feature on home page
          </label>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="admin-btn admin-btn-gold" disabled={busy}>
          <Save size={13} /> Save
        </button>
        {form.id && (
          <button type="button" className="admin-btn admin-btn-danger" onClick={() => setDeleteModalOpen(true)}>
            <Trash2 size={13} /> Delete series
          </button>
        )}
      </div>
      <ImagePickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        list={media}
        onPick={(p) => {
          setForm({ ...form, cover_url: p });
          setPickerOpen(false);
        }}
      />
    </form>
  );
}
