"use client";

import { useState, useEffect } from "react";
import { LoaderCircle, Trash2, Crosshair } from "lucide-react";
import { compressImage } from "@/components/admin/RichText";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { MIN_WIDTH, RATIOS, focalPosition } from "@/lib/media";

type MediaItem = {
  path: string;
  alt: string;
  filename: string;
  focal?: { x: number; y: number } | null;
  width?: number | null;
  height?: number | null;
};

export default function MediaLibraryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
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

  async function saveFocal(item: MediaItem, e: React.MouseEvent<HTMLImageElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - box.left) / box.width) * 100);
    const y = Math.round(((e.clientY - box.top) / box.height) * 100);
    const focal = { x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) };
    setItems((prev) => prev.map((m) => (m.path === item.path ? { ...m, focal } : m)));
    const res = await fetch("/api/admin/media", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: item.path, focal }),
    });
    setMessage(res.ok ? `Focus point saved for ${item.filename || item.path.split("/").pop()}.` : "Could not save the focus point.");
  }

  function remove(path: string) {
    openConfirm({
      title: "Delete this image?",
      message:
        "It will be removed from the library and from any teaching, series or event using it. This cannot be undone.",
      mode: "danger",
      confirmLabel: "Delete image",
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
          <p className="mt-1 max-w-[62ch] text-xs leading-relaxed opacity-60">
            Originals are kept whole: nothing is cropped when it is uploaded. Click
            any picture to move its focus point — the crosshair marks what stays in
            frame when the site crops for a phone, tablet or desktop.
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
          Upload image
        </label>
      </div>

      <p className="mb-3 text-[0.7rem] opacity-55">
        Recommended: {RATIOS.hero.replace(" / ", ":")} for covers, at least{" "}
        {MIN_WIDTH.hero}px wide. Portraits of people work best at{" "}
        {RATIOS.portrait.replace(" / ", ":")}.
      </p>

      {message && <p className="admin-surface mb-3 p-2 text-xs">{message}</p>}

      {loading ? (
        <p className="flex gap-2 text-xs opacity-60">
          <LoaderCircle size={12} className="animate-spin" /> Loading…
        </p>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {items.slice((page - 1) * pageSize, page * pageSize).map((m) => {
              const tooSmall = Boolean(m.width && m.width < MIN_WIDTH.card);
              return (
                <li key={m.path} className="admin-surface p-2">
                  <div className="relative overflow-hidden bg-ink">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.path}
                      alt={m.alt}
                      onClick={(e) => saveFocal(m, e)}
                      title="Click to set the focus point"
                      style={{ objectPosition: focalPosition(m.focal) }}
                      className="h-32 w-full cursor-crosshair object-contain"
                    />
                    <span
                      aria-hidden="true"
                      style={{
                        left: `${m.focal?.x ?? 50}%`,
                        top: `${m.focal?.y ?? 30}%`,
                      }}
                      className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold-soft"
                    />
                  </div>
                  <p className="mt-1 flex items-center justify-between gap-2 text-[0.62rem] opacity-55">
                    <span className="truncate" title={m.path}>
                      {m.path.split("/").pop()}
                    </span>
                    <span className="flex shrink-0 items-center gap-1 tabular-nums">
                      <Crosshair size={10} />
                      {m.focal ? `${m.focal.x}/${m.focal.y}` : "50/30"}
                    </span>
                  </p>
                  {m.width && m.height && (
                    <p className="text-[0.6rem] tabular-nums opacity-40">
                      {m.width} × {m.height}
                      {tooSmall ? " · small" : ""}
                    </p>
                  )}
                  <input
                    className="admin-input mt-1 !py-1 text-xs"
                    defaultValue={m.alt}
                    onBlur={(e) => e.target.value !== m.alt && saveAlt(m.path, e.target.value)}
                    placeholder="Describe this image…"
                    aria-label={`Description for ${m.filename || m.path}`}
                  />
                  <button
                    className="admin-btn admin-btn-danger mt-1 !py-1"
                    onClick={() => remove(m.path)}
                    disabled={busy}
                    aria-label={`Delete ${m.filename || m.path}`}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </li>
              );
            })}
            {items.length === 0 && (
              <li className="col-span-full border-t border-parchment/12 py-8 text-center text-sm opacity-60">
                No images yet. Upload the first one — a cover for the next teaching is
                a good place to start.
              </li>
            )}
          </ul>
          <AdminPagination
            totalItems={items.length}
            pageSize={pageSize}
            currentPage={page}
            onPageChange={setPage}
            className="mt-3"
          />
        </>
      )}

      {busy && (
        <p className="mt-2 flex items-center gap-2 text-xs">
          <LoaderCircle size={12} className="animate-spin" /> Working…
        </p>
      )}

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
