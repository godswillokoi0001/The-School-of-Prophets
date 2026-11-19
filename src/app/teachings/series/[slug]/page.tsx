import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { TeachingCard } from "@/components/TeachingCard";
import { getSeries, getTeachings } from "@/lib/data";
import { site } from "@/config/site";

type Params = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const seriesList = await getSeries();
  const series = seriesList.find((s) => s.slug === slug);
  if (!series) return { title: "Series not found" };
  const blurb = /^(description|blurb|summary|text|tbd|tba)\.{0,3}$/i.test(
    (series.blurb ?? "").trim(),
  )
    ? `Teachings in the ${series.title} series.`
    : series.blurb;
  return {
    title: series.title,
    description: blurb,
    alternates: { canonical: `/teachings/series/${series.slug}` },
    openGraph: {
      title: `${series.title} | ${site.name}`,
      description: blurb,
      url: `/teachings/series/${series.slug}`,
    },
  };
}

export default async function SeriesPage({ params }: Params) {
  const { slug } = await params;
  const [seriesList, teachings] = await Promise.all([getSeries(), getTeachings()]);
  const series = seriesList.find((s) => s.slug === slug);
  if (!series) notFound();

  const items = teachings
    .filter((t) => t.series === slug)
    .sort((a, b) => b.date.localeCompare(a.date));

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
    <>
      <PageHeader
        label="Series"
        title={series.title}
        lead={blurb || undefined}
        image={series.image ?? items[0]?.image}
        imageAlt={series.imageAlt ?? items[0]?.imageAlt}
        aside={
          series.image || items[0]?.image ? (
            <div className="border-t border-ink/20 pt-4">
              <p className="label text-quiet">In this series</p>
              <p className="mt-2 font-display text-3xl tabular-nums">{items.length}</p>
              <Link href="/teachings" className="link-quiet mt-4 inline-block text-sm font-semibold">
                All teachings
              </Link>
            </div>
          ) : (
            <div className="border border-ink/15 bg-parchment-2 p-8">
              <p className="label text-quiet">Series</p>
              <p className="mt-6 font-display text-6xl leading-none text-ember/70">
                {initials}
              </p>
              <p className="mt-3 text-sm text-quiet">
                {items.length === 0
                  ? "In preparation"
                  : `${items.length} ${items.length === 1 ? "teaching" : "teachings"}`}
              </p>
              <Link href="/teachings" className="link-quiet mt-4 inline-block text-sm font-semibold">
                All teachings
              </Link>
            </div>
          )
        }
      />

      <section className="wrap py-14 md:py-20">
        {items.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((t) => (
              <TeachingCard key={t.slug} teaching={t} seriesTitle={series.title} />
            ))}
          </div>
        ) : (
          <p className="measure text-quiet">
            This series is still being uploaded. Subscribe on YouTube so you do not
            miss the next one.
          </p>
        )}
      </section>
    </>
  );
}
