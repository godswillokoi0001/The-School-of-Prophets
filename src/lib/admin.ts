import { redirect } from "next/navigation";
import { cache } from "react";
import { createSupabaseServer, getAdminClient } from "@/lib/supabase/server";

export type Role = "owner" | "admin" | "moderator" | "viewer";

export type Staff = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
};

export const getStaff = cache(async (): Promise<Staff | null> => {
  const sb = await createSupabaseServer();
  if (!sb) return null;
  const { data: userData } = await sb.auth.getUser();
  if (!userData?.user) return null;
  const client = (await getAdminClient()) || sb;

  let { data: profile } = await client
    .from("profiles")
    .select("id,email,full_name,role,status")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!profile && userData.user.email) {
    const cleanEmail = userData.user.email.toLowerCase().trim();
    const { data: pByEmail } = await client
      .from("profiles")
      .select("id,email,full_name,role,status")
      .ilike("email", cleanEmail)
      .maybeSingle();

    if (pByEmail) {
      profile = pByEmail;
      try {
        await client.from("profiles").update({ id: userData.user.id }).eq("id", pByEmail.id);
        profile.id = userData.user.id;
      } catch {
        // non-fatal
      }
    } else if (cleanEmail === "censusokoi515@gmail.com" || cleanEmail === "lawrenceiwara1@gmail.com") {
      const ownerName = cleanEmail === "lawrenceiwara1@gmail.com" ? "Prophet Lawrence Iwara" : "Owner";
      try {
        await client.from("profiles").upsert({
          id: userData.user.id,
          email: cleanEmail,
          full_name: ownerName,
          role: "owner",
          status: "active",
        });
        profile = {
          id: userData.user.id,
          email: cleanEmail,
          full_name: ownerName,
          role: "owner",
          status: "active",
        };
      } catch {
        // non-fatal
      }
    }
  }

  if (!profile || profile.status !== "active") return null;
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role as Role,
  };
});

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
  try {
    const client = await getAdminClient();
    if (!client) {
      console.info(`[audit] ${action} ${entity} ${entityId ?? ""}`, detail);
      return;
    }
    const { error } = await client.from("audit_log").insert({
      actor: actor?.id ?? null,
      actor_email: actor?.email ?? "system",
      action,
      entity,
      entity_id: entityId ?? null,
      detail,
    });
    if (error) {
      console.warn(`[audit] Insert warning:`, error.message);
    }
  } catch (err) {
    console.warn(`[audit] Failed to record audit log:`, err);
  }
}
