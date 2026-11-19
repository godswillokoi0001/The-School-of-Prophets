"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Search, X } from "lucide-react";

type Result = { group: string; label: string; href: string; meta?: string };

export function AdminSearch({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
    const t = setTimeout(async () => {
      if (q.trim().length < 2) {
        setResults([]);
        return;
      }
      setBusy(true);
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
      if (res.ok) setResults((await res.json()).results ?? []);
      setBusy(false);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const grouped = results.reduce<Record<string, Result[]>>((acc, r) => {
    (acc[r.group] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[10vh]"
      onClick={onClose}
    >
      <div
        className="admin-surface w-full max-w-lg "
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Global search"
      >
        <div className="flex items-center gap-2 border-b border-parchment/10 px-3 py-2">
          <Search size={14} className="opacity-50" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search teachings, series, events, submissions, bookings..."
            className="admin-input !border-0 !bg-transparent"
            aria-label="Search query"
          />
          {busy && <LoaderCircle size={14} className="animate-spin opacity-50" />}
          <button onClick={onClose} aria-label="Close search" className="p-1 opacity-60">
            <X size={14} />
          </button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {q.trim().length >= 2 && !busy && results.length === 0 && (
            <p className="p-3 text-xs opacity-60">Nothing found for “{q}”.</p>
          )}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <p className="px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.18em] opacity-40">
                {group}
              </p>
              {items.map((r, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onClose();
                    router.push(r.href);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-parchment/5"
                >
                  {r.label}
                  {r.meta && (
                    <span className="block text-[0.65rem] opacity-50">{r.meta}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
