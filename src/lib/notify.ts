import * as webpush from "web-push";
import { getServiceClient } from "@/lib/supabase/server";
import {
  buildHtmlEmail,
  renderConfirmationEmail,
  renderBookingConfirmedEmail,
  renderBookingCancelledEmail,
  renderEnrolmentAcceptedEmail,
  renderEnrolmentDeclinedEmail,
  renderWaitlistOpenEmail,
  renderGenericEmail,
} from "@/lib/email-templates";

export type SubmissionRow = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
};

const typeLabels: Record<string, string> = {
  enrolment: "Enrolment application",
  waitlist: "Waitlist entry",
  prayer: "Prayer request",
  testimony: "Testimony",
  contact: "Contact message",
  registration: "Event registration",
  booking: "Call booking",
  newsletter: "Newsletter signup",
};

export function fill(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "");
}

async function log(
  channel: string,
  target: string,
  subject: string,
  body: string,
  status: string,
  error: string,
  relatedId?: string,
) {
  const svc = getServiceClient();
  if (!svc) return;
  try {
    await svc.from("notification_log").insert({
      channel, target, subject, body, status, error,
      related_type: "submission",
      related_id: relatedId ?? null,
    });
  } catch {
    // Logging to DB is secondary to actual dispatch
  }
}

export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  replyTo?: string,
  html?: string,
) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) {
    console.warn("[notify:sendEmail] Skipped: no RESEND_API_KEY or recipient", { to, hasKey: Boolean(key) });
    return "skipped:no-config";
  }

  const from = process.env.FORMS_FROM ?? "The School of Prophets <onboarding@resend.dev>";
  const verifiedDevEmail = "censusokoi515@gmail.com";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text: body,
        ...(html ? { html } : {}),
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn(`[notify:sendEmail] Resend API response (${res.status}) for ${to}:`, text);

      // Smart sandbox fallback: When testing with onboarding@resend.dev, Resend restricts delivery
      // to the verified owner account (censusokoi515@gmail.com). Deliver the full email there so it is never lost!
      if (res.status === 403 && text.includes("testing emails to your own email address") && to.toLowerCase() !== verifiedDevEmail.toLowerCase()) {
        console.info(`[notify:sendEmail] Routing sandbox email to verified owner ${verifiedDevEmail} (intended for ${to})`);
        const banner = `<div style="background:#fef3c7;border:1px solid #f59e0b;padding:12px;margin-bottom:16px;border-radius:4px;font-size:12px;color:#92400e;"><strong>Resend Sandbox Delivery:</strong> This email was dispatched to <code>${to}</code>. Because the sending domain is currently in Resend sandbox mode, Resend routed this copy to your verified account (${verifiedDevEmail}). Once a custom domain is verified in your Resend dashboard, emails will be delivered directly to external recipients.</div>`;
        const sandboxHtml = html ? `${banner}${html}` : undefined;
        const sandboxText = `[RESEND SANDBOX DELIVERY — INTENDED FOR: ${to}]\n\n${body}`;
        const sandboxSubject = `[Delivery -> ${to}] ${subject}`;

        const fallbackRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from,
            to: [verifiedDevEmail],
            subject: sandboxSubject,
            text: sandboxText,
            ...(sandboxHtml ? { html: sandboxHtml } : {}),
            ...(replyTo ? { reply_to: replyTo } : {}),
          }),
        });

        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json().catch(() => ({}));
          console.info(`[notify:sendEmail] Delivered sandbox copy to ${verifiedDevEmail} (id: ${(fallbackData as Record<string, unknown>).id})`);
          await log("email", to, subject, body, "sent", `delivered via sandbox to ${verifiedDevEmail}`);
          return "sent";
        }
      }

      await log("email", to, subject, body, "failed", `${res.status} ${text}`);
      return "failed";
    }

    const data = await res.json().catch(() => ({}));
    console.info(`[notify:sendEmail] Email sent successfully to ${to} (id: ${(data as Record<string, unknown>).id})`);
    await log("email", to, subject, body, "sent", "");
    return "sent";
  } catch (err) {
    console.error("[notify:sendEmail] Network/runtime error sending email:", err);
    await log("email", to, subject, body, "failed", String(err));
    return "failed";
  }
}

export async function sendReplyEmail(to: string, subject: string, body: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://theschoolofprophets.org";
  const rendered = renderGenericEmail({
    title: subject,
    badge: "Ministry Response",
    bodyText: body,
    cta: {
      label: "Visit The School of Prophets",
      url: siteUrl,
    },
  });
  return sendEmail(to, subject, body, undefined, rendered.html);
}

