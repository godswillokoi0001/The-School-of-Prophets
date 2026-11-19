"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { getAdminClient } from "@/lib/supabase/server";
import { audit, requireStaff, getStaff } from "@/lib/admin";
import { generateInviteToken } from "@/lib/invites";
import { getPublicSiteUrl } from "@/lib/site-url";
import { renderInviteEmail, buildHtmlEmail } from "@/lib/email-templates";
import { sendEmail, getFromAddress } from "@/lib/notify";
import { processReminders, type ReminderStage } from "@/lib/reminders";

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

  const cleanEmail = email.toLowerCase().trim();
  const site = getPublicSiteUrl();
  const token = generateInviteToken(cleanEmail, role, fullName);
  const inviteLink = `${site}/admin/accept-invite?token=${token}`;

  // 1. Pre-provision in profiles table so user is immediately listed
  try {
    const { data: existingProfile } = await svc
      .from("profiles")
      .select("id, full_name")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingProfile) {
      await svc
        .from("profiles")
        .update({ role, full_name: fullName || existingProfile.full_name, status: "active" })
        .eq("id", existingProfile.id);
    } else {
      await svc.from("profiles").insert({
        id: crypto.randomUUID(),
        email: cleanEmail,
        full_name: fullName || cleanEmail.split("@")[0],
        role,
        status: "active",
        invited_by: staff.id,
      });
    }
  } catch (profileErr) {
    console.warn("[inviteUser] Profile pre-provision notice:", profileErr);
  }

  // 2. Try to pre-provision user in Supabase auth if service role key is configured
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    try {
      const { data: userData } = await svc.auth.admin.createUser({
        email: cleanEmail,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });
      if (userData?.user) {
        await svc.from("profiles").upsert({
          id: userData.user.id,
          email: cleanEmail,
          full_name: fullName,
          role,
          invited_by: staff.id,
          status: "active",
        });
      }
    } catch (err) {
      console.warn("[inviteUser] Auth user pre-provisioning notice:", err);
    }
  }

  // 3. Render and send high-fidelity branded HTML email via Resend
  const emailContent = renderInviteEmail({
    fullName,
    email: cleanEmail,
    role,
    inviteLink,
    invitedByName: staff.fullName || "An Owner",
  });

  const sendResult = await sendEmail(
    cleanEmail,
    emailContent.subject,
    emailContent.text,
    undefined,
    emailContent.html
  );

  await audit(staff, "invite", "profiles", cleanEmail, { role, sendResult });
  revalidateTag("team");

  return {
    ok: true,
    message: sendResult === "sent"
      ? `Invitation email dispatched to ${cleanEmail}!`
      : "Invitation link generated! You can copy and share the link directly below.",
    inviteLink,
  };
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

  let recipients: { email: string; name: string }[] = [];
  if (segment === "waitlist" || segment === "applicants") {
    const { data } = await svc
      .from("submissions")
      .select("payload")
      .eq("type", segment === "waitlist" ? "waitlist" : "enrolment")
      .is("deleted_at", null);
    const map = new Map<string, string>();
    for (const r of data ?? []) {
      const p = (r.payload as Record<string, unknown>) ?? {};
      const em = String(p.email ?? "").trim().toLowerCase();
      if (em && !map.has(em)) {
        map.set(em, String(p.firstName ?? p.name ?? "").trim());
      }
    }
    recipients = [...map.entries()].map(([email, name]) => ({ email, name }));
  } else {
    const map = new Map<string, string>();
    const { data: subData } = await svc.from("subscribers").select("email, name").is("unsubscribed_at", null);
    for (const s of subData ?? []) {
      const em = String(s.email ?? "").trim().toLowerCase();
      if (em) map.set(em, String(s.name ?? "").trim());
    }
    const { data: subSubmissions } = await svc
      .from("submissions")
      .select("payload")
      .eq("type", "newsletter")
      .is("deleted_at", null);
    for (const sub of subSubmissions ?? []) {
      const p = (sub.payload as Record<string, unknown>) ?? {};
      const em = String(p.email ?? "").trim().toLowerCase();
      if (em && !map.has(em)) {
        map.set(em, String(p.firstName ?? p.name ?? "").trim());
      }
    }
    recipients = [...map.entries()].map(([email, name]) => ({ email, name }));
  }

  const key = process.env.RESEND_API_KEY;
  const from = process.env.FORMS_FROM ?? "The School of Prophets <onboarding@resend.dev>";
  const siteUrl = getPublicSiteUrl();

  let sent = 0;
  if (key && recipients.length > 0) {
    const BATCH_SIZE = 5;
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((recip) => {
          const firstName = recip.name.split(" ")[0] || "Beloved";
          const personalizedText = body
            .replace(/<[^>]+>/g, " ")
            .replace(/\{\{name\}\}/gi, recip.name || "Beloved")
            .replace(/\{\{first_name\}\}/gi, firstName)
            .replace(/\s+/g, " ")
            .trim();
          const personalizedHtmlBody = body
            .replace(/\{\{name\}\}/gi, recip.name || "Beloved")
            .replace(/\{\{first_name\}\}/gi, firstName);

          const emailHtml = buildHtmlEmail({
            badge: "Ministry Broadcast",
            title: subject,
            htmlBody: personalizedHtmlBody,
            footerNote: "You are receiving this because you subscribed to The School of Prophets updates.",
          });

          return fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: getFromAddress(recip.email),
              to: [recip.email],
              subject,
              text: personalizedText,
              html: emailHtml,
              headers: { "List-Unsubscribe": `<${siteUrl}/api/unsubscribe>` },
            }),
          }).then((r) => r.ok);
        })
      );
      for (const res of results) {
        if (res.status === "fulfilled" && res.value) sent += 1;
      }
    }
  }
  const now = new Date().toISOString();
  await svc
    .from("broadcasts")
    .update({ status: "sent", sent_at: now, stats: { recipients: recipients.length, sent } })
    .eq("id", inserted.id);

  audit(staff, "send-broadcast", "broadcasts", inserted.id, { subject, recipients: recipients.length, sent }).catch(() => {});
  revalidatePath("/admin/broadcasts");
  revalidatePath("/newsletter");

  const { data: updatedRecord } = await svc
    .from("broadcasts")
    .select("*")
    .eq("id", inserted.id)
    .maybeSingle();

  return {
    ok: true,
    message: `Sent to ${sent} of ${recipients.length} recipients.`,
    broadcast: updatedRecord,
  };
}

