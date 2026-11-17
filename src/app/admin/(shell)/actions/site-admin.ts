"use server";

import { revalidateTag } from "next/cache";
import { getAdminClient } from "@/lib/supabase/server";
import { audit, requireStaff, getStaff } from "@/lib/admin";

/* FAQ */
export async function saveFaqs(rows: { id?: string; question: string; answer: string; sort_order: number; active: boolean }[]) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database" };
  const { error } = await svc.from("faqs").upsert(rows.map((r) => ({ ...r, id: r.id || undefined })));
  if (error) return { ok: false, error: error.message };
  await audit(staff, "update", "faqs", undefined, { count: rows.length });
  revalidateTag("faqs");
  return { ok: true };
}

export async function deleteFaq(id: string) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false };
  await svc.from("faqs").delete().eq("id", id);
  await audit(staff, "delete", "faqs", id);
  revalidateTag("faqs");
  return { ok: true };
}

/* Team */
export async function saveTeam(rows: { id?: string; name: string; role_label: string; bio: string; photo_url: string | null; sort_order: number; visible: boolean }[]) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database" };
  const { error } = await svc.from("team_members").upsert(rows.map((r) => ({ ...r, id: r.id || undefined })));
  if (error) return { ok: false, error: error.message };
  await audit(staff, "update", "team_members", undefined, { count: rows.length });
  revalidateTag("team");
  return { ok: true };
}

export async function deleteTeamMember(id: string) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false };
  await svc.from("team_members").delete().eq("id", id);
  await audit(staff, "delete", "team_members", id);
  revalidateTag("team");
  return { ok: true };
}

/* Email templates */
export async function saveEmailTemplate(key: string, subject: string, body: string) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database" };
  const { error } = await svc.from("email_templates").upsert(
    { key, subject, body, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (error) return { ok: false, error: error.message };
  await audit(staff, "update", "email_templates", key);
  return { ok: true };
}

export async function testEmailTemplate(to: string, subject: string, body: string) {
  const staff = await getStaff();
  if (!staff) return { ok: false, error: "Not signed in" };
  const { sendReplyEmail } = await import("@/lib/notify");
  const result = await sendReplyEmail(to, `[TEST] ${subject}`, body.replace(/\{\{name\}\}/g, staff.fullName || "there").replace(/\{\{type\}\}/g, "test message"));
  return { ok: result === "sent", result };
}

/* Users (owner) */
export async function inviteUser(email: string, role: string, fullName: string) {
  const staff = await requireStaff("owner");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database" };
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await svc.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
    redirectTo: `${site}/admin/auth/callback`,
  });
  if (error) return { ok: false, error: error.message };
  if (data.user) {
    await svc.from("profiles").upsert({ id: data.user.id, email, full_name: fullName, role, invited_by: staff.id });
  }
  await audit(staff, "invite", "profiles", email, { role });
  return { ok: true };
}

