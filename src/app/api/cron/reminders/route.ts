import { NextResponse } from "next/server";
import { getServiceClient, supabaseConfigured } from "@/lib/supabase/server";
import { sendTemplated } from "@/lib/notify";

async function guard(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!(await guard(request)))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const svc = getServiceClient();
  if (!svc || !supabaseConfigured()) return NextResponse.json({ ok: false });

  const now = Date.now();
  const windows = [
    { label: "24h", from: new Date(now + 23.5 * 3600_000).toISOString(), to: new Date(now + 24.5 * 3600_000).toISOString() },
    { label: "1h", from: new Date(now + 0.5 * 3600_000).toISOString(), to: new Date(now + 1.5 * 3600_000).toISOString() },
  ];

  for (const w of windows) {
    const { data: bookings } = await svc
      .from("bookings")
      .select("*, call_types(name)")
      .eq("status", "confirmed")
      .gte("starts_at", w.from)
      .lte("starts_at", w.to);
    for (const b of bookings ?? []) {
      const marker = `reminder-${w.label}-${b.id}`;
      const { data: existing } = await svc
        .from("notification_log")
        .select("id")
        .eq("channel", "reminder")
        .eq("related_id", marker)
        .maybeSingle();
      if (existing) continue;
      const when = new Date(b.starts_at).toLocaleString("en-GB", { timeZone: "Africa/Lagos" });
      await sendTemplated("reminder", b.email, {
        name: String(b.name),
        time: when,
        link: (b.call_types as { name?: string } | null)?.name ?? "your call",
      });
      await svc.from("notification_log").insert({
        channel: "reminder", target: b.email, subject: `Reminder ${w.label}`, body: when, status: "sent", related_type: "booking", related_id: marker,
      });
    }
  }
  return NextResponse.json({ ok: true });
}
