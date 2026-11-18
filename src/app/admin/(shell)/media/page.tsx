"use client";

import { useState, useEffect } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import { UploadButton, compressImage } from "@/components/admin/RichText";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminPagination } from "@/components/admin/AdminPagination";

export default function MediaLibraryPage() {
  const [items, setItems] = useState<{ path: string; alt: string; filename: string }[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalMode, setModalMode] = useState<"danger" | "warning" | "info" | "success">("warning");
  const [modalConfirmLabel, setModalConfirmLabel] = useState<string | undefined>(undefined);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

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

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/media");
    if (res.ok) setItems((await res.json()).list ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveAlt(path: string, alt: string) {
    setBusy(true);
    const res = await fetch("/api/admin/media", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, alt }),
    });
    setBusy(false);
    setMessage(res.ok ? "Description saved." : "Failed to save description.");
  }

  function remove(path: string) {
    openConfirm({
      title: "Delete Media Item",
      message: "Delete this media permanently? It will also be safely cleared from any teachings, events, or series where it is currently used.",
      mode: "danger",
      confirmLabel: "Delete Media",
      onConfirm: async () => {
        setBusy(true);
        const res = await fetch("/api/admin/media", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path }),
        });
        setBusy(false);
        const data = await res.json();
        setMessage(res.ok ? "Image deleted." : data.error ?? "Delete failed.");
        if (res.ok) load();
      },
    });
  }

  async function uploadFile(file: File) {
    setBusy(true);
    const compressed = await compressImage(file);
    const form = new FormData();
    form.append("file", compressed);
    form.append("alt", file.name.replace(/\.[^.]+$/, ""));
    const res = await fetch("/api/admin/media", { method: "POST", body: form });
    const data = await res.json();
    setBusy(false);
    setMessage(res.ok ? "Uploaded." : data.error ?? "Upload failed.");
    if (res.ok) load();
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Media library</h1>
          <p className="text-xs opacity-60">
            Images are compressed and stored in Supabase Storage. Give each one a
            description (alt text) so it works for people using screen readers.
          </p>
        </div>
        <label className="admin-btn admin-btn-gold cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f);
            }}
          />
          Upload images
        </label>
      </div>
      {message && <p className="admin-surface mb-3 p-2 text-xs">{message}</p>}
      {loading ? (
        <p className="flex gap-2 text-xs opacity-60"><LoaderCircle size={12} className="animate-spin" /> Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {items.slice((page - 1) * pageSize, page * pageSize).map((m) => (
              <div key={m.path} className="admin-surface p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.path} alt={m.alt} className="h-28 w-full object-cover" />
                <p className="mt-1 truncate text-[0.65rem] opacity-60" title={m.path}>
                  {m.path.split("/").pop()}
                </p>
                <input
                  className="admin-input !py-1 text-xs"
                  defaultValue={m.alt}
                  onBlur={(e) => e.target.value !== m.alt && saveAlt(m.path, e.target.value)}
                  placeholder="Describe this image…"
                  aria-label={`Alt text for ${m.filename}`}
                />
                <button
                  className="admin-btn admin-btn-danger mt-1 !py-1"
                  onClick={() => remove(m.path)}
                  disabled={busy}
                  aria-label={`Delete ${m.filename}`}
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            ))}
            {items.length === 0 && (
              <p className="col-span-full p-6 text-center text-sm opacity-60">
                No images yet. Upload the first one.
              </p>
            )}
          </div>
          <AdminPagination
            totalItems={items.length}
            pageSize={pageSize}
            currentPage={page}
            onPageChange={setPage}
            className="mt-3"
          />
        </>
      )}
      {busy && <p className="mt-2 flex items-center gap-2 text-xs"><LoaderCircle size={12} className="animate-spin" /> Working…</p>}
      <UploadButton setBusy={setBusy} onUploaded={() => load()} label="" />

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
    </div>
  );
}
