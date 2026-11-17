import { NextResponse } from "next/server";
import { getStaff } from "@/lib/admin";
import { getServiceClient, supabaseConfigured } from "@/lib/supabase/server";
import { audit } from "@/lib/admin";

export async function GET(request: Request) {
  const staff = await getStaff();
  if (!staff || staff.role === "viewer")
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const svc = getServiceClient();
  if (!svc || !supabaseConfigured())
    return NextResponse.json({ error: "no database" }, { status: 400 });

  let query = svc
    .from("submissions")
    .select("id,created_at,type,payload,status")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(2000);
  if (type) query = query.eq("type", type);
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);
  const { data } = await query;

  const rows = [
    ["id", "submitted_at", "type", "status", "name", "email", "payload"],
    ...(data ?? []).map((r) => [
      r.id,
      r.created_at,
      r.type,
      r.status,
      String(r.payload?.name ?? r.payload?.fullName ?? ""),
      String(r.payload?.email ?? ""),
      JSON.stringify(r.payload),
    ]),
  ];

  await audit(staff, "export", `submissions${type ? `.${type}` : ""}`, undefined, { from, to });

  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tsop-${type ?? "all"}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
