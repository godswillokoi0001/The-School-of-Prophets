import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarPlus } from "lucide-react";
import { Seal } from "@/components/Seal";
import { Cover } from "@/components/Cover";
import { NextGathering } from "@/components/NextGathering";
import { Timetable } from "@/components/Timetable";
import { EnrolmentBanner } from "@/components/EnrolmentBanner";
import { SocialLinks } from "@/components/SocialLinks";
import { Reveal } from "@/components/Reveal";
import {
  getContactSettings,
  getEnrolmentSettings,
  getSchedule,
  getMediaMeta,
  getScheduleExceptions,
  getSeries,
  getSetting,
  getTeachings,
} from "@/lib/data";
import { focalFor } from "@/lib/media";
import { site } from "@/config/site";
import { training } from "@/content/ministry";
import { formatDate } from "@/lib/time";

const defaultSections = {
  intro: true,
  systems: true,
  week: true,
  teaching: true,
  training: true,
  cta: true,
};

type HomeSections = Partial<typeof defaultSections>;

const systems = [
  {
    number: "01",
    title: "Word",
    body: "The Scriptures opened, book by book and topic by topic, until a person can hear God for themselves.",
  },
  {
    number: "02",
    title: "Worship",
    body: "We bless His name before we ask Him for anything. Worship sets the posture of the house.",
  },
  {
    number: "03",
    title: "Prayer",
    body: "Intercession is the work here, not the warm-up. A people who stand in the gap for one another.",
  },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [teachings, schedule, seriesList, contact, enrolment, homeSetting, exceptions, mediaMeta] = await Promise.all([
    getTeachings(),
    getSchedule(),
    getSeries(),
    getContactSettings(),
    getEnrolmentSettings(),
    getSetting("homepage", {}),
    getScheduleExceptions(),
    getMediaMeta(),
  ]);
  const show = { ...defaultSections, ...(homeSetting as HomeSections) };
  // A stub saved in the CMS ("Title...") is not a teaching; never print it.
  const published = teachings.filter(
    (t) => !/^(title|untitled|sample)\.{0,3}$/i.test(t.title.trim()),
  );
  const featured = published.find((t) => t.featured) ?? published[0];
  const seriesTitle = seriesList.find((s) => s.slug === featured?.series)?.title;
  const recent = published.filter((t) => t.slug !== featured?.slug).slice(0, 3);

  return (
    <>
      {/* Hero: the watchman's hill, held behind the type */}
      <section className="relative isolate overflow-hidden bg-ink text-parchment">
        <Image
          src="/images/desert-walk.webp"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[65%_45%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/5"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/30"
        />

        <div className="wrap relative grid gap-12 pb-16 pt-16 md:min-h-[38rem] md:content-center md:pb-24 md:pt-24 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-7">
            <p className="label text-gold-soft/85">
              Interdenominational · Founded {site.founded}
            </p>

            <h1 className="mt-7 max-w-[13ch] font-display text-display text-parchment">
              A community
              <br />
              of the called.
            </h1>

            <p className="mt-8 max-w-[34ch] font-display text-lead leading-snug text-parchment/75">
              Planted in the word. Moved by the Spirit. Built on prayer.
            </p>

            <p className="measure mt-6 text-parchment/55">
              The School of Prophets is an interdenominational prophetic fellowship
              led by {site.leader}, gathering online every week from Nigeria, Zambia
              and beyond.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link href="/gatherings" className="btn btn-gold">
                Join a gathering
              </Link>
              <Link
                href="/teachings"
                className="link-quiet inline-flex items-center gap-2 text-sm text-parchment/75 hover:text-parchment"
              >
                Read a teaching first
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <NextGathering sessions={schedule} joinHref={contact.whatsapp || undefined} />
            <p className="mt-4 text-xs leading-relaxed text-parchment/60">
              Every session is online. Times are kept in WAT and shown in your own
              timezone.
            </p>
          </div>
        </div>

        <div className="relative border-t border-parchment/10">
          <div className="wrap flex flex-wrap gap-x-10 gap-y-2 py-4 text-[0.7rem] uppercase tracking-[0.14em] text-parchment/60">
            <span>Founded {site.founded}</span>
            <span aria-hidden="true" className="text-parchment/20">/</span>
            <span>Interdenominational</span>
            <span aria-hidden="true" className="text-parchment/20">/</span>
            <span>Online, weekly</span>
          </div>
        </div>
      </section>

      {/* Who we are, with a scripture plate */}
      {show.intro && (
        <section className="wrap grid gap-12 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-7">
            <p className="label text-ember">The fellowship</p>
            <Reveal>
              <h2 className="mt-5 max-w-[24ch] font-display text-hero">
                Saints from different churches and cities, bound by love and united
                by one Spirit.
              </h2>
            </Reveal>
            <div className="mt-8 grid max-w-3xl gap-6 text-quiet sm:grid-cols-2">
              <p>
                We come to hear God clearly, to grow into what He has called us to
                be, and to stand in prayer for one another.
              </p>
              <p>
                Founded on {site.founded} as an interdenominational mandate for the
                whole body of Christ. We stay in our local churches and gather here
                to be taught.
              </p>
            </div>
            <Link
              href="/about"
              className="link-quiet mt-8 inline-flex items-center gap-2 text-sm font-semibold text-ink"
            >
              The story and the vision
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
          </div>

          <figure className="md:col-span-5 md:pl-8">
            <div className="border border-ink/15 bg-paper p-8">
              <Seal size={72} idKey="home-intro" />
              <blockquote className="mt-8">
                <p className="pullquote font-display text-2xl leading-[1.25]">
                  “The most High ruleth in the kingdom of men, and giveth it to
                  whomsoever he will.”
                </p>
                <figcaption className="mt-5 text-xs uppercase tracking-[0.13em] text-quiet">
                  Daniel 4:17 · the fellowship&apos;s watchword
                </figcaption>
              </blockquote>
            </div>
          </figure>
        </section>
      )}

      {/* The week: the timetable is the centrepiece */}
      {show.week && (
        <section className="bg-ink text-parchment">
          <div className="wrap py-20 md:py-28">
            <div className="grid gap-6 md:grid-cols-12 md:items-end">
              <div className="md:col-span-7">
                <p className="label text-gold-soft/85">This week</p>
                <Reveal>
                  <h2 className="mt-4 font-display text-hero">The week, in WAT.</h2>
                </Reveal>
              </div>
              <div className="md:col-span-5 md:text-right">
                <a
                  href="/schedule.ics"
                  download
                  className="inline-flex items-center gap-2 text-sm text-parchment/65 hover:text-parchment"
                >
                  <CalendarPlus aria-hidden="true" className="h-4 w-4" />
                  Add the whole week to your calendar
                </a>
              </div>
            </div>

            <div className="mt-10 md:mt-12">
              <Timetable sessions={schedule} exceptions={exceptions} tone="dark" />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="max-w-[58ch] text-xs leading-relaxed text-parchment/60">
                Times marked * await the ministry&apos;s confirmation. Links are
                posted in the community before each session.
              </p>
              <Link href="/gatherings" className="link-quiet text-sm text-parchment/75">
                What an evening looks like
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Three systems as typography, not cards */}
      {show.systems && (
        <section className="wrap py-20 md:py-28">
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <p className="label text-ember md:col-span-3">The three systems</p>
            <h2 className="font-display text-hero md:col-span-9">
              Everything here rests on three things.
            </h2>
          </div>

          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-0">
            {systems.map((system, index) => (
              <div
                key={system.number}
                className={`border-t border-ink/25 pt-6 md:px-8 ${
                  index === 0 ? "md:pl-0" : ""
                } ${index < systems.length - 1 ? "md:border-r md:border-r-ink/15" : ""} ${
                  index === systems.length - 1 ? "md:pr-0" : ""
                }`}
              >
                <p className="font-display text-5xl leading-none tabular-nums text-ember">
                  {system.number}
                </p>
                <h3 className="mt-6 font-display text-3xl">{system.title}</h3>
                <p className="mt-3 max-w-[32ch] text-sm leading-relaxed text-quiet">
                  {system.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Start with a teaching */}
      {show.teaching && featured && (
        <section className="border-y border-ink/15 bg-paper">
          <div className="wrap py-16 md:py-24">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <p className="label text-ember">Start with this teaching</p>
              <Link href="/teachings" className="link-quiet text-sm text-quiet">
                All teachings
              </Link>
            </div>

            <article className="mt-8 grid gap-8 border-t border-ink/20 pt-8 md:grid-cols-12">
              <div className="md:col-span-3">
                <p className="label text-quiet">{seriesTitle ?? "Teaching"}</p>
                <p className="mt-2 text-xs text-quiet">{formatDate(featured.date)}</p>
              </div>

              <div className="md:col-span-9 grid gap-8 lg:grid-cols-12 lg:items-center">
                <div className={featured.image ? "lg:col-span-7" : "lg:col-span-12"}>
                  <h3 className="max-w-[26ch] font-display text-3xl leading-[1.05] sm:text-4xl lg:text-5xl">
                    <Link href={`/teachings/${featured.slug}`} className="link-quiet">
                      {featured.title}
                    </Link>
                  </h3>
                  <p className="measure mt-5 text-quiet">{featured.summary}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-6">
                    <Link
                      href={`/teachings/${featured.slug}`}
                      className="link-quiet inline-flex items-center gap-2 text-sm font-semibold text-ink"
                    >
                      Read the outline
                      <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </Link>
                    <span className="text-xs uppercase tracking-[0.12em] text-ember">
                      {featured.scripture}
                    </span>
                  </div>
                </div>

                {featured.image && (
                  <div className="lg:col-span-5">
                    <Link
                      href={`/teachings/${featured.slug}`}
                      className="group relative block aspect-[3/2] overflow-hidden border border-ink/15 bg-ink-2"
                    >
                      <Cover
                        src={featured.image}
                        alt={featured.imageAlt || featured.title}
                        sizes="(max-width: 768px) 100vw, 35vw"
                        fit="contain"
                        className="media-zoom"
                      />
                    </Link>
                  </div>
                )}
              </div>
            </article>

            {recent.length > 0 && (
              <ul className="mt-10">
                {recent.map((t) => (
                  <li key={t.slug} className="border-t border-ink/12">
                    <Link
                      href={`/teachings/${t.slug}`}
                      className="group grid gap-2 py-5 sm:grid-cols-[9rem_1fr_auto] sm:items-baseline sm:gap-6"
                    >
                      <span className="text-xs uppercase tracking-[0.12em] text-quiet">
                        {formatDate(t.date)}
                      </span>
                      <span className="font-display text-xl leading-snug group-hover:text-ember">
                        {t.title}
                      </span>
                      <span className="text-xs uppercase tracking-[0.12em] text-quiet">
                        {t.scripture}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Training */}
      {show.training && (
        <section className="bg-ink-2 text-parchment">
          <div className="wrap grid gap-12 py-20 md:grid-cols-12 md:py-28">
            <div className="md:col-span-7">
              <p className="label text-gold-soft/85">The Bible institute</p>
              <h2 className="mt-5 max-w-[24ch] font-display text-hero">
                Called into ministry? Don&apos;t guess your way into it.
              </h2>
              <p className="measure mt-6 text-parchment/60">{training.intro}</p>
              <p className="measure mt-4 text-sm text-parchment/60">
                {training.enrolmentNote}
              </p>
              <Link
                href="/training"
                className="link-quiet mt-8 inline-flex items-center gap-2 text-sm text-parchment/80"
              >
                Read the syllabus
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="md:col-span-5 md:pl-8">
              <EnrolmentBanner status={enrolment.status} />
            </div>
          </div>
        </section>
      )}

      {/* The Prophet: the portrait we have */}
      <section className="wrap grid gap-12 py-20 md:grid-cols-12 md:py-28">
        <figure className="md:col-span-4">
          <div className="relative aspect-[4/5] overflow-hidden bg-ink">
            <Image
              src="/images/prophet-portrait.webp"
              alt="Prophet Lawrence Iwara, founder and overseer of The School of Prophets"
              fill
              sizes="(max-width: 768px) 100vw, 32vw"
              className="object-cover object-top"
            />
          </div>
          <figcaption className="figure-caption mt-3">
            Prophet Lawrence Iwara · founder and overseer
          </figcaption>
        </figure>

        <div className="md:col-span-7 md:col-start-6">
          <p className="label text-ember">In his own words</p>
          <Reveal>
            <blockquote className="mt-6">
              <p className="pullquote max-w-[23ch] font-display text-3xl leading-[1.15] sm:text-4xl lg:text-[2.5rem]">
                “One of the reasons God sent prophets was simply because He loves His
                people.”
              </p>
              <footer className="mt-6 text-xs uppercase tracking-[0.13em] text-quiet">
                From the 5th Anniversary teaching, 19 September 2026
              </footer>
            </blockquote>
          </Reveal>
          <p className="measure mt-8 text-quiet">
            He teaches weekly, trains those called into ministry at the Bible
            institute, and shepherds the fellowship in prayer.
          </p>
          <Link
            href="/about#prophet"
            className="link-quiet mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink"
          >
            Meet the Prophet
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Join */}
      {show.cta && (
        <section className="border-t border-ink/15 bg-paper">
          <div className="wrap grid gap-10 py-16 md:grid-cols-12 md:py-20">
            <div className="md:col-span-7">
              <p className="label text-ember">Take your seat</p>
              <h2 className="mt-4 max-w-[20ch] font-display text-hero">
                Join the community and gather this week.
              </h2>
              <p className="measure mt-5 text-quiet">
                Tell the team where you are and how long you have been walking with
                God. Someone will send the session links.
              </p>
              <div className="mt-8">
                <SocialLinks />
              </div>
              <p className="mt-4 text-xs text-quiet">
                WhatsApp and Telegram invites are sent on request while the public
                invites are being refreshed.
              </p>
            </div>

            <div className="md:col-span-4 md:col-start-9 md:text-right">
              <Seal size={120} idKey="home-join" className="ml-auto" />
              <p className="mt-6 text-sm text-quiet">
                New here? Write first and an admin will answer.
              </p>
              <Link href="/contact" className="link-quiet mt-2 inline-block text-sm font-semibold text-ink">
                Contact the fellowship
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
