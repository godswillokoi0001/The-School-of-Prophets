import Image from "next/image";

/**
 * The seal is built from the ministry's supplied crest, not a new drawing:
 * the crest sits inside a hairline ring carrying the fellowship's name and
 * founding year, with a gentle holy rotation and ambient radiance.
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
      className={`group relative aspect-square transition-transform duration-500 hover:scale-[1.02] ${className}`}
      style={{ width: size, maxWidth: "100%" }}
      role="img"
      aria-label="The School of Prophets seal: the crest within a ring reading Watchers, Daniel 4:17, established 2021"
    >
      {/* Ambient sacred golden glow */}
      <div
        className="absolute inset-2 -z-10 rounded-full bg-gradient-to-tr from-gold/20 via-gold-soft/10 to-amber-500/15 blur-2xl animate-pulse pointer-events-none"
        aria-hidden="true"
      />

      {/* Rotating outer ring and typography */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full text-gold animate-[spin_80s_linear_infinite] will-change-transform"
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

      {/* Inner crest */}
      <div className="absolute inset-[24%] transition-transform duration-500 ease-out group-hover:scale-105">
        <Image
          src="/images/tsop-crest.webp"
          alt=""
          fill
          sizes="(max-width: 768px) 40vw, 200px"
          className="object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
          priority={priority}
        />
      </div>
    </div>
  );
}
