import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Teaching } from "@/content/teachings";
import { formatDate } from "@/lib/time";
import { Cover } from "@/components/Cover";
import type { Focal } from "@/lib/media";

/**
 * A catalogue entry as a card: cover, series and date, title, one sentence.
 */
export function TeachingCard({
  teaching,
  featured = false,
  seriesTitle,
  focal,
}: {
  teaching?: Teaching | null;
  featured?: boolean;
  seriesTitle?: string;
  focal?: Focal;
}) {
  if (!teaching) return null;

  return (
    <article
      className={`card card-hover group overflow-hidden ${
        featured ? "md:col-span-2" : ""
      }`}
    >
      {teaching.image && (
        <div
          className={`relative overflow-hidden border-b border-line bg-ink-2 ${
            featured ? "aspect-[16/9]" : "aspect-[16/10]"
          }`}
        >
          <Cover
            src={teaching.image}
            alt={teaching.imageAlt}
            sizes={featured ? "(max-width: 768px) 100vw, 60vw" : "(max-width: 768px) 100vw, 40vw"}
            focal={focal}
            fit="contain"
            className="media-zoom"
          />
        </div>
      )}

      <div className={featured ? "p-6 sm:p-8" : "p-5"}>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-quiet">
          <span className="font-medium text-ember">{seriesTitle ?? "Teaching"}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{formatDate(teaching.date)}</span>
        </div>

        <h3
          className={`mt-2 font-semibold leading-snug tracking-tight ${
            featured ? "text-2xl sm:text-3xl" : "text-lg"
          }`}
        >
          <Link href={`/teachings/${teaching.slug}`} className="transition-colors group-hover:text-ember">
            {teaching.title}
          </Link>
        </h3>

        <p className={`mt-2 text-sm leading-relaxed text-quiet ${featured ? "measure" : "line-clamp-3"}`}>
          {teaching.summary}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3 text-xs">
          <span className="flex flex-wrap items-center gap-2 text-quiet">
            <span className="font-medium text-ember">{teaching.scripture}</span>
            {teaching.isSample && <span className="text-quiet/70">· Sample entry</span>}
          </span>
          <Link
            href={`/teachings/${teaching.slug}`}
            aria-label={`Read ${teaching.title}`}
            className="text-ink transition-colors group-hover:text-ember"
          >
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
