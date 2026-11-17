import { requireStaff } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase/server";
import { UsersManager } from "@/components/admin/UsersManager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const staff = await requireStaff("owner");
  const svc = await getAdminClient();
  const members = svc
    ? (await svc.from("profiles").select("id,email,full_name,role,status,created_at").order("created_at")).data ?? []
    : [];
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 font-display text-2xl">Team & roles</h1>
      <p className="mb-4 text-xs opacity-60">
        Invite teammates by email and choose what each one can see and do.
        Deactivated accounts keep the audit history but cannot sign in.
      </p>
      <UsersManager members={members} selfId={staff.id} />
    </div>
  );
}
