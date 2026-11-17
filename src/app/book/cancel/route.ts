import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("b");
  const token = url.searchParams.get("t");
  const svc = getServiceClient();
  if (!svc || !id || !token) return NextResponse.redirect(new URL("/", request.url));
  const expected = crypto
    .createHash("sha256")
    .update(`${id}:${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`)
    .digest("hex")
    .slice(0, 24);
  if (token !== expected) return NextResponse.redirect(new URL("/", request.url));

  const { data } = await svc.from("bookings").select("starts_at").eq("id", id).single();
  if (data) {
    await svc.from("bookings").update({ status: "cancelled", cancel_reason: "Cancelled by the visitor" }).eq("id", id);
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    return NextResponse.redirect(new URL("/book", site));
  }
  return NextResponse.redirect(new URL("/", request.url));
}
