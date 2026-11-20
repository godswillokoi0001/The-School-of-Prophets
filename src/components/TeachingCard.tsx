import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Teaching } from "@/content/teachings";
import { formatDate } from "@/lib/time";
import { Cover } from "@/components/Cover";
import type { Focal } from "@/lib/media";

/**
 * A catalogue entry, set like a publisher's list: cover, date, series, title,
 * one sentence. Hairline rules, no card chrome.
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

  const hasImage = Boolean(teaching.image);
  const metaSpan = hasImage ? "md:col-span-2" : "md:col-span-3";
  const bodySpan = hasImage
    ? featured
      ? "md:col-span-5"
      : "md:col-span-6"
    : "md:col-span-8";

  return (
    <article
      className={`group grid gap-4 border-t border-ink/15 py-6 md:grid-cols-12 md:gap-6 ${
        featured ? "md:py-8" : ""
      }`}
    >
      {hasImage && (
        <div
          className={`relative overflow-hidden border border-ink/10 bg-ink-2 ${
            featured ? "aspect-[3/2] md:col-span-4" : "aspect-[3/2] md:col-span-3"
          }`}
        >
          <Cover
            src={teaching.image}
            alt={teaching.imageAlt}
            sizes={featured ? "(max-width: 768px) 100vw, 33vw" : "(max-width: 768px) 100vw, 25vw"}
            focal={focal}
            fit="contain"
            className="media-zoom"
          />
        </div>
      )}

      <div className={metaSpan}>
        <p className="label text-ember">{seriesTitle ?? "Teaching"}</p>
        <p className="mt-1.5 text-xs tabular-nums text-quiet">
          {formatDate(teaching.date)}
        </p>
      </div>

      <div className={bodySpan}>
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

      {/* On phones the title is the link; a lone arrow under the entry reads as debris. */}
      <div className="hidden md:col-span-1 md:block md:text-right">
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
