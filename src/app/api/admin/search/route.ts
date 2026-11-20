export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAdminClient, createSupabaseServer, getServiceClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/admin";

export async function GET(request: Request) {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const svc = (await getAdminClient()) || (await createSupabaseServer()) || getServiceClient();
  if (!svc) return NextResponse.json({ results: [] });
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });
  const like = `%${q}%`;

  const [teachings, series, events, submissions, bookings] = await Promise.all([
    svc.from("teachings").select("slug,title,status").or(`title.ilike.${like},summary.ilike.${like}`).limit(5),
    svc.from("series").select("slug,title").ilike("title", like).limit(3),
    svc.from("events").select("slug,title,status").ilike("title", like).limit(4),
    svc.from("submissions").select("id,type,payload,status").or(`payload->>name.ilike.${like},payload->>email.ilike.${like}`).limit(6),
    svc.from("bookings").select("id,name,starts_at,status").ilike("name", like).limit(4),
  ]);

  const results = [
    ...(teachings.data ?? []).map((t) => ({ group: "Teachings", label: t.title, href: `/admin/teachings/${t.slug}`, meta: t.status })),
    ...(series.data ?? []).map((s) => ({ group: "Series", label: s.title, href: `/admin/series/${s.slug}` })),
    ...(events.data ?? []).map((e) => ({ group: "Events", label: e.title, href: `/admin/events/${e.slug}`, meta: e.status })),
    ...(submissions.data ?? []).map((s) => ({
      group: "Inbox",
      label: (s.payload?.name as string) ?? "Submission",
      href: `/admin/inbox/${s.id}`,
      meta: `${s.type} · ${s.status}`,
    })),
    ...(bookings.data ?? []).map((b) => ({
      group: "Bookings",
      label: b.name,
      href: `/admin/calendar`,
      meta: new Date(b.starts_at).toLocaleString("en-GB") + ` · ${b.status}`,
    })),
  ];

  return NextResponse.json({ results }, { headers: { "Cache-Control": "no-store" } });
}
