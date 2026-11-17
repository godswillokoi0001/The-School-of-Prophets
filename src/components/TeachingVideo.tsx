"use client";

import { useState } from "react";

/** YouTube is loaded only on request: no third-party script until clicked. */
export function TeachingVideo({
  youtubeId,
  title,
}: {
  youtubeId: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="aspect-video w-full bg-ink">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative flex aspect-video w-full items-center justify-center overflow-hidden border border-parchment/20 bg-ink text-parchment"
    >
      <span className="paper-grain absolute inset-0 opacity-20" aria-hidden="true" />
      <span className="relative flex flex-col items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center border border-gold/60 text-gold">
          <svg viewBox="0 0 24 24" className="h-5 w-5 translate-x-[1px]" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <span className="label text-parchment/70">Play the teaching</span>
        <span className="max-w-[30ch] px-4 text-center text-sm text-parchment/45">
          Loads from YouTube only when you press play.
        </span>
      </span>
    </button>
  );
}
