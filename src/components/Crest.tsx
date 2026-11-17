import Image from "next/image";

/**
 * The ministry's own crest. It is the only logo used on the site: in the
 * header, the footer, and as the quiet watermark behind editorial sections.
 */
export function Crest({
  className = "",
  width = 469,
  height = 532,
  priority = false,
  decorative = false,
}: {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  decorative?: boolean;
}) {
  return (
    <Image
      src="/images/tsop-crest.webp"
      alt={decorative ? "" : "The School of Prophets crest: an eagle over a shield, Watchers, Daniel 4:17"}
      aria-hidden={decorative || undefined}
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}
