/**
 * One image contract for the whole product.
 *
 * Nothing here touches the database or the browser, so it is safe to import
 * from server components, client components and route handlers alike.
 */

export type Focal = { x: number; y: number };

export type MediaMeta = {
  x: number;
  y: number;
  /** Natural width in pixels, recorded at upload. */
  w?: number;
  h?: number;
};

export type MediaMetaMap = Record<string, MediaMeta>;

/** Aspect ratios allowed per use. Keep this list short and honest. */
export const RATIOS = {
  hero: "16 / 9",
  wide: "16 / 10",
  card: "3 / 2",
  portrait: "4 / 5",
  portraitTall: "3 / 4",
  thumb: "1 / 1",
  og: "1.91 / 1",
} as const;

export type RatioName = keyof typeof RATIOS;

/** Minimum sensible pixel width for each use, for the upload warning. */
export const MIN_WIDTH: Record<RatioName, number> = {
  hero: 1600,
  wide: 1200,
  card: 900,
  portrait: 800,
  portraitTall: 800,
  thumb: 400,
  og: 1200,
};

export const DEFAULT_FOCAL: Focal = { x: 50, y: 30 };

export function clampFocal(value: number): number {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, Math.round(value)));
}

/** `object-position` value for a focal point. */
export function focalPosition(focal?: Partial<Focal> | null): string {
  return `${clampFocal(focal?.x ?? DEFAULT_FOCAL.x)}% ${clampFocal(focal?.y ?? DEFAULT_FOCAL.y)}%`;
}

/**
 * Look up the focal point for a URL in the media metadata map. Absolute storage
 * URLs and local `/uploads/...` paths are both keyed by exactly what is stored
 * in `cover_url`, so no normalisation is needed.
 */
export function focalFor(map: MediaMetaMap | null | undefined, src?: string | null): Focal | undefined {
  if (!src || !map) return undefined;
  const hit = map[src];
  if (!hit) return undefined;
  return { x: hit.x, y: hit.y };
}

export function metaFor(map: MediaMetaMap | null | undefined, src?: string | null): MediaMeta | undefined {
  if (!src || !map) return undefined;
  return map[src];
}

/** Human hint shown under upload fields. */
export function sizeHint(ratio: RatioName, label: string): string {
  const min = MIN_WIDTH[ratio];
  const ratioText = RATIOS[ratio].replace(" / ", ":");
  return `${label} · ${ratioText} · at least ${min}px wide. The whole picture is kept; framing is set on the site, not by cropping the file.`;
}
