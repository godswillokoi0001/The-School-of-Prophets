import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { NextGathering } from "@/components/NextGathering";
import { Timetable } from "@/components/Timetable";
import { SocialLinks } from "@/components/SocialLinks";
import { BookOpen, Flame, HandHeart, CalendarPlus } from "lucide-react";
import { covenant } from "@/content/faq";
import { scheduleNote } from "@/content/schedule";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Weekly Gatherings",
  description:
    "The weekly rhythm of The School of Prophets: Monday teaching, Wednesday Bible study, prayer nights and weekend exhortation. Online, times in WAT and converted to yours.",
  alternates: { canonical: "/gatherings" },
  openGraph: {
    title: "Weekly Gatherings | The School of Prophets",
    description:
      "Every week we meet online to be taught, to worship and to pray. See the schedule, converted to your timezone.",
    url: "/gatherings",
  },
};

export default function GatheringsPage() {
  return (
    <>
      <PageHeader
        label="Weekly gatherings"
        title="Every week, we meet."
        lead="All sessions are held online. Times are in West Africa Time (WAT); we convert them to your timezone automatically, because our members gather from Nigeria, Zambia and further afield."
        aside={<NextGathering tone="light" />}
        image="/images/worship-hands.webp"
        imageAlt="A member of the fellowship worshipping with raised hands"
      />

      <section id="timetable" className="wrap grid gap-12 py-16 md:py-20 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <p className="label text-ember">The timetable</p>
          <p className="mt-3 text-sm leading-relaxed text-quiet">
            Monday is the heaviest teaching night. Wednesday is Bible study.
            Prayer runs through the rest of the week.
          </p>
          <a href="/schedule.ics" download className="btn btn-outline mt-6">
            <CalendarPlus aria-hidden="true" className="h-4 w-4" />
            Download .ics
          </a>
        </div>

        <div className="lg:col-span-9">
          <Timetable />
          <p className="mt-5 max-w-[70ch] text-xs leading-relaxed text-quiet">
            {scheduleNote}{" "}
            <Link href="/contact" className="underline underline-offset-4">
              Message us
            </Link>{" "}
            if you need the time in your city before it is published here.
          </p>
        </div>
      </section>

      {/* WHAT TO EXPECT */}
      <section id="expect" className="border-y border-ink/15 bg-parchment-2/70">
        <div className="wrap grid gap-10 py-16 md:grid-cols-12 md:py-20">
          <div className="md:col-span-4">
            <p className="label text-ember">What to expect</p>
            <h2 className="mt-4 font-display text-3xl">An hour, in order.</h2>
          </div>
          <div className="md:col-span-8">
            <ol className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  title: "Worship",
                  icon: Flame,
                  body: "We open with worship and thanksgiving, before anything is asked of God.",
                },
                {
                  title: "The Word",
                  icon: BookOpen,
                  body: "A full teaching, not a devotional. Bring a Bible and something to write on.",
                },
                {
                  title: "Prayer",
                  icon: HandHeart,
                  body: "We close in prayer, and stay for those who need ministry.",
                },
              ].map((part, i) => (
                <li key={part.title} className="border-t border-ink/20 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="label text-quiet">Part {i + 1}</p>
                    <part.icon aria-hidden="true" className="h-4 w-4 text-ember" />
                  </div>
                  <p className="mt-2 font-display text-xl">{part.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-quiet">{part.body}</p>
                </li>
              ))}
            </ol>
            <p className="measure mt-8 text-sm leading-relaxed text-quiet">
              You are encouraged to take part, not just watch. React to the
              teachings, ask questions, and pray aloud if you are able.
            </p>
          </div>
        </div>
      </section>

      {/* HOW TO JOIN */}
      <section className="wrap grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-6">
          <p className="label text-ember">How to join</p>
          <h2 className="mt-4 font-display text-hero">
            The link is posted in the community.
          </h2>
          <p className="measure mt-5 text-sm leading-relaxed text-quiet">
            Join the WhatsApp community, where session links and notices are
            posted before every gathering. Telegram and the Facebook group carry
            the same notices for members who prefer them.
          </p>
          <div className="mt-7">
            <SocialLinks />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-quiet">
            Invite links are refreshed periodically. If a link is closed, request
            one and an admin will send it to you.
          </p>
        </div>

        <div className="md:col-span-6 md:pl-8">
          <div className="border border-ink/15 p-6">
            <p className="label text-quiet">Between gatherings</p>
            <p className="mt-3 text-sm leading-relaxed text-ink/80">
              Teachings are uploaded to YouTube, and written outlines are kept in
              the library here so you can follow a series from the beginning.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/teachings" className="btn btn-outline">
                Teaching library
              </Link>
              <a
                href={site.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                YouTube channel
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* COVENANT */}
      <section id="covenant" className="bg-ink text-parchment">
        <div className="wrap py-16 md:py-24">
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <p className="label text-gold md:col-span-3">Our covenant</p>
            <h2 className="max-w-[26ch] font-display text-hero md:col-span-9">
              Four commitments that keep this house in order.
            </h2>
          </div>

          <div className="mt-12 grid gap-10 md:grid-cols-2">
            {covenant.map((rule, i) => (
              <div key={rule.title} className="border-t border-parchment/20 pt-5">
                <p className="label text-gold/70">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-2xl">{rule.title}</h3>
                <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-parchment/60">
                  {rule.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
