import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { TeachingCard } from "@/components/TeachingCard";
import { seriesBySlug, seriesList, teachingsBySeries } from "@/content/teachings";
import { site } from "@/config/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return seriesList.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const series = seriesBySlug(slug);
  if (!series) return { title: "Series not found" };
  return {
    title: series.title,
    description: series.blurb,
    alternates: { canonical: `/teachings/series/${series.slug}` },
    openGraph: {
      title: `${series.title} | ${site.name}`,
      description: series.blurb,
      url: `/teachings/series/${series.slug}`,
    },
  };
}

export default async function SeriesPage({ params }: Params) {
  const { slug } = await params;
  const series = seriesBySlug(slug);
  if (!series) notFound();

  const items = teachingsBySeries(slug);

  return (
    <>
      <PageHeader
        label="Series"
        title={series.title}
        lead={series.blurb}
        image={items[0]?.image}
        imageAlt={items[0]?.imageAlt}
        aside={
          <div className="border-t border-ink/20 pt-4">
            <p className="label text-quiet">In this series</p>
            <p className="mt-2 font-display text-3xl">{items.length}</p>
            <Link href="/teachings" className="link-underline mt-4 inline-block text-sm font-semibold">
              All teachings →
            </Link>
          </div>
        }
      />

      <section className="wrap py-14 md:py-20">
        {items.length > 0 ? (
          <div className="grid gap-x-10 gap-y-12 md:grid-cols-2">
            {items.map((t) => (
              <TeachingCard key={t.slug} teaching={t} />
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
