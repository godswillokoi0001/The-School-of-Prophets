"use client";

import { useEffect, useState } from "react";

/**
 * Razor-thin radiant gold scroll progress line at the very top of the window.
 * Glows subtly as the user reads and navigates through the site.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setProgress(0);
        return;
      }
      const current = window.scrollY;
      const pct = Math.min(100, Math.max(0, (current / totalHeight) * 100));
      setProgress(pct);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (progress <= 0.5) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[150] h-[2.5px] pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-gold/60 via-gold to-gold-soft transition-all duration-150 ease-out shadow-[0_0_8px_rgba(217,190,134,0.6)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
