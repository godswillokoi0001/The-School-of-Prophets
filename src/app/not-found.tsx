import Link from "next/link";
import { Crest } from "@/components/Crest";
import { site } from "@/config/site";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-ink text-parchment">
      <Crest
        className="pointer-events-none absolute -right-10 top-6 w-72 opacity-[0.08] md:w-[28rem]"
        decorative
      />
      <div className="wrap relative grid gap-10 py-24 md:grid-cols-12 md:py-32">
        <div className="md:col-span-8">
          <p className="label text-gold">404</p>
          <h1 className="mt-5 max-w-[22ch] font-display text-hero">
            That page is not in the house.
          </h1>
          <p className="measure mt-5 text-parchment/60">
            The link may be old, or the page may have moved. The teachings and the
            weekly schedule are the best places to start again.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="btn btn-gold">
              Back to the homepage
            </Link>
            <Link href="/teachings" className="btn btn-outline">
              The teaching library
            </Link>
          </div>
          <p className="mt-8 text-xs text-parchment/40">
            {site.name} · {site.crest}
          </p>
        </div>
      </div>
    </section>
  );
}
