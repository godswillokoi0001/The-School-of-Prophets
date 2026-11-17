"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Megaphone, TriangleAlert, X, ArrowRight } from "lucide-react";

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

    // Check if dismissed in this session for this particular message
    const msgHash = data.message.trim().slice(0, 40);
    const dismissedKey = `tsop_announcement_${msgHash}`;
    const dismissed = sessionStorage.getItem(dismissedKey);
    if (!dismissed) {
      setIsOpen(true);
    }
  }, [data]);

  if (!mounted || !isOpen || !data.active || !data.message?.trim()) {
    return null;
  }

  function handleClose() {
    setIsOpen(false);
    const msgHash = data.message.trim().slice(0, 40);
    const dismissedKey = `tsop_announcement_${msgHash}`;
    try {
      sessionStorage.setItem(dismissedKey, "1");
    } catch {
      // ignore
    }
  }

  const isEmergency = data.variant === "emergency";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-modal-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-ink/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-lg rounded-xl border border-gold/40 bg-parchment p-6 sm:p-8 text-ink shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close icon */}
        <button
          onClick={handleClose}
          aria-label="Close announcement and continue browsing"
          className="absolute right-4 top-4 rounded-full p-2 text-ink/50 hover:bg-ink/10 hover:text-ink transition-colors"
        >
          <X size={18} />
        </button>

        {/* Badge */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              isEmergency
                ? "bg-ember/15 text-ember"
                : "bg-gold/25 text-ink"
            }`}
          >
            {isEmergency ? (
              <TriangleAlert className="h-3.5 w-3.5" />
            ) : (
              <Megaphone className="h-3.5 w-3.5" />
            )}
            <span>{isEmergency ? "Important Notice" : "Announcement"}</span>
          </div>
        </div>

        {/* Title */}
        <h3 id="announcement-modal-title" className="font-display text-2xl font-semibold leading-snug">
          {data.headline?.trim() || (isEmergency ? "Important Ministry Notice" : "Special Announcement")}
        </h3>

        {/* Message */}
        <div className="mt-3 text-sm leading-relaxed text-ink/80 whitespace-pre-line">
          {data.message}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {data.link?.trim() ? (
            <Link
              href={data.link}
              onClick={handleClose}
              className="btn btn-gold flex-1 text-center inline-flex items-center justify-center gap-2"
            >
              <span>{data.buttonText?.trim() || "Open Link / Form"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}

          <button
            type="button"
            onClick={handleClose}
            className="btn btn-outline flex-1 text-center"
          >
            Continue browsing
          </button>
        </div>
      </div>
    </div>
  );
}
