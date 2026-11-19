import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { getServiceClient } from "@/lib/supabase/server";
import { fieldErrors, honeypotSchema, contactSchema, prayerSchema, testimonySchema, enrolmentSchema, newsletterSchema, registrationSchema, betaFeedbackSchema } from "@/lib/schemas";
import { clientKey, rateLimit } from "@/lib/forms";
import { notifySubmission, sendBetaConfirmation, sendConfirmation } from "@/lib/notify";
import { BETA_TYPE } from "@/lib/beta";
import { betaAccepting, betaDuplicate, prepareBetaSubmission } from "@/lib/beta-server";

export const formSchemas: Record<string, z.ZodType<Record<string, unknown>>> = {
  contact: contactSchema as unknown as z.ZodType<Record<string, unknown>>,
  prayer: prayerSchema as unknown as z.ZodType<Record<string, unknown>>,
  testimony: testimonySchema as unknown as z.ZodType<Record<string, unknown>>,
  enrolment: enrolmentSchema as unknown as z.ZodType<Record<string, unknown>>,
  waitlist: enrolmentSchema as unknown as z.ZodType<Record<string, unknown>>,
  newsletter: newsletterSchema as unknown as z.ZodType<Record<string, unknown>>,
  registration: registrationSchema as unknown as z.ZodType<Record<string, unknown>>,
  [BETA_TYPE]: betaFeedbackSchema as unknown as z.ZodType<Record<string, unknown>>,
};

const privateTypes = new Set(["prayer", "enrolment", "waitlist", BETA_TYPE]);

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function verifyTurnstile(token?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
    });
    return (await res.json()).success === true;
  } catch {
    return false;
  }
}

