"use server";

import { revalidateTag } from "next/cache";
import { getServiceClient } from "@/lib/supabase/server";
import { audit, requireStaff } from "@/lib/admin";

export type EventInput = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  starts_at: string;
  ends_at: string | null;
  timezone: string;
  format: "online" | "onsite" | "hybrid";
  location: string;
  join_url: string;
  cover_url: string | null;
  cover_alt: string;
  registration_required: boolean;
  capacity: number | null;
  status: "draft" | "published" | "cancelled";
  recurrence: "none" | "weekly" | "monthly" | "yearly";
  featured: boolean;
  recap: string;
  recap_video_url: string | null;
};

export async function saveEvent(input: EventInput) {
  const staff = await requireStaff("admin");
  const svc = getServiceClient();
  if (!svc) return { ok: false, error: "No database connection" };
  const { data: existing } = input.id
    ? await svc.from("events").select("slug").eq("id", input.id).single()
    : { data: null };
  if (existing && existing.slug !== input.slug) {
    await svc.from("slug_redirects").upsert({
      from_path: `/events/${existing.slug}`,
      to_path: `/events/${input.slug}`,
    });
  }
  const { error } = await svc
    .from("events")
    .upsert({ ...input, id: input.id || undefined });
  if (error) {
    if (error.message.includes("duplicate key"))
      return { ok: false, error: "That web address (slug) is already taken." };
    return { ok: false, error: error.message };
  }
  await audit(staff, input.id ? "update" : "create", "events", input.id ?? input.slug, { title: input.title });
  revalidateTag("events");
  return { ok: true };
}

export async function deleteEvent(id: string) {
  const staff = await requireStaff("admin");
  const svc = getServiceClient();
  if (!svc) return { ok: false };
  await svc.from("events").delete().eq("id", id);
  await audit(staff, "delete", "events", id);
  revalidateTag("events");
  return { ok: true };
}

export async function addEventException(
  eventId: string,
  occurrenceDate: string,
  action: "cancel" | "reschedule",
  newStartsAt: string | null,
  note: string,
) {
  const staff = await requireStaff("admin");
  const svc = getServiceClient();
  if (!svc) return { ok: false, error: "No database connection" };
  const { error } = await svc.from("event_exceptions").insert({
    event_id: eventId,
    occurrence_date: occurrenceDate,
    action,
    new_starts_at: newStartsAt,
    note,
  });
  if (error) return { ok: false, error: error.message };
  await audit(staff, action, "event_exceptions", eventId, { date: occurrenceDate });
  revalidateTag("events");
  return { ok: true };
}
