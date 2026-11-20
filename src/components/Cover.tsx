import Image from "next/image";
import { focalPosition, type Focal } from "@/lib/media";

/**
 * A cover plate, sourced from the CMS (`cover_url` on teachings, series and
 * events). Local uploads go through the image optimiser; absolute storage URLs
 * bypass it so a new storage host needs no build-time configuration.
 *
 * The parent owns the aspect ratio (via `MediaFrame` or an explicit
 * `aspect-[…]` box). This component only decides how the picture sits inside
 * it: `cover` for atmosphere with a focal point, `contain` when the whole
 * picture matters.
 *
 * When the whole picture is shown, the space either side of it is filled with a
 * blurred, scaled copy of the same picture rather than a flat black bar. The
 * file is still never cropped: the copy is decoration behind the original.
 */
export function Cover({
  src,
  alt = "",
  sizes,
  priority = false,
  fit = "cover",
  focal,
  className = "",
}: {
  src: string;
  alt?: string;
  sizes: string;
  priority?: boolean;
  fit?: "cover" | "contain";
  focal?: Focal;
  className?: string;
}) {
  if (!src) return null;

  const remote = /^https?:\/\//.test(src);
  const contained = fit === "contain";

  return (
    <>
      {contained && (
        <>
          <Image
            src={src}
            alt=""
            aria-hidden="true"
            fill
            sizes={sizes}
            unoptimized={remote}
            style={{
              objectFit: "cover",
              objectPosition: focalPosition(focal),
            }}
            className="pointer-events-none scale-[1.06] blur-[10px] saturate-[0.95]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-ink/45"
          />
        </>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={remote}
        style={{
          objectFit: fit,
          objectPosition: fit === "cover" ? focalPosition(focal) : "50% 50%",
        }}
        className={className}
      />
    </>
  );
}