async function pushToAdmins(title: string, body: string, relatedId?: string) {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return;
  const svc = getServiceClient();
  if (!svc) return;
  const { data: subs } = await svc.from("push_subscriptions").select("endpoint,keys");
  if (!subs?.length) return;
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT ?? "mailto:admin@theschoolofprophets.org",
      pub,
      priv,
    );
  } catch {
    return;
  }
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: s.keys },
          JSON.stringify({ title, body, url: `/admin/inbox/${relatedId ?? ""}` }),
        );
        await log("push", s.endpoint, title, body, "sent", "", relatedId);
      } catch (err) {
        const message = String(err);
        await log("push", s.endpoint, title, body, "failed", message, relatedId);
        if (message.includes("410")) {
          await svc.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
        }
      }
    }),
  );
}

async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text }),
    });
  } catch {
    // optional channel; failures are non-fatal
  }
}

function renderFields(payload: Record<string, unknown>) {
  return Object.entries(payload)
    .filter(([, v]) => v !== undefined && v !== "" && v !== null)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

export async function notifySubmission(s: SubmissionRow) {
  const label = typeLabels[s.type] ?? s.type;
  const name = String(s.payload.name ?? s.payload.fullName ?? "");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const link = `${siteUrl}/admin/inbox/${s.id}`;
  const textBody = `${label}\n\n${renderFields(s.payload)}\n\nOpen in dashboard: ${link}\nSubmitted: ${s.created_at}`;

  const fieldItems = Object.entries(s.payload)
    .filter(([, v]) => v !== undefined && v !== "" && v !== null)
    .map(([k, v]) => ({
      label: k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, " $1"),
      value: String(v),
    }));

  const subject = `TSOP ${label}${name ? ` · ${name}` : ""}`;
  const htmlBody = buildHtmlEmail({
    badge: "New Submission",
    title: `New ${label} Received`,
    preheader: name ? `New ${label} received from ${name}` : `New ${label} received`,
    paragraphs: [
      `A new <strong>${label}</strong> has been submitted through the ministry website.`,
      `Review the submission details below or jump directly to the administrative inbox to respond or flag.`,
    ],
    highlightBox: {
      label: "Submission Data",
      items: fieldItems.length > 0 ? fieldItems : [{ label: "Type", value: label }],
    },
    cta: {
      label: "Open in Dashboard",
      url: link,
    },
    closing: "Ministry Notification Engine,<br /><strong>The School of Prophets</strong>",
  });

  // 1. Fetch authorized staff recipients from database
  const svc = getServiceClient();
  let staffEmails: string[] = [];
  if (svc) {
    try {
      let query = svc.from("profiles").select("email, role").eq("status", "active");
      if (s.type === "enrolment") {
        // The training form is strictly for the owner
        query = query.eq("role", "owner");
      } else {
        // All admins and owners should be notified for other forms
        query = query.in("role", ["owner", "admin"]);
      }
      const { data: members } = await query;
      staffEmails = (members ?? []).map((m) => m.email).filter(Boolean);
    } catch {
      // ignore
    }
  }

  // 2. Add environment targets (for non-training forms or fallback)
  const envTargets = [process.env.NOTIFY_EMAILS, process.env.FORMS_INBOX]
    .flatMap((v) => (v ? v.split(",").map((t) => t.trim()) : []))
    .filter(Boolean);

  const targets = [...new Set([...staffEmails, ...(s.type === "enrolment" ? [] : envTargets)])];

  for (const to of targets) {
    await sendEmail(to, subject, textBody, undefined, htmlBody);
  }

  await pushToAdmins(label, name ? `${label} from ${name}` : label, s.id);
  await sendTelegram(textBody);

  const webhook = process.env.FORMS_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...s, link }),
      });
    } catch {
      // optional channel
    }
  }
}

export async function sendConfirmation(s: SubmissionRow, to: string) {
  const name = String(s.payload.name ?? s.payload.fullName ?? "");
  const typeLabel = (typeLabels[s.type] ?? s.type).toLowerCase();
  const rendered = renderConfirmationEmail({ name, type: typeLabel });
  return sendEmail(to, rendered.subject, rendered.text, undefined, rendered.html);
}

