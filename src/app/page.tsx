import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Flame,
  Globe,
  GraduationCap,
  HandHeart,
  Quote,
  Sparkles,
  Video,
} from "lucide-react";
import { Crest } from "@/components/Crest";
import { NextGathering } from "@/components/NextGathering";
import { Timetable } from "@/components/Timetable";
import { TeachingCard } from "@/components/TeachingCard";
import { SocialLinks } from "@/components/SocialLinks";
import { EnrolmentBanner } from "@/components/EnrolmentBanner";
import { Reveal } from "@/components/Reveal";
import { teachingOfTheWeek, teachings } from "@/content/teachings";
import { site } from "@/config/site";
import { training } from "@/content/ministry";

const systems = [
  {
    number: "01",
    title: "Word",
    icon: BookOpen,
    body: "Teaching that opens the Scriptures and trains you to hear God's voice, book by book and topic by topic.",
  },
  {
    number: "02",
    title: "Worship",
    icon: Flame,
    body: "Gathering to bless His name before we ask for anything.",
  },
  {
    number: "03",
    title: "Prayer",
    icon: HandHeart,
    body: "A people who intercede, together, consistently.",
  },
];

const strip = [
  {
    src: "/images/eagle-gold.webp",
    alt: "An eagle in profile, gold against a dark sky",
    caption: "Sight",
    note: "The eagle sees what the flock cannot.",
  },
  {
    src: "/images/shofar-sunset.webp",
    alt: "A shofar raised within a prayer shawl at sunset",
    caption: "The trumpet",
    note: "A clear sound, not an uncertain one.",
  },
  {
    src: "/images/praying-man.webp",
    alt: "A believer praying with clasped hands in low light",
    caption: "Intercession",
    note: "Prayer is the work, not the warm-up.",
  },
];

