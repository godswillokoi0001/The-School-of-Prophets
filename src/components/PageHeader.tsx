import type { ReactNode } from "react";
import { Crest } from "@/components/Crest";

export function PageHeader({
  label,
  title,
  lead,
  aside,
  image,
  imageAlt,
}: {
  label: string;
  title: string;
  lead?: string;
  aside?: ReactNode;
  image?: string;
  imageAlt?: string;
}) {
  return (
    <header className="relative overflow-hidden border-b border-ink/15 bg-parchment">
      {image ? (
        <div className="wrap relative grid gap-8 py-10 md:grid-cols-12 md:items-center md:gap-10 md:py-14">
          <div className="md:col-span-7">
            <p className="label text-ember">{label}</p>
            <h1 className="mt-4 font-display text-hero text-ink">{title}</h1>
            {lead && (
              <p className="measure mt-6 text-base leading-relaxed text-quiet md:text-lg">
                {lead}
              </p>
            )}
            {aside && <div className="mt-8">{aside}</div>}
          </div>
          <div className="md:col-span-5">
            <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-[3/4]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={imageAlt ?? ""}
                className="h-full w-full object-cover"
                loading="eager"
              />
              <div className="pointer-events-none absolute inset-0 border border-ink/10" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/60 to-transparent" />
            </div>
          </div>
        </div>
      ) : (
        <>
          <Crest
            className="pointer-events-none absolute -right-12 -top-16 w-80 opacity-[0.07] md:w-[26rem]"
            decorative
          />
          <div className="wrap relative grid gap-8 py-14 md:grid-cols-12 md:py-20">
            <div className="md:col-span-8">
              <p className="label text-ember">{label}</p>
              <h1 className="mt-4 font-display text-hero text-ink">{title}</h1>
              {lead && (
                <p className="measure mt-6 text-base leading-relaxed text-quiet md:text-lg">
                  {lead}
                </p>
              )}
            </div>
            {aside && <div className="md:col-span-4 md:pt-2">{aside}</div>}
          </div>
        </>
      )}
    </header>
  );
}
