import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || searchParams.get("redirect_to") || "/admin";
  const sb = await createSupabaseServer();
  if (code && sb) {
    await sb.auth.exchangeCodeForSession(code);
  }
  const destination = next.startsWith("/") ? next : `/${next}`;
  return NextResponse.redirect(`${origin}${destination}`);
}
