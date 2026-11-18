"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient } from "@/lib/supabase/server";
import { audit, requireStaff } from "@/lib/admin";
import { sendBetaFixedEmail } from "@/lib/notify";
import { BETA_SETTING_KEY, BETA_TAGS, BETA_TYPE, type BetaPayload, type StoryConsent } from "@/lib/beta";

const ALLOWED_STATUS = new Set([
  "new",
  "seen",
  "triaged",
  "in_progress",
  "fixed",
  "wont_fix",
  "archived",
]);

function revalidate(id?: string) {
  revalidatePath("/admin/beta");
  revalidatePath("/admin/inbox");
  if (id) revalidatePath(`/admin/inbox/${id}`);
}

export async function setBetaStatus(id: string, status: string, notifyReporter = false) {
  const staff = await requireStaff("moderator");
  if (!ALLOWED_STATUS.has(status)) return { ok: false, error: "Unknown status." };
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database connection." };

  const { data } = await svc.from("submissions").select("payload,status").eq("id", id).single();
  const payload = (data?.payload ?? {}) as BetaPayload;
  const { error } = await svc.from("submissions").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  if (data?.status !== status) {
    await svc.from("submission_history").insert({
      submission_id: id,
      actor: staff.id,
      field: "status",
      from_value: data?.status ?? null,
      to_value: status,
    });
  }

  let emailed = false;
  if (notifyReporter && status === "fixed" && payload.email) {
    const result = await sendBetaFixedEmail(
      payload.email,
      String(payload.name ?? ""),
      payload.issues?.length ?? 1,
    );
    emailed = result === "sent";
    if (emailed) {
      await svc.from("submission_notes").insert({
        submission_id: id,
        author: staff.id,
        body: `“We fixed what you found” email sent to ${payload.email}.`,
      });
    }
  }

  await audit(staff, "update", "beta_feedback", id, { status, emailed });
  revalidate(id);
  return {
    ok: true,
    message: emailed ? "Marked fixed and the tester was emailed." : `Marked ${status.replace("_", " ")}.`,
    emailed,
  };
}

