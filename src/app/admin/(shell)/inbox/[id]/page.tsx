import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin";
import { getServiceClient, supabaseConfigured } from "@/lib/supabase/server";
import { SubmissionDetail, type SubmissionRow } from "@/components/admin/InboxUI";

export const dynamic = "force-dynamic";

export default async function SubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff("moderator");
  const { id } = await params;
  const svc = getServiceClient();
  if (!svc || !supabaseConfigured()) notFound();

  const { data } = await svc
    .from("submissions")
    .select("id,type,status,private,payload,created_at,submission_notes(body,created_at)")
    .eq("id", id)
    .single();
  if (!data) notFound();

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
