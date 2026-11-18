import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { CopyButton } from "@/components/CopyButton";
import { getGivingSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Giving",
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
        label="Giving"
        title="Give toward the work."
        lead={giving.intro}
      />

      <section className="wrap grid gap-12 py-14 md:py-20 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          {/* Nigerian / Domestic Bank Accounts */}
          <div>
            <h2 className="font-display text-2xl">Within Nigeria</h2>
            {hasBank ? (
              <div className="mt-4 border-t border-ink/25">
                <p className="label py-3 text-quiet">
                  Bank transfer · {bank.currency}
                </p>
                <dl>
                  {rows.map(([term, value]) => (
                    <div
                      key={term}
                      className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/12 py-4"
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
              <div className="mt-4 border-y border-ink/20 py-5">
                <p className="label text-ember">Details being confirmed</p>
                <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-quiet">
                  {giving.pendingMessage}
                </p>
                <Link href="/contact" className="btn btn-gold mt-5">
                  Ask for the account details
                </Link>
              </div>
            )}
          </div>

          {/* Foreign / International Accounts */}
          <div>
            <h2 className="font-display text-2xl">From outside Nigeria</h2>
            {hasForeign ? (
              <div className="mt-4 border-t border-ink/25">
                <p className="label py-3 text-quiet">
                  International wire · {foreign?.currency || "USD"}
                </p>
                <dl>
                  {foreignRows.map(([term, value]) => (
                    <div
                      key={term}
                      className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/12 py-4"
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
              <div className="mt-4 border-y border-ink/20 py-5">
                <p className="label text-ember">Giving from abroad</p>
                <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-quiet">
                  Partners outside Nigeria can give by card or ask the admin desk for
                  wire instructions in USD, GBP or EUR.
                </p>
                <Link href="/contact" className="btn btn-outline mt-5">
                  Ask for wire details
                </Link>
              </div>
            )}
          </div>

          {/* Paystack / Card Payment */}
          {giving.paystack.enabled && giving.paystack.link && (
            <div className="border-t border-ink/20 pt-5">
              <p className="label text-quiet">Card payment</p>
              <p className="mt-2 max-w-[52ch] text-sm text-quiet">
                Card payments are handled by Paystack and support Nigerian and
                international cards.
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
          <p className="label text-ember">A word on giving</p>
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

          <div className="mt-8 border-l border-gold pl-4">
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
