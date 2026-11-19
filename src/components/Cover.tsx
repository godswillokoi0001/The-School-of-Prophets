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

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={/^https?:\/\//.test(src)}
      style={{
        objectFit: fit,
        objectPosition: fit === "cover" ? focalPosition(focal) : "50% 50%",
      }}
      className={className}
    />
  );
}
