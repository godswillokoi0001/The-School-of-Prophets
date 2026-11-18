import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PrayerForm } from "@/components/forms/PrayerForm";
import { Timetable } from "@/components/Timetable";
import { getSchedule } from "@/lib/data";
import { CalendarPlus } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Prayer",
  description:
    "Send a prayer request to the intercessors of The School of Prophets, or join the prayer nights. Private requests are seen only by the prayer team.",
  alternates: { canonical: "/prayer" },
};

export default async function PrayerPage() {
  const schedule = await getSchedule();
  return (
    <>
      <PageHeader
        label="Prayer"
        title="Pray with us. Or let us pray for you."
        lead="Share a request and our intercessors will stand with you. Requests marked private are seen only by the prayer team and never published on this site."
        image="/images/praying-man.webp"
        imageAlt="A believer praying with clasped hands, light across his face"
      />

      <section className="wrap grid gap-12 py-14 md:py-20 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PrayerForm />
        </div>

        <aside className="lg:col-span-5 lg:pl-6">
          <div className="border-t border-ink/20 pt-5">
            <p className="label text-ember">Privacy</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">
              Requests are delivered to the prayer team&apos;s inbox, not to a
              public page. Private requests are not shared in the group, and no
              name appears anywhere on this site without consent.
            </p>
          </div>

          <div className="mt-8 border-t border-ink/20 pt-5">
            <p className="label text-ember">Join the intercessors</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">
              Our vision includes building a Christian community of intercessors.
              If that is your burden, tell us and we will show you where to stand.
            </p>
            <Link href="/contact" className="link-quiet mt-3 inline-block text-sm font-semibold">
              Contact the team
            </Link>
          </div>

          <div className="mt-8 border-t border-ink/20 pt-5">
            <p className="label text-ember">Prayer nights</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">
              We gather to pray through the week, usually at 9:00 PM WAT. See the
              full timetable for the current pattern.
            </p>
            <Link href="/gatherings" className="link-quiet mt-3 inline-block text-sm font-semibold">
              The weekly schedule
            </Link>
          </div>
        </aside>
      </section>

      <section className="border-t border-ink/15 bg-parchment-2/70">
        <div className="wrap py-14 md:py-20">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="font-display text-3xl">When we pray</h2>
            <a href="/schedule.ics" download className="btn btn-outline">
              <CalendarPlus aria-hidden="true" className="h-4 w-4" />
              Add to calendar
            </a>
          </div>
          <div className="mt-6">
            <Timetable sessions={schedule} />
          </div>
        </div>
      </section>
    </>
  );
}
