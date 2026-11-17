import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { BookingFlow } from "@/components/BookingFlow";
import { getBookingConfig } from "@/lib/booking";

export const metadata: Metadata = {
  title: "Book a call",
  description:
    "Book a counselling or prayer call, an enrolment enquiry or a ministry-guidance session with Prophet Lawrence Iwara and the TSOP team.",
  alternates: { canonical: "/book" },
};

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const { callTypes } = await getBookingConfig();
  return (
    <>
      <PageHeader
        label="Book a call"
        title="Talk with the ministry."
        lead="Choose the kind of call, pick a time that suits you, and it is confirmed by email. Times show in your own timezone."
        image="/images/prayer-cathedral.webp"
        imageAlt="A congregation at prayer in a cathedral lit by a shaft of light"
      />
      <section className="wrap py-14">
        <div className="mx-auto max-w-2xl">
          <BookingFlow
            initialTypes={callTypes.map((t) => ({
              id: t.id,
              name: t.name,
              slug: t.slug,
              description: t.description.replace(" [sample]", ""),
              duration_minutes: t.duration_minutes,
              mode: t.mode,
            }))}
          />
        </div>
      </section>
    </>
  );
}
