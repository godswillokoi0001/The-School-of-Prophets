/**
 * Form delivery. Submissions are validated by the caller (zod), rate limited
 * here, then delivered by email (Resend) and/or webhook. With no provider
 * configured the submission is written to the server log so local testing
 * works and nothing is silently lost.
 */

type Delivery = {
  kind: "contact" | "prayer" | "testimony" | "enrolment";
  subject: string;
  fields: Record<string, string | boolean | undefined>;
  private?: boolean;
};

const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit = 4, windowMs = 10 * 60_000) {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    return { ok: false as const, retryAfter: Math.ceil((windowMs - (now - hits[0])) / 1000) };
  }
  hits.push(now);
  buckets.set(key, hits);
  return { ok: true as const };
}

export function clientKey(req: Request) {
  const headers = req.headers;
  const forwarded = headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || headers.get("x-real-ip") || "local";
  return `${ip}:${new URL(req.url).pathname}`;
}

function render(d: Delivery) {
  const rows = Object.entries(d.fields)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  return `${rows}\n\n— Sent from theschoolofprophets.org (${d.kind})`;
}

export async function deliver(d: Delivery) {
  const body = render(d);
  const inbox = process.env.FORMS_INBOX;
  const resendKey = process.env.RESEND_API_KEY;
  const webhook = process.env.FORMS_WEBHOOK_URL;
  const results: string[] = [];

  if (resendKey && inbox) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.FORMS_FROM ?? "TSOP Website <onboarding@resend.dev>",
          to: [inbox],
          subject: d.subject,
          text: body,
        }),
      });
      results.push(res.ok ? "email" : `email-failed:${res.status}`);
      if (!res.ok) console.error("[forms] Resend rejected", res.status, await res.text());
    } catch (error) {
      results.push("email-error");
      console.error("[forms] Resend error", error);
    }
  }

  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...d, body }),
      });
      results.push(res.ok ? "webhook" : `webhook-failed:${res.status}`);
    } catch (error) {
      results.push("webhook-error");
      console.error("[forms] webhook error", error);
    }
  }

  if (results.length === 0) {
    // Local development / unconfigured deployment: never lose the submission.
    console.info(`[forms] ${d.subject}\n${body}`);
    results.push("logged");
  }

  return { delivered: results };
}

/** Shared JSON response helper for the form routes. */
export function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
