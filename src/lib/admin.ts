import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/server";

export type Role = "owner" | "admin" | "moderator" | "viewer";

export type Staff = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
};

export async function getStaff(): Promise<Staff | null> {
  const sb = await createSupabaseServer();
  if (!sb) return null;
  const { data: userData } = await sb.auth.getUser();
  if (!userData?.user) return null;
  const svc = getServiceClient();
  const { data: profile } = await svc!
    .from("profiles")
    .select("id,email,full_name,role,status")
    .eq("id", userData.user.id)
    .maybeSingle();
  if (!profile || profile.status !== "active") return null;
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role as Role,
  };
}

const rank: Record<Role, number> = { viewer: 1, moderator: 2, admin: 3, owner: 4 };

export function roleAtLeast(role: Role, min: Role) {
  return rank[role] >= rank[min];
}

export async function requireStaff(min: Role = "viewer"): Promise<Staff> {
  const staff = await getStaff();
  if (!staff) redirect("/admin/login");
  if (!roleAtLeast(staff.role, min)) redirect("/admin");
  return staff;
}

export async function audit(
  actor: Staff | null,
  action: string,
  entity: string,
  entityId?: string,
  detail: Record<string, unknown> = {},
) {
  const svc = getServiceClient();
  if (!svc) {
    console.info(`[audit] ${action} ${entity} ${entityId ?? ""}`, detail);
    return;
  }
  await svc.from("audit_log").insert({
    actor: actor?.id ?? null,
    actor_email: actor?.email ?? "system",
    action,
    entity,
    entity_id: entityId ?? null,
    detail,
  });
}
