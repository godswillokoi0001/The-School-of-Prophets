export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAdminClient, createSupabaseServer, getServiceClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/admin";

export async function POST(request: Request) {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const svc = (await getAdminClient()) || (await createSupabaseServer()) || getServiceClient();
  if (!svc) return NextResponse.json({ ok: false }, { status: 400 });
  const sub = await request.json();
  if (!sub?.endpoint) return NextResponse.json({ ok: false }, { status: 400 });
  await svc.from("push_subscriptions").upsert({
    user_id: staff.id,
    endpoint: sub.endpoint,
    keys: sub.keys ?? {},
  });
  return NextResponse.json({ ok: true });
}
