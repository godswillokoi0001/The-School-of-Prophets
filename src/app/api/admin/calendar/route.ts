import { NextResponse } from "next/server";
import { getStaff } from "@/lib/admin";
import { getAdminClient, createSupabaseServer, getServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const staff = await getStaff();
  if (!staff || staff.role === "viewer") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const svc = (await getAdminClient()) || (await createSupabaseServer()) || getServiceClient();
  if (!svc) return NextResponse.json({ bookings: [], events: [] });
  const url = new URL(request.url);
  const month = url.searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
  const rangeStart = `${month}-01T00:00:00+01:00`;
  const [y, m] = month.split("-").map(Number);
  const rangeEnd = `${new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10)}T00:00:00+01:00`;

  const [bookings, events] = await Promise.all([
    svc
      .from("bookings")
      .select("*, call_types(name)")
      .gte("starts_at", rangeStart)
      .lt("starts_at", rangeEnd)
      .order("starts_at"),
    svc
      .from("events")
      .select("title,starts_at")
      .eq("status", "published")
      .gte("starts_at", rangeStart)
      .lt("starts_at", rangeEnd),
  ]);

  return NextResponse.json(
    {
      bookings: (bookings.data ?? []).map((b) => ({
        ...b,
        call_type: (b.call_types as { name?: string } | null)?.name ?? "Call",
      })),
      events: events.data ?? [],
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
