"use server";

import { getServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/notify";
import { buildHtmlEmail } from "@/lib/email-templates";

export async function requestPasswordResetAction(email: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const cleanEmail = email.trim().toLowerCase();
  const svc = getServiceClient();
  if (!svc) {
    return { success: false, error: "Authentication service is currently unavailable. Please check your Supabase configuration." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://theschoolofprophets.site";
  const redirectTo = `${siteUrl.replace(/\/$/, "")}/admin/reset-password`;

  try {
    const { data, error } = await svc.auth.admin.generateLink({
      type: "recovery",
      email: cleanEmail,
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.warn("[requestPasswordResetAction] generateLink notice:", error.message);
      // For security, don't reveal if the email is not registered to prevent email enumeration
      return {
        success: true,
        message: `If ${cleanEmail} is registered in our admin records, a password reset link has been dispatched. Please check your inbox and spam folder.`,
      };
    }

    const actionLink = data?.properties?.action_link;
    if (!actionLink) {
      return { success: false, error: "Failed to generate recovery link. Please try again." };
    }

    const html = buildHtmlEmail({
      badge: "Account Security",
      title: "Reset Your Admin Password",
      preheader: "Password recovery link for The School of Prophets administrator portal",
      paragraphs: [
        "A password reset request was initiated for your administrator account at <strong>The School of Prophets</strong>.",
        "Click the button below to establish a new password for your account. For your protection, this secure link is valid for 1 hour.",
      ],
      cta: {
        label: "Reset My Password",
        url: actionLink,
      },
      highlightBox: {
        label: "Security Details",
        items: [
          { label: "Account Email", value: cleanEmail },
          { label: "Link Validity", value: "60 minutes" },
          { label: "Portal", value: "The School of Prophets Admin" },
        ],
      },
      closing:
        "If you did not request this password reset, please disregard this email or notify the owner immediately.<br /><br />Ministry Administration,<br /><strong>The School of Prophets</strong>",
    });

    const plainText = `Reset Your Admin Password — The School of Prophets\n\nA password reset was requested for ${cleanEmail}.\n\nClick the link below to set a new password:\n${actionLink}\n\nThis link is valid for 60 minutes.\nIf you did not request this, you can safely ignore this email.`;

    const dispatchStatus = await sendEmail(
      cleanEmail,
      "Reset Your Password — The School of Prophets",
      plainText,
      undefined,
      html
    );

    if (dispatchStatus.startsWith("failed")) {
      return {
        success: false,
        error: "Unable to send the email at this time. Please verify email delivery settings.",
      };
    }

    return {
      success: true,
      message: `A password reset link has been dispatched to ${cleanEmail}. Please check your email inbox and spam folder.`,
    };
  } catch (err: unknown) {
    console.error("[requestPasswordResetAction] Unexpected failure:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to dispatch reset email",
    };
  }
}
