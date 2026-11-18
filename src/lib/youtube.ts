export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const m = trimmed.match(
    /(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|live\/|watch\?v=|&v=)([\w-]{11})/
  );
  if (m) return m[1];
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  return null;
}
