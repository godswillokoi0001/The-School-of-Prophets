import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { EnrolmentForm } from "@/components/forms/EnrolmentForm";
import { EnrolmentBanner } from "@/components/EnrolmentBanner";
import { training } from "@/content/ministry";
import { BookOpen, Flame, HandHeart, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";

const unitIcons: LucideIcon[] = [Sparkles, BookOpen, Flame, HandHeart, ShieldCheck];

export const metadata: Metadata = {
  title: "Training",
  description:
    "The School of Prophets Bible Institute: an intensive training for those called into ministry and believers with spiritual gifts. Cohorts open for limited periods.",
  alternates: { canonical: "/training" },
  openGraph: {
    title: "Bible Institute | The School of Prophets",
    description:
      "Intensive training for those called into the prophetic office and believers with spiritual gifts.",
    url: "/training",
  },
};

export default function TrainingPage() {
  const isOpen = training.status === "open";

  return (
    <>
      <PageHeader
        label="The Bible institute"
        title="Trained for the call."
        lead={training.intro}
        aside={<EnrolmentBanner tone="light" showLink={false} />}
        image="/images/potter.webp"
        imageAlt="A potter shaping a vessel, an image of training and formation"
      />

      <section className="wrap grid gap-12 py-16 md:py-20 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="label text-ember">Who it is for</p>
          <ul className="mt-5 space-y-4">
            {training.forWhom.map((item) => (
              <li
                key={item}
                className="border-t border-ink/15 pt-4 text-sm leading-relaxed text-ink/80"
              >
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-10 border border-ink/15 p-5">
            <p className="label text-quiet">Cost</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">{training.costs}</p>
          </div>
        </div>

        <div className="lg:col-span-8">
          <p className="label text-ember">What you will learn</p>
          <ol className="mt-5">
            {training.syllabus.map((unit, i) => {
              const Icon = unitIcons[i] ?? BookOpen;
              return (
              <li
                key={unit.title}
                className="grid gap-2 border-t border-ink/15 py-5 sm:grid-cols-[3.5rem_1fr] sm:gap-4"
              >
                <span className="flex flex-col gap-1 font-display text-2xl text-ember">
                  {String(i + 1).padStart(2, "0")}
                  <Icon aria-hidden="true" className="h-4 w-4 text-ink/40" />
                </span>
                <div>
                  <p className="font-display text-xl leading-snug">{unit.title}</p>
                  <p className="mt-1 max-w-[52ch] text-sm leading-relaxed text-quiet">
                    {unit.body}
                  </p>
                </div>
              </li>
              );
            })}
          </ol>
          <p className="mt-5 max-w-[60ch] text-xs leading-relaxed text-quiet">
            The syllabus above is drawn from the themes taught in the fellowship
            and is awaiting the ministry&apos;s final confirmation for the next
            cohort.
          </p>
        </div>
      </section>

      <section className="border-y border-ink/15 bg-parchment-2/70" id="apply">
        <div className="wrap grid gap-10 py-16 md:grid-cols-12 md:py-20">
          <div className="md:col-span-4">
            <p className="label text-ember">Enrolment</p>
            <h2 className="mt-4 font-display text-3xl">
              {isOpen ? "Apply for the cohort." : "Join the waitlist."}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-quiet">
              {training.enrolmentNote}
            </p>
            <p className="mt-4 text-xs leading-relaxed text-quiet">
              {isOpen
                ? "The application takes a few minutes. The team reviews every one personally."
                : "Enrolment is closed between cohorts. The waitlist carries your details forward so you are told first."}
            </p>
            <Link
              href="/contact"
              className="link-underline mt-6 inline-block text-sm font-semibold"
            >
              Ask a question instead →
            </Link>
          </div>

          <div className="md:col-span-8">
            <div className="border border-ink/15 bg-parchment p-6 sm:p-8">
              <EnrolmentForm isOpen={isOpen} />
            </div>
          </div>
        </div>
      </section>

      <section className="wrap py-16">
        <div className="grid gap-8 border-t border-ink/15 pt-8 md:grid-cols-2">
          <div>
            <p className="label text-quiet">After you submit</p>
            <p className="mt-3 max-w-[50ch] text-sm leading-relaxed text-ink/80">
              The Prophet&apos;s team reviews every application personally and will
              message you on WhatsApp. Nothing is decided automatically.
            </p>
          </div>
          <div>
            <p className="label text-quiet">What we will not do</p>
            <p className="mt-3 max-w-[50ch] text-sm leading-relaxed text-ink/80">
              We will not ask you for money in a private message, and we will not
              pass your details to anyone outside the team.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
