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
            <div className="mt-4">
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
          <ul>
            {seriesList.map((series) => {
              const count = teachings.filter((t) => t.series === series.slug).length;
              const cover =
                series.image ?? teachings.find((t) => t.series === series.slug)?.image;
              const coverAlt =
                series.imageAlt ?? teachings.find((t) => t.series === series.slug)?.imageAlt;
              return (
                <li key={series.slug} className="border-b border-ink/12">
                  <Link
                    href={`/teachings/series/${series.slug}`}
                    className="group grid gap-3 py-5 sm:grid-cols-[8rem_1fr_auto] sm:items-center sm:gap-6"
                  >
                    {cover && (
                      <span className="relative block aspect-[16/10] overflow-hidden bg-ink">
                        <Cover
                          src={cover}
                          alt={coverAlt}
                          sizes="(max-width: 640px) 100vw, 128px"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        />
                      </span>
                    )}
                    <span>
                      <span className="font-display text-2xl group-hover:text-ember">
                        {series.title}
                      </span>
                      <span className="mt-1 block max-w-[62ch] text-sm text-quiet">
                        {series.blurb}
                      </span>
                    </span>
                    <span className="flex items-center gap-3 text-xs uppercase tracking-[0.12em] text-quiet">
                      {count} {count === 1 ? "part" : "parts"}
                      <ArrowRight
                        aria-hidden="true"
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
