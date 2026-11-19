"use server";

import { getServiceRoleKey } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/notify";
import { renderPasswordResetEmail } from "@/lib/email-templates";
import { createClient } from "@supabase/supabase-js";

export async function requestPasswordResetAction(email: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const cleanEmail = email.trim().toLowerCase();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://theschoolofprophets.site";
  const redirectTo = `${siteUrl.replace(/\/$/, "")}/admin/reset-password`;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = getServiceRoleKey();

  if (!supabaseUrl) {
    return { success: false, error: "Supabase URL is not configured." };
  }

  // --- Attempt 1: Branded Liturgical Email via Service Role + Resend ---
  if (serviceKey) {
    try {
      const adminSb = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data, error } = await adminSb.auth.admin.generateLink({
        type: "recovery",
        email: cleanEmail,
        options: {
          redirectTo,
        },
      });

      if (!error && data?.properties?.action_link) {
        const actionLink = data.properties.action_link;
        const rendered = renderPasswordResetEmail({
          email: cleanEmail,
          resetUrl: actionLink,
        });

        const status = await sendEmail(
          cleanEmail,
          rendered.subject,
          rendered.text,
          undefined,
          rendered.html
        );

        if (!status.startsWith("failed")) {
          return {
            success: true,
            message: `A password reset link has been dispatched to ${cleanEmail}. Please check your inbox and spam folder.`,
          };
        }
      } else if (error) {
        console.warn("[requestPasswordResetAction] generateLink notice:", error.message);
      }
    } catch (adminErr) {
      console.warn("[requestPasswordResetAction] admin.generateLink error:", adminErr);
    }
  }

  // --- Attempt 2: Direct Supabase Password Reset Fallback ---
  // Guaranteed to dispatch even if service role key is not yet added in Vercel
  if (anonKey) {
    try {
      const sb = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false },
      });

      const { error: resetErr } = await sb.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo,
      });

      if (resetErr) {
        return { success: false, error: resetErr.message };
      }

      return {
        success: true,
        message: `A password reset link has been dispatched to ${cleanEmail}. Please check your inbox and spam folder.`,
      };
    } catch (err: unknown) {
      console.error("[requestPasswordResetAction] Supabase fallback error:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to dispatch reset email",
      };
    }
  }

  return { success: false, error: "No available method to dispatch reset email." };
}
