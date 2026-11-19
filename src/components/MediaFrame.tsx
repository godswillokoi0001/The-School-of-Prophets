import Image from "next/image";
import { focalPosition, RATIOS, type Focal, type RatioName } from "@/lib/media";

/**
 * The only place an image is framed.
 *
 * - The box always carries a real aspect ratio, so nothing jumps on load.
 * - `fit="contain"` shows the whole picture (posters, flyers, documents,
 *   screenshots) on a quiet tint.
 * - `fit="cover"` is reserved for atmospheric photography, and always takes a
 *   focal point so faces and text survive the crop.
 * - The file is never cropped, stretched or upscaled; only the viewport moves.
 */
export function MediaFrame({
  src,
  alt = "",
  ratio = "card",
  fit = "cover",
  focal,
  sizes,
  priority = false,
  tint = "ink",
  className = "",
  children,
}: {
  src?: string | null;
  alt?: string;
  ratio?: RatioName;
  fit?: "cover" | "contain";
  focal?: Focal;
  sizes: string;
  priority?: boolean;
  tint?: "ink" | "paper";
  className?: string;
  children?: React.ReactNode;
}) {
  const tintClass = tint === "paper" ? "bg-parchment-2" : "bg-ink-2";

  if (!src) {
    return (
      <div
        aria-hidden="true"
        style={{ aspectRatio: RATIOS[ratio] }}
        className={`flex items-center justify-center border border-current/10 ${tintClass} ${className}`}
      >
        <span className="label opacity-30">No image</span>
      </div>
    );
  }

  const remote = /^https?:\/\//.test(src);

  return (
    <div
      style={{ aspectRatio: RATIOS[ratio] }}
      className={`relative overflow-hidden ${tintClass} ${className}`}
    >
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
      />
      {children}
    </div>
  );
}
