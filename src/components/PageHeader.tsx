import Link from "next/link";
import { Cover } from "@/components/Cover";

/**
 * The header for inner pages: label, title, lead, with an optional editorial
 * plate beneath and an optional aside beside the title.
 */
export function PageHeader({
  label,
  title,
  lead,
  aside,
  meta,
  image,
  imageAlt,
}: {
  label: string;
  title: string;
  lead?: string;
  aside?: React.ReactNode;
  meta?: { label: string; value: string }[];
  image?: string;
  imageAlt?: string;
}) {
  return (
    <header className="border-b border-ink/15">
      <div className="wrap grid gap-10 py-14 md:grid-cols-12 md:py-20">
        <div className={aside ? "md:col-span-7" : "md:col-span-9"}>
          <p className="label text-ember">{label}</p>
          <h1 className="mt-5 font-display text-hero">{title}</h1>
          {lead && (
            <p className="measure mt-6 max-w-[56ch] text-lg leading-relaxed text-quiet">
              {lead}
            </p>
          )}
          {meta && meta.length > 0 && (
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3 border-t border-ink/15 pt-4">
              {meta.map((item) => (
                <div key={item.label}>
                  <dt className="label text-quiet">{item.label}</dt>
                  <dd className="mt-1 text-sm">{item.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {aside && (
          <div className="md:col-span-4 md:col-start-9 md:pl-4">{aside}</div>
        )}
      </div>

      {image && (
        <div className="wrap pb-10 md:pb-14">
          {/* The plate shows the whole picture: a wide crop of a portrait
              photograph cuts faces and text, which is never acceptable. */}
          <div className="relative aspect-[3/2] overflow-hidden border border-ink/10 bg-ink-2">
            <Cover src={image} alt={imageAlt} sizes="(max-width: 1200px) 100vw, 1200px" fit="contain" />
          </div>
        </div>
      )}
    </header>
  );
}

export function PageFooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="link-quiet text-sm text-ink">
      {children}
    </Link>
  );
}