export async function handleFormSubmission(
  request: Request,
  body: { type?: string; payload?: unknown; website?: string; turnstileToken?: string },
) {
  const isBeta = (body.type ?? "") === BETA_TYPE;
  // Beta reviews get five attempts an hour; the rest keep the tighter default.
  const limit = rateLimit(clientKey(request), isBeta ? 5 : 4, isBeta ? 3_600_000 : 10 * 60_000);
  if (!limit.ok)
    return json(
      {
        ok: false,
        message: isBeta
          ? "We already have your review. If you need to add something, reply to our confirmation email."
          : "Please wait a little before sending again.",
      },
      429,
    );

  if (!(await verifyTurnstile(body.turnstileToken)))
    return json({ ok: false, message: "Spam check failed. Please try again." }, 400);

  const trap = honeypotSchema.safeParse(body);
  if (!trap.success) return json({ ok: true });

  let type = body.type ?? "";
  if (type === "enrolment") {
    const trainingOpen = await enrolmentOpen();
    if (!trainingOpen) type = "waitlist";
  }

  const schema = formSchemas[type];
  if (!schema) return json({ ok: false, message: "Unknown form." }, 400);

  if (type === BETA_TYPE && !(await betaAccepting())) {
    return json(
      {
        ok: false,
        message: "Thank you — the beta has closed and we are no longer collecting reviews.",
      },
      403,
    );
  }

  const rawPayload =
    body.payload && typeof body.payload === "object"
      ? (body.payload as Record<string, unknown>)
      : body;

  const parsed = schema.safeParse(rawPayload);
  if (!parsed.success) {
    return json(
      {
        ok: false,
        message: "Please check the fields marked below.",
        errors: fieldErrors(parsed.error),
      },
      422,
    );
  }

  let payload = parsed.data as Record<string, unknown>;
  const rawEmail = String(payload.email ?? "").trim();
  const email = rawEmail ? rawEmail.toLowerCase() : null;
  if (email) payload.email = email;
  const fullNameCalculated = (payload.firstName || payload.lastName)
    ? `${payload.firstName ?? ""} ${payload.lastName ?? ""}`.trim()
    : String(payload.name ?? payload.fullName ?? "");
  const name = fullNameCalculated;
  payload.name = fullNameCalculated;

  if (type === BETA_TYPE) {
    if (email && (await betaDuplicate(email))) {
      return json(
        {
          ok: false,
          message:
            "We already have a review from this email a moment ago. If you want to add something, reply to our confirmation email.",
        },
        409,
      );
    }
    payload = await prepareBetaSubmission(payload);
  }

  const svc = getServiceClient();
  const db =
    svc ||
    (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        )
      : null);

  if (!db) {
    console.info(`[forms] ${type} ${name}\n${JSON.stringify(payload, null, 2)}`);
    return json({ ok: true, message: "Thank you. Your message has been received." });
  }

  // Prevent duplicate newsletter subscriptions
  if (type === "newsletter" && email) {
    // 1. Check if email already exists in subscribers table
    const { data: existingSub } = await db
      .from("subscribers")
      .select("id, unsubscribed_at")
      .ilike("email", email)
      .maybeSingle();

    if (existingSub) {
      if (!existingSub.unsubscribed_at) {
        return json(
          {
            ok: false,
            message: "This email address is already subscribed to our newsletter.",
          },
          409,
        );
      }
      // If previously unsubscribed, reactivate their subscription
      await db
        .from("subscribers")
        .update({ unsubscribed_at: null, name: name || undefined })
        .eq("id", existingSub.id);
      sendConfirmation(
        {
          id: existingSub.id,
          type: "newsletter",
          payload: { name, email },
          created_at: new Date().toISOString(),
        },
        email,
      ).catch(() => {});
      return json({
        ok: true,
        message: "Welcome back! Your daily devotionals and teaching alerts have been reactivated.",
      });
    }

    // 2. Also check if already recorded in submissions table
    const { data: existingSubmissions } = await db
      .from("submissions")
      .select("id")
      .eq("type", "newsletter")
      .ilike("payload->>email", email)
      .is("deleted_at", null)
      .limit(1);

    if (existingSubmissions && existingSubmissions.length > 0) {
      // Sync into subscribers table
      try {
        await db
          .from("subscribers")
          .upsert({ email, name, source: "site" }, { onConflict: "email" });
      } catch {
        // ignore
      }
      return json(
        {
          ok: false,
          message: "This email address is already subscribed to our newsletter.",
        },
        409,
      );
    }
  }

  const isPrivate = privateTypes.has(type) || payload.isPrivate === true;

  const { data, error } = await db
    .from("submissions")
    .insert({ type, payload, private: isPrivate, ip: clientKey(request).split(":")[0] })
    .select("id,created_at")
    .single();

  if (error) {
    console.error(`[forms] Error inserting submission:`, error);
    if (error.code === "42501") {
      console.error(
        `[forms] Supabase RLS policy blocked the insert. Please run 'supabase/migrations/0002_unlock_and_storage.sql' in your Supabase SQL Editor.`,
      );
    }
    // Fallback: log to server console so the submission is never lost
    console.info(`[forms:fallback-logged] ${type} from ${name} (${email}):`, JSON.stringify(payload, null, 2));
    const fallbackSubmission = {
      id: `fallback-${Date.now()}`,
      type,
      payload,
      created_at: new Date().toISOString(),
    };
    await notifySubmission(fallbackSubmission).catch(() => {});
    if (email) {
      if (type === BETA_TYPE) await sendBetaConfirmation(fallbackSubmission, email).catch(() => {});
      else await sendConfirmation(fallbackSubmission, email).catch(() => {});
    }
    return json({ ok: true, message: "Thank you. Your message has been received." });
  }

  const submission = { id: data.id, type, payload, created_at: data.created_at };
  await notifySubmission(submission);

  if (email) {
    if (type === BETA_TYPE) {
      await sendBetaConfirmation(submission, email).catch(() => {});
    } else {
      await sendConfirmation(submission, email);
    }
    if (type === "newsletter") {
      await db
        .from("subscribers")
        .upsert({ email, name, source: "site" }, { onConflict: "email" });
    }
  }

  return json({ ok: true, message: "Thank you. Your message has been received." });
}

async function enrolmentOpen(): Promise<boolean> {
  const svc = getServiceClient();
  const db =
    svc ||
    (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        )
      : null);
  if (!db) return false;
  const { data } = await db.from("site_settings").select("value").eq("key", "enrolment").maybeSingle();
  return (data?.value as { status?: string })?.status === "open";
}
