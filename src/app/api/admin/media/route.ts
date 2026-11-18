import { NextResponse } from "next/server";
import { createSupabaseServer, getServiceClient, getAdminClient, supabaseConfigured } from "@/lib/supabase/server";
import { audit, getStaff } from "@/lib/admin";

const MAX_BYTES = 35 * 1024 * 1024;
const ALLOWED = [
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/avif",
  "audio/mpeg", "audio/mp3", "audio/wav", "audio/m4a", "audio/ogg", "audio/x-m4a", "audio/aac", "audio/webm"
];

export async function GET() {
  const staff = await getStaff();
  if (!staff || staff.role === "viewer") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const svc = (await getAdminClient()) || (await createSupabaseServer()) || getServiceClient();
  if (!svc || !supabaseConfigured()) return NextResponse.json({ list: [] });
  const { data } = await svc.from("media").select("path,alt,filename,size").order("created_at", { ascending: false });
  const list = (data ?? []).map((item) => {
    let resolvedPath = item.path;
    if (!resolvedPath.startsWith("http://") && !resolvedPath.startsWith("https://") && !resolvedPath.startsWith("/")) {
      resolvedPath = svc.storage.from("media").getPublicUrl(item.path).data.publicUrl;
    }
    return {
      ...item,
      path: resolvedPath,
      storageKey: item.path,
    };
  });
  return NextResponse.json({ list });
}

export async function POST(request: Request) {
  const staff = await getStaff();
  if (!staff || staff.role === "viewer") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const svc = (await getAdminClient()) || (await createSupabaseServer()) || getServiceClient();
  if (!svc || !supabaseConfigured())
    return NextResponse.json({ error: "Storage requires Supabase configuration" }, { status: 400 });

  const form = await request.formData();
  const file = form.get("file") as File | null;
  const alt = String(form.get("alt") ?? "");
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED.includes(file.type))
    return NextResponse.json({ error: "Only standard image (JPEG, PNG, WebP, GIF) or audio (MP3, WAV, M4A, OGG) files are allowed." }, { status: 415 });
  if (file.size > MAX_BYTES)
    return NextResponse.json({ error: "File exceeds 35 MB limit." }, { status: 413 });
  if (!alt.trim())
    return NextResponse.json({ error: "Describe the image for screen readers (alt text is required)." }, { status: 422 });

  // Auto-create bucket if missing
  try {
    await svc.storage.createBucket("media", { public: true });
  } catch {
    // Ignore error if bucket already exists or cannot be created
  }

  const safe = file.name.replace(/[^\w.-]+/g, "-").toLowerCase();
  const filename = `${Date.now()}-${safe}`;
  const storagePath = `uploads/${filename}`;

  let publicUrl = "";

  const { error: uploadError } = await svc.storage.from("media").upload(storagePath, file, {
    contentType: file.type,
    upsert: false,
  });

  if (!uploadError) {
    const { data: urlData } = svc.storage.from("media").getPublicUrl(storagePath);
    publicUrl = urlData.publicUrl;
  } else {
    console.warn("[media] Supabase storage upload notice (saving to local public/uploads):", uploadError.message);
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const buffer = Buffer.from(await file.arrayBuffer());
      const localFilePath = path.join(uploadDir, filename);
      await fs.writeFile(localFilePath, buffer);
      publicUrl = `/uploads/${filename}`;
    } catch (fsErr) {
      console.error("[media] Failed to save to local uploads directory:", fsErr);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }
  }

  const { error: insertError } = await svc.from("media").insert({
    path: publicUrl,
    filename: file.name,
    mime: file.type,
    size: file.size,
    alt: alt.trim(),
    uploaded_by: staff.id,
  });

  if (insertError) {
    console.warn("[media] Failed to insert row into media table:", insertError.message);
  }

  await audit(staff, "upload", "media", publicUrl, { size: file.size });
  return NextResponse.json({ path: publicUrl, url: publicUrl });
}

export async function PATCH(request: Request) {
  const staff = await getStaff();
  if (!staff || staff.role === "viewer") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const svc = (await getAdminClient()) || (await createSupabaseServer()) || getServiceClient();
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
  const svc = (await getAdminClient()) || (await createSupabaseServer()) || getServiceClient();
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
  const storageKey = path.includes("/media/") ? path.split("/media/").pop() : path;
  if (storageKey) {
    await svc.storage.from("media").remove([storageKey]);
  }
  await svc.from("media").delete().or(`path.eq.${path},path.eq.${storageKey}`);
  await audit(staff, "delete", "media", path);
  return NextResponse.json({ ok: true });
}
