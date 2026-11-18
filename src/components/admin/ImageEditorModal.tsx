"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Crop, FlipHorizontal, LoaderCircle, RotateCcw, RotateCw, X, ZoomIn } from "lucide-react";

export type ImageEditorModalProps = {
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyAndUpload: (editedFile: File, altText: string) => Promise<void>;
  aspectPreset?: "16:9" | "1:1" | "4:5" | "free";
};

export function ImageEditorModal({
  file,
  isOpen,
  onClose,
  onApplyAndUpload,
  aspectPreset = "16:9",
}: ImageEditorModalProps) {
  const [imgUrl, setImgUrl] = useState<string>("");
  const [rotation, setRotation] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [aspect, setAspect] = useState<"16:9" | "1:1" | "4:5" | "free">(aspectPreset);
  const [altText, setAltText] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    setAltText(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
    setRotation(0);
    setFlipped(false);
    setZoom(1);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      imageObjRef.current = img;
      redraw(img, 0, false, 1, aspect);
    };

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  function redraw(
    img: HTMLImageElement | null,
    rot: number,
    flip: boolean,
    scale: number,
    currentAspect: "16:9" | "1:1" | "4:5" | "free"
  ) {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate target aspect ratio dimensions
    let targetW = img.width;
    let targetH = img.height;

    if (currentAspect === "16:9") {
      targetH = Math.round(targetW * (9 / 16));
    } else if (currentAspect === "1:1") {
      const minSide = Math.min(targetW, targetH);
      targetW = minSide;
      targetH = minSide;
    } else if (currentAspect === "4:5") {
      targetH = Math.round(targetW * (5 / 4));
    }

    // Set max reasonable bounds for performance
    const maxBound = 1600;
    if (targetW > maxBound || targetH > maxBound) {
      const boundRatio = Math.min(maxBound / targetW, maxBound / targetH);
      targetW = Math.round(targetW * boundRatio);
      targetH = Math.round(targetH * boundRatio);
    }

    const isRotated90or270 = rot % 180 !== 0;
    canvas.width = isRotated90or270 ? targetH : targetW;
    canvas.height = isRotated90or270 ? targetW : targetH;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rot * Math.PI) / 180);
    if (flip) ctx.scale(-1, 1);
    ctx.scale(scale, scale);

    // Draw centered
    ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
    ctx.restore();
  }

  function handleRotate(delta: number) {
    const next = (rotation + delta + 360) % 360;
    setRotation(next);
    redraw(imageObjRef.current, next, flipped, zoom, aspect);
  }

  function handleFlip() {
    const next = !flipped;
    setFlipped(next);
    redraw(imageObjRef.current, rotation, next, zoom, aspect);
  }

  function handleZoom(newZoom: number) {
    setZoom(newZoom);
    redraw(imageObjRef.current, rotation, flipped, newZoom, aspect);
  }

  function handleAspectChange(nextAspect: "16:9" | "1:1" | "4:5" | "free") {
    setAspect(nextAspect);
    redraw(imageObjRef.current, rotation, flipped, zoom, nextAspect);
  }

  async function handleApply() {
    const canvas = canvasRef.current;
    if (!canvas || !file) return;

    setBusy(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.9)
      );

      if (!blob) {
        throw new Error("Canvas export failed");
      }

      const editedFile = new File(
        [blob],
        file.name.replace(/\.[^.]+$/, "") + "-edited.webp",
        { type: "image/webp" }
      );

      await onApplyAndUpload(editedFile, altText.trim() || file.name);
      onClose();
    } catch (err) {
      console.error("[ImageEditorModal] Error exporting edited image:", err);
    } finally {
      setBusy(false);
    }
  }

  if (!isOpen || !file) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        className="relative w-full max-w-2xl rounded-xl border border-gold/40 bg-[#161411] p-5 sm:p-6 text-parchment shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={busy}
          className="absolute right-4 top-4 text-parchment/40 hover:text-parchment transition-colors"
          aria-label="Close image editor"
        >
          <X size={18} />
        </button>

        <h3 className="font-display text-xl font-semibold text-gold flex items-center gap-2">
          <Crop size={18} /> Edit Image Before Upload
        </h3>
        <p className="mt-1 text-xs opacity-60">
          Rotate, crop, and describe your image for optimal presentation on the website.
        </p>

        {/* Canvas Preview Area */}
        <div className="mt-4 flex items-center justify-center bg-black/50 border border-parchment/10 rounded-lg p-3 overflow-hidden min-h-[240px] max-h-[360px]">
          <canvas
            ref={canvasRef}
            className="max-h-[320px] max-w-full object-contain rounded shadow"
          />
        </div>

        {/* Toolbar Controls */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3 bg-black/30 rounded-lg border border-parchment/5">
          {/* Rotation & Flip */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="admin-btn admin-btn-ghost !py-1 !px-2.5 text-xs"
              onClick={() => handleRotate(-90)}
              title="Rotate 90° Left"
            >
              <RotateCcw size={14} className="mr-1" /> -90°
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-ghost !py-1 !px-2.5 text-xs"
              onClick={() => handleRotate(90)}
              title="Rotate 90° Right"
            >
              <RotateCw size={14} className="mr-1" /> +90°
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-ghost !py-1 !px-2.5 text-xs"
              onClick={handleFlip}
              title="Flip Horizontally"
            >
              <FlipHorizontal size={14} className="mr-1" /> Flip
            </button>
          </div>

          {/* Aspect Ratios */}
          <div className="flex items-center gap-1 text-xs">
            <span className="opacity-60 mr-1">Crop:</span>
            {(["16:9", "1:1", "4:5", "free"] as const).map((asp) => (
              <button
                key={asp}
                type="button"
                onClick={() => handleAspectChange(asp)}
                className={`px-2 py-1 rounded text-[0.7rem] font-semibold border ${
                  aspect === asp
                    ? "bg-gold text-ink border-gold"
                    : "border-parchment/20 text-parchment/70 hover:bg-parchment/10"
                }`}
              >
                {asp === "free" ? "Original" : asp}
              </button>
            ))}
          </div>

          {/* Zoom Slider */}
          <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
            <ZoomIn size={13} className="opacity-60" />
            <span className="opacity-60">Zoom:</span>
            <input
              type="range"
              min="0.8"
              max="2"
              step="0.05"
              value={zoom}
              onChange={(e) => handleZoom(parseFloat(e.target.value))}
              className="accent-gold h-1.5 w-24 bg-parchment/20 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Alt Text Input */}
        <div className="mt-4">
          <label className="admin-label">Image Description (Alt Text for Screen Readers & SEO)</label>
          <input
            className="admin-input"
            value={altText}
            placeholder="e.g. Prophet Lawrence preaching during Convergence Night"
            onChange={(e) => setAltText(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-2.5 border-t border-parchment/10 pt-4">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="admin-btn admin-btn-ghost text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleApply}
            className="admin-btn admin-btn-gold text-xs"
          >
            {busy ? (
              <>
                <LoaderCircle size={14} className="animate-spin mr-1" />
                <span>Processing & Uploading…</span>
              </>
            ) : (
              <>
                <Check size={14} className="mr-1" />
                <span>Save & Upload Image</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
