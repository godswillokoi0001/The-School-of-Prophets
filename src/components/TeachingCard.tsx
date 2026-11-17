import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, Headphones, Play } from "lucide-react";
import type { Teaching } from "@/content/teachings";
import { seriesBySlug } from "@/content/teachings";
import { formatDate } from "@/lib/time";

const formatIcon = {
  video: Play,
  audio: Headphones,
  notes: FileText,
} as const;

export function TeachingCard({
  teaching,
  featured = false,
}: {
  teaching: Teaching;
  featured?: boolean;
}) {
  const series = seriesBySlug(teaching.series);
  return (
    <article className="group relative flex flex-col">
      <div
        className={`relative overflow-hidden bg-ink ${featured ? "aspect-[16/9]" : "aspect-[16/10]"}`}
      >
        <Image
          src={teaching.image}
          alt={teaching.imageAlt}
          fill
          sizes={featured ? "(max-width: 768px) 100vw, 60vw" : "(max-width: 768px) 100vw, 45vw"}
          className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 p-4">
          <span className="label bg-gold px-2 py-1 text-ink">{series?.title ?? "Teaching"}</span>
          {teaching.isSample && (
            <span className="label border border-parchment/30 px-2 py-1 text-parchment/80">
              Sample
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-quiet">
          <span>{formatDate(teaching.date)}</span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold uppercase tracking-[0.12em] text-ember">
            {teaching.scripture}
          </span>
        </div>

        <h3
          className={`mt-3 font-display leading-tight ${
            featured ? "text-3xl sm:text-4xl lg:text-[2.6rem]" : "text-2xl"
          }`}
        >
          <Link href={`/teachings/${teaching.slug}`}>
            <span className="absolute inset-0" aria-hidden="true" />
            {teaching.title}
          </Link>
        </h3>

        <p
          className={`mt-3 text-sm leading-relaxed text-quiet ${featured ? "measure text-base" : ""}`}
        >
          {teaching.summary}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-4 pt-5">
          {teaching.format.map((f) => {
            const Icon = formatIcon[f];
            return (
              <span key={f} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink/60">
                <Icon aria-hidden="true" className="h-3.5 w-3.5 text-ember" />
                {f === "notes" ? "Notes" : f === "video" ? "Video" : "Audio"}
              </span>
            );
          })}
          <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ember">
            Read
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
