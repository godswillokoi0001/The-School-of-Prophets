"use client";

import { useMemo, useState } from "react";
import type { Format, Series, Teaching } from "@/content/teachings";
import { TeachingCard } from "@/components/TeachingCard";

const formats: { key: Format | "all"; label: string }[] = [
  { key: "all", label: "All formats" },
  { key: "video", label: "Video" },
  { key: "audio", label: "Audio" },
  { key: "notes", label: "Notes" },
];

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
      .filter((t) => (format === "all" ? true : t.format.includes(format)))
      .filter((t) =>
        q
          ? [t.title, t.summary, t.scripture, ...t.topics]
              .join(" ")
              .toLowerCase()
              .includes(q)
          : true,
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [series, format, query]);

  return (
    <div>
      <div className="flex flex-col gap-6 border-y border-ink/15 py-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex-1">
          <p className="label text-quiet">Series</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSeries("all")}
              aria-pressed={series === "all"}
              className={`tag ${
                series === "all" ? "border-ink bg-ink text-parchment" : "text-ink/70"
              }`}
            >
              All series
            </button>
            {seriesList.map((s) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => setSeries(s.slug)}
                aria-pressed={series === s.slug}
                className={`tag ${
                  series === s.slug ? "border-ink bg-ink text-parchment" : "text-ink/70"
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <label className="field">
            <span>Format</span>
            <select
              className="select min-w-[9rem]"
              value={format}
              onChange={(e) => setFormat(e.target.value as Format | "all")}
            >
              {formats.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Search</span>
            <input
              type="search"
              className="input min-w-[11rem]"
              placeholder="Topic or passage"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
      </div>

      <p className="label mt-6 text-quiet" aria-live="polite">
        {results.length} {results.length === 1 ? "teaching" : "teachings"}
      </p>

      {results.length > 0 ? (
        <div className="mt-8 grid gap-x-10 gap-y-12 md:grid-cols-2">
          {results.map((t) => (
            <TeachingCard
              key={t.slug}
              teaching={t}
              seriesTitle={seriesList.find((s) => s.slug === t.series)?.title}
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 border border-ink/15 p-8">
          <p className="font-display text-2xl">Nothing in that combination yet.</p>
          <p className="measure mt-2 text-sm text-quiet">
            New teachings are added every week. Clear the filters, or subscribe
            on YouTube so you do not miss the next one.
          </p>
          <button
            type="button"
            className="btn btn-outline mt-5"
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
