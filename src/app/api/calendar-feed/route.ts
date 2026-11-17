import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { icsFor } from "@/lib/booking";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const expected = process.env.CALENDAR_FEED_TOKEN ?? "";
  if (!expected || token !== expected)
    return NextResponse.json({ error: "invalid token" }, { status: 403 });

  const svc = getServiceClient();
  if (!svc) return NextResponse.json({ error: "no database" }, { status: 400 });

  const [bookings, sessions, events] = await Promise.all([
    svc.from("bookings").select("*, call_types(name)").in("status", ["pending", "confirmed"]).gte("starts_at", new Date(Date.now() - 30 * 86400_000).toISOString()),
    svc.from("schedule_sessions").select("*").eq("active", true),
    svc.from("events").select("*").eq("status", "published"),
  ]);

  const lines: string[] = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//TSOP//Feed//EN"];

  for (const b of bookings.data ?? []) {
    lines.push(
      ...icsFor(
        `Call: ${b.name} (${(b.call_types as { name?: string } | null)?.name ?? "TSOP"})`,
        b.topic ?? "",
        b.starts_at,
        b.ends_at,
        b.id,
      )
        .replace("BEGIN:VCALENDAR", "")
        .replace("VERSION:2.0", "")
        .replace("PRODID:-//TSOP//Booking//EN", "")
        .replace("END:VCALENDAR", "")
        .split("\r\n")
        .filter(Boolean),
    );
  }

  for (const s of sessions.data ?? []) {
    for (let i = 0; i < 60; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      if (d.getDay() !== s.day) continue;
      const [h, m] = s.start_time.split(":").map(Number);
      const start = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), h - 1, m, 0));
      lines.push(
        ...icsFor(s.title, s.description ?? "", start.toISOString(), new Date(start.getTime() + 3600_000).toISOString(), `session-${s.id}-${i}`)
          .split("\r\n")
          .filter((l) => l.startsWith("BEGIN:VEVENT") || l.startsWith("END:VEVENT") || l.startsWith("UID") || l.startsWith("DTSTART") || l.startsWith("DTEND") || l.startsWith("SUMMARY")),
      );
    }
  }

  for (const e of events.data ?? []) {
    lines.push(
      ...icsFor(e.title, e.description ?? "", e.starts_at, e.ends_at ?? e.starts_at, e.id)
        .split("\r\n")
        .filter((l) => l.startsWith("BEGIN:VEVENT") || l.startsWith("END:VEVENT") || l.startsWith("UID") || l.startsWith("DTSTART") || l.startsWith("DTEND") || l.startsWith("SUMMARY")),
    );
  }

  lines.push("END:VCALENDAR");

  return new NextResponse(lines.join("\r\n"), {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "no-store" },
  });
}
