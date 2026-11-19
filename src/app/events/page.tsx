import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin, Clock, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EventCalendarLink } from "@/components/EventCalendarLink";
import { Cover } from "@/components/Cover";
import { getEvents, getMediaMeta } from "@/lib/data";
import { focalFor } from "@/lib/media";
import { formatDate } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Anniversaries, conferences and watch nights at The School of Prophets, including the 5th Anniversary held on 19 September 2026.",
  alternates: { canonical: "/events" },
  openGraph: {
    title: "Events | The School of Prophets",
    description: "Gatherings that mark the season.",
    url: "/events",
  },
};

export default async function EventsPage() {
  const [events, mediaMeta] = await Promise.all([getEvents(), getMediaMeta()]);
  // Seeded examples stay in the CMS but are never printed as real gatherings.
  const upcoming = events.filter((e) => e.kind === "upcoming" && !e.isSample);
  const past = events.filter((e) => e.kind === "past" && !e.isSample);

  return (
    <>
      <PageHeader
        label="Events"
        title="Gatherings that mark the season."
        lead="Beyond the weekly rhythm, the fellowship marks anniversaries, conferences and watch nights together. Every 18 September is our anniversary."
      />

      <section className="wrap py-12 md:py-16">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="label text-ember">On the calendar</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Upcoming</h2>
          </div>
          <p className="flex items-center gap-2 text-xs text-quiet">
            <CalendarDays aria-hidden="true" className="h-4 w-4 text-gold" />
            Dates in WAT
          </p>
        </div>

        {upcoming.length === 0 ? (
          <div className="card mt-6 p-6">
            <p className="measure text-sm leading-relaxed text-quiet">
              Nothing is on the calendar beyond the weekly gatherings just now. The
              next anniversary is 18 September.
            </p>
            <Link href="/gatherings" className="btn btn-outline mt-4">
              See the weekly timetable
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {upcoming.map((event) => (
              <article key={event.slug} className="card card-hover group overflow-hidden">
                {event.image && (
                  <div className="relative aspect-[16/9] overflow-hidden border-b border-line bg-ink-2">
                    <Cover
                      src={event.image}
                      alt={event.imageAlt}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      fit="cover"
                      focal={focalFor(mediaMeta, event.image)}
                      className="media-zoom"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-paper/95 px-2.5 py-1 text-[0.7rem] font-semibold text-ink">
                      {formatDate(event.date)}
                    </span>
                  </div>
                )}

                <div className="p-5 sm:p-6">
                  <h3 className="text-xl font-semibold leading-snug tracking-tight">
                    <Link
                      href={`/events/${event.slug}`}
                      className="transition-colors group-hover:text-ember"
                    >
                      {event.title}
                    </Link>
                  </h3>

                  <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-quiet">
                    {event.time && (
                      <span className="flex items-center gap-1.5">
                        <Clock aria-hidden="true" className="h-3.5 w-3.5 text-gold" />
                        {event.time} WAT
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-gold" />
                      {event.location}
                      {event.needsConfirmation ? " · awaiting confirmation" : ""}
                    </span>
                  </p>

                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-quiet">
                    {event.summary}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
                    <EventCalendarLink event={event} />
                    <Link
                      href={`/events/${event.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-ember"
                    >
                      Details
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-line bg-paper">
        <div className="wrap py-12 md:py-16">
          <p className="label text-quiet">The record</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Past gatherings</h2>

          {past.length === 0 && (
            <p className="measure mt-4 text-sm leading-relaxed text-quiet">
              Recaps from earlier gatherings are being gathered. The weekly timetable
              is the reliable record until they are published.
            </p>
          )}

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {past.map((event) => (
              <article key={event.slug} className="card overflow-hidden">
                {event.image && (
                  <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-ink-2">
                    <Cover
                      src={event.image}
                      alt={event.imageAlt}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      fit="cover"
                      focal={focalFor(mediaMeta, event.image)}
                    />
                  </div>
                )}
                <div className="p-5">
                  <p className="text-xs text-quiet">{formatDate(event.date)}</p>
                  <h3 className="mt-1.5 text-base font-semibold leading-snug tracking-tight">
                    {event.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-quiet">
                    {event.summary}
                  </p>
                  {event.detail?.[0] && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-quiet/80">
                      {event.detail[0]}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
