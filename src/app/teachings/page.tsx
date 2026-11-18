import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { TeachingLibrary } from "@/components/TeachingLibrary";
import { NewsletterSubscribe } from "@/components/NewsletterSubscribe";
import { TeachingCard } from "@/components/TeachingCard";
import { getSeries, getTeachings } from "@/lib/data";
import { site } from "@/config/site";
import { BookOpen, Layers } from "lucide-react";
import { YouTubeIcon } from "@/components/BrandIcons";

export const metadata: Metadata = {
  title: "Teachings",
  description:
    "The teaching library of The School of Prophets: the Word of Knowledge, Faith, the Mystery of the Kingdom, the gifts of the Spirit, and book studies in written outline and video.",
  alternates: { canonical: "/teachings" },
  openGraph: {
    title: "Teaching Library | The School of Prophets",
    description:
      "Weekly teachings grouped by series, with written outlines and recordings.",
    url: "/teachings",
  },
};

export const dynamic = "force-dynamic";

export default async function TeachingsPage() {
  const [teachings, seriesList] = await Promise.all([getTeachings(), getSeries()]);
  const featured = teachings.find((t) => t.featured) ?? teachings[0];

  return (
    <>
      <PageHeader
        label="Teaching library"
        title="The Word, in order."
        lead="Teachings from our weekly gatherings, grouped by series so you can follow them from the beginning. Written outlines are here; recordings are on YouTube."
        image="/images/bible-bedside.webp"
        imageAlt="A believer reading the Scriptures in a quiet room"
        aside={
          <div className="border-t border-ink/20 pt-4">
            <p className="label text-quiet">Subscribe</p>
            <p className="mt-2 text-sm leading-relaxed text-quiet">
              New teachings are uploaded every week.
            </p>
            <a
              href={site.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline mt-4"
            >
              <YouTubeIcon aria-hidden="true" className="h-4 w-4" />
              YouTube channel
            </a>
          </div>
        }
      />

      {featured && (
        <section className="border-b border-ink/15 bg-parchment-2/70">
          <div className="wrap grid gap-8 py-12 md:grid-cols-12 md:py-16">
            <div className="md:col-span-3">
              <p className="label text-ember">Teaching of the week</p>
            </div>
            <div className="md:col-span-9">
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
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-display text-3xl">Browse the library</h2>
          <p className="max-w-[52ch] text-xs leading-relaxed text-quiet">
            Entries marked &ldquo;sample&rdquo; are structural placeholders
            prepared for this site. Replace them with the ministry&apos;s own
            recordings and notes.
          </p>
        </div>
        <div className="mt-8">
          <TeachingLibrary seriesList={seriesList} teachings={teachings} />
        </div>

        <div className="mt-12">
          <NewsletterSubscribe
            variant="card"
            title="Receive New Teachings In Your Inbox"
            description="Subscribe free to receive weekly study notes, mp3 audio releases, and teaching outlines as soon as they are published."
          />
        </div>

        <div id="series" className="mt-16 border-t border-ink/15 pt-8">
          <p className="label flex items-center gap-2 text-quiet">
            <Layers aria-hidden="true" className="h-3.5 w-3.5" />
            Series index
          </p>
          <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {seriesList.map((series) => (
              <li key={series.slug}>
                <Link
                  href={`/teachings/series/${series.slug}`}
                  className="group flex items-center justify-between gap-3 border-t border-ink/12 py-3 text-sm"
                >
                  <span className="flex items-center gap-2.5">
                    <BookOpen aria-hidden="true" className="h-3.5 w-3.5 text-ember" />
                    {series.title}
                  </span>
                  <span className="text-xs text-quiet group-hover:text-ember">
                    {teachings.filter((t) => t.series === series.slug).length}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
