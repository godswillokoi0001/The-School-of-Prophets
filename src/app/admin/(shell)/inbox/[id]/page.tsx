import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase/server";
import { SubmissionDetail, type SubmissionRow } from "@/components/admin/InboxUI";
import { BetaSubmissionDetail } from "@/components/admin/BetaSubmissionDetail";
import { BETA_TYPE, type BetaPayload } from "@/lib/beta";

export const dynamic = "force-dynamic";

export default async function SubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await requireStaff("moderator");
  const { id } = await params;
  const svc = await getAdminClient();
  if (!svc) notFound();

  const { data } = await svc
    .from("submissions")
    .select("id,type,status,private,payload,created_at,tags,assignee,submission_notes(body,created_at)")
    .eq("id", id)
    .single();
  if (!data) notFound();

  // Automatically mark as read once checked by staff
  if (data.status === "new") {
    await svc.from("submissions").update({ status: "seen" }).eq("id", id);
    data.status = "seen";
    try {
      revalidatePath("/admin");
      revalidatePath("/admin/inbox");
    } catch {
      // ignore in edge cases
    }
  }

  const p = (data.payload ?? {}) as Record<string, unknown>;

  if (data.type === BETA_TYPE) {
    const { data: team } = await svc
      .from("profiles")
      .select("id,full_name,email")
      .eq("status", "active")
      .in("role", ["owner", "admin", "moderator"])
      .order("full_name");

    return (
      <BetaSubmissionDetail
        role={staff.role}
        team={(team ?? []).map((m) => ({ id: m.id, name: m.full_name ?? "", email: m.email ?? "" }))}
        row={{
          id: data.id,
          status: data.status,
          payload: p as BetaPayload,
          name: String(p.name ?? ""),
          email: String(p.email ?? ""),
          whatsapp: String(p.whatsapp ?? ""),
          created_at: data.created_at,
          tags: (data.tags ?? []) as string[],
          assignee: data.assignee ?? null,
          notes: data.submission_notes ?? [],
        }}
      />
    );
  }

  const row: SubmissionRow = {
    id: data.id,
    type: data.type,
    status: data.status,
    private: data.private,
    name: String(p.name ?? p.fullName ?? ""),
    email: String(p.email ?? ""),
    whatsapp: String(p.whatsapp ?? ""),
    created_at: data.created_at,
    payload: p,
    notes: data.submission_notes ?? [],
    prayedFor: Number(p.prayedFor ?? 0) || undefined,
  };

  return <SubmissionDetail row={row} role={staff.role} />;
}
