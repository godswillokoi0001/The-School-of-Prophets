import { getSchedule } from "@/lib/data";
import { icsForSessions } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessions = await getSchedule();
  const body = icsForSessions(sessions);
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="school-of-prophets.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
