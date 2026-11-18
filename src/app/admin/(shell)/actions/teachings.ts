"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminClient } from "@/lib/supabase/server";
import { audit, requireStaff } from "@/lib/admin";
import { extractYouTubeId } from "@/lib/youtube";

export type TeachingInput = {
  id?: string;
  title: string;
  slug: string;
  series_id: string | null;
  part_number: number | null;
  date_taught: string | null;
  speaker: string;
  summary: string;
  body: string;
  cover_url: string | null;
  cover_alt: string;
  scripture: string[];
  youtube_url: string | null;
  audio_url: string | null;
  pdf_url: string | null;
  links: { label: string; url: string }[];
  tags: string[];
  featured: boolean;
  status: "draft" | "scheduled" | "published";
  publish_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  share_image_url: string | null;
};

const allTags = ["teachings", "series", "setting:homepage"];

function revalidateSite() {
  allTags.forEach((t) => revalidateTag(t));
  try {
    revalidatePath("/teachings");
    revalidatePath("/teachings/[slug]", "page");
    revalidatePath("/");
    revalidatePath("/admin/teachings");
  } catch {
    // ignore
  }
}

export async function saveTeaching(input: TeachingInput) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database connection" };

  if (input.status === "published") {
    const ytId = extractYouTubeId(input.youtube_url);
    if (!ytId) {
      return {
        ok: false,
        error: "A valid YouTube video link is required to publish a teaching. Please add the YouTube video link, or save as a draft.",
      };
    }
  }

  const { data: existing } = input.id
    ? await svc.from("teachings").select("slug,title").eq("id", input.id).single()
    : { data: null };

  if (existing && existing.slug !== input.slug) {
    await svc
      .from("slug_redirects")
      .upsert({ from_path: `/teachings/${existing.slug}`, to_path: `/teachings/${input.slug}` });
  }

  const row = { ...input, publish_at: input.status === "scheduled" ? input.publish_at : input.publish_at };
  const { data, error } = await svc
    .from("teachings")
    .upsert({ ...row, id: input.id || undefined, created_by: staff.id })
    .select("id")
    .single();
  if (error) {
    if (error.message.includes("duplicate key"))
      return { ok: false, error: "That web address (slug) is already taken. Try another." };
    return { ok: false, error: error.message };
  }

  if (input.id) {
    await svc.from("teaching_links").delete().eq("teaching_id", input.id);
  }
  if (input.links.length > 0) {
    await svc.from("teaching_links").insert(
      input.links.map((l, i) => ({ teaching_id: data.id, label: l.label, url: l.url, sort_order: i })),
    );
  }

  await audit(staff, input.id ? "update" : "create", "teachings", data.id, { title: input.title, status: input.status });
  revalidateSite();
  return { ok: true, id: data.id };
}

export async function bulkTeachings(ids: string[], action: string, value?: string) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc || ids.length === 0) return { ok: false };
  if (action === "delete") {
    await svc.from("teachings").delete().in("id", ids);
  } else if (action === "publish") {
    await svc.from("teachings").update({ status: "published" }).in("id", ids);
  } else if (action === "unpublish") {
    await svc.from("teachings").update({ status: "draft" }).in("id", ids);
  } else if (action === "series" && value) {
    await svc.from("teachings").update({ series_id: value }).in("id", ids);
  } else if (action === "tag" && value) {
    const { data } = await svc.from("teachings").select("id,tags").in("id", ids);
    for (const t of data ?? []) {
      const tags = new Set([...(t.tags ?? []), value]);
      await svc.from("teachings").update({ tags: [...tags] }).eq("id", t.id);
    }
  }
  await audit(staff, action, "teachings", undefined, { ids, value });
  revalidateSite();
  return { ok: true };
}

export async function duplicateTeaching(id: string) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false };
  const { data: src } = await svc.from("teachings").select("*").eq("id", id).single();
  if (!src) return { ok: false };
  const copy = {
    ...src,
    id: undefined,
    slug: `${src.slug}-copy-${Date.now().toString(36).slice(-4)}`,
    title: `${src.title} (copy)`,
    status: "draft",
    featured: false,
  };
  const { data, error } = await svc.from("teachings").insert(copy).select("id").single();
  if (error) return { ok: false, error: error.message };
  await audit(staff, "duplicate", "teachings", id, { newId: data.id });
  revalidateSite();
  return { ok: true, id: data.id };
}

/* ------- series ------- */

export type SeriesInput = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  cover_url: string | null;
  cover_alt: string;
  status: "draft" | "published" | "archived";
  sort_order: number;
  featured: boolean;
};

export async function saveSeries(input: SeriesInput) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database connection" };
  const { data: existing } = input.id
    ? await svc.from("series").select("slug").eq("id", input.id).single()
    : { data: null };
  if (existing && existing.slug !== input.slug) {
    await svc
      .from("slug_redirects")
      .upsert({ from_path: `/teachings/series/${existing.slug}`, to_path: `/teachings/series/${input.slug}` });
  }
  const { error } = await svc
    .from("series")
    .upsert({ ...input, id: input.id || undefined });
  if (error) return { ok: false, error: error.message };
  await audit(staff, input.id ? "update" : "create", "series", input.id ?? input.slug, { title: input.title });
  revalidateSite();
  return { ok: true };
}

export async function reorderSeries(orderedIds: string[]) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false };
  for (let i = 0; i < orderedIds.length; i++) {
    await svc.from("series").update({ sort_order: i + 1 }).eq("id", orderedIds[i]);
  }
  await audit(staff, "reorder", "series", undefined, { count: orderedIds.length });
  revalidateSite();
  return { ok: true };
}

export async function deleteSeries(id: string) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false };
  const { error } = await svc.from("series").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await audit(staff, "delete", "series", id);
  revalidateSite();
  return { ok: true };
}