export default function HomePage() {
  const featured = teachings.find((t) => t.slug === teachingOfTheWeek) ?? teachings[0];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink text-parchment">
        <div className="absolute inset-0">
          <Image
            src="/images/desert-walk.webp"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[65%_35%] opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/92 to-ink/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/70" />
        </div>

        <div className="wrap relative grid gap-12 py-16 lg:grid-cols-12 lg:gap-10 lg:py-24">
          <div className="lg:col-span-7">
            <p className="label flex items-center gap-2 text-gold">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
              Interdenominational · Founded {site.founded}
            </p>
            <h1 className="mt-6 font-display text-display">
              A community
              <br />
              of the called.
            </h1>

            <ul className="mt-9 max-w-md space-y-3 border-l border-gold/50 pl-5">
              {[
                { icon: BookOpen, text: "Taught in the Word." },
                { icon: Flame, text: "Moved by the Spirit." },
                { icon: HandHeart, text: "Built on prayer." },
              ].map((line) => (
                <li key={line.text} className="flex items-center gap-3">
                  <line.icon aria-hidden="true" className="h-4 w-4 shrink-0 text-gold" />
                  <span className="font-display text-xl leading-snug text-parchment/90 sm:text-2xl">
                    {line.text}
                  </span>
                </li>
              ))}
            </ul>

            <p className="measure mt-8 text-parchment/60">
              The School of Prophets is an interdenominational prophetic
              fellowship, led by {site.leader}, gathering online every week.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/gatherings" className="btn btn-gold">
                <Video aria-hidden="true" className="h-4 w-4" />
                Join a gathering
              </Link>
              <Link href="/training" className="btn btn-outline">
                <GraduationCap aria-hidden="true" className="h-4 w-4" />
                Explore the training
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 lg:pl-6">
            <NextGathering />
            <p className="mt-4 text-xs leading-relaxed text-parchment/40">
              Times are entered in WAT and converted to your own timezone. Every
              session is held online.
            </p>
          </div>
        </div>

        <div className="relative border-t border-parchment/10">
          <div className="wrap grid gap-4 py-5 text-sm text-parchment/65 sm:grid-cols-3">
            {[
              { icon: CalendarDays, label: "Founded", value: site.founded },
              { icon: Globe, label: "Scope", value: "Interdenominational" },
              { icon: Video, label: "Rhythm", value: "Gathering weekly, online" },
            ].map((fact) => (
              <p key={fact.label} className="flex items-center gap-3">
                <fact.icon aria-hidden="true" className="h-4 w-4 shrink-0 text-gold" />
                <span>
                  <span className="label mr-2 text-parchment/40">{fact.label}</span>
                  {fact.value}
                </span>
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="wrap grid gap-12 py-16 md:grid-cols-12 md:items-center md:py-24">
        <div className="md:col-span-7">
          <p className="label flex items-center gap-2 text-ember">
            <BookOpen aria-hidden="true" className="h-3.5 w-3.5" />
            Who we are
          </p>
          <Reveal>
            <h2 className="mt-4 max-w-[24ch] font-display text-hero">
              We are saints from different churches and cities, bound by love and
              united by one Spirit.
            </h2>
          </Reveal>
          <div className="mt-8 grid max-w-3xl gap-6 text-quiet sm:grid-cols-2">
            <p>
              We come to hear God clearly, to grow into what He has called us to
              be, and to stand in prayer for one another.
            </p>
            <p>
              Founded on {site.founded} as an interdenominational mandate for the
              whole body of Christ, we stay in our local churches and gather here
              to be taught, to worship and to intercede.
            </p>
          </div>
          <Link
            href="/about"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
          >
            Read our story and vision
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <div className="md:col-span-5">
          <figure>
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="/images/prayer-cathedral.webp"
                alt="A believer at prayer in a cathedral, light falling through the windows"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            <figcaption className="label mt-3 flex items-center gap-2 text-quiet">
              <HandHeart aria-hidden="true" className="h-3.5 w-3.5 text-ember" />
              A people who intercede
            </figcaption>
          </figure>
        </div>
      </section>

      {/* IMAGE STRIP */}
      <section aria-label="The fellowship in image" className="border-y border-ink/15 bg-parchment-2/60">
        <div className="wrap grid gap-4 py-10 sm:grid-cols-3">
          {strip.map((item) => (
            <figure key={item.caption} className="group relative overflow-hidden">
              <div className="relative aspect-[4/5] w-full sm:aspect-[3/4]">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 30vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 p-4 text-parchment">
                <p className="font-display text-xl leading-tight">{item.caption}</p>
                <p className="mt-1 text-xs text-parchment/70">{item.note}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* THREE SYSTEMS */}
      <section className="bg-ink text-parchment">
        <div className="wrap py-16 md:py-24">
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <p className="label flex items-center gap-2 text-gold md:col-span-3">
              <Crest className="h-6 w-auto" decorative />
              The three systems
            </p>
            <h2 className="font-display text-hero md:col-span-9">
              Everything here rests on three things.
            </h2>
          </div>

          <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-3 md:gap-8">
            {systems.map((system, index) => (
              <div
                key={system.number}
                className={`border-t border-parchment/20 pt-6 ${
                  index === 1 ? "md:mt-14" : index === 2 ? "md:mt-7" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className="font-display text-6xl leading-none text-gold/80">
                    {system.number}
                  </p>
                  <system.icon
                    aria-hidden="true"
                    className="h-8 w-8 text-parchment/35"
                    strokeWidth={1.2}
                  />
                </div>
                <h3 className="mt-5 font-display text-3xl">{system.title}</h3>
                <p className="mt-3 max-w-[38ch] text-sm leading-relaxed text-parchment/60">
                  {system.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THIS WEEK */}
      <section id="this-week" className="wrap grid gap-12 py-16 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="label flex items-center gap-2 text-ember">
            <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
            This week
          </p>
          <Reveal>
            <h2 className="mt-4 font-display text-hero">The rhythm of the week.</h2>
          </Reveal>
          <p className="measure mt-5 text-sm leading-relaxed text-quiet">
            Session links and notices are posted in the community. Bring your
            Bible, and come ready to take part rather than watch.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/gatherings" className="btn btn-outline">
              <CalendarDays aria-hidden="true" className="h-4 w-4" />
              The full week
            </Link>
            <a href="/schedule.ics" download className="btn btn-outline">
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              Add to calendar
            </a>
          </div>
        </div>
        <div className="lg:col-span-8">
          <Timetable />
          <p className="mt-4 text-xs leading-relaxed text-quiet">
            * Awaiting confirmation from the ministry. Times shown in WAT
            (Africa/Lagos), converted to your device&apos;s timezone.
          </p>
        </div>
      </section>

      {/* TEACHING OF THE WEEK */}
      <section className="border-y border-ink/15 bg-parchment-2/70">
        <div className="wrap grid gap-10 py-16 md:grid-cols-12 md:py-20">
          <div className="md:col-span-3">
            <p className="label flex items-center gap-2 text-ember">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
              Teaching of the week
            </p>
            <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-quiet">
              A new teaching from the library every week, with the written outline
              alongside the recording.
            </p>
            <Link
              href="/teachings"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
            >
              The whole library
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <div className="md:col-span-9">
            <TeachingCard teaching={featured} featured />
          </div>
        </div>
      </section>

      {/* TRAINING */}
      <section className="bg-ink-2 text-parchment">
        <div className="wrap grid items-center gap-10 py-16 md:grid-cols-12 md:py-24">
          <div className="relative aspect-[4/3] overflow-hidden md:col-span-5 md:aspect-[4/5]">
            <Image
              src="/images/potter.webp"
              alt="A potter shaping a vessel on the wheel while an elder watches"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
            <p className="label absolute bottom-4 left-4 text-parchment/70">
              Formed, not improvised
            </p>
          </div>

          <div className="md:col-span-7 md:pl-6">
            <p className="label flex items-center gap-2 text-gold">
              <GraduationCap aria-hidden="true" className="h-3.5 w-3.5" />
              The Bible institute
            </p>
            <h2 className="mt-4 max-w-[22ch] font-display text-hero">
              Called into ministry? Don&apos;t guess your way into it.
            </h2>
            <p className="measure mt-5 text-parchment/65">{training.intro}</p>
            <div className="mt-7 max-w-md">
              <EnrolmentBanner />
            </div>
          </div>
        </div>
      </section>

      {/* PULL QUOTE */}
      <section className="relative overflow-hidden bg-parchment py-16 md:py-24">
        <Crest
          className="pointer-events-none absolute -right-10 top-0 w-64 opacity-[0.05] md:w-96"
          decorative
        />
        <div className="wrap relative">
          <figure className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-2">
              <Quote aria-hidden="true" className="h-10 w-10 text-gold" strokeWidth={1.2} />
            </div>
            <blockquote className="md:col-span-10">
              <p className="max-w-[32ch] font-display text-2xl leading-[1.15] sm:text-4xl">
                One of the reasons God sent prophets was simply because He loves
                His people.
              </p>
              <figcaption className="label mt-6 text-quiet">
                {site.leader} · 5th Anniversary teaching, 19 September 2026
              </figcaption>
            </blockquote>
          </figure>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="relative overflow-hidden bg-ink text-parchment">
        <div className="wrap grid items-stretch gap-10 py-16 md:grid-cols-12 md:py-0">
          <div className="md:col-span-6 md:py-24">
            <p className="label flex items-center gap-2 text-gold">
              <HandHeart aria-hidden="true" className="h-3.5 w-3.5" />
              Take your seat
            </p>
            <h2 className="mt-4 max-w-[20ch] font-display text-hero">
              Join the community and gather with us this week.
            </h2>
            <p className="measure mt-5 text-parchment/60">
              Tell us where you are and how long you have been walking with God.
              Someone will welcome you in and send the session links.
            </p>
            <div className="mt-8">
              <SocialLinks />
            </div>
            <p className="mt-4 text-xs text-parchment/40">
              WhatsApp and Telegram invite links are sent on request while the
              public invites are being refreshed.
            </p>
          </div>

          <div className="relative md:col-span-6 md:min-h-[30rem]">
            <Image
              src="/images/worship-hands.webp"
              alt="A young believer worshipping with raised hands, tears on his face"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top opacity-90"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/20 to-transparent md:from-ink" />
            <div className="absolute bottom-5 right-5 hidden items-center gap-2 md:flex">
              <Crest className="h-10 w-auto opacity-80" decorative />
              <span className="label text-parchment/60">Watchers · Dan 4:17</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
