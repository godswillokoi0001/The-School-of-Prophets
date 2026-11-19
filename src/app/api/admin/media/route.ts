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
  // Focal points live in site_settings under `media_meta`, keyed by stored path.
  // No schema change, and the original file is never touched.
  const { data: metaRow } = await svc
    .from("site_settings")
    .select("value")
    .eq("key", "media_meta")
    .maybeSingle();
  const meta = (metaRow?.value ?? {}) as Record<string, { x: number; y: number; w?: number; h?: number }>;
  const list = (data ?? []).map((item) => {
    let resolvedPath = item.path;
    if (!resolvedPath.startsWith("http://") && !resolvedPath.startsWith("https://") && !resolvedPath.startsWith("/")) {
      resolvedPath = svc.storage.from("media").getPublicUrl(item.path).data.publicUrl;
    }
    const stored = meta[item.path] ?? meta[resolvedPath];
    return {
      ...item,
      path: resolvedPath,
      storageKey: item.path,
      focal: stored ? { x: stored.x, y: stored.y } : null,
      width: stored?.w ?? null,
      height: stored?.h ?? null,
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
  const focalX = Number(form.get("focalX"));
  const focalY = Number(form.get("focalY"));
  const width = Number(form.get("width"));
  const height = Number(form.get("height"));
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

  // Remember the framing and the natural size. Stored separately from the file,
  // so any image can be reframed later without being re-uploaded or re-cropped.
  try {
    const { data: existing } = await svc
      .from("site_settings")
      .select("value")
      .eq("key", "media_meta")
      .maybeSingle();
    const map = ((existing?.value as Record<string, unknown>) ?? {}) as Record<string, unknown>;
    map[publicUrl] = {
      x: Number.isFinite(focalX) ? focalX : 50,
      y: Number.isFinite(focalY) ? focalY : 30,
      ...(Number.isFinite(width) && width > 0 ? { w: width } : {}),
      ...(Number.isFinite(height) && height > 0 ? { h: height } : {}),
    };
    await svc.from("site_settings").upsert({ key: "media_meta", value: map }, { onConflict: "key" });
  } catch (metaErr) {
    console.warn("[media] Could not store framing metadata:", metaErr);
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

  // Focus point only: never rewrites the image file.
  if (body.focal && typeof body.focal.x === "number" && typeof body.focal.y === "number") {
    const { data: existing } = await svc
      .from("site_settings")
      .select("value")
      .eq("key", "media_meta")
      .maybeSingle();
    const map = ((existing?.value as Record<string, Record<string, number> | unknown>) ?? {}) as Record<string, unknown>;
    const previous = (map[body.path] as Record<string, number>) ?? {};
    map[body.path] = { ...previous, x: body.focal.x, y: body.focal.y };
    const { error: metaError } = await svc
      .from("site_settings")
      .upsert({ key: "media_meta", value: map }, { onConflict: "key" });
    if (metaError) return NextResponse.json({ error: metaError.message }, { status: 500 });
    await audit(staff, "focus", "media", body.path, { focal: body.focal });
    return NextResponse.json({ ok: true });
  }

  const { error } = await svc.from("media").update({ alt: String(body.alt ?? old?.alt ?? "") }).eq("path", body.path);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await audit(staff, "rename", "media", body.path, { alt: body.alt });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const staff = await getStaff();
  if (!staff || (staff.role !== "owner" && staff.role !== "admin")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const svc = (await getAdminClient()) || (await createSupabaseServer()) || getServiceClient();
  if (!svc) return NextResponse.json({ error: "no database" }, { status: 400 });

  const { path } = await request.json();
  if (!path) return NextResponse.json({ error: "Missing file path" }, { status: 400 });

  const storageKey = path.includes("/media/") ? path.split("/media/").pop() : path;

  // 1. Cascade update everywhere this image is used (teachings, events, series)
  await Promise.allSettled([
    svc.from("teachings").update({ cover_url: null }).eq("cover_url", path),
    svc.from("events").update({ cover_url: null }).eq("cover_url", path),
    svc.from("series").update({ cover_url: null }).eq("cover_url", path),
    svc.from("teachings").update({ share_image_url: null }).eq("share_image_url", path),
    storageKey && storageKey !== path
      ? svc.from("teachings").update({ cover_url: null }).eq("cover_url", storageKey)
      : Promise.resolve(),
    storageKey && storageKey !== path
      ? svc.from("events").update({ cover_url: null }).eq("cover_url", storageKey)
      : Promise.resolve(),
    storageKey && storageKey !== path
      ? svc.from("series").update({ cover_url: null }).eq("cover_url", storageKey)
      : Promise.resolve(),
  ]);

  // 2. Remove from Supabase Storage
  if (storageKey) {
    try {
      await svc.storage.from("media").remove([storageKey]);
    } catch {
      // storage removal is secondary
    }
  }

  // 3. Remove from local uploads if saved locally
  if (path.startsWith("/uploads/")) {
    try {
      const fs = await import("fs/promises");
      const p = await import("path");
      const localFilePath = p.join(process.cwd(), "public", path);
      await fs.unlink(localFilePath);
    } catch {
      // ignore
    }
  }

  // 4. Delete record from media table
  await svc.from("media").delete().eq("path", path);
  if (storageKey && storageKey !== path) {
    await svc.from("media").delete().eq("path", storageKey);
  }

  audit(staff, "delete", "media", path).catch(() => {});
  return NextResponse.json({ ok: true });
}
