import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { NewsletterSubscribe } from "@/components/NewsletterSubscribe";
import { getServiceClient, supabaseConfigured } from "@/lib/supabase/server";
import { formatDate } from "@/lib/time";
import { Mail, ScrollText, Sparkles, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Newsletter & Epistles | The School of Prophets",
  description:
    "Apostolic teachings, weekly prophetic insights, and gathering notices from Prophet Lawrence and The School of Prophets fellowship.",
  alternates: { canonical: "/newsletter" },
};

type PastBroadcast = {
  id: string;
  subject: string;
  body: string;
  sent_at: string | null;
  created_at: string;
};

export default async function NewsletterPage() {
  let archives: PastBroadcast[] = [];

  if (supabaseConfigured()) {
    try {
      const svc = getServiceClient();
      if (svc) {
        const { data } = await svc
          .from("broadcasts")
          .select("id, subject, body, sent_at, created_at")
          .eq("status", "sent")
          .order("created_at", { ascending: false })
          .limit(20);
        archives = (data ?? []) as PastBroadcast[];
      }
    } catch {
      // Fallback silently if table not populated
    }
  }

  return (
    <>
      <PageHeader
        label="Epistles & Letters"
        title="The School of Prophets Newsletter"
        lead="Apostolic teachings, weekly prophetic insights, and gathering notices from Prophet Lawrence and the fellowship sent directly to your inbox."
        image="/images/bible-open.webp"
        imageAlt="An open Bible under warm light"
      />

      {/* SUBSCRIBE SECTION */}
      <section className="bg-ink text-parchment">
        <NewsletterSubscribe
          variant="banner"
          title="Subscribe to the Weekly Epistle"
          description="Enter your email to receive every new teaching, prophetic bulletin, and gathering announcement. Free of charge, no spam."
        />
      </section>

      {/* WHY SUBSCRIBE */}
      <section className="wrap py-14 md:py-20">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="border border-ink/10 bg-parchment-2/40 p-6">
            <div className="flex items-center gap-2 text-ember">
              <ScrollText className="h-5 w-5" />
              <h3 className="font-display text-lg text-ink">Apostolic Teachings</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-quiet">
              Unpack deep scriptural mysteries, prophetic protocols, and biblical doctrines taught during fellowship sessions.
            </p>
          </div>

          <div className="border border-ink/10 bg-parchment-2/40 p-6">
            <div className="flex items-center gap-2 text-ember">
              <Sparkles className="h-5 w-5" />
              <h3 className="font-display text-lg text-ink">Prophetic Insights</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-quiet">
              Receive timely pastoral exhortations, words of encouragement, and discernment for the current spiritual season.
            </p>
          </div>

          <div className="border border-ink/10 bg-parchment-2/40 p-6">
            <div className="flex items-center gap-2 text-ember">
              <CheckCircle2 className="h-5 w-5" />
              <h3 className="font-display text-lg text-ink">Gathering Notices</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-quiet">
              Never miss a Tuesday Bible Study, Friday Word of Knowledge, or special watch night prayer gathering.
            </p>
          </div>
        </div>

        {/* ARCHIVED LETTERS */}
        <div className="mt-16 border-t border-ink/15 pt-12">
          <div className="flex items-center gap-2 text-ember">
            <Mail className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-widest text-ink">
              Recent Epistles & Letters
            </span>
          </div>
          <h2 className="mt-2 font-display text-2xl text-ink">Sent from the Fellowship</h2>

          {archives.length === 0 ? (
            <div className="mt-6 border border-dashed border-ink/20 p-8 text-center">
              <p className="font-display text-base text-ink">No archived letters published yet.</p>
              <p className="mt-1 text-xs text-quiet">
                Subscribe above to receive our inaugural edition directly in your email.
              </p>
            </div>
          ) : (
            <div className="mt-6 divide-y divide-ink/10">
              {archives.map((letter) => (
                <article key={letter.id} className="py-8">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-quiet">
                    <span className="font-mono">
                      {letter.sent_at ? formatDate(letter.sent_at) : formatDate(letter.created_at)}
                    </span>
                    <span className="rounded bg-gold/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-gold">
                      Fellowship Epistle
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-xl text-ink">{letter.subject}</h3>
                  <div className="prose prose-sm mt-3 max-w-none text-quiet line-clamp-3 whitespace-pre-line">
                    {letter.body}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