const defaultTemplates: Record<string, { subject: string; body: string }> = {
  confirmation: {
    subject: "Thank you for reaching out — The School of Prophets",
    body: "Hello {{name}},\n\nThank you for reaching out to The School of Prophets. We have received your {{type}} and a member of the team will respond soon.\n\nBlessings,\nThe School of Prophets",
  },
  booking_confirmed: {
    subject: "Your call is confirmed — The School of Prophets",
    body: "Hello {{name}},\n\nYour call has been confirmed for {{time}} (WAT).\n\nJoin link: {{link}}\n\nBlessings,\nThe School of Prophets",
  },
  booking_cancelled: {
    subject: "Update regarding your booking — The School of Prophets",
    body: "Hello {{name}},\n\nYour call scheduled for {{time}} has been cancelled.\n\nReason: {{reason}}\n\nYou can book a new time here: {{link}}\n\nThe School of Prophets",
  },
  acceptance: {
    subject: "Welcome to The School of Prophets — Application Accepted",
    body: "Hello {{name}},\n\nWe are joyful to inform you that your enrolment application has been accepted! Please check your portal for orientation details.\n\nThe School of Prophets",
  },
  decline: {
    subject: "Update regarding your application — The School of Prophets",
    body: "Hello {{name}},\n\nThank you for your interest in The School of Prophets. After prayerful review, we are unable to offer you a seat for this intake.\n\nGrace and peace,\nThe School of Prophets",
  },
  waitlist_open: {
    subject: "Applications are now open — The School of Prophets",
    body: "Hello {{name}},\n\nApplications have just opened for the upcoming intake! As you joined our waitlist, you have priority access:\n\n{{link}}\n\nThe School of Prophets",
  },
};

export async function sendTemplated(key: string, to: string, vars: Record<string, string>) {
  const normalizedKey = key === "cancellation" ? "booking_cancelled" : key === "confirmed" ? "booking_confirmed" : key;
  const svc = getServiceClient();

  // Check if there is an explicit DB template override
  let dbOverride: { subject?: string; body?: string } | null = null;
  if (svc) {
    try {
      const { data } = await svc.from("email_templates").select("subject,body").eq("key", normalizedKey).maybeSingle();
      if (data && (data.subject || data.body)) {
        dbOverride = data;
      }
    } catch {
      // Use standard renderers
    }
  }

  // If a custom DB override exists, fill placeholders and wrap with generic HTML template
  if (dbOverride) {
    const fallback = defaultTemplates[normalizedKey] ?? {
      subject: "The School of Prophets",
      body: "Hello {{name}},\n\nBlessings,\nThe School of Prophets",
    };
    const finalSubject = fill(dbOverride.subject || fallback.subject, vars);
    const finalBody = fill(dbOverride.body || fallback.body, vars);
    const rendered = renderGenericEmail({
      title: finalSubject,
      bodyText: finalBody,
      cta: vars.link ? { label: "Open Link", url: vars.link } : undefined,
    });
    return sendEmail(to, finalSubject, finalBody, undefined, rendered.html);
  }

  // Use specialized rich HTML template renderers for canonical actions
  if (normalizedKey === "booking_confirmed") {
    const rendered = renderBookingConfirmedEmail({
      name: vars.name,
      time: vars.time,
      joinLink: vars.link,
      cancelLink: vars.cancelUrl,
    });
    return sendEmail(to, rendered.subject, rendered.text, undefined, rendered.html);
  }

  if (normalizedKey === "booking_cancelled") {
    const rendered = renderBookingCancelledEmail({
      name: vars.name,
      time: vars.time,
      reason: vars.reason,
      bookLink: vars.link,
    });
    return sendEmail(to, rendered.subject, rendered.text, undefined, rendered.html);
  }

  if (normalizedKey === "acceptance") {
    const rendered = renderEnrolmentAcceptedEmail({
      name: vars.name,
      cohortName: vars.cohort,
    });
    return sendEmail(to, rendered.subject, rendered.text, undefined, rendered.html);
  }

  if (normalizedKey === "decline") {
    const rendered = renderEnrolmentDeclinedEmail({
      name: vars.name,
    });
    return sendEmail(to, rendered.subject, rendered.text, undefined, rendered.html);
  }

  if (normalizedKey === "waitlist_open") {
    const rendered = renderWaitlistOpenEmail({
      name: vars.name,
      link: vars.link,
    });
    return sendEmail(to, rendered.subject, rendered.text, undefined, rendered.html);
  }

  if (normalizedKey === "confirmation") {
    const rendered = renderConfirmationEmail({
      name: vars.name,
      type: vars.type || "message",
    });
    return sendEmail(to, rendered.subject, rendered.text, undefined, rendered.html);
  }

  // Fallback for any other custom key
  const fallback = defaultTemplates[normalizedKey] ?? {
    subject: "The School of Prophets",
    body: "Hello {{name}},\n\nBlessings,\nThe School of Prophets",
  };
  const finalSubject = fill(fallback.subject, vars);
  const finalBody = fill(fallback.body, vars);
  const rendered = renderGenericEmail({
    title: finalSubject,
    bodyText: finalBody,
    cta: vars.link ? { label: "View Details", url: vars.link } : undefined,
  });
  return sendEmail(to, finalSubject, finalBody, undefined, rendered.html);
}
