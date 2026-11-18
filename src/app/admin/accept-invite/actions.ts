"use server";

import { parseInviteToken } from "@/lib/invites";
import { getServiceClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function verifyTokenAction(token: string) {
  return parseInviteToken(token);
}

export async function completeInviteAction(token: string, password: string) {
  const verified = parseInviteToken(token);
  if (!verified.ok || !verified.data) {
    return { ok: false, error: verified.error ?? "Invalid invitation token." };
  }

  const { email, role, fullName } = verified.data;
  const cleanEmail = email.toLowerCase().trim();

  if (!password || password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters long." };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    return { ok: false, error: "Database configuration is missing." };
  }

  try {
    // 1. If service role key is available, use auth.admin for direct confirmed creation
    if (serviceKey) {
      const adminSb = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
      const { data: userList } = await adminSb.auth.admin.listUsers();
      const existing = userList?.users.find((u) => u.email?.toLowerCase() === cleanEmail);

      let userId = existing?.id;

      if (!existing) {
        const { data: created, error: createError } = await adminSb.auth.admin.createUser({
          email: cleanEmail,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        });
        if (createError) return { ok: false, error: createError.message };
        userId = created.user.id;
      } else {
        const { error: updateError } = await adminSb.auth.admin.updateUserById(existing.id, {
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        });
        if (updateError) return { ok: false, error: updateError.message };
      }

      // Upsert into profiles
      await adminSb.from("profiles").upsert({
        id: userId,
        email: cleanEmail,
        full_name: fullName,
        role,
        status: "active",
      });

      return { ok: true, email: cleanEmail };
    }

    // 2. Try stored procedure/RPC if configured in Supabase
    const svc = getServiceClient();
    if (svc) {
      try {
        const { data: rpcRes, error: rpcErr } = await svc.rpc("accept_staff_invite", {
          target_email: cleanEmail,
          target_password: password,
          target_full_name: fullName,
          target_role: role,
        });
        if (!rpcErr && rpcRes?.ok) {
          return { ok: true, email: cleanEmail };
        }
      } catch {
        // Fall back to client signup
      }
    }

    // 3. Fallback using client signup
    const clientSb = createClient(url, anonKey);
    const { data: authData, error: authError } = await clientSb.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (authError && !authError.message.toLowerCase().includes("already registered")) {
      return { ok: false, error: authError.message };
    }

    const userId = authData?.user?.id;
    if (userId && svc) {
      await svc.from("profiles").upsert({
        id: userId,
        email: cleanEmail,
        full_name: fullName,
        role,
        status: "active",
      });
    }

    return { ok: true, email: cleanEmail };
  } catch (err: unknown) {
    console.error("[completeInviteAction] Error:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create account." };
  }
}
