import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { EventCalendarLink } from "@/components/EventCalendarLink";
import { EventRegisterForm } from "@/components/forms/EventRegisterForm";
import { getEvents } from "@/lib/data";
import { getServiceClient, supabaseConfigured } from "@/lib/supabase/server";
import { sanitizeServerHtml } from "@/lib/sanitize-html";
import { formatDate } from "@/lib/time";
import { site } from "@/config/site";

type Params = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

async function followRedirect(slug: string): Promise<string | null> {
  if (!supabaseConfigured()) return null;
  const { data } = await getServiceClient()!
    .from("slug_redirects")
    .select("new_path")
    .eq("entity_type", "event")
    .eq("old_slug", slug)
    .limit(1);
  return data?.[0]?.new_path ?? null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const events = await getEvents();
  const event = events.find((e) => e.slug === slug);
  if (!event) return { title: "Event not found" };
  return {
    title: event.title,
    description: event.summary,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      title: `${event.title} | ${site.name}`,
      description: event.summary,
      url: `/events/${event.slug}`,
    },
  };
}

export default async function EventDetailPage({ params }: Params) {
  const { slug } = await params;
  const events = await getEvents();
  const event = events.find((e) => e.slug === slug);
  if (!event) {
    const target = await followRedirect(slug);
    if (target) redirect(target);
    notFound();
  }

  const upcoming = event.kind === "upcoming";
  const startsAt = `${event.date}T${event.time ?? "19:00"}:00+01:00`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: startsAt,
    eventStatus: upcoming ? "https://schema.org/EventScheduled" : "https://schema.org/EventPast",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: {
      "@type": "VirtualLocation",
      url: `${site.url}/events/${event.slug}`,
    },
    description: event.summary,
    image: [event.image],
    organizer: { "@type": "Organization", name: site.name, url: site.url },
  };

  return (
    <>
      <PageHeader
        label={upcoming ? "Upcoming event" : "Past gathering"}
        title={event.title}
        lead={event.summary}
        image={event.image}
        imageAlt={event.imageAlt}
        aside={
          <div className="border-t border-ink/20 pt-4">
            <p className="label text-quiet">When</p>
            <p className="mt-2 font-display text-xl">{formatDate(event.date)}</p>
            {event.time && (
              <p className="mt-1 text-sm text-quiet">
                {event.time}
                {event.endTime ? `–${event.endTime}` : ""} WAT
              </p>
            )}
            <p className="mt-3 label text-quiet">Where</p>
            <p className="mt-1 text-sm">{event.location}</p>
            <div className="mt-4">
              <EventCalendarLink event={event} />
            </div>
          </div>
        }
      />

      <div className="wrap grid gap-12 py-14 md:grid-cols-12 md:py-20">
        <div className="md:col-span-7">
          <p className="measure text-lg leading-relaxed text-ink/80">{event.summary}</p>

          {event.detail?.length ? (
            <div className="mt-10 space-y-5 border-t border-ink/15 pt-8">
              <p className="label text-ember">About this gathering</p>
              {event.detail.map((paragraph) =>
                paragraph.trimStart().startsWith("<") ? (
                  <div
                    key="recap"
                    className="prose-editor max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizeServerHtml(paragraph) }}
                  />
                ) : (
                  <p key={paragraph} className="measure text-[0.975rem] leading-relaxed text-ink/80">
                    {paragraph}
                  </p>
                ),
              )}
            </div>
          ) : null}
        </div>

        <aside className="md:col-span-5">
          {upcoming ? (
            <div className="border border-ink/15 p-6">
              <p className="label text-ember">Registration</p>
              <p className="mt-2 text-sm leading-relaxed text-quiet">
                Register so we can plan and send you the joining details.
              </p>
              <div className="mt-6">
                <EventRegisterForm eventSlug={event.slug} eventTitle={event.title} />
              </div>
            </div>
          ) : (
            <div className="border border-ink/15 p-6">
              <p className="label text-quiet">This gathering has passed</p>
              <p className="mt-2 text-sm leading-relaxed text-quiet">
                The teaching from this gathering is kept in the library.
              </p>
              <Link href="/teachings" className="btn btn-outline mt-4">
                Teaching library
              </Link>
            </div>
          )}

          <div className="mt-8 border-t border-ink/20 pt-5 text-sm">
            <Link href="/events" className="link-underline">
              ← All events
            </Link>
          </div>
        </aside>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
