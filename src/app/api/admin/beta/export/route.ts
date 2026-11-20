export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { audit, getStaff } from "@/lib/admin";
import { getServiceClient } from "@/lib/supabase/server";
import { AREAS, BETA_TYPE, consentLabel, type BetaPayload } from "@/lib/beta";

function cell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export async function GET() {
  const staff = await getStaff();
  if (!staff || staff.role === "viewer") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const svc = getServiceClient();
  if (!svc) return NextResponse.json({ error: "no database" }, { status: 400 });

  const { data } = await svc
    .from("submissions")
    .select("id,status,payload,created_at,tags")
    .eq("type", BETA_TYPE)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(5000);

  const header = [
    "id",
    "submitted_at",
    "status",
    "name",
    "email",
    "whatsapp",
    "location",
    "device",
    "overall_rating",
    ...AREAS.map((area) => `rating_${area.key}`),
    "liked",
    "take",
    "issues_count",
    "issues",
    "improve",
    "wish",
    "story",
    "story_consent",
    "may_contact",
    "wants_call",
    "browser",
    "os",
    "screen",
    "referrer",
    "tags",
  ];

  const rows = (data ?? []).map((row) => {
    const p = (row.payload ?? {}) as BetaPayload;
    return [
      row.id,
      row.created_at,
      row.status,
      p.name,
      p.email,
      p.whatsapp,
      p.location,
      p.device,
      p.overall_rating,
      ...AREAS.map((area) => p.area_ratings?.[area.key] ?? ""),
      p.liked,
      p.take,
      p.issues?.length ?? 0,
      (p.issues ?? [])
        .map((issue) => `${issue.page} [${issue.severity}]: ${issue.description}`)
        .join(" | "),
      p.improve,
      p.wish,
      p.story,
      consentLabel(p.story_consent),
      p.may_contact ? "yes" : "no",
      p.wants_call ? "yes" : "no",
      p.meta?.browser,
      p.meta?.os,
      p.meta?.screen,
      p.meta?.referrer,
      (row.tags ?? []).join(" "),
    ];
  });

  await audit(staff, "export", "beta_feedback", undefined, { count: rows.length });

  const csv = [header, ...rows].map((line) => line.map(cell).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tsop-beta-feedback-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
