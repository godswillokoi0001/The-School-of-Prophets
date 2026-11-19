import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarPlus } from "lucide-react";
import { Seal } from "@/components/Seal";
import { Cover } from "@/components/Cover";
import { NextGathering } from "@/components/NextGathering";
import { Timetable } from "@/components/Timetable";
import { EnrolmentBanner } from "@/components/EnrolmentBanner";
import { SocialLinks } from "@/components/SocialLinks";
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
  const [teachings, schedule, seriesList, contact, enrolment, homeSetting, exceptions, mediaMeta] =
    await Promise.all([
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
  void mediaMeta;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-paper">
        <div className="wrap grid gap-10 py-12 md:py-16 lg:grid-cols-12 lg:items-start lg:gap-12 lg:py-20">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-parchment px-3 py-1 text-[0.75rem] font-medium text-quiet">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold" />
              Interdenominational · Founded {site.founded}
            </p>

            <h1 className="mt-5 font-display text-display text-ink">
              A community of the called.
            </h1>

            <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-quiet">
              Planted in the word, moved by the Spirit, built on prayer. An online
              fellowship led by {site.leader}, gathering from Nigeria, Zambia and
              beyond.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/gatherings" className="btn btn-ink">
                Join a gathering
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link href="/teachings" className="btn btn-outline">
                Read a teaching
              </Link>
            </div>

            <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-5">
              {[
                ["Founded", site.founded],
                ["Rhythm", "Weekly, online"],
                ["Watchword", "Daniel 4:17"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-quiet">
                    {label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-5">
            <NextGathering
              tone="light"
              sessions={schedule}
              joinHref={contact.whatsapp || undefined}
            />
            <p className="mt-3 text-xs leading-relaxed text-quiet">
              Every session is online. Times are kept in WAT and shown in your own
              timezone.
            </p>
          </div>
        </div>

        <div className="wrap pb-10 md:pb-14">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-line md:aspect-[21/9]">
            <Image
              src="/images/desert-walk.webp"
              alt="A man walking a desert road at sunrise"
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="object-cover object-[65%_45%]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-5 text-parchment sm:p-7">
              <p className="max-w-[34ch] font-display text-lg font-semibold leading-snug sm:text-2xl">
                “The most High ruleth in the kingdom of men.”
              </p>
              <p className="text-[0.7rem] uppercase tracking-[0.1em] text-parchment/70">
                Daniel 4:17
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who we are */}
      {show.intro && (
        <section className="wrap section-space grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <p className="label text-ember">The fellowship</p>
            <h2 className="mt-3 max-w-[24ch] font-display text-hero">
              Saints from different churches and cities, bound by love and united by
              one Spirit.
            </h2>
            <div className="mt-6 grid gap-5 text-quiet sm:grid-cols-2">
              <p>
                We come to hear God clearly, to grow into what He has called us to be,
                and to stand in prayer for one another.
              </p>
              <p>
                Founded on {site.founded} as an interdenominational mandate for the
                whole body of Christ. We stay in our local churches and gather here
                to be taught.
              </p>
            </div>
            <Link
              href="/about"
              className="link-quiet mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink"
            >
              The story and the vision
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>

          <figure className="card p-6 sm:p-8 lg:col-span-5">
            <Seal size={56} idKey="home-intro" />
            <blockquote className="mt-5">
              <p className="text-xl font-medium leading-snug tracking-[-0.02em] text-ink">
                “The most High ruleth in the kingdom of men, and giveth it to
                whomsoever he will.”
              </p>
              <figcaption className="mt-4 text-xs text-quiet">
                Daniel 4:17 · the fellowship&apos;s watchword
              </figcaption>
            </blockquote>
          </figure>
        </section>
      )}

      {/* Three systems */}
      {show.systems && (
        <section className="border-y border-line bg-paper">
          <div className="wrap section-space">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="label text-ember">The three systems</p>
                <h2 className="mt-3 max-w-[22ch] font-display text-hero">
                  Everything here rests on three things.
                </h2>
              </div>
              <Link href="/about" className="link-quiet text-sm text-quiet">
                How the house is ordered
              </Link>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {systems.map((system) => (
                <article key={system.number} className="card card-hover p-6">
                  <p className="text-2xl font-semibold tabular-nums text-gold">
                    {system.number}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight">{system.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-quiet">{system.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* The week */}
      {show.week && (
        <section className="wrap section-space">
          <div className="card p-5 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="label text-ember">This week</p>
                <h2 className="mt-2 font-display text-hero">The week, in WAT.</h2>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="/schedule.ics"
                  download
                  className="inline-flex items-center gap-2 text-sm text-quiet hover:text-ink"
                >
                  <CalendarPlus aria-hidden="true" className="h-4 w-4" />
                  Add the week to your calendar
                </a>
                <Link href="/gatherings" className="btn btn-outline">
                  What an evening looks like
                </Link>
              </div>
            </div>

            <div className="mt-7">
              <Timetable sessions={schedule} exceptions={exceptions} />
            </div>

            <p className="mt-4 max-w-[64ch] text-xs leading-relaxed text-quiet">
              Times marked * await the ministry&apos;s confirmation. Links are posted
              in the community before each session.
            </p>
          </div>
        </section>
      )}

      {/* Featured teaching */}
      {show.teaching && featured && (
        <section className="border-y border-line bg-paper">
          <div className="wrap section-space">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="label text-ember">Start with this teaching</p>
                <h2 className="mt-2 font-display text-hero">Recent from the house.</h2>
              </div>
              <Link href="/teachings" className="btn btn-outline">
                All teachings
              </Link>
            </div>

            <article className="card mt-7 grid gap-6 overflow-hidden lg:grid-cols-12 lg:gap-0">
              {featured.image && (
                <div className="relative aspect-[16/10] bg-ink-2 lg:col-span-5 lg:aspect-auto lg:min-h-[22rem]">
                  <Cover
                    src={featured.image}
                    alt={featured.imageAlt || featured.title}
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    fit="contain"
                  />
                </div>
              )}
              <div
                className={`p-6 sm:p-8 ${
                  featured.image ? "lg:col-span-7" : "lg:col-span-12"
                }`}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-quiet">
                  <span className="font-medium text-ember">{seriesTitle ?? "Teaching"}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDate(featured.date)}</span>
                  {featured.scripture && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{featured.scripture}</span>
                    </>
                  )}
                </div>
                <h3 className="mt-3 max-w-[24ch] text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                  <Link href={`/teachings/${featured.slug}`} className="link-quiet">
                    {featured.title}
                  </Link>
                </h3>
                <p className="measure mt-3 text-sm leading-relaxed text-quiet">
                  {featured.summary}
                </p>
                <Link
                  href={`/teachings/${featured.slug}`}
                  className="btn btn-ink mt-6"
                >
                  Read the outline
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </article>

            {recent.length > 0 && (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {recent.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/teachings/${t.slug}`}
                    className="card card-hover group p-5"
                  >
                    <p className="text-xs text-quiet">{formatDate(t.date)}</p>
                    <h3 className="mt-2 text-base font-semibold leading-snug tracking-tight group-hover:text-ember">
                      {t.title}
                    </h3>
                    <p className="mt-2 text-xs text-quiet">{t.scripture}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Training */}
      {show.training && (
        <section className="wrap section-space">
          <div className="rounded-2xl bg-ink p-6 text-parchment sm:p-10">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <p className="label text-gold-soft/80">The Bible institute</p>
                <h2 className="mt-3 max-w-[24ch] font-display text-hero">
                  Called into ministry? Don&apos;t guess your way into it.
                </h2>
                <p className="measure mt-4 text-sm leading-relaxed text-parchment/70">
                  {training.intro}
                </p>
                <p className="measure mt-3 text-sm leading-relaxed text-parchment/60">
                  {training.enrolmentNote}
                </p>
                <Link
                  href="/training"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold-soft hover:text-parchment"
                >
                  Read the syllabus
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>

              <div className="lg:col-span-5">
                <EnrolmentBanner status={enrolment.status} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* The Prophet */}
      <section className="border-t border-line bg-paper">
        <div className="wrap section-space grid gap-8 lg:grid-cols-12 lg:items-center">
          <figure className="lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-ink sm:aspect-[4/5]">
              <Image
                src="/images/prophet-portrait.webp"
                alt="Prophet Lawrence Iwara, founder and overseer of The School of Prophets"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-top"
              />
            </div>
            <figcaption className="mt-3 text-xs text-quiet">
              Prophet Lawrence Iwara · founder and overseer
            </figcaption>
          </figure>

          <div className="lg:col-span-6 lg:col-start-7">
            <p className="label text-ember">In his own words</p>
            <blockquote className="mt-4">
              <p className="max-w-[24ch] text-2xl font-medium leading-snug tracking-[-0.025em] sm:text-3xl">
                “One of the reasons God sent prophets was simply because He loves His
                people.”
              </p>
              <footer className="mt-4 text-xs text-quiet">
                From the 5th Anniversary teaching, 19 September 2026
              </footer>
            </blockquote>
            <p className="measure mt-5 text-sm leading-relaxed text-quiet">
              He teaches weekly, trains those called into ministry at the Bible
              institute, and shepherds the fellowship in prayer.
            </p>
            <Link
              href="/about#prophet"
              className="link-quiet mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink"
            >
              Meet the Prophet
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Join */}
      {show.cta && (
        <section className="wrap pb-16 md:pb-24">
          <div className="card grid gap-8 p-6 sm:p-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="label text-ember">Take your seat</p>
              <h2 className="mt-2 max-w-[20ch] font-display text-hero">
                Join the community and gather this week.
              </h2>
              <p className="measure mt-4 text-sm leading-relaxed text-quiet">
                Tell the team where you are and how long you have been walking with
                God. Someone will send the session links.
              </p>
              <div className="mt-6">
                <SocialLinks />
              </div>
              <p className="mt-3 text-xs text-quiet">
                WhatsApp and Telegram invites are sent on request while the public
                invites are being refreshed.
              </p>
            </div>

            <div className="lg:col-span-4 lg:col-start-9">
              <Seal size={96} idKey="home-join" />
              <p className="mt-4 text-sm text-quiet">
                New here? Write first and an admin will answer.
              </p>
              <Link href="/contact" className="btn btn-outline mt-3">
                Contact the fellowship
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
