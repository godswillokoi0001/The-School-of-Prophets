import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { TestimonyForm } from "@/components/forms/TestimonyForm";
import { testimonies, testimonyNote } from "@/content/testimonies";
import { formatDate } from "@/lib/time";
import { Quote, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Testimonies",
  description:
    "What God is doing among the members of The School of Prophets. Testimonies are shared only with written consent and reviewed before publication.",
  alternates: { canonical: "/testimonies" },
};

export default function TestimoniesPage() {
  return (
    <>
      <PageHeader
        label="Testimonies"
        title="What God is doing."
        lead="We believe in telling what God has done. These are shared with permission, in the member's own words, and nothing is edited to make it larger than it was."
        image="/images/worship-hands.webp"
        imageAlt="A believer worshipping with raised hands"
      />

      <section className="wrap py-14 md:py-20">
        <div className="flex items-start gap-3 border border-ink/15 bg-parchment-2/50 p-4">
          <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
          <p className="text-xs leading-relaxed text-quiet">
            {testimonyNote} Entries below are labelled accordingly.
          </p>
        </div>

        <ul className="mt-10">
          {testimonies.map((testimony) => (
            <li
              key={testimony.id}
              className="grid gap-5 border-t border-ink/15 py-10 md:grid-cols-12"
            >
              <div className="md:col-span-3">
                <p className="label text-ember">{testimony.name}</p>
                <p className="mt-2 text-xs text-quiet">
                  {testimony.location ? `${testimony.location} · ` : ""}
                  {formatDate(testimony.date)}
                </p>
                {testimony.isSample && (
                  <p className="mt-3">
                    <span className="tag text-quiet">Sample entry</span>
                  </p>
                )}
              </div>
              <blockquote className="md:col-span-9">
                <Quote
                  aria-hidden="true"
                  className="mb-3 h-6 w-6 text-gold"
                  strokeWidth={1.4}
                />
                <p className="max-w-[62ch] font-display text-xl leading-snug text-ink/90">
                  &ldquo;{testimony.body}&rdquo;
                </p>
              </blockquote>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-ink/15 bg-parchment-2/70" id="share">
        <div className="wrap grid gap-10 py-16 md:grid-cols-12 md:py-20">
          <div className="md:col-span-4">
            <p className="label text-ember">Share yours</p>
            <h2 className="mt-4 font-display text-3xl">Tell what He has done.</h2>
            <p className="mt-4 text-sm leading-relaxed text-quiet">
              Submissions are held privately and reviewed before anything is
              published. We will confirm the wording with you first.
            </p>
            <ul className="mt-6 space-y-3 text-xs leading-relaxed text-quiet">
              <li>· You choose the name we publish, or none at all.</li>
              <li>· Your email is only used to confirm the wording.</li>
              <li>· Nothing is published without the consent box ticked.</li>
            </ul>
          </div>
          <div className="md:col-span-8">
            <div className="border border-ink/15 bg-parchment p-6 sm:p-8">
              <TestimonyForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
