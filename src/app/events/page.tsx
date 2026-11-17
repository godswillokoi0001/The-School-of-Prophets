import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Clock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EventCalendarLink } from "@/components/EventCalendarLink";
import { getEvents } from "@/lib/data";
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
  const events = await getEvents();
  const upcoming = events.filter((e) => e.kind === "upcoming");
  const past = events.filter((e) => e.kind === "past");

  return (
    <>
      <PageHeader
        label="Events"
        title="Gatherings that mark the season."
        lead="Beyond the weekly rhythm, the fellowship marks anniversaries, conferences and watch nights together. Every 18 September is our anniversary."
        image="/images/shofar-sky.webp"
        imageAlt="A shofar lifted against an evening sky"
      />

      <section className="wrap py-14 md:py-20">
        <div className="flex items-baseline justify-between gap-6">
          <h2 className="font-display text-3xl">Upcoming</h2>
          <p className="label flex items-center gap-2 text-quiet">
            <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
            Dates in WAT
          </p>
        </div>

        {upcoming.length === 0 ? (
          <p className="measure mt-6 text-sm text-quiet">
            Nothing is on the calendar beyond the weekly gatherings just now. The
            next anniversary is 18 September.
          </p>
        ) : (
          <ul className="mt-6">
            {upcoming.map((event) => (
              <li
                key={event.slug}
                className="grid gap-6 border-t border-ink/15 py-8 md:grid-cols-[9rem_1fr]"
              >
                <p className="label text-ember">{formatDate(event.date)}</p>

                <div className="grid gap-6 sm:grid-cols-[15rem_1fr] sm:items-start">
                  <div className="relative aspect-[4/3] overflow-hidden bg-ink">
                    <Image
                      src={event.image}
                      alt={event.imageAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, 240px"
                      className="object-cover"
                    />
                    {event.isSample && (
                      <span className="label absolute left-2 top-2 bg-ink/85 px-2 py-1 text-parchment/80">
                        Sample
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-display text-2xl leading-tight">
                      <Link href={`/events/${event.slug}`} className="hover:text-ember">
                        {event.title}
                      </Link>
                    </h3>
                    <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-quiet">
                      {event.time && (
                        <span className="flex items-center gap-1.5">
                          <Clock aria-hidden="true" className="h-3.5 w-3.5 text-ember" />
                          {event.time} WAT
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-ember" />
                        {event.location}
                        {event.needsConfirmation ? " · awaiting confirmation" : ""}
                      </span>
                    </p>
                    <p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-quiet">
                      {event.summary}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <EventCalendarLink event={event} />
                      <Link
                        href={`/events/${event.slug}`}
                        className="link-underline text-sm font-semibold"
                      >
                        Details &amp; registration →
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-t border-ink/15 bg-parchment-2/70">
        <div className="wrap py-14 md:py-20">
          <h2 className="font-display text-3xl">Past gatherings</h2>
          <ul className="mt-6">
            {past.map((event) => (
              <li key={event.slug} className="border-t border-ink/15 py-8">
                <div className="grid gap-6 md:grid-cols-[9rem_1fr]">
                  <p className="label text-quiet">{formatDate(event.date)}</p>

                  <div className="grid gap-6 md:grid-cols-[18rem_1fr] md:items-start">
                    <div className="relative aspect-[16/10] overflow-hidden bg-ink">
                      <Image
                        src={event.image}
                        alt={event.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, 288px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl leading-tight">{event.title}</h3>
                      <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-ink/80">
                        {event.summary}
                      </p>
                      {event.detail?.map((paragraph) => (
                        <p
                          key={paragraph}
                          className="mt-3 max-w-[62ch] text-sm leading-relaxed text-quiet"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