export async function setUserRole(id: string, role: string) {
  const staff = await requireStaff("owner");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database" };
  if (id === staff.id && role !== "owner")
    return { ok: false, error: "You cannot remove your own Owner role. Ask another Owner to do it." };
  const { error } = await svc.from("profiles").update({ role }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  await audit(staff, "role-change", "profiles", id, { role });
  return { ok: true };
}

export async function setUserStatus(id: string, status: string) {
  const staff = await requireStaff("owner");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database" };
  if (id === staff.id) return { ok: false, error: "You cannot deactivate yourself." };
  const { error } = await svc.from("profiles").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  await audit(staff, status === "active" ? "activate" : "deactivate", "profiles", id);
  return { ok: true };
}

export async function deleteUser(id: string) {
  const staff = await requireStaff("owner");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database" };
  if (id === staff.id) return { ok: false, error: "You cannot delete yourself." };

  try {
    await svc.auth.admin.deleteUser(id);
  } catch (err) {
    console.warn("Could not delete from auth.users directly:", err);
  }

  const { error } = await svc.from("profiles").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  await audit(staff, "delete", "profiles", id);
  return { ok: true };
}

/* Privacy tools */
export async function personSearch(term: string) {
  await requireStaff("owner");
  const svc = await getAdminClient();
  if (!svc) return [];
  const like = `%${term}%`;
  const { data } = await svc
    .from("submissions")
    .select("id,type,payload,created_at,status")
    .or(`payload->>email.ilike.${like},payload->>whatsapp.ilike.${like}`)
    .is("deleted_at", null)
    .limit(100);
  const { data: bookings } = await svc
    .from("bookings")
    .select("id,name,email,whatsapp,created_at,starts_at")
    .or(`email.ilike.${like},whatsapp.ilike.${like}`)
    .limit(100);
  const { data: subs } = await svc.from("subscribers").select("id,email,name,created_at").ilike("email", like).limit(100);
  return [
    ...(data ?? []).map((r) => ({ kind: "submission", id: r.id, summary: `${r.type} · ${r.status} · ${r.created_at?.slice(0, 10)}`, payload: r.payload })),
    ...(bookings ?? []).map((r) => ({ kind: "booking", id: r.id, summary: `call · ${r.starts_at?.slice(0, 10)}`, payload: r })),
    ...(subs ?? []).map((r) => ({ kind: "subscriber", id: r.id, summary: `subscriber · ${r.created_at?.slice(0, 10)}`, payload: r })),
  ];
}

export async function erasePerson(ids: string[]) {
  const staff = await requireStaff("owner");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database" };
  for (const id of ids) {
    await svc.from("submissions").update({ payload: { erased: true }, deleted_at: new Date().toISOString() }).eq("id", id);
    await svc.from("bookings").update({ name: "Erased", email: "erased@example.com", whatsapp: "", topic: "", notes: "", admin_notes: "" }).eq("id", id);
  }
  await audit(staff, "erase-person", "privacy", undefined, { count: ids.length });
  return { ok: true, count: ids.length };
}

/* Broadcasts */
export async function sendBroadcast(subject: string, body: string, segment: string, scheduledAt?: string) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database" };

  const { data: insertedRow } = await svc
    .from("broadcasts")
    .insert({ subject, body, segment, status: scheduledAt ? "scheduled" : "sending", scheduled_at: scheduledAt ?? null, created_by: staff.id })
    .select("id")
    .single();
  const inserted = { id: insertedRow?.id ?? "" };

  if (scheduledAt) {
    await audit(staff, "schedule-broadcast", "broadcasts", inserted.id, { subject, scheduledAt });
    return { ok: true, message: "Scheduled." };
  }

  let emails: string[] = [];
  if (segment === "waitlist" || segment === "applicants") {
    const { data } = await svc
      .from("submissions")
      .select("payload")
      .eq("type", segment === "waitlist" ? "waitlist" : "enrolment")
      .is("deleted_at", null);
    emails = [...new Set((data ?? []).map((r) => String((r.payload as Record<string, unknown>).email ?? "")).filter(Boolean))];
  } else {
    const { data } = await svc.from("subscribers").select("email").is("unsubscribed_at", null);
    emails = (data ?? []).map((r) => r.email);
  }

  const key = process.env.RESEND_API_KEY;
  const from = process.env.FORMS_FROM ?? "The School of Prophets <onboarding@resend.dev>";
  let sent = 0;
  if (key) {
    for (const email of emails) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from,
            to: [email],
            subject,
            text: body.replace(/\{\{name\}\}/g, ""),
            headers: { "List-Unsubscribe": `<${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/unsubscribe>` },
          }),
        });
        if (res.ok) sent += 1;
      } catch {
        // keep going; failures are recorded below
      }
    }
  }
  await svc.from("broadcasts").update({ status: "sent", sent_at: new Date().toISOString(), stats: { recipients: emails.length, sent } }).eq("id", inserted.id);
  await audit(staff, "send-broadcast", "broadcasts", inserted.id, { subject, recipients: emails.length, sent });
  return { ok: true, message: `Sent to ${sent} of ${emails.length} recipients.` };
}

export async function snippetFor(kind: string, ref: string) {
  await requireStaff("admin");
  const svc = await getAdminClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  if (!svc) return { ok: false, text: "" };
  if (kind === "teaching") {
    const { data } = await svc.from("teachings").select("title,summary,slug").eq("id", ref).maybeSingle();
    if (!data) return { ok: false, text: "" };
    return { ok: true, text: `NEW TEACHING\n\n${data.title}\n\n${(data.summary ?? "").slice(0, 180)}\n\nWatch/read: ${site}/teachings/${data.slug}\n\nThe School of Prophets` };
  }
  const { data } = await svc.from("events").select("title,description,slug,starts_at").eq("id", ref).maybeSingle();
  if (!data) return { ok: false, text: "" };
  const when = new Date(data.starts_at).toLocaleString("en-GB", { timeZone: "Africa/Lagos" });
  return { ok: true, text: `YOU ARE INVITED\n\n${data.title}\n\n${when} (Lagos time)\n${(data.description ?? "").slice(0, 160)}\n\nDetails: ${site}/events/${data.slug}\n\nThe School of Prophets` };
}

/* Notifications settings */
export async function saveNotificationSettings(userId: string, values: Record<string, unknown>) {
  const staff = await getStaff();
  if (!staff || (staff.id !== userId && staff.role !== "owner"))
    return { ok: false, error: "Not allowed" };
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database" };
  const { error } = await svc.from("notification_settings").upsert({ user_id: userId, ...values });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
