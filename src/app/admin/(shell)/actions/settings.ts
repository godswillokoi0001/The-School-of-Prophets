"use server";

import { revalidateTag } from "next/cache";
import { getAdminClient } from "@/lib/supabase/server";
import { audit, getStaff } from "@/lib/admin";

const allTags = ["setting:enrolment", "setting:announcement", "setting:homepage", "setting:giving", "setting:contact", "setting:pages", "setting:legal", "setting:seo", "schedule", "series", "teachings", "events", "faqs", "team", "testimonies"];

export async function saveSetting(key: string, value: Record<string, unknown>) {
  const staff = await getStaff();
  const svc = await getAdminClient();
  if (!staff) return { ok: false, error: "Not signed in" };
  if (!svc) return { ok: false, error: "Database not connected" };
  const { error } = await svc
    .from("site_settings")
    .upsert({ key, value, updated_by: staff.id, updated_at: new Date().toISOString() });
  if (error) return { ok: false, error: error.message };
  await audit(staff, "update", `site_settings.${key}`, key, value);
  revalidateTag(`setting:${key}`);
  return { ok: true };
}

export async function revalidateAll() {
  allTags.forEach((t) => revalidateTag(t));
}
