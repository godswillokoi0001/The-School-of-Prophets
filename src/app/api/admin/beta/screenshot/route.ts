import { NextResponse } from "next/server";
import { getStaff } from "@/lib/admin";
import { getServiceClient } from "@/lib/supabase/server";
import { BETA_BUCKET } from "@/lib/beta";

/**
 * Screenshots live in a private bucket. Admins get a short-lived signed URL;
 * nobody else can read the object, and the path is checked against the bucket.
 */
export async function GET(request: Request) {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const path = new URL(request.url).searchParams.get("path") ?? "";
  if (!path.startsWith("beta/") || path.includes("..")) {
    return NextResponse.json({ error: "invalid path" }, { status: 400 });
  }

  const svc = getServiceClient();
  if (!svc) return NextResponse.json({ error: "storage unavailable" }, { status: 503 });

  const { data, error } = await svc.storage.from(BETA_BUCKET).createSignedUrl(path, 120);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message ?? "not found" }, { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