export async function assignBetaReview(id: string, userId: string | null) {
  const staff = await requireStaff("moderator");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database connection." };
  const { error } = await svc.from("submissions").update({ assignee: userId || null }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  await audit(staff, "assign", "beta_feedback", id, { assignee: userId });
  revalidate(id);
  return { ok: true, message: userId ? "Assigned." : "Unassigned." };
}

export async function setBetaTags(id: string, tags: string[]) {
  const staff = await requireStaff("moderator");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database connection." };
  const clean = [...new Set(tags.filter((tag) => (BETA_TAGS as readonly string[]).includes(tag)))];
  const { error } = await svc.from("submissions").update({ tags: clean }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  await audit(staff, "tag", "beta_feedback", id, { tags: clean });
  revalidate(id);
  return { ok: true, message: "Tags saved." };
}

export async function setBetaStory(id: string, story: string, status: "draft" | "approved") {
  const staff = await requireStaff("moderator");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database connection." };
  const { data } = await svc.from("submissions").select("payload").eq("id", id).single();
  const payload = (data?.payload ?? {}) as BetaPayload;
  const next: BetaPayload = {
    ...payload,
    story: story.slice(0, 1500).trim(),
    story_status: status,
  };
  const patch: Record<string, unknown> = { payload: next };
  if (status === "approved") patch.status = "triaged";
  const { error } = await svc.from("submissions").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };
  await audit(staff, status === "approved" ? "approve-story" : "edit", "beta_feedback", id);
  revalidate(id);
  return { ok: true, message: status === "approved" ? "Story approved for publishing." : "Story saved." };
}

export async function setBetaConsent(id: string, consent: StoryConsent) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database connection." };
  const { data } = await svc.from("submissions").select("payload").eq("id", id).single();
  const payload = (data?.payload ?? {}) as BetaPayload;
  const next: BetaPayload = { ...payload, story_consent: consent };
  if (consent === "private") next.display_name = "";
  const { error } = await svc.from("submissions").update({ payload: next }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  await audit(staff, "consent", "beta_feedback", id, { consent });
  revalidate(id);
  return { ok: true, message: "Consent updated." };
}

/**
 * Turn an approved story into a draft testimony in the existing Testimonies
 * pipeline (submissions.type = testimony, awaiting approval in the inbox).
 */
export async function createTestimonyFromBeta(id: string) {
  const staff = await requireStaff("moderator");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database connection." };

  const { data } = await svc.from("submissions").select("payload").eq("id", id).single();
  const payload = (data?.payload ?? {}) as BetaPayload;

  if (!payload.story || !payload.story.trim()) return { ok: false, error: "There is no story on this review." };
  if (payload.story_consent !== "public_named" && payload.story_consent !== "public_anonymous") {
    return {
      ok: false,
      error: "The tester did not consent to publication. Change the consent only with their written permission.",
    };
  }

  const name =
    payload.story_consent === "public_named"
      ? payload.display_name || payload.name || "A member of the fellowship"
      : "Anonymous";

  const { data: created, error } = await svc
    .from("submissions")
    .insert({
      type: "testimony",
      status: "new",
      private: false,
      payload: {
        name,
        email: payload.email ?? "",
        testimony: payload.story.trim(),
        consent: true,
        source: "beta_feedback",
        beta_submission_id: id,
      },
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  const { data: current } = await svc.from("submissions").select("payload").eq("id", id).single();
  const latest = (current?.payload ?? payload) as BetaPayload;
  await svc
    .from("submissions")
    .update({ payload: { ...latest, story_status: "approved" } })
    .eq("id", id);

  await audit(staff, "create-testimony", "beta_feedback", id, { testimonyId: created?.id });
  revalidate(id);
  return {
    ok: true,
    message: `Draft testimony created (${name}). Approve it in the inbox when you are ready.`,
  };
}

export async function setBetaOpen(open: boolean) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database connection." };
  const { error } = await svc
    .from("site_settings")
    .upsert({ key: BETA_SETTING_KEY, value: { status: open ? "open" : "closed" } }, { onConflict: "key" });
  if (error) return { ok: false, error: error.message };
  await audit(staff, open ? "beta-open" : "beta-close", "site_settings", BETA_SETTING_KEY);
  revalidatePath("/beta-testers");
  revalidatePath("/admin/beta");
  return {
    ok: true,
    message: open ? "The beta is accepting reviews again." : "The beta is closed. The page now thanks visitors and the form is hidden.",
  };
}

export async function removeSampleBeta() {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "No database connection." };
  const { data } = await svc
    .from("submissions")
    .select("id")
    .eq("type", BETA_TYPE)
    .eq("payload->>isSample", "true");
  const ids = (data ?? []).map((row) => row.id);
  if (ids.length === 0) return { ok: true, message: "There are no sample reviews to remove." };
  const { error } = await svc.from("submissions").delete().in("id", ids);
  if (error) return { ok: false, error: error.message };
  await audit(staff, "delete-samples", "beta_feedback", undefined, { count: ids.length });
  revalidate();
  return { ok: true, message: `${ids.length} sample review${ids.length === 1 ? "" : "s"} removed.` };
}

export async function addBetaNote(id: string, body: string) {
  const staff = await requireStaff("moderator");
  const svc = await getAdminClient();
  if (!svc || !body.trim()) return { ok: false, error: "Write something first." };
  const { error } = await svc
    .from("submission_notes")
    .insert({ submission_id: id, author: staff.id, body: body.trim() });
  if (error) return { ok: false, error: error.message };
  await audit(staff, "note", "beta_feedback", id, { length: body.length });
  revalidate(id);
  return { ok: true, message: "Note saved." };
}
