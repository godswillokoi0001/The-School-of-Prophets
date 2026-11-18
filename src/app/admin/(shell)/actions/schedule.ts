"use server";

import { revalidateTag } from "next/cache";
import { getAdminClient } from "@/lib/supabase/server";
import { audit, requireStaff } from "@/lib/admin";

type SessionInput = {
  id?: string;
  day: number;
  title: string;
  type: string;
  start_time: string;
  end_time: string | null;
  description: string;
  join_url: string;
  active: boolean;
  sort_order: number;
};

export async function saveSessions(rows: SessionInput[]) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database connection" };

  const payload = rows.map((r, i) => ({
    id: r.id && r.id.trim() ? r.id : crypto.randomUUID(),
    day: Number(r.day),
    title: r.title ? r.title.trim() : "Untitled Gathering",
    type: r.type || "Teaching",
    start_time: r.start_time || "19:00",
    end_time: r.end_time || null,
    description: r.description ?? "",
    join_url: r.join_url ?? "",
    active: r.active ?? true,
    sort_order: i + 1,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await svc
    .from("schedule_sessions")
    .upsert(payload, { onConflict: "id" });
  if (error) return { ok: false, error: error.message };
  await audit(staff, "update", "schedule_sessions", undefined, { count: rows.length });
  revalidateTag("schedule");
  return { ok: true };
}

export async function deleteSession(id: string) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false };
  const { error } = await svc.from("schedule_sessions").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await audit(staff, "delete", "schedule_sessions", id);
  revalidateTag("schedule");
  return { ok: true };
}

export async function addException(
  sessionId: string,
  occurrenceDate: string,
  action: "cancel" | "reschedule",
  newStartTime: string,
  note: string,
) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database connection" };
  const { error } = await svc.from("schedule_exceptions").insert({
    session_id: sessionId,
    occurrence_date: occurrenceDate,
    action,
    new_start_time: action === "reschedule" ? newStartTime : null,
    note,
  });
  if (error) return { ok: false, error: error.message };
  await audit(staff, action, "schedule_exceptions", sessionId, { date: occurrenceDate, note });
  revalidateTag("schedule");
  return { ok: true };
}

export async function deleteException(id: string) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false };
  await svc.from("schedule_exceptions").delete().eq("id", id);
  await audit(staff, "delete", "schedule_exceptions", id);
  revalidateTag("schedule");
  return { ok: true };
}