export async function snippetFor(kind: string, ref: string) {
  await requireStaff("admin");
  const svc = await getAdminClient();
  const site = getPublicSiteUrl();
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

/* Subscribers */
export async function deleteSubscriber(id: string) {
  const staff = await requireStaff("owner");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "Database not available" };

  const { data: sub } = await svc
    .from("subscribers")
    .select("id,email")
    .eq("id", id)
    .maybeSingle();

  if (!sub) return { ok: false, error: "Subscriber not found" };
  const cleanEmail = String(sub.email ?? "").trim().toLowerCase();

  const { error } = await svc.from("subscribers").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  if (cleanEmail) {
    try {
      await svc
        .from("submissions")
        .delete()
        .eq("type", "newsletter")
        .ilike("payload->>email", cleanEmail);
    } catch {
      // non-fatal
    }
  }

  await audit(staff, "delete-subscriber", "subscribers", id, { email: cleanEmail });
  revalidatePath("/admin/subscribers");
  revalidatePath("/admin/broadcasts");
  return { ok: true, message: "Subscriber removed successfully." };
}

/* Broadcasts */
export async function deleteBroadcast(id: string) {
  const staff = await requireStaff("owner");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "Database not available" };

  const { error } = await svc.from("broadcasts").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  await audit(staff, "delete-broadcast", "broadcasts", id, {});
  revalidatePath("/admin/broadcasts");
  return { ok: true, message: "Newsletter record deleted." };
}

/* Automated Activity & Gathering Reminders */
export async function runRemindersCheckAction() {
  const staff = await requireStaff("admin");
  const result = await processReminders({ dryRun: false });
  await audit(staff, "run-reminders-check", "system", "reminders", {
    processed: result.results.length,
    sent: result.results.filter((r) => r.status === "sent").length,
  });
  revalidatePath("/admin/schedule");
  return { ok: true, result };
}

export async function testSendReminderAction(stage: ReminderStage) {
  const staff = await requireStaff("admin");
  if (!staff.email) {
    return { ok: false, error: "Staff account has no email address configured." };
  }
  const result = await processReminders({
    dryRun: false,
    forceStage: stage,
    recipientOverride: staff.email,
  });
  await audit(staff, "test-send-reminder", "system", "reminders", {
    stage,
    target: staff.email,
  });
  return {
    ok: true,
    message: `Test ${stage} reminder sent directly to ${staff.email}.`,
    result,
  };
}
