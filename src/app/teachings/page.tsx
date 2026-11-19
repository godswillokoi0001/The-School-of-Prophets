import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TeachingLibrary } from "@/components/TeachingLibrary";
import { TeachingCard } from "@/components/TeachingCard";
import { YouTubeIcon } from "@/components/BrandIcons";
import { Cover } from "@/components/Cover";
import { getSeries, getTeachings } from "@/lib/data";
import { site } from "@/config/site";
import { formatDate } from "@/lib/time";

export const metadata: Metadata = {
  title: "Teachings",
  description:
    "The teaching library of The School of Prophets: the Word of Knowledge, Faith, the Mystery of the Kingdom, the gifts of the Spirit, and book studies in written outline and video.",
  alternates: { canonical: "/teachings" },
  openGraph: {
    title: "Teaching Library | The School of Prophets",
    description: "Weekly teachings grouped by series, with written outlines and recordings.",
    url: "/teachings",
  },
};

export const dynamic = "force-dynamic";

export default async function TeachingsPage() {
  const [teachings, seriesList] = await Promise.all([getTeachings(), getSeries()]);
  const featured = teachings.find((t) => t.featured) ?? teachings[0];

  return (
    <>
      <header className="border-b border-ink/15">
        <div className="wrap grid gap-10 py-14 md:grid-cols-12 md:py-20">
          <div className="md:col-span-8">
            <p className="label text-ember">Teaching library</p>
            <h1 className="mt-5 font-display text-hero">The Word, in order.</h1>
            <p className="measure mt-6 text-lg leading-relaxed text-quiet">
              Teachings from the weekly gatherings, kept in series so you can follow
              one from the beginning. Written outlines are here; recordings are on
              YouTube.
            </p>
          </div>

          <div className="md:col-span-4 md:pl-8 md:pt-2">
            <div className="border-t border-ink/25 pt-4">
              <p className="label text-quiet">The archive</p>
              <p className="mt-3 font-display text-4xl tabular-nums">
                {String(teachings.length).padStart(2, "0")}
              </p>
              <p className="mt-1 text-sm text-quiet">
                outlines across {seriesList.length} series
              </p>
              <a
                href={site.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="link-quiet mt-5 inline-flex items-center gap-2 text-sm text-ink"
              >
                <YouTubeIcon aria-hidden="true" className="h-4 w-4 text-ember" />
                Watch on YouTube
              </a>
            </div>
          </div>
        </div>
      </header>

      {featured && (
        <section className="bg-paper">
          <div className="wrap py-12 md:py-16">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="label text-ember">Teaching of the week</p>
              <p className="text-xs text-quiet">{formatDate(featured.date)}</p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <TeachingCard
                teaching={featured}
                featured
                seriesTitle={seriesList.find((s) => s.slug === featured?.series)?.title}
              />
            </div>
          </div>
        </section>
      )}

      <section className="wrap py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-title">The catalogue</h2>
          <p className="max-w-[46ch] text-xs leading-relaxed text-quiet">
            Entries marked “sample” are structural placeholders prepared for this
            site, to be replaced with the ministry&apos;s own recordings and notes.
          </p>
        </div>

        <div className="mt-8">
          <TeachingLibrary seriesList={seriesList} teachings={teachings} />
        </div>

        <div id="series" className="mt-16">
          <div className="flex items-baseline justify-between border-t border-ink/25 pt-5">
            <p className="label text-quiet">Series</p>
            <Link href="/teachings" className="link-quiet text-xs text-quiet">
              Everything
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {seriesList.map((series) => {
              const count = teachings.filter((t) => t.series === series.slug).length;
              const cover =
                series.image ?? teachings.find((t) => t.series === series.slug)?.image;
              const coverAlt =
                series.imageAlt ?? teachings.find((t) => t.series === series.slug)?.imageAlt;
              // A stored stub ("Description...") is not a blurb; print nothing.
              const blurb = /^(description|blurb|summary|text|tbd|tba)\.{0,3}$/i.test(
                (series.blurb ?? "").trim(),
              )
                ? ""
                : series.blurb;
              const initials = series.title
                .split(/\s+/)
                .filter((word) => !/^(the|of|and|a)$/i.test(word))
                .slice(0, 2)
                .map((word) => word[0])
                .join("");
              return (
                <Link
                  key={series.slug}
                  href={`/teachings/series/${series.slug}`}
                  className="card card-hover group overflow-hidden"
                >
                  {cover ? (
                    <span className="relative block aspect-[16/9] overflow-hidden border-b border-line bg-ink-2">
                      <Cover
                        src={cover}
                        alt={coverAlt}
                        sizes="(max-width: 640px) 100vw, 33vw"
                        fit="contain"
                        className="media-zoom"
                      />
                    </span>
                  ) : (
                    <span className="relative flex aspect-[16/9] items-center justify-center overflow-hidden border-b border-line bg-parchment-2">
                      <span className="text-3xl font-semibold leading-none text-ember/70">
                        {initials}
                      </span>
                      <span className="label absolute bottom-3 left-4 text-quiet">Series</span>
                    </span>
                  )}
                  <span className="block p-5">
                    <span className="block text-lg font-semibold leading-snug tracking-tight group-hover:text-ember">
                      {series.title}
                    </span>
                    {blurb && (
                      <span className="mt-1.5 line-clamp-2 block text-sm leading-relaxed text-quiet">
                        {blurb}
                      </span>
                    )}
                    <span className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-quiet">
                      {count === 0
                        ? "In preparation"
                        : `${count} ${count === 1 ? "part" : "parts"}`}
                      <ArrowRight
                        aria-hidden="true"
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
