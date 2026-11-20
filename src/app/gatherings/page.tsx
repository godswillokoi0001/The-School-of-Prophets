import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { NextGathering } from "@/components/NextGathering";
import { Timetable } from "@/components/Timetable";
import { SocialLinks } from "@/components/SocialLinks";
import { Seal } from "@/components/Seal";
import { covenant } from "@/content/faq";
import { scheduleNote } from "@/content/schedule";
import { getContactSettings, getSchedule, getScheduleExceptions } from "@/lib/data";
import { site } from "@/config/site";

export const dynamic = "force-dynamic";

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

export default async function GatheringsPage() {
  const [schedule, contact, exceptions] = await Promise.all([
    getSchedule(),
    getContactSettings(),
    getScheduleExceptions(),
  ]);

  return (
    <>
      <header className="relative isolate overflow-hidden bg-ink text-parchment">
        <div data-parallax className="absolute inset-x-0 -bottom-[6%] -top-[6%]">
          <Image
            src="/images/fellowship-gathering.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[62%_40%]"
          />
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-ink/76 md:bg-ink/55" />
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden bg-gradient-to-r from-ink/95 via-ink/65 to-ink/10 md:block"
        />
        <div className="wrap relative grid gap-12 py-14 md:grid-cols-12 md:py-20">
          <div className="md:col-span-7">
            <p className="label text-gold-soft/85">Weekly gatherings</p>
            <h1 className="mt-5 font-display text-hero">Every week, we meet.</h1>
            <p className="measure mt-6 text-parchment/60">
              All sessions are held online. Times are in West Africa Time and are
              converted to your own timezone, because members gather from Nigeria,
              Zambia and further afield.
            </p>
            <p className="mt-8 max-w-[46ch] font-display text-xl leading-snug text-parchment/80">
              Come as you are, bring a Bible, and take part rather than watch.
            </p>
          </div>

          <div className="md:col-span-5 md:pl-6">
            <NextGathering sessions={schedule} joinHref={contact.whatsapp || undefined} />
          </div>
        </div>
      </header>

      <section id="timetable" className="wrap py-16 md:py-24">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="label text-ember">The timetable</p>
            <p className="mt-3 text-sm leading-relaxed text-quiet">
              Monday carries the fullest teaching. Wednesday is Bible study. Prayer
              runs through the rest of the week.
            </p>
            <a
              href="/schedule.ics"
              download
              className="link-quiet mt-6 inline-flex items-center gap-2 text-sm text-ink"
            >
              <CalendarPlus aria-hidden="true" className="h-4 w-4 text-ember" />
              Download the calendar
            </a>
          </div>

          <div className="lg:col-span-9">
            <Timetable sessions={schedule} exceptions={exceptions} />
            <p className="mt-5 max-w-[70ch] text-xs leading-relaxed text-quiet">
              {scheduleNote}{" "}
              <Link href="/contact" className="link-quiet text-ink">
                Message the team
              </Link>{" "}
              if you need the time in your city before it is published here.
            </p>
          </div>
        </div>
      </section>

      <section id="expect" className="border-y border-ink/15 bg-paper">
        <div className="wrap grid gap-12 py-16 md:grid-cols-12 md:py-24">
          <div className="md:col-span-4">
            <p className="label text-ember">What to expect</p>
            <h2 className="mt-4 font-display text-hero">An evening, in order.</h2>
            <p className="measure mt-5 text-sm leading-relaxed text-quiet">
              Sessions run for about ninety minutes. Nothing is performed for an
              audience; the room is open for questions and for prayer.
            </p>
          </div>

          <div className="md:col-span-7 md:col-start-6">
            <ol>
              {[
                {
                  title: "Worship",
                  body: "We open with worship and thanksgiving, before anything is asked of God. Words are on screen if you do not know them.",
                },
                {
                  title: "The Word",
                  body: "A full teaching rather than a devotional, usually with an outline you can keep. Questions are taken at the end where time allows.",
                },
                {
                  title: "Prayer",
                  body: "We close in prayer and stay for anyone who needs ministry. You can leave quietly at any point; no one is put on the spot.",
                },
              ].map((part, i) => (
                <li
                  key={part.title}
                  className="grid gap-3 border-t border-ink/20 py-6 sm:grid-cols-[4rem_1fr] sm:gap-6"
                >
                  <span className="font-display text-3xl tabular-nums text-ember">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl">{part.title}</h3>
                    <p className="mt-1.5 max-w-[52ch] text-sm leading-relaxed text-quiet">
                      {part.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="wrap grid gap-12 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-6">
          <p className="label text-ember">How to join</p>
          <h2 className="mt-4 font-display text-hero">
            The link is posted in the community.
          </h2>
          <p className="measure mt-5 text-quiet">
            Join the WhatsApp community, where session links and notices are posted
            before every gathering. Telegram and the Facebook group carry the same
            notices for members who prefer them.
          </p>
          <div className="mt-7">
            <SocialLinks
              links={{
                whatsapp: contact.whatsapp,
                telegram: contact.telegram,
                facebookGroup: contact.facebookGroup,
                facebookPage: contact.facebookPage,
                youtube: contact.youtube,
              }}
            />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-quiet">
            Invite links are refreshed periodically. If a link has closed, request
            one and an admin will send it to you.
          </p>
        </div>

        <div className="md:col-span-4 md:col-start-9">
          <Seal size={110} idKey="gatherings" />
          <p className="mt-5 text-sm leading-relaxed text-quiet">
            Between gatherings, teachings go to YouTube and written outlines stay in
            the library here, so a series can be followed from its first part.
          </p>
          <div className="mt-5 flex flex-col items-start gap-3 text-sm">
            <Link href="/teachings" className="link-quiet font-semibold text-ink">
              Teaching library
            </Link>
            <a
              href={site.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="link-quiet text-quiet"
            >
              YouTube channel
            </a>
          </div>
        </div>
      </section>

      <section id="covenant" className="bg-ink text-parchment">
        <div className="wrap py-16 md:py-24">
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <p className="label text-gold-soft/85 md:col-span-3">Our covenant</p>
            <h2 className="max-w-[26ch] font-display text-hero md:col-span-9">
              Four commitments that keep this house in order.
            </h2>
          </div>

          <div className="mt-12 grid gap-x-12 gap-y-8 md:grid-cols-2">
            {covenant.map((rule, i) => (
              <div key={rule.title} className="border-t border-parchment/20 pt-5">
                <p className="label text-gold-soft/70">{String(i + 1).padStart(2, "0")}</p>
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
