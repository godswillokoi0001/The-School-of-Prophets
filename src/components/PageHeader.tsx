import Link from "next/link";

/**
 * The header for inner pages. Deliberately typographic: no lead image, no
 * badge, no breadcrumb chip. Pages supply an aside when there is something
 * genuinely useful to put beside the title (a form, a status, a link).
 *
 * `image` and `imageAlt` remain in the signature so older call sites keep
 * compiling; they are intentionally not rendered.
 */
export function PageHeader({
  label,
  title,
  lead,
  aside,
  meta,
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
