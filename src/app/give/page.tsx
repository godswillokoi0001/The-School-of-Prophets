import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { CopyButton } from "@/components/CopyButton";
import { getGivingSettings } from "@/lib/data";
import { Globe, Info, Landmark, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Sow into the teaching, training and outreach of The School of Prophets. Domestic and international bank transfer details.",
  alternates: { canonical: "/give" },
};

export default async function GivePage() {
  const giving = await getGivingSettings();
  const bank = giving.bank;
  const foreign = (giving as Record<string, unknown>).foreignBank as {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    currency?: string;
    swiftCode?: string;
    routingNumber?: string;
    bankAddress?: string;
    notes?: string;
  } | undefined;

  const hasBank = Boolean(bank.accountNumber && bank.accountName);
  const rows = (
    [
      ["Bank", bank.bankName],
      ["Account name", bank.accountName],
      ["Account number", bank.accountNumber],
      ["Sort code", bank.sortCode],
    ] as [string, string][]
  ).filter(([, value]) => Boolean(value));

  const hasForeign = Boolean(foreign?.accountNumber && foreign?.accountName);
  const foreignRows = (
    [
      ["Bank", foreign?.bankName],
      ["Account name", foreign?.accountName],
      ["Account number / IBAN", foreign?.accountNumber],
      ["Currency", foreign?.currency || "USD"],
      ["SWIFT / BIC code", foreign?.swiftCode],
      ["Routing / Sort code", foreign?.routingNumber],
      ["Bank address", foreign?.bankAddress],
    ] as [string, string | undefined][]
  ).filter(([, value]) => Boolean(value)) as [string, string][];

  return (
    <>
      <PageHeader
        label="Giving & Stewardship"
        title="Sow into the work."
        lead={giving.intro}
        image="/images/eagle-gold.webp"
        imageAlt="An eagle in profile, the emblem of the fellowship"
      />

      <section className="wrap grid gap-12 py-14 md:py-20 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          {/* Nigerian / Domestic Bank Accounts */}
          <div>
            <h2 className="mb-3 font-display text-xl">Nigerian Bank Transfer</h2>
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
                  Details Being Updated
                </p>
                <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-ink/80">
                  {giving.pendingMessage}
                </p>
                <Link href="/contact" className="btn btn-gold mt-6">
                  Request Nigerian account details
                </Link>
              </div>
            )}
          </div>

          {/* Foreign / International Accounts */}
          <div>
            <h2 className="mb-3 font-display text-xl">International / Foreign Transfer</h2>
            {hasForeign ? (
              <div className="border border-ink/15 bg-parchment-2/20">
                <p className="label flex items-center gap-2 border-b border-ink/15 px-6 py-4 text-quiet">
                  <Globe aria-hidden="true" className="h-3.5 w-3.5 text-ember" />
                  International wire / Domiciliary · {foreign?.currency || "USD"}
                </p>
                <dl>
                  {foreignRows.map(([term, value]) => (
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
                {foreign?.notes && (
                  <div className="border-t border-ink/10 p-4 text-xs leading-relaxed text-ink/80">
                    <p className="label mb-1 text-quiet">Wire transfer instructions</p>
                    <p>{foreign.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-ink/15 bg-parchment-2/40 p-6">
                <p className="label flex items-center gap-2 text-ember">
                  <Globe aria-hidden="true" className="h-3.5 w-3.5" />
                  Giving from outside Nigeria
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink/80">
                  Partners and supporters giving from outside Nigeria can wire directly to our domiciliary accounts or give by card. Reach out to the admin desk for tailored international wire instructions (USD, GBP, EUR).
                </p>
                <Link href="/contact" className="btn btn-outline mt-4">
                  Request international wire details
                </Link>
              </div>
            )}
          </div>

          {/* Paystack / Card Payment */}
          {giving.paystack.enabled && giving.paystack.link && (
            <div className="border border-ink/15 p-6">
              <p className="label text-quiet">Card payment</p>
              <p className="mt-2 text-sm text-quiet">
                Give securely by card through Paystack. Supports Nigerian and international cards.
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
