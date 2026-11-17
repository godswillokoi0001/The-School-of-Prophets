"use server";

import { revalidateTag } from "next/cache";
import { getAdminClient } from "@/lib/supabase/server";
import { audit, requireStaff } from "@/lib/admin";

export type CallTypeInput = {
  id?: string; name: string; slug: string; description: string;
  duration_minutes: number; buffer_minutes: number; mode: string;
  approval_required: boolean; active: boolean; sort_order: number;
};

export async function saveAvailability(
  rules: { id?: string; weekday: number; start_time: string; end_time: string; slot_minutes: number; active: boolean; call_type_id: string | null }[],
  callTypes: CallTypeInput[],
) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database" };
  const { error: e1 } = await svc.from("availability_rules").upsert(
    rules.map((r) => ({ ...r, id: r.id || undefined })),
  );
  if (e1) return { ok: false, error: e1.message };
  const { error: e2 } = await svc.from("call_types").upsert(
    callTypes.map((t) => ({ ...t, id: t.id || undefined })),
  );
  if (e2) return { ok: false, error: e2.message };
  await audit(staff, "update", "availability", undefined, { rules: rules.length, callTypes: callTypes.length });
  revalidateTag("schedule");
  return { ok: true };
}

export async function deleteRule(id: string) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false };
  await svc.from("availability_rules").delete().eq("id", id);
  await audit(staff, "delete", "availability_rules", id);
  return { ok: true };
}

export async function addBlockedDate(date: string, allDay: boolean, startTime: string, endTime: string, reason: string) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database" };
  const { error } = await svc.from("availability_exceptions").insert({
    date,
    all_day: allDay,
    start_time: allDay ? null : startTime,
    end_time: allDay ? null : endTime,
    reason,
  });
  if (error) return { ok: false, error: error.message };
  await audit(staff, "create", "availability_exceptions", date, { reason });
  revalidateTag("schedule");
  return { ok: true };
}

export async function removeBlockedDate(id: string) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false };
  await svc.from("availability_exceptions").delete().eq("id", id);
  await audit(staff, "delete", "availability_exceptions", id);
  return { ok: true };
}
