import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { ContactForm } from "@/components/forms/ContactForm";
import { SocialLinks } from "@/components/SocialLinks";
import { getContactSettings, getFaqs } from "@/lib/data";
import { site } from "@/config/site";
import { Plus, Phone, Mail } from "lucide-react";
import { FacebookIcon, YouTubeIcon } from "@/components/BrandIcons";

export const metadata: Metadata = {
  title: "Contact / Join",
  description:
    "Join the WhatsApp community, Telegram or Facebook group, or send a message to the team at The School of Prophets.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Join The School of Prophets",
    description:
      "The community links, and a direct line to the team for questions about gatherings or training.",
    url: "/contact",
  },
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const [faqs, contact] = await Promise.all([getFaqs(), getContactSettings()]);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer.replace(/\[[^\]]+\]/g, "").trim() },
    })),
  };

  return (
    <>
      <PageHeader
        label="Contact / Join"
        title="Take your seat."
        lead="Join the community on WhatsApp, Telegram or the Facebook group, or send a message and an admin will answer. Tell us where you are and how long you have been walking with God."
        aside={
          <div className="card p-5">
            <p className="label text-quiet">Founded</p>
            <p className="mt-2 font-display text-xl">{site.founded}</p>
            <p className="mt-1 text-sm text-quiet">{site.crest}</p>
          </div>
        }
      />

      <section className="wrap grid gap-10 py-12 md:py-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="label text-ember">The community</p>
          <SocialLinks
            variant="list"
            className="mt-4"
            links={{
              whatsapp: contact.whatsapp,
              telegram: contact.telegram,
              facebookGroup: contact.facebookGroup,
              facebookPage: contact.facebookPage,
              youtube: contact.youtube,
            }}
          />
          <p className="mt-5 text-xs leading-relaxed text-quiet">
            WhatsApp and Telegram invites are sent on request while the public
            links are being refreshed. Ask below and an admin will send the
            current link.
          </p>

          <div className="mt-8 border-t border-line pt-6">
            <p className="label text-ember">
              Where else to find us
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href={`mailto:${contact.email || site.email.publicAddress}`}
                  className="link-underline inline-flex items-center gap-2"
                >
                  <Mail aria-hidden="true" className="h-4 w-4 text-ember" />
                  Email — {contact.email || site.email.publicAddress}
                </a>
              </li>
              <li>
                <a
                  href={contact.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline inline-flex items-center gap-2"
                >
                  <YouTubeIcon aria-hidden="true" className="h-4 w-4 text-ember" />
                  YouTube — @prophetlawrencefiwara
                </a>
              </li>
              <li>
                <a
                  href={contact.facebookPage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline inline-flex items-center gap-2"
                >
                  <FacebookIcon aria-hidden="true" className="h-4 w-4 text-ember" />
                  Facebook page — Lawrence Iwara
                </a>
              </li>
            </ul>

            <div className="mt-8 rounded-xl border border-line bg-parchment p-5">
              <p className="label flex items-center gap-2 text-ember">
                <Phone aria-hidden="true" className="h-3.5 w-3.5" />
                Pastoral & Prophetic Counsel
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">
                Need to speak one-on-one with Prophet Lawrence for spiritual guidance, discernment, or ministry enquiry?
              </p>
              <Link href="/book" className="btn btn-gold mt-4 inline-flex">
                Book a call with Prophet Lawrence
              </Link>
            </div>
          </div>
        </div>

        <div className="card p-5 sm:p-8 lg:col-span-7">
          <div>
            <p className="label text-quiet">Send a message</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              We would like to hear from you.
            </h2>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-quiet">
            We never ask for money by private message. If someone does, tell an
            admin.{" "}
            <Link href="/give" className="underline underline-offset-4">
              Giving happens only through the page we publish.
            </Link>
          </p>
        </div>
      </section>

      <section className="border-t border-line bg-paper">
        <div className="wrap grid gap-10 py-12 md:grid-cols-12 md:py-16">
          <div className="md:col-span-4">
            <p className="label text-ember">FAQ</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Questions people ask.</h2>
            <p className="mt-4 text-sm leading-relaxed text-quiet">
              Anything still unclear? Use the form above; it reaches the same
              admins.
            </p>
          </div>

          <div className="md:col-span-8">
            <div className="border-t border-line">
              {faqs.length === 0 ? (
                <div className="py-8">
                  <p className="text-lg font-semibold leading-snug">
                    Nothing published here yet.
                  </p>
                  <p className="measure mt-2 text-sm leading-relaxed text-quiet">
                    The team answers questions as they come in. Write through the
                    form and the reply will be personal.
                  </p>
                </div>
              ) : (
                faqs.map((faq) => (
                  <details key={faq.id} className="group border-b border-line py-4">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
                      <span className="text-base font-medium leading-snug">{faq.question}</span>
                      <Plus
                        aria-hidden="true"
                        className="mt-1 h-4 w-4 shrink-0 text-ember transition-transform group-open:rotate-45"
                      />
                    </summary>
                    <p className="measure mt-3 text-sm leading-relaxed text-quiet">
                      {faq.answer}
                    </p>
                  </details>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
