"use client";

import { useMemo, useState } from "react";
import type { Format, Series, Teaching } from "@/content/teachings";
import { TeachingCard } from "@/components/TeachingCard";

const formats: { key: Format | "all"; label: string }[] = [
  { key: "all", label: "Everything" },
  { key: "video", label: "Video" },
  { key: "audio", label: "Audio" },
  { key: "notes", label: "Written" },
];

function Toggle({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`border-b pb-0.5 text-sm transition-colors ${
        active
          ? "border-ink text-ink"
          : "border-transparent text-quiet hover:border-ink/30 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function TeachingLibrary({
  seriesList,
  teachings,
}: {
  seriesList: Series[];
  teachings: Teaching[];
}) {
  const [series, setSeries] = useState<string>("all");
  const [format, setFormat] = useState<Format | "all">("all");
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...teachings]
      .filter((t) => (series === "all" ? true : t.series === series))
      .filter((t) => (format === "all" ? true : (t.format ?? []).includes(format)))
      .filter((t) =>
        q
          ? [t.title, t.summary, t.scripture, ...(t.topics ?? [])]
              .join(" ")
              .toLowerCase()
              .includes(q)
          : true,
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [series, format, query, teachings]);

  return (
    <div>
      <div className="grid gap-8 border-y border-ink/15 py-6 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="label text-quiet">Series</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <Toggle active={series === "all"} onClick={() => setSeries("all")}>
              All
            </Toggle>
            {seriesList.map((s) => (
              <Toggle key={s.slug} active={series === s.slug} onClick={() => setSeries(s.slug)}>
                {s.title}
              </Toggle>
            ))}
          </div>
        </div>

        <div className="md:col-span-5">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label text-quiet">Format</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                {formats.map((f) => (
                  <Toggle
                    key={f.key}
                    active={format === f.key}
                    onClick={() => setFormat(f.key)}
                  >
                    {f.label}
                  </Toggle>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 py-4">
        <label className="flex w-full items-center gap-3 sm:w-auto">
          <span className="label shrink-0 text-quiet">Search</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Passage, series or subject"
            className="w-full border-b border-ink/25 bg-transparent py-1.5 text-sm outline-none placeholder:text-quiet/70 focus:border-ink sm:w-64"
          />
        </label>
        <p className="label text-quiet" aria-live="polite">
          {results.length} {results.length === 1 ? "entry" : "entries"}
        </p>
      </div>

      {results.length > 0 ? (
        <div>
          {results.map((t) => (
            <TeachingCard
              key={t.slug}
              teaching={t}
              seriesTitle={seriesList.find((s) => s.slug === t.series)?.title}
            />
          ))}
        </div>
      ) : (
        <div className="border-t border-ink/15 py-12">
          <p className="font-display text-2xl">Nothing in that combination yet.</p>
          <p className="measure mt-2 text-sm text-quiet">
            New teachings are added every week. Clear the filters, or subscribe on
            YouTube and the next one will find you.
          </p>
          <button
            type="button"
            className="link-quiet mt-5 text-sm font-semibold text-ink"
            onClick={() => {
              setSeries("all");
              setFormat("all");
              setQuery("");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
