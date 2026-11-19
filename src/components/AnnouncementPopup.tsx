"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

export type AnnouncementData = {
  active: boolean;
  headline?: string;
  message: string;
  link?: string;
  buttonText?: string;
  variant?: "default" | "emergency";
};

export function AnnouncementPopup({ data }: { data: AnnouncementData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!data.active || !data.message?.trim()) return;

    const msgHash = data.message.trim().slice(0, 40);
    const dismissedKey = `tsop_announcement_${msgHash}`;
    try {
      if (!sessionStorage.getItem(dismissedKey)) setIsOpen(true);
    } catch {
      setIsOpen(true);
    }
  }, [data]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = previous;
    };
  }, [isOpen]);

  if (!mounted || !isOpen || !data.active || !data.message?.trim()) return null;

  function handleClose() {
    setIsOpen(false);
    const dismissedKey = `tsop_announcement_${data.message.trim().slice(0, 40)}`;
    try {
      sessionStorage.setItem(dismissedKey, "1");
    } catch {
      // storage unavailable; closing for this page view is enough
    }
  }

  const isEmergency = data.variant === "emergency";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-modal-title"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/80 p-4 sm:p-6"
      onClick={handleClose}
    >
      <div
        role="document"
        className="relative w-full max-w-lg border border-parchment/20 border-t-2 border-t-gold bg-ink-2 p-6 text-parchment sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          aria-label="Close announcement and continue browsing"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center text-parchment/50 transition-colors hover:text-parchment"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <p className={`label ${isEmergency ? "text-gold-soft" : "text-gold-soft/85"}`}>
          {isEmergency ? "Notice" : "From the fellowship"}
        </p>

        <h2
          id="announcement-modal-title"
          className="mt-4 pr-8 font-display text-2xl leading-snug"
        >
          {data.headline?.trim() ||
            (isEmergency ? "An important notice" : "A word from the team")}
        </h2>

        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-parchment/65">
          {data.message}
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          {data.link?.trim() && (
            <Link href={data.link} onClick={handleClose} className="btn btn-gold">
              {data.buttonText?.trim() || "Read more"}
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
          )}
          <button type="button" onClick={handleClose} className="btn btn-outline">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
