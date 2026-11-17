import { NextResponse } from "next/server";
import { getServiceClient, supabaseConfigured } from "@/lib/supabase/server";
import { audit, getStaff } from "@/lib/admin";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export async function GET() {
  const staff = await getStaff();
  if (!staff || staff.role === "viewer") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const svc = getServiceClient();
  if (!svc || !supabaseConfigured()) return NextResponse.json({ list: [] });
  const { data } = await svc.from("media").select("path,alt,filename,size").order("created_at", { ascending: false });
  return NextResponse.json({ list: data ?? [] });
}

export async function POST(request: Request) {
  const staff = await getStaff();
  if (!staff || staff.role === "viewer") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const svc = getServiceClient();
  if (!svc || !supabaseConfigured())
    return NextResponse.json({ error: "Storage requires Supabase configuration" }, { status: 400 });

  const form = await request.formData();
  const file = form.get("file") as File | null;
  const alt = String(form.get("alt") ?? "");
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!ALLOWED.includes(file.type))
    return NextResponse.json({ error: "Only JPEG, PNG, WebP, GIF or AVIF images are allowed." }, { status: 415 });
  if (file.size > MAX_BYTES)
    return NextResponse.json({ error: "Image is larger than 8 MB." }, { status: 413 });
  if (!alt.trim())
    return NextResponse.json({ error: "Describe the image for screen readers (alt text is required)." }, { status: 422 });

  const safe = file.name.replace(/[^\w.-]+/g, "-").toLowerCase();
  const path = `uploads/${Date.now()}-${safe}`;
  const { error } = await svc.storage.from("media").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: url } = svc.storage.from("media").getPublicUrl(path);
  await svc.from("media").insert({
    path,
    filename: file.name,
    mime: file.type,
    size: file.size,
    alt: alt.trim(),
    uploaded_by: staff.id,
  });
  await audit(staff, "upload", "media", path, { size: file.size });
  return NextResponse.json({ path, url: url.publicUrl });
}

export async function PATCH(request: Request) {
  const staff = await getStaff();
  if (!staff || staff.role === "viewer") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const svc = getServiceClient();
  if (!svc) return NextResponse.json({ error: "no database" }, { status: 400 });
  const body = await request.json();
  const { data: old } = await svc.from("media").select("alt,path").eq("path", body.path).single();
  const { error } = await svc.from("media").update({ alt: String(body.alt ?? old?.alt ?? "") }).eq("path", body.path);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await audit(staff, "rename", "media", body.path, { alt: body.alt });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const staff = await getStaff();
  if (!staff || staff.role !== "owner") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const svc = getServiceClient();
  if (!svc) return NextResponse.json({ error: "no database" }, { status: 400 });
  const { path } = await request.json();
  const usage = await Promise.all([
    svc.from("teachings").select("id", { head: false }).eq("cover_url", path),
    svc.from("events").select("id", { head: false }).eq("cover_url", path),
    svc.from("series").select("id", { head: false }).eq("cover_url", path),
  ]);
  const inUse = usage.some((r) => (r.data ?? []).length > 0);
  if (inUse)
    return NextResponse.json(
      { error: "This image is still used by a teaching, series or event. Replace it there first." },
      { status: 409 },
    );
  await svc.storage.from("media").remove([path]);
  await svc.from("media").delete().eq("path", path);
  await audit(staff, "delete", "media", path);
  return NextResponse.json({ ok: true });
}
