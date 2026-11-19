import type { Metadata } from "next";
import Link from "next/link";
import { BetaFeedbackForm } from "@/components/BetaFeedbackForm";
import { BETA_SITE_URL } from "@/lib/beta";
import { betaAccepting } from "@/lib/beta-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "You're among the first",
  description:
    "A quiet invitation to the members of the fellowship: test the new School of Prophets site and tell us the truth about it.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/beta-testers" },
  openGraph: {
    type: "website",
    title: "You're among the first — The School of Prophets",
    description:
      "Test the new site. Tell us the truth. Every review is read by the team.",
    url: "/beta-testers",
    siteName: "The School of Prophets",
  },
  twitter: {
    card: "summary_large_image",
    title: "You're among the first — The School of Prophets",
    description: "Test the new site. Tell us the truth. Every review is read by the team.",
  },
};

const THINGS_TO_TRY = [
  "Look at the weekly gatherings and the timetable.",
  "Open a teaching and read or listen for a minute.",
  "Send a prayer request, even a short one.",
  "Try booking a call and see how the times read.",
  "Open an event and check the details.",
  "Switch between your phone and a computer.",
];

export default async function BetaTestersPage() {
  const open = await betaAccepting();

  return (
    <>
      <header className="border-b border-ink/15">
        <div className="wrap max-w-4xl pb-12 pt-12 md:pb-16 md:pt-16">
          <div>
            <p className="label text-ember">Beta · Invited testers</p>
            <h1 className="mt-5 font-display text-hero">You&rsquo;re among the first.</h1>
            <div className="measure mt-6 space-y-4 text-lg leading-relaxed text-quiet">
              <p>
                Thank you for saying yes. This site is still new, and most of the people
                who will one day use it have not seen it yet.
              </p>
              <p>
                Your honest review will shape what it becomes — what stays, what changes,
                what is missing. It takes about five minutes. Only your name and email are
                required; everything else is yours to skip.
              </p>
            </div>

            <div className="mt-8 border-t border-ink/15 pt-5 max-w-2xl">
              <p className="text-sm leading-relaxed text-ink/85">
                Please test the site first:{" "}
                <a
                  href={BETA_SITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-quiet font-semibold text-ember"
                >
                  open it in a new tab
                </a>
                .
              </p>
              <details className="group mt-3">
                <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-quiet hover:text-ink">
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                  Things to try, if it helps
                </summary>
                <ul className="mt-3 space-y-1.5 pl-5 text-sm leading-relaxed text-quiet">
                  {THINGS_TO_TRY.map((item) => (
                    <li key={item} className="list-disc">
                      {item}
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </div>
        </div>
      </header>

      <section className="wrap grid gap-12 py-12 md:py-16 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {open ? (
            <BetaFeedbackForm />
          ) : (
            <div className="max-w-[58ch] border-t border-ink/20 pt-8">
              <p className="label text-ember">The beta has closed</p>
              <h2 className="mt-4 font-display text-title">Thank you for standing with us.</h2>
              <p className="mt-4 text-base leading-relaxed text-quiet">
                We are no longer collecting reviews. Everything already sent has been
                read, and the site you see now carries much of it. If something still
                needs saying, write to the team directly.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/contact" className="btn btn-gold">
                  Write to the team
                </Link>
                <Link href="/" className="btn btn-outline">
                  Back to the site
                </Link>
              </div>
            </div>
          )}
        </div>

        <aside className="lg:col-span-3 lg:col-start-10">
          <div className="border-t border-ink/20 pt-5">
            <p className="label text-ember">A quiet promise</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">
              Your answers go only to the School of Prophets team. They are not sold,
              shared, or used for advertising, and they are never published without your
              written permission.
            </p>
          </div>
          <div className="mt-8 border-t border-ink/20 pt-5">
            <p className="label text-ember">What happens next</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">
              The team reads every review. If you reported something broken, we will look
              at it that week, and write to you if it is fixed.
            </p>
          </div>
          <div className="mt-8 border-t border-ink/20 pt-5">
            <p className="label text-ember">Would you rather talk?</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">
              A short call is sometimes easier than writing.
            </p>
            <Link href="/book" className="link-quiet mt-3 inline-block text-sm font-semibold">
              Book a call
            </Link>
          </div>
        </aside>
      </section>
    </>
  );
}
