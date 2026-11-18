"use server";

import { revalidateTag } from "next/cache";
import { getAdminClient } from "@/lib/supabase/server";
import { audit, requireStaff } from "@/lib/admin";
import { sendReplyEmail, sendTemplated } from "@/lib/notify";

const LABELS: Record<string, string> = {
  enrolment: "Enrolment application", waitlist: "Waitlist entry",
  prayer: "Prayer request", testimony: "Testimony", contact: "Contact message",
  registration: "Event registration", booking: "Call booking", newsletter: "Sign-up",
};

async function recordChange(id: string, actor: string, field: string, from: string | null, to: string | null) {
  const svc = await getAdminClient();
  if (!svc) return;
  await svc.from("submission_history").insert({ submission_id: id, actor, field, from_value: from, to_value: to });
}

export async function setStatus(id: string, status: string) {
  const staff = await requireStaff("moderator");
  const svc = await getAdminClient();
  if (!svc) return { ok: false };
  const { data: current } = await svc.from("submissions").select("status,type").eq("id", id).single();
  const { error } = await svc.from("submissions").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  await recordChange(id, staff.id, "status", current?.status ?? null, status);
  await audit(staff, "update", `submissions.${LABELS[current?.type ?? ""] ?? "submission"}`, id, { status });
  return { ok: true };
}

export async function addNote(id: string, body: string) {
  const staff = await requireStaff("moderator");
  const svc = await getAdminClient();
  if (!svc || !body.trim()) return { ok: false };
  const { error } = await svc.from("submission_notes").insert({ submission_id: id, author: staff.id, body: body.trim() });
  if (error) return { ok: false, error: error.message };
  await audit(staff, "note", "submissions", id, { length: body.length });
  return { ok: true };
}

export async function replyByEmail(id: string, to: string, subject: string, body: string) {
  const staff = await requireStaff("moderator");
  const result = await sendReplyEmail(to, subject, body);
  await recordChange(id, staff.id, "reply", null, to);
  await addNote(id, `Reply sent to ${to}:\nSubject: ${subject}\n\n${body}`);
  await setStatus(id, "replied");
  return { ok: true, result, message: "Reply sent successfully." };
}

export async function bulkAction(ids: string[], action: string) {
  const staff = await requireStaff("moderator");
  const svc = await getAdminClient();
  if (!svc || ids.length === 0) return { ok: false };
  if (action === "delete") {
    if (staff.role !== "owner" && staff.role !== "admin") return { ok: false, error: "Not allowed" };
    await svc.from("submissions").update({ deleted_at: new Date().toISOString() }).in("id", ids);
  } else if (action === "spam") {
    await svc.from("submissions").update({ is_spam: true, status: "spam" }).in("id", ids);
  } else if (action === "seen") {
    await svc.from("submissions").update({ status: "seen" }).in("id", ids);
  } else if (action === "archive") {
    await svc.from("submissions").update({ status: "archived" }).in("id", ids);
  }
  await audit(staff, action, "submissions", undefined, { ids });
  return { ok: true };
}

export async function restoreSubmission(id: string) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false };
  await svc.from("submissions").update({ deleted_at: null }).eq("id", id);
  await audit(staff, "restore", "submissions", id);
  return { ok: true };
}

export async function markPrayed(id: string, notes: string) {
  const staff = await requireStaff("moderator");
  const svc = await getAdminClient();
  if (!svc) return { ok: false };
  const { data } = await svc.from("submissions").select("payload").eq("id", id).single();
  const payload = (data?.payload ?? {}) as Record<string, unknown>;
  const prayedCount = Number(payload.prayedFor ?? 0) + 1;
  await svc.from("submissions").update({
    payload: { ...payload, prayedFor: prayedCount, prayedNotes: notes || (payload.prayedNotes as string) || "" },
  }).eq("id", id);
  await recordChange(id, staff.id, "prayed", String(prayedCount - 1), String(prayedCount));
  return { ok: true, prayedCount };
}

export async function decideApplication(id: string, decision: "approved" | "declined" | "waitlist") {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database connection" };
  const { data } = await svc.from("submissions").select("payload").eq("id", id).single();
  const payload = (data?.payload ?? {}) as Record<string, unknown>;
  const name = String(payload.fullName ?? payload.name ?? "there");
  const email = String(payload.email ?? payload.emailAddress ?? "");
  const cohort = String(payload.cohort || "The School of Prophets Bible Institute");

  const templateKey = decision === "approved" ? "acceptance" : decision === "declined" ? "decline" : null;
  if (templateKey && email) {
    await sendTemplated(templateKey, email, { name, cohort });
  }

  await svc.from("submissions").update({ status: decision }).eq("id", id);
  await recordChange(id, staff.id, "status", null, decision);
  await addNote(
    id,
    decision === "approved"
      ? `Application ACCEPTED by ${staff.fullName || "Admin"}. Acceptance email sent to ${email || "applicant"}.`
      : decision === "declined"
      ? `Application DECLINED by ${staff.fullName || "Admin"}. Notification email sent to ${email || "applicant"}.`
      : `Application moved to waitlist by ${staff.fullName || "Admin"}.`
  );
  await audit(staff, decision, "applications", id);
  revalidateTag("testimonies");
  return { ok: true, message: `Application ${decision} successfully.` };
}

export async function approveTestimony(id: string, editedBody: string | null) {
  const staff = await requireStaff("moderator");
  const svc = await getAdminClient();
  if (!svc) return { ok: false };
  const { data } = await svc.from("submissions").select("payload").eq("id", id).single();
  const payload = (data?.payload ?? {}) as Record<string, unknown>;
  const next = editedBody ? { ...payload, testimony: editedBody } : payload;
  await svc.from("submissions").update({ payload: next, status: "approved" }).eq("id", id);
  await recordChange(id, staff.id, "status", null, "approved");
  await audit(staff, "publish", "testimonies", id);
  revalidateTag("testimonies");
  return { ok: true };
}

export async function featureTestimony(id: string, featured: boolean) {
  await requireStaff("moderator");
  const svc = await getAdminClient();
  if (!svc) return { ok: false };
  const { data } = await svc.from("submissions").select("payload").eq("id", id).single();
  const payload = (data?.payload ?? {}) as Record<string, unknown>;
  await svc.from("submissions").update({ payload: { ...payload, featured } }).eq("id", id);
  revalidateTag("testimonies");
  return { ok: true };
}

export async function convertWaitlist(ids: string[]) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc || ids.length === 0) return { ok: false };
  const { data } = await svc.from("submissions").select("id,payload").in("id", ids);
  for (const row of data ?? []) {
    const p = (row.payload ?? {}) as Record<string, unknown>;
    const email = String(p.email ?? "");
    const name = String(p.fullName ?? p.name ?? "there");
    if (email) {
      await sendTemplated("waitlist_open", email, {
        name,
        link: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/training`,
      });
    }
    await svc.from("submissions").update({ status: "replied" }).eq("id", row.id);
    await recordChange(row.id, staff.id, "waitlist-converted", null, "emailed");
  }
  await audit(staff, "waitlist-converted", "applications", undefined, { count: ids.length });
  return { ok: true, count: ids.length };
}
