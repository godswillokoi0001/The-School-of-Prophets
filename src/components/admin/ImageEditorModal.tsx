"use client";

import { useEffect, useRef, useState } from "react";
import { Check, FlipHorizontal, LoaderCircle, RotateCcw, RotateCw, X } from "lucide-react";
import { DEFAULT_FOCAL, MIN_WIDTH, RATIOS, sizeHint, type Focal, type RatioName } from "@/lib/media";

/**
 * Upload editor. Deliberately **non-destructive**: the file is uploaded as it
 * was taken (only rotation and mirroring are applied, because a sideways phone
 * photo is a mistake, not a crop). Framing happens on the site through the
 * focal point, so the original can be reframed later without re-uploading.
 */
export function ImageEditorModal({
  file,
  isOpen,
  onClose,
  onApplyAndUpload,
  ratio = "hero",
}: {
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyAndUpload: (file: File, altText: string, focal: Focal, size: { w: number; h: number }) => Promise<void>;
  ratio?: RatioName;
}) {
  const [rotation, setRotation] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [altText, setAltText] = useState("");
  const [focal, setFocal] = useState<Focal>(DEFAULT_FOCAL);
  const [busy, setBusy] = useState(false);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [preview, setPreview] = useState<string>("");

  const imageRef = useRef<HTMLImageElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!file) return;
    setAltText(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
    setRotation(0);
    setFlipped(false);
    setFocal(DEFAULT_FOCAL);
    const url = URL.createObjectURL(file);
    setPreview(url);
    const probe = new Image();
    probe.onload = () => {
      const rotated = rotation % 180 !== 0;
      setSize(rotated ? { w: probe.naturalHeight, h: probe.naturalWidth } : { w: probe.naturalWidth, h: probe.naturalHeight });
    };
    probe.src = url;
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  function handleStageClick(e: React.MouseEvent<HTMLDivElement>) {
    const box = stageRef.current?.getBoundingClientRect();
    if (!box) return;
    const x = Math.round(((e.clientX - box.left) / box.width) * 100);
    const y = Math.round(((e.clientY - box.top) / box.height) * 100);
    setFocal({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  }

  async function handleApply() {
    if (!file) return;
    setBusy(true);
    try {
      let upload: File = file;
      if (rotation !== 0 || flipped) {
        // Rotation only — no cropping, full frame preserved.
        const bitmap = await createImageBitmap(file);
        const swap = rotation % 180 !== 0;
        const canvas = document.createElement("canvas");
        canvas.width = swap ? bitmap.height : bitmap.width;
        canvas.height = swap ? bitmap.width : bitmap.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          if (flipped) ctx.scale(-1, 1);
          ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/webp", 0.92),
          );
          if (blob) {
            upload = new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
          }
        }
      }

      await onApplyAndUpload(upload, altText.trim() || file.name, focal, size);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  if (!isOpen || !file) return null;

  const tooSmall = size.w > 0 && size.w < MIN_WIDTH[ratio];
  const extremeRatio = size.w > 0 && size.h > 0 && (size.w / size.h > 3 || size.h / size.w > 3);

  const frames: { label: string; ratio: RatioName; width: string }[] = [
    { label: "Phone", ratio: "portrait", width: "w-14" },
    { label: "Tablet", ratio: "card", width: "w-20" },
    { label: "Desktop", ratio: "hero", width: "w-28" },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-editor-title"
      className="fixed inset-0 z-[220] flex items-end justify-center bg-ink/90 p-0 sm:items-center sm:p-4"
    >
      <div className="max-h-[94vh] w-full max-w-3xl overflow-y-auto border border-parchment/15 bg-ink-2 text-parchment">
        <div className="flex items-start justify-between border-b border-parchment/12 px-4 py-3">
          <div>
            <h2 id="image-editor-title" className="font-display text-lg leading-tight">
              Add an image
            </h2>
            <p className="mt-0.5 text-[0.7rem] opacity-60">
              The full picture is kept. Set where the focus should sit, and the site
              frames it for each screen.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={busy}
            className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center text-parchment/50 hover:text-parchment"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-[1fr_15rem]">
          <div>
            <div
              ref={stageRef}
              onClick={handleStageClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") e.preventDefault();
              }}
              aria-label="Click the picture to set the focus point"
              className="relative max-h-[46vh] cursor-crosshair overflow-hidden border border-parchment/15 bg-ink"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imageRef}
                src={preview}
                alt=""
                draggable={false}
                style={{
                  transform: `rotate(${rotation}deg) scaleX(${flipped ? -1 : 1})`,
                  maxHeight: "46vh",
                }}
                className="mx-auto block select-none"
              />
              <span
                aria-hidden="true"
                style={{ left: `${focal.x}%`, top: `${focal.y}%` }}
                className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2  border border-gold-soft shadow-[0_0_0_1px_rgba(0,0,0,0.6)]"
              />
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1">
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost !px-2"
                  onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                  title="Rotate left"
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost !px-2"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  title="Rotate right"
                >
                  <RotateCw size={13} />
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost !px-2"
                  onClick={() => setFlipped((f) => !f)}
                  title="Mirror"
                >
                  <FlipHorizontal size={13} />
                </button>
              </div>
              <p className="text-[0.65rem] tabular-nums opacity-55">
                {size.w > 0 ? `${size.w} × ${size.h} px` : "Reading size…"}
              </p>
            </div>

            <p className="mt-1 text-[0.65rem] leading-relaxed opacity-50">
              Focus: {focal.x}% across, {focal.y}% down. Click the picture to move it.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="admin-label">Describe the image</span>
              <textarea
                className="admin-textarea !min-h-20 text-xs"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="e.g. Prophet Lawrence preaching at Convergence Night"
              />
              <span className="admin-hint">
                For people using screen readers. Say what is happening in the picture.
              </span>
            </label>

            <div>
              <p className="admin-label">How it will be framed</p>
              <div className="flex items-end gap-2">
                {frames.map((f) => (
                  <figure key={f.label} className="text-center">
                    <div
                      style={{ aspectRatio: RATIOS[f.ratio] }}
                      className={`${f.width} overflow-hidden border border-parchment/15 bg-ink`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt=""
                        className="h-full w-full object-cover"
                        style={{ objectPosition: `${focal.x}% ${focal.y}%` }}
                      />
                    </div>
                    <figcaption className="mt-1 text-[0.6rem] uppercase tracking-[0.1em] opacity-50">
                      {f.label}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>

            <p className="text-[0.65rem] leading-relaxed opacity-55">{sizeHint(ratio, "Main use")}</p>
            {tooSmall && (
              <p className="border border-[#e6b566]/40 bg-[#e6b566]/10 px-2 py-1.5 text-[0.65rem] text-[#e6b566]">
                This file is narrower than {MIN_WIDTH[ratio]}px, so it will look soft
                on large screens. A larger original is better if you have one.
              </p>
            )}
            {extremeRatio && (
              <p className="border border-parchment/20 bg-parchment/5 px-2 py-1.5 text-[0.65rem] opacity-70">
                Very wide or very tall pictures are hard to frame. Check the previews
                above before saving.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-parchment/12 px-4 py-3">
          <button type="button" disabled={busy} onClick={onClose} className="admin-btn admin-btn-ghost">
            Cancel
          </button>
          <button type="button" disabled={busy} onClick={handleApply} className="admin-btn admin-btn-gold">
            {busy ? (
              <>
                <LoaderCircle size={14} className="animate-spin" /> Uploading…
              </>
            ) : (
              <>
                <Check size={14} /> Use this image
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
