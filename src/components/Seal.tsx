import Image from "next/image";

/**
 * The seal is built from the ministry's supplied crest, not a new drawing:
 * the crest sits inside a hairline ring carrying the fellowship's name and
 * founding year, the way a printed institution sets its seal.
 */
export function Seal({
  className = "",
  size = 320,
  priority = false,
  idKey = "primary",
}: {
  className?: string;
  size?: number;
  priority?: boolean;
  idKey?: string;
}) {
  const arc = `seal-arc-${idKey}`;

  return (
    <div
      className={`relative aspect-square ${className}`}
      style={{ width: size, maxWidth: "100%" }}
      role="img"
      aria-label="The School of Prophets seal: the crest within a ring reading Watchers, Daniel 4:17, established 2021"
    >
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full text-gold"
        aria-hidden="true"
      >
        <defs>
          <path
            id={arc}
            d="M100,100 m-88,0 a88,88 0 1,1 176,0 a88,88 0 1,1 -176,0"
            fill="none"
          />
        </defs>
        <circle cx="100" cy="100" r="97" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.55" />
        <circle cx="100" cy="100" r="82" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.35" />
        <text
          fill="currentColor"
          style={{
            fontSize: "6.1px",
            letterSpacing: "2.35px",
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          <textPath href={`#${arc}`} startOffset="1%">
            The School of Prophets · Est. 2021 · Watchers · Daniel 4:17 ·
          </textPath>
        </text>
      </svg>

      <div className="absolute inset-[24%]">
        <Image
          src="/images/tsop-crest.webp"
          alt=""
          fill
          sizes="(max-width: 768px) 40vw, 200px"
          className="object-contain"
          priority={priority}
        />
      </div>
    </div>
  );
}
