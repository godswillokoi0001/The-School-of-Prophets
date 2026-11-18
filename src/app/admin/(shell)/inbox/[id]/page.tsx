import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase/server";
import { SubmissionDetail, type SubmissionRow } from "@/components/admin/InboxUI";

export const dynamic = "force-dynamic";

export default async function SubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff("moderator");
  const { id } = await params;
  const svc = await getAdminClient();
  if (!svc) notFound();

  const { data } = await svc
    .from("submissions")
    .select("id,type,status,private,payload,created_at,submission_notes(body,created_at)")
    .eq("id", id)
    .single();
  if (!data) notFound();

  // Automatically mark as read once checked by staff
  if (data.status === "new") {
    await svc.from("submissions").update({ status: "read" }).eq("id", id);
    data.status = "read";
    try {
      revalidatePath("/admin");
      revalidatePath("/admin/inbox");
    } catch {
      // ignore in edge cases
    }
  }

  const p = (data.payload ?? {}) as Record<string, unknown>;
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

  return <SubmissionDetail row={row} role={(await requireStaff("moderator")).role} />;
}
