import { icsForSessions } from "@/lib/time";

export const revalidate = 86400;

export function GET() {
  const body = icsForSessions();
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="school-of-prophets.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
