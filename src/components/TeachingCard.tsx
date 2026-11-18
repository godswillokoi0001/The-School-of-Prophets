import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Teaching } from "@/content/teachings";
import { formatDate } from "@/lib/time";

/**
 * A catalogue entry, set like a publisher's list: date, series, title, one
 * sentence. No image, no card, no shadow.
 */
export function TeachingCard({
  teaching,
  featured = false,
  seriesTitle,
}: {
  teaching?: Teaching | null;
  featured?: boolean;
  seriesTitle?: string;
}) {
  if (!teaching) return null;

  return (
    <article
      className={`group grid gap-3 border-t border-ink/15 py-6 md:grid-cols-12 md:gap-6 ${
        featured ? "md:py-8" : ""
      }`}
    >
      <div className="md:col-span-3">
        <p className="label text-ember">{seriesTitle ?? "Teaching"}</p>
        <p className="mt-1.5 text-xs tabular-nums text-quiet">
          {formatDate(teaching.date)}
        </p>
      </div>

      <div className="md:col-span-8">
        <h3
          className={`font-display leading-[1.08] ${
            featured ? "text-3xl sm:text-4xl" : "text-2xl"
          }`}
        >
          <Link href={`/teachings/${teaching.slug}`} className="link-quiet">
            {teaching.title}
          </Link>
        </h3>
        <p className={`mt-2 text-sm leading-relaxed text-quiet ${featured ? "measure" : ""}`}>
          {teaching.summary}
        </p>
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-quiet">
          <span className="uppercase tracking-[0.1em] text-ember">{teaching.scripture}</span>
          {teaching.isSample && <span className="uppercase tracking-[0.1em]">Sample entry</span>}
        </p>
      </div>

      <div className="md:col-span-1 md:text-right">
        <Link
          href={`/teachings/${teaching.slug}`}
          aria-label={`Read ${teaching.title}`}
          className="inline-flex text-quiet transition-colors group-hover:text-ember"
        >
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
