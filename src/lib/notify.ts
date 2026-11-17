import webpush from "web-push";
import { getServiceClient } from "@/lib/supabase/server";

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
  await svc.from("notification_log").insert({
    channel, target, subject, body, status, error,
    related_type: "submission",
    related_id: relatedId ?? null,
  });
}

async function sendEmail(to: string, subject: string, body: string, replyTo?: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return "skipped:no-config";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.FORMS_FROM ?? "TSOP Website <onboarding@resend.dev>",
        to: [to],
        subject,
        text: body,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      await log("email", to, subject, body, "failed", `${res.status} ${text}`);
      return "failed";
    }
    await log("email", to, subject, body, "sent", "");
    return "sent";
  } catch (err) {
    await log("email", to, subject, body, "failed", String(err));
    return "failed";
  }
}

export async function sendReplyEmail(to: string, subject: string, body: string) {
  return sendEmail(to, subject, body);
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
  const link = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/admin/inbox/${s.id}`;
  const body = `${label}\n\n${renderFields(s.payload)}\n\nOpen in dashboard: ${link}\nSubmitted: ${s.created_at}`;

  const targets = [process.env.NOTIFY_EMAILS, process.env.FORMS_INBOX]
    .flatMap((v) => (v ? v.split(",").map((t) => t.trim()) : []))
    .filter(Boolean);

  for (const to of targets) {
    await sendEmail(to, `TSOP ${label}${name ? ` · ${name}` : ""}`, body, undefined);
  }

  await pushToAdmins(label, name ? `${label} from ${name}` : label, s.id);
  await sendTelegram(body);

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
  const svc = getServiceClient();
  const name = String(s.payload.name ?? s.payload.fullName ?? "");
  let subject = "We received your message";
  let template =
    "Hello {{name}},\n\nThank you for reaching out to The School of Prophets. We have received your {{type}} and a member of the team will respond soon.\n\nThe School of Prophets";
  if (svc) {
    const { data } = await svc.from("email_templates").select("*").eq("key", "confirmation").maybeSingle();
    if (data) {
      subject = data.subject;
      template = data.body;
    }
  }
  const typeLabel = (typeLabels[s.type] ?? s.type).toLowerCase();
  const body = fill(template, { name, type: typeLabel });
  return sendEmail(to, subject, body);
}

export async function sendTemplated(key: string, to: string, vars: Record<string, string>) {
  const svc = getServiceClient();
  let subject = "The School of Prophets";
  let body = fill("Hello {{name}},\n\nThe School of Prophets", vars);
  if (svc) {
    const { data } = await svc.from("email_templates").select("*").eq("key", key).maybeSingle();
    if (data) {
      subject = data.subject;
      body = fill(data.body, vars);
    }
  }
  return sendEmail(to, subject, body);
}
