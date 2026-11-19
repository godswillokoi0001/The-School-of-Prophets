import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { NewsletterSubscribe } from "@/components/NewsletterSubscribe";
import { getServiceClient, supabaseConfigured } from "@/lib/supabase/server";
import { formatDate } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The letter",
  description:
    "A weekday devotion, a note when a new teaching is published, and the weekly letter from The School of Prophets.",
  alternates: { canonical: "/newsletter" },
};

type PastBroadcast = {
  id: string;
  subject: string;
  body: string;
  sent_at: string | null;
  created_at: string;
};

function plainText(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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
      // No archive table yet; the page still works without one.
    }
  }

  return (
    <>
      <PageHeader
        label="The letter"
        title="A short word each weekday."
        lead="A devotion of a few minutes in the morning, a note when a new teaching is published, and the weekly letter. No other email is sent."
      />

      <section className="bg-ink text-parchment">
        <div className="wrap py-10 md:py-12">
          <NewsletterSubscribe variant="inline" />
        </div>
      </section>

      <section className="wrap py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-3">
            <p className="label text-ember">The archive</p>
            <p className="mt-3 text-sm leading-relaxed text-quiet">
              Every letter sent to the fellowship, newest first.
            </p>
          </div>

          <div className="md:col-span-9">
            {archives.length > 0 ? (
              <ul>
                {archives.map((letter) => (
                  <li key={letter.id} className="border-t border-ink/15 py-6">
                    <p className="text-xs uppercase tracking-[0.12em] text-quiet">
                      {formatDate(letter.sent_at ?? letter.created_at)}
                    </p>
                    <h2 className="mt-1.5 font-display text-2xl leading-snug">
                      {letter.subject}
                    </h2>
                    <p className="measure mt-2 text-sm leading-relaxed text-quiet">
                      {plainText(letter.body).slice(0, 220)}
                      {plainText(letter.body).length > 220 ? "…" : ""}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="border-y border-ink/15 py-10">
                <p className="font-display text-2xl">The archive is empty for now.</p>
                <p className="measure mt-2 text-sm leading-relaxed text-quiet">
                  Letters sent to the fellowship will be kept here, newest first. Subscribe above and the next one will arrive by email.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
