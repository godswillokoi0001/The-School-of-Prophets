import Link from "next/link";
import { Cover } from "@/components/Cover";

/**
 * The header for inner pages: label, title, lead, with an optional portrait
 * card beside the title and an optional aside.
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
  const hasSide = Boolean(aside || image);

  return (
    <header className="border-b border-line bg-paper">
      <div className="wrap grid gap-8 py-10 md:py-14 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className={hasSide ? "lg:col-span-7" : "lg:col-span-9"}>
          <p className="label text-ember">{label}</p>
          <h1 className="mt-3 font-display text-hero">{title}</h1>
          {lead && (
            <p className="measure mt-4 max-w-[58ch] text-base leading-relaxed text-quiet">
              {lead}
            </p>
          )}
          {meta && meta.length > 0 && (
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-4">
              {meta.map((item) => (
                <div key={item.label}>
                  <dt className="label text-quiet">{item.label}</dt>
                  <dd className="mt-1 text-sm font-medium">{item.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {aside && <div className="lg:col-span-4 lg:col-start-9">{aside}</div>}

        {!aside && image && (
          <div className="lg:col-span-4 lg:col-start-9">
            {/* Portrait artwork fills a portrait card; anything narrower keeps
                its whole frame on a blurred copy of itself. */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-ink-2 sm:aspect-[16/9] lg:aspect-[4/5]">
              <Cover
                src={image}
                alt={imageAlt}
                sizes="(max-width: 1024px) 100vw, 33vw"
                fit="contain"
              />
            </div>
          </div>
        )}
      </div>
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
