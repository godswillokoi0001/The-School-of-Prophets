import Image from "next/image";

/**
 * A cover plate, sourced from the CMS (`cover_url` on teachings, series and
 * events). Local uploads go through the image optimiser; absolute storage URLs
 * bypass it so a new storage host needs no build-time configuration.
 */
export function Cover({
  src,
  alt = "",
  sizes,
  priority = false,
  className = "object-cover",
}: {
  src: string;
  alt?: string;
  sizes: string;
  priority?: boolean;
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
      className={className}
    />
  );
}
