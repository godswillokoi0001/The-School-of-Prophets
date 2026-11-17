import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { CopyButton } from "@/components/CopyButton";
import { giving } from "@/content/ministry";
import { getGivingSettings } from "@/lib/data";
import { Info, Landmark, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Give",
  description:
    "Sow into the teaching, training and outreach of The School of Prophets. Bank transfer details and giving notes.",
  alternates: { canonical: "/give" },
};

export default async function GivePage() {
  const giving = await getGivingSettings();
  const bank = giving.bank;
  const hasBank = Boolean(bank.accountNumber && bank.accountName);
  const rows = (
    [
      ["Bank", bank.bankName],
      ["Account name", bank.accountName],
      ["Account number", bank.accountNumber],
      ["Sort code", bank.sortCode],
    ] as [string, string][]
  ).filter(([, value]) => Boolean(value));

  return (
    <>
      <PageHeader
        label="Giving"
        title="Sow into the work."
        lead={giving.intro}
        image="/images/eagle-gold.webp"
        imageAlt="An eagle in profile, the emblem of the fellowship"
      />

      <section className="wrap grid gap-12 py-14 md:py-20 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {hasBank ? (
            <div className="border border-ink/15">
              <p className="label flex items-center gap-2 border-b border-ink/15 px-6 py-4 text-quiet">
                <Landmark aria-hidden="true" className="h-3.5 w-3.5 text-ember" />
                Bank transfer · {bank.currency}
              </p>
              <dl>
                {rows.map(([term, value]) => (
                  <div
                    key={term}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-6 py-4 last:border-b-0"
                  >
                    <div>
                      <dt className="label text-quiet">{term}</dt>
                      <dd className="mt-1 font-display text-xl tabular-nums">{value}</dd>
                    </div>
                    <CopyButton value={value} />
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <div className="border border-ink/15 bg-parchment-2/50 p-6 sm:p-8">
              <p className="label flex items-center gap-2 text-ember">
                <Info aria-hidden="true" className="h-3.5 w-3.5" />
                Not yet published
              </p>
              <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-ink/80">
                {giving.pendingMessage}
              </p>
              <Link href="/contact" className="btn btn-gold mt-6">
                Request the details
              </Link>
              <p className="mt-4 text-xs leading-relaxed text-quiet">
                In the code, these details live in{" "}
                <code className="bg-ink/5 px-1">src/content/ministry.ts</code>. Fill
                them in once and the copy buttons appear automatically.
              </p>
            </div>
          )}

          {giving.paystack.enabled && giving.paystack.link && (
            <div className="mt-6 border border-ink/15 p-6">
              <p className="label text-quiet">Card payment</p>
              <p className="mt-2 text-sm text-quiet">
                Give securely by card through Paystack.
              </p>
              <a
                href={giving.paystack.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline mt-4"
              >
                Give by card
              </a>
            </div>
          )}
        </div>

        <aside className="lg:col-span-5 lg:pl-8">
          <p className="label flex items-center gap-2 text-ember">
            <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
            A word on giving
          </p>
          <ul className="mt-4 space-y-5">
            {giving.notes.map((note) => (
              <li
                key={note}
                className="border-t border-ink/15 pt-4 text-sm leading-relaxed text-ink/80"
              >
                {note}
              </li>
            ))}
          </ul>

          <div className="mt-8 border-l-2 border-gold pl-4">
            <p className="text-sm leading-relaxed text-quiet">
              If anyone approaches you privately asking for money in the name of
              this fellowship, stop and tell an admin. That is not how we operate.
            </p>
          </div>

          <p className="mt-8 text-xs leading-relaxed text-quiet">
            Giving is voluntary. Gatherings remain free, and no one is turned away
            for not giving.
          </p>
        </aside>
      </section>
    </>
  );
}
