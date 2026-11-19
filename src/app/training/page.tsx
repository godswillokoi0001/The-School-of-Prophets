import type { Metadata } from "next";
import Link from "next/link";
import { EnrolmentForm } from "@/components/forms/EnrolmentForm";
import { EnrolmentBanner } from "@/components/EnrolmentBanner";
import { Seal } from "@/components/Seal";
import { training } from "@/content/ministry";
import { getEnrolmentSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Training",
  description:
    "The School of Prophets Bible Institute: an intensive training for those called into ministry and believers with spiritual gifts. Cohorts open for limited periods.",
  alternates: { canonical: "/training" },
  openGraph: {
    title: "Bible Institute | The School of Prophets",
    description:
      "Intensive training for those called to the prophetic office and believers with spiritual gifts.",
    url: "/training",
  },
};

export default async function TrainingPage() {
  const enrolment = await getEnrolmentSettings();
  const isOpen = enrolment.status === "open";

  return (
    <>
      <header className="border-b border-ink/15">
        <div className="wrap grid gap-10 py-14 md:grid-cols-12 md:py-20">
          <div className="md:col-span-8">
            <p className="label text-ember">The Bible institute</p>
            <h1 className="mt-5 font-display text-hero">Trained for the call.</h1>
            <p className="measure mt-6 font-display text-lead leading-snug text-quiet">
              {training.intro}
            </p>
          </div>
          <div className="md:col-span-4 md:pl-8">
            <Seal size={140} idKey="training" className="md:ml-auto" />
          </div>
        </div>
      </header>

      <div className="wrap grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <section>
            <p className="label text-ember">Who it is for</p>
            <ul className="mt-5">
              {training.forWhom.map((item) => (
                <li
                  key={item}
                  className="border-t border-ink/15 py-4 text-[0.975rem] leading-relaxed"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-14">
            <p className="label text-ember">The syllabus</p>
            <ol className="mt-5">
              {training.syllabus.map((unit, i) => (
                <li
                  key={unit.title}
                  className="grid gap-2 border-t border-ink/15 py-6 sm:grid-cols-[3.5rem_1fr] sm:gap-5"
                >
                  <span className="font-display text-2xl tabular-nums text-ember">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="font-display text-xl leading-snug">{unit.title}</h2>
                    <p className="mt-1.5 max-w-[52ch] text-sm leading-relaxed text-quiet">
                      {unit.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-4 max-w-[60ch] text-xs leading-relaxed text-quiet">
              The syllabus is drawn from the themes taught in the fellowship and is
              awaiting the ministry&apos;s final confirmation for the next cohort.
            </p>
          </section>

          <section className="mt-14">
            <p className="label text-ember">Cost</p>
            <p className="mt-3 max-w-[54ch] text-[0.975rem] leading-relaxed">
              {enrolment.feeText || training.costs}
            </p>
            <p className="mt-3 max-w-[54ch] text-sm leading-relaxed text-quiet">
              Cost is never a reason to stay silent. If it is the obstacle, say so in
              the application and the team will respond.
            </p>
          </section>
        </div>

        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="lg:sticky lg:top-28">
            <EnrolmentBanner status={enrolment.status} showLink={false} />
            <a href="#apply" className="btn btn-gold mt-3 w-full">
              {isOpen ? "Start the application" : "Join the waitlist"}
            </a>
            <p className="mt-4 text-xs leading-relaxed text-quiet">
              {training.enrolmentNote}
            </p>
            <Link href="/contact" className="link-quiet mt-4 inline-block text-sm text-ink">
              Ask a question first
            </Link>
          </div>
        </aside>
      </div>

      <section id="apply" className="border-y border-ink/15 bg-paper">
        <div className="wrap grid gap-10 py-16 md:grid-cols-12 md:py-20">
          <div className="md:col-span-4">
            <p className="label text-ember">Enrolment</p>
            <h2 className="mt-4 font-display text-title">
              {isOpen ? "Apply for the cohort." : "Join the waitlist."}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-quiet">
              {isOpen
                ? "The application takes a few minutes. The team reads every one personally."
                : "Enrolment is closed between cohorts. The waitlist keeps your details so you are told first."}
            </p>
            <p className="mt-4 text-xs leading-relaxed text-quiet">
              We will not ask you for money in a private message, and your details
              stay with the team.
            </p>
          </div>

          <div className="md:col-span-8">
            <EnrolmentForm isOpen={isOpen} />
          </div>
        </div>
      </section>

      <section className="wrap py-12">
        <p className="max-w-[62ch] text-sm leading-relaxed text-quiet">
          After you submit, the Prophet&apos;s team reviews the application and
          replies on WhatsApp. Nothing here is decided by a form.
        </p>
      </section>
    </>
  );
}
