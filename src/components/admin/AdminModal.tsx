"use client";

import { useEffect } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export type AdminModalProps = {
  isOpen?: boolean;
  open?: boolean;
  title: string;
  description?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info" | "success";
  mode?: "danger" | "warning" | "info" | "success";
  onConfirm?: (() => void) | (() => Promise<void>);
  onCancel?: () => void;
  onClose?: () => void;
  isLoading?: boolean;
};

export function AdminModal({
  isOpen,
  open,
  title,
  description,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant,
  mode,
  onConfirm,
  onCancel,
  onClose,
  isLoading = false,
}: AdminModalProps) {
  const isVisible = Boolean(isOpen ?? open);
  const textDescription = description || message;
  const activeVariant = variant || mode || "info";
  const handleClose = onCancel || onClose || (() => {});

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isVisible && !isLoading) {
        handleClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, isLoading, handleClose]);

  if (!isVisible) return null;

  const isAlertOnly = !onConfirm;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="relative w-full max-w-md rounded-xl border border-gold/30 bg-[#171512] p-6 text-parchment shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          disabled={isLoading}
          aria-label="Close dialog"
          className="absolute right-4 top-4 text-parchment/40 hover:text-parchment transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            {activeVariant === "danger" && <AlertCircle className="text-red-400" size={22} />}
            {activeVariant === "warning" && <AlertTriangle className="text-amber-400" size={22} />}
            {activeVariant === "success" && <CheckCircle2 className="text-emerald-400" size={22} />}
            {activeVariant === "info" && <Info className="text-gold" size={22} />}
          </div>
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold text-parchment">{title}</h3>
            {textDescription && (
              <p className="mt-2 text-xs leading-relaxed text-parchment/70 whitespace-pre-line">
                {textDescription}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          {!isAlertOnly && (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleClose}
              className="admin-btn admin-btn-ghost text-xs"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              if (onConfirm) onConfirm();
              else handleClose();
            }}
            className={`admin-btn text-xs ${
              activeVariant === "danger"
                ? "!bg-red-900/80 !border-red-600 !text-white hover:!bg-red-800"
                : "admin-btn-gold"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
