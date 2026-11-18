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
  renderBetaConfirmationEmail,
  renderBetaFixedEmail,
} from "@/lib/email-templates";
import { BETA_TYPE, RATING_LABELS, consentLabel, isHighPriority, summaryLines, type BetaPayload } from "@/lib/beta";

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
  [BETA_TYPE]: "Beta review",
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
      await log("email", to, subject, body, "failed", `${res.status} ${text}`);
      return `failed: ${text}`;
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

  if (s.type === BETA_TYPE) {
    await notifyBetaSubmission(s, label, name, link);
    return;
  }
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

  // Parallel non-blocking email dispatch to all authorized admins
  await Promise.allSettled(targets.map((to) => sendEmail(to, subject, textBody, undefined, htmlBody)));

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

/**
 * Beta reviews get their own notification: rating in the subject, priority
 * flag for 1–2 ratings and anything that broke, screenshots linked.
 */
async function notifyBetaSubmission(
  s: SubmissionRow,
  label: string,
  name: string,
  link: string,
) {
  const payload = s.payload as BetaPayload;
  const rating = Number(payload.overall_rating ?? 0);
  const priority = isHighPriority(payload);
  const ratingText = rating > 0 ? `${rating}/5` : "unrated";
  const subject = `${priority ? "[Priority] " : ""}New beta review: ${ratingText} from ${name || "a tester"}`;

  const issues = (payload.issues ?? []).map((issue, index) => ({
    label: `Issue ${index + 1} · ${issue.page}`,
    value: `${issue.severity} — ${issue.description}${issue.screenshots?.length ? ` (${issue.screenshots.length} screenshot${issue.screenshots.length === 1 ? "" : "s"})` : ""}`,
  }));

  const items = [
    { label: "Overall", value: rating > 0 ? `${rating}/5 · ${RATING_LABELS[rating]}` : "Not rated" },
    { label: "Name", value: name || "—" },
    { label: "Email", value: String(payload.email ?? "—") },
    { label: "WhatsApp", value: String(payload.whatsapp ?? "—") },
    { label: "Location", value: String(payload.location ?? "—") },
    { label: "Device", value: String(payload.device ?? "—") },
    {
      label: "Areas",
      value:
        Object.entries(payload.area_ratings ?? {})
          .filter(([, v]) => Number(v) > 0)
          .map(([k, v]) => `${k} ${v}/5`)
          .join(" · ") || "—",
    },
    { label: "Liked most", value: String(payload.liked ?? "—") },
    { label: "Their take", value: String(payload.take ?? "—") },
    { label: "Improve", value: String(payload.improve ?? "—") },
    { label: "Wished for", value: String(payload.wish ?? "—") },
    ...issues,
    { label: "Story", value: String(payload.story ?? "—") },
    { label: "Story consent", value: consentLabel(payload.story_consent) },
    {
      label: "Browser / screen",
      value: `${payload.meta?.browser ?? "—"} · ${payload.meta?.os ?? "—"} · ${payload.meta?.screen ?? "—"}`,
    },
  ];

  const textBody = `${priority ? "HIGH PRIORITY\n\n" : ""}${label} · ${ratingText}\n\n${renderFields(items.reduce<Record<string, unknown>>((acc, i) => ({ ...acc, [i.label]: i.value }), {}))}\n\nOpen in dashboard: ${link}\nSubmitted: ${s.created_at}`;

  const htmlBody = buildHtmlEmail({
    badge: priority ? "Priority beta review" : "New beta review",
    title: `${priority ? "Priority: " : ""}${ratingText} from ${name || "a tester"}`,
    preheader: `${label} · ${ratingText}${payload.device ? ` · ${payload.device}` : ""}`,
    paragraphs: [
      `A member of the fellowship has reviewed the site.`,
      priority
        ? `This is flagged for attention: a low rating or something that broke. Please read it today if you can.`
        : `Every review is read. Reply to the tester from the inbox if a follow-up would help.`,
    ],
    highlightBox: { label: "The review", items },
    cta: { label: "Open in Dashboard", url: link },
    closing: "Ministry Notification Engine,<br /><strong>The School of Prophets</strong>",
  });

  const svc = getServiceClient();
  let staffEmails: string[] = [];
  if (svc) {
    try {
      const { data: members } = await svc
        .from("profiles")
        .select("email, role")
        .eq("status", "active")
        .in("role", ["owner", "admin", "moderator"]);
      staffEmails = (members ?? []).map((m) => m.email).filter(Boolean);
    } catch {
      // ignore
    }
  }
  const envTargets = [process.env.NOTIFY_EMAILS, process.env.FORMS_INBOX]
    .flatMap((v) => (v ? v.split(",").map((t) => t.trim()) : []))
    .filter(Boolean);
  const targets = [...new Set([...staffEmails, ...envTargets])];

  await Promise.allSettled(targets.map((to) => sendEmail(to, subject, textBody, String(payload.email ?? "") || undefined, htmlBody)));
  await pushToAdmins(label, `${ratingText} from ${name || "a tester"}${priority ? " · priority" : ""}`, s.id);
  await sendTelegram(textBody);

  const webhook = process.env.FORMS_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...s, link, priority }),
      });
    } catch {
      // optional channel
    }
  }
}

/** Editable default for the beta emails, overridden in Settings → Email templates. */
async function betaTemplate(key: string) {
  const svc = getServiceClient();
  if (!svc) return null;
  try {
    const { data } = await svc
      .from("email_templates")
      .select("subject,body")
      .eq("key", key)
      .maybeSingle();
    return data?.body ? data : null;
  } catch {
    return null;
  }
}

/** Thank-you email to the tester, summarising what they sent. */
export async function sendBetaConfirmation(s: SubmissionRow, to: string) {
  const payload = s.payload as BetaPayload;
  const name = String(payload.name ?? "");
  const lines = summaryLines(payload);
  const override = await betaTemplate("beta_confirmation");

  if (override) {
    const subject = fill(override.subject, { name, summary: "" });
    const body = fill(override.body, { name, summary: lines.join("\n") });
    const rendered = renderGenericEmail({ title: subject, bodyText: body });
    return sendEmail(to, subject, body, undefined, rendered.html);
  }

  const rendered = renderBetaConfirmationEmail({ name, lines });
  return sendEmail(to, rendered.subject, rendered.text, undefined, rendered.html);
}

/** Optional "we fixed what you found" note, used from /admin/beta. */
export async function sendBetaFixedEmail(to: string, name: string, count = 1, note?: string) {
  const override = await betaTemplate("beta_fixed");
  if (override) {
    const subject = fill(override.subject, { name, count: String(count), note: note ?? "" });
    const body = fill(override.body, { name, count: String(count), note: note ?? "" });
    const rendered = renderGenericEmail({ title: subject, bodyText: body });
    return sendEmail(to, subject, body, undefined, rendered.html);
  }
  const rendered = renderBetaFixedEmail({ name, count, note });
  return sendEmail(to, rendered.subject, rendered.text, undefined, rendered.html);
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
