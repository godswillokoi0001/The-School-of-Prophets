import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ExternalLink, Headphones } from "lucide-react";
import { TeachingVideo } from "@/components/TeachingVideo";
import { Cover } from "@/components/Cover";
import { getSeries, getTeaching, getTeachings } from "@/lib/data";
import { getServiceClient, supabaseConfigured } from "@/lib/supabase/server";
import { sanitizeServerHtml } from "@/lib/sanitize-html";
import { formatDate } from "@/lib/time";
import { site } from "@/config/site";

type Params = { params: Promise<{ slug: string }> };

async function followRedirect(slug: string): Promise<string | null> {
  if (!supabaseConfigured()) return null;
  const { data } = await getServiceClient()!
    .from("slug_redirects")
    .select("new_path")
    .eq("entity_type", "teaching")
    .eq("old_slug", slug)
    .limit(1);
  return data?.[0]?.new_path ?? null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const teaching = await getTeaching(slug);
  if (!teaching) return { title: "Teaching not found" };
  const seriesList = await getSeries();
  const series = seriesList.find((s) => s.slug === teaching.series);
  return {
    title: teaching.title,
    description: teaching.summary,
    alternates: { canonical: `/teachings/${teaching.slug}` },
    openGraph: {
      type: "article",
      title: teaching.title,
      description: teaching.summary,
      url: `/teachings/${teaching.slug}`,
      publishedTime: teaching.date,
    },
    other: series ? { "article:section": series.title } : undefined,
  };
}

export default async function TeachingPage({ params }: Params) {
  const { slug } = await params;
  const teaching = await getTeaching(slug);
  if (!teaching) {
    const target = await followRedirect(slug);
    if (target) redirect(target);
    notFound();
  }

  const [allTeachings, seriesList] = await Promise.all([getTeachings(), getSeries()]);
  const series = seriesList.find((s) => s.slug === teaching.series);
  const inSeries = allTeachings
    .filter((t) => t.series === teaching.series)
    .sort((a, b) => b.date.localeCompare(a.date));
  const index = inSeries.findIndex((t) => t.slug === teaching.slug);
  const next = inSeries[index + 1];
  const previous = inSeries[index - 1];

  const hasBody = !!teaching.body?.trim();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: teaching.title,
    datePublished: teaching.date,
    description: teaching.summary,
    author: { "@type": "Person", name: site.leader },
    publisher: { "@type": "Organization", name: site.name },
    articleSection: series?.title,
  };

  return (
    <article>
      <header className="border-b border-ink/15 bg-parchment">
        <div className="wrap py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="label flex flex-wrap gap-2 text-quiet">
            <Link href="/teachings" className="hover:text-ember">
              Teachings
            </Link>
            <span aria-hidden="true">/</span>
            {series && (
              <>
                <Link href={`/teachings/series/${series.slug}`} className="hover:text-ember">
                  {series.title}
                </Link>
                <span aria-hidden="true">/</span>
              </>
            )}
            <span className="text-ink/50">This teaching</span>
          </nav>

          <h1 className="mt-6 max-w-[24ch] font-display text-hero">{teaching.title}</h1>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-quiet">
            <span>{formatDate(teaching.date)}</span>
            <span aria-hidden="true">·</span>
            <span>{teaching.scripture}</span>
            {series && (
              <>
                <span aria-hidden="true">·</span>
                <span>{series.title}</span>
              </>
            )}
            {teaching.isSample && <span className="tag text-quiet">Sample entry</span>}
          </div>

          <div className="mt-9 max-w-[34rem] border-y border-ink/25 py-6">
            <p className="label text-ember">The text</p>
            <p className="mt-2 font-display text-2xl leading-snug">{teaching.scripture}</p>
          </div>
        </div>

        {teaching.image && (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink md:aspect-[24/9]">
            <Cover
              src={teaching.image}
              alt={teaching.imageAlt}
              sizes="100vw"
              priority
            />
          </div>
        )}
      </header>

      <div className="wrap grid gap-12 py-12 md:grid-cols-12 md:py-16">
        <div className="md:col-span-8">
          <p className="measure text-lg leading-relaxed text-ink/80">{teaching.summary}</p>

          {teaching.youtubeId ? (
            <div className="mt-8">
              <TeachingVideo youtubeId={teaching.youtubeId} title={teaching.title} />
            </div>
          ) : null}

          {teaching.audioUrl && (
            <div className="mt-6 border-y border-ink/20 py-5">
              <p className="label flex items-center gap-2 text-ember">
                <Headphones aria-hidden="true" size={13} />
                Audio recording
              </p>
              <audio controls className="mt-3 w-full" src={teaching.audioUrl}>
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          <div className="mt-12 space-y-5 border-t border-ink/15 pt-8">
            <p className="label text-ember">Outline and study notes</p>
            {hasBody ? (
              <div
                className="prose-tsop measure"
                dangerouslySetInnerHTML={{ __html: sanitizeServerHtml(teaching.body!) }}
              />
            ) : (
              (teaching.notes ?? []).map((note, i) => (
                <p key={i} className="measure text-[0.975rem] leading-relaxed">
                  {note}
                </p>
              ))
            )}
          </div>

          {((teaching as { links?: { label: string; url: string }[] }).links ?? []).length > 0 && (
            <div className="mt-10 border-t border-ink/20 pt-5">
              <p className="label text-ember">Further reading</p>
              <ul className="mt-3 space-y-2.5">
                {((teaching as { links?: { label: string; url: string }[] }).links ?? []).map((l, i) => (
                  <li key={i}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-quiet inline-flex items-center gap-1.5 text-sm text-ink"
                    >
                      <span>{l.label || l.url}</span>
                      <ExternalLink size={13} className="text-gold shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-12 flex flex-wrap gap-3 border-t border-ink/15 pt-8">
            <Link href="/gatherings" className="btn btn-gold">
              Join the next gathering
            </Link>
            <a
              href={site.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              More on YouTube
            </a>
          </div>
        </div>

        <aside className="md:col-span-4">
          <div className="border-t border-ink/20 pt-5">
            <p className="label text-quiet">Topics</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {teaching.topics.map((topic) => (
                <li key={topic} className="tag text-ink/70">
                  {topic}
                </li>
              ))}
            </ul>
          </div>

          {series && (
            <div className="mt-8 border-t border-ink/20 pt-5">
              <p className="label text-quiet">In this series</p>
              <p className="mt-2 font-display text-xl leading-snug">{series.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-quiet">{series.blurb}</p>
              <ol className="mt-4 space-y-2 text-sm">
                {inSeries.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/teachings/${item.slug}`}
                      aria-current={item.slug === teaching.slug ? "page" : undefined}
                      className={`block border-t border-ink/10 py-2 ${
                        item.slug === teaching.slug
                          ? "font-semibold text-ember"
                          : "text-ink/75 hover:text-ember"
                      }`}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {(previous || next) && (
            <div className="mt-8 grid gap-3 border-t border-ink/20 pt-5 text-sm">
              {previous && (
                <Link href={`/teachings/${previous.slug}`} className="link-underline">
                  ← {previous.title}
                </Link>
              )}
              {next && (
                <Link href={`/teachings/${next.slug}`} className="link-underline">
                  {next.title} →
                </Link>
              )}
            </div>
          )}
        </aside>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </article>
  );
}
