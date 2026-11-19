import { getServiceClient } from "@/lib/supabase/server";
import { getSchedule, getScheduleExceptions, getEvents, getContactSettings } from "@/lib/data";
import { nextStartFor, formatTimeWAT, WAT_OFFSET_MS } from "@/lib/time";
import type { Session } from "@/content/schedule";
import {
  renderGatheringReminderEmail,
  renderEventReminderEmail,
} from "@/lib/email-templates";
import { sendEmail } from "@/lib/notify";
import { site } from "@/config/site";

export type ReminderStage = "24h" | "12h" | "1h" | "live";

export type ReminderResult = {
  type: "gathering" | "event";
  id: string;
  title: string;
  stage: ReminderStage;
  scheduledTimeWAT: string;
  recipientsCount: number;
  status: "sent" | "already_sent" | "skipped" | "dry_run";
  error?: string;
};

/**
 * Fetch all verified, active newsletter subscribers
 */
export async function getActiveSubscribers(): Promise<{ email: string; name: string }[]> {
  const svc = getServiceClient();
  if (!svc) return [];

  const map = new Map<string, string>();

  // 1. Subscribers table
  const { data: subs } = await svc
    .from("subscribers")
    .select("email, name")
    .is("unsubscribed_at", null);

  for (const s of subs ?? []) {
    const em = String(s.email ?? "").trim().toLowerCase();
    if (em) map.set(em, String(s.name ?? "").trim());
  }

  // 2. Submissions table (type: newsletter)
  const { data: submissions } = await svc
    .from("submissions")
    .select("payload")
    .eq("type", "newsletter")
    .is("deleted_at", null);

  for (const sub of submissions ?? []) {
    const p = (sub.payload as Record<string, unknown>) ?? {};
    const em = String(p.email ?? "").trim().toLowerCase();
    if (em && !map.has(em)) {
      const name = String(p.firstName ?? p.name ?? "").trim();
      map.set(em, name);
    }
  }

  return [...map.entries()].map(([email, name]) => ({ email, name }));
}

/**
 * Check if a reminder has already been sent
 */
async function hasReminderBeenSent(relatedType: string, relatedId: string): Promise<boolean> {
  const svc = getServiceClient();
  if (!svc) return false;

  const { data } = await svc
    .from("notification_log")
    .select("id")
    .eq("related_type", relatedType)
    .eq("related_id", relatedId)
    .eq("status", "sent")
    .limit(1);

  return Boolean(data && data.length > 0);
}

/**
 * Log a sent reminder in notification_log
 */
async function recordReminderSent(
  channel: string,
  target: string,
  subject: string,
  body: string,
  relatedType: string,
  relatedId: string,
  status: "sent" | "failed",
  error?: string
) {
  const svc = getServiceClient();
  if (!svc) return;

  try {
    await svc.from("notification_log").insert({
      channel,
      target,
      subject,
      body: body.slice(0, 250),
      status,
      error: error || "",
      related_type: relatedType,
      related_id: relatedId,
    });
  } catch (err) {
    console.error("[reminders:recordReminderSent] Failed to insert log:", err);
  }
}

/**
 * Core Reminder Dispatcher
 * Checks weekly gatherings and upcoming events against the current time.
 */
export async function processReminders(options?: {
  dryRun?: boolean;
  forceStage?: ReminderStage;
  recipientOverride?: string;
}): Promise<{
  ok: boolean;
  timestamp: string;
  results: ReminderResult[];
}> {
  const now = new Date();
  const dryRun = options?.dryRun ?? false;
  const results: ReminderResult[] = [];

  const [sessions, exceptions, events, contact] = await Promise.all([
    getSchedule(),
    getScheduleExceptions(),
    getEvents(),
    getContactSettings(),
  ]);

  const joinUrl = contact.whatsapp || site.social.whatsappInvite || "/contact";
  const allSubscribers = options?.recipientOverride
    ? [{ email: options.recipientOverride, name: "Beloved" }]
    : await getActiveSubscribers();

  /* =========================================================
     1. WEEKLY GATHERING REMINDERS (24h, 12h, 1h, live)
     ========================================================= */
  for (const session of sessions) {
    if (!session.start) continue;

    const startMs = nextStartFor(session, now);
    const startDate = new Date(startMs);
    const dateStr = startDate.toISOString().slice(0, 10);

    // Check if cancelled in exceptions
    const isCancelled = exceptions.some(
      (e: { sessionId: string; occurrenceDate: string; action: string }) =>
        e.sessionId === session.id &&
        e.occurrenceDate === dateStr &&
        e.action === "cancel"
    );
    if (isCancelled) continue;

    const diffMs = startMs - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffMinutes = diffMs / (1000 * 60);

    // Identify stage
    let matchedStage: ReminderStage | null = options?.forceStage || null;
    if (!matchedStage) {
      if (diffHours <= 24.5 && diffHours >= 23.0) {
        matchedStage = "24h";
      } else if (diffHours <= 12.5 && diffHours >= 11.0) {
        matchedStage = "12h";
      } else if (diffMinutes <= 70 && diffMinutes >= 40) {
        matchedStage = "1h";
      } else if (diffMinutes <= 5 && diffMinutes >= -25) {
        matchedStage = "live";
      }
    }

    if (!matchedStage) continue;

    const relatedType = "gathering_reminder";
    const relatedId = `${session.id}:${dateStr}:${matchedStage}`;
    const timeWAT = formatTimeWAT(session.start);

    // Format human-readable date in WAT
    const watDate = new Date(startMs + WAT_OFFSET_MS);
    const dateFormatted = watDate.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });

    if (!options?.forceStage && !dryRun) {
      const alreadySent = await hasReminderBeenSent(relatedType, relatedId);
      if (alreadySent) {
        results.push({
          type: "gathering",
          id: session.id,
          title: session.title,
          stage: matchedStage,
          scheduledTimeWAT: `${dateFormatted} at ${timeWAT} WAT`,
          recipientsCount: 0,
          status: "already_sent",
        });
        continue;
      }
    }

    if (dryRun) {
      results.push({
        type: "gathering",
        id: session.id,
        title: session.title,
        stage: matchedStage,
        scheduledTimeWAT: `${dateFormatted} at ${timeWAT} WAT`,
        recipientsCount: allSubscribers.length,
        status: "dry_run",
      });
      continue;
    }

    // Send emails in batches of 5
    let sentCount = 0;
    const BATCH_SIZE = 5;

    for (let i = 0; i < allSubscribers.length; i += BATCH_SIZE) {
      const batch = allSubscribers.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(
        batch.map((sub) => {
          const rendered = renderGatheringReminderEmail({
            name: sub.name,
            sessionTitle: session.title,
            focus: session.focus,
            timeWAT,
            dateFormatted,
            stage: matchedStage!,
            joinUrl,
          });
          return sendEmail(sub.email, rendered.subject, rendered.text, undefined, rendered.html);
        })
      );

      sentCount += batchResults.filter((r) => r.status === "fulfilled").length;
    }

    // Record in notification_log so this stage will not repeat
    await recordReminderSent(
      "email",
      `all_subscribers (${sentCount})`,
      `${session.title} (${matchedStage})`,
      `Reminder sent for ${session.title} scheduled at ${timeWAT} WAT`,
      relatedType,
      relatedId,
      "sent"
    );

    results.push({
      type: "gathering",
      id: session.id,
      title: session.title,
      stage: matchedStage,
      scheduledTimeWAT: `${dateFormatted} at ${timeWAT} WAT`,
      recipientsCount: sentCount,
      status: "sent",
    });
  }

  /* =========================================================
     2. SPECIAL EVENT REMINDERS (24h, 1h, live)
     ========================================================= */
  for (const event of events) {
    if (event.kind === "past") continue;

    // Resolve event start timestamp in WAT
    let startMs: number | null = null;
    const anyEvent = event as Record<string, unknown>;
    if (typeof anyEvent.starts_at === "string" && anyEvent.starts_at) {
      startMs = new Date(anyEvent.starts_at).getTime();
    } else if (event.date) {
      const timeStr = event.time || "10:00";
      // Construct WAT (+01:00) ISO string
      startMs = new Date(`${event.date}T${timeStr}:00+01:00`).getTime();
    }

    if (!startMs || isNaN(startMs)) continue;
    const eventDate = new Date(startMs);

    const diffMs = startMs - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffMinutes = diffMs / (1000 * 60);

    let matchedStage: ReminderStage | null = options?.forceStage || null;
    if (!matchedStage) {
      if (diffHours <= 24.5 && diffHours >= 23.0) {
        matchedStage = "24h";
      } else if (diffMinutes <= 70 && diffMinutes >= 40) {
        matchedStage = "1h";
      } else if (diffMinutes <= 5 && diffMinutes >= -25) {
        matchedStage = "live";
      }
    }

    if (!matchedStage) continue;

    const eventId = String((anyEvent.eventId || anyEvent.id || event.slug) ?? event.slug);
    const dateStr = eventDate.toISOString().slice(0, 10);
    const relatedType = "event_reminder";
    const relatedId = `event-${eventId}:${dateStr}:${matchedStage}`;

    const startsAtFormatted = eventDate.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }) + " WAT";

    if (!options?.forceStage && !dryRun) {
      const alreadySent = await hasReminderBeenSent(relatedType, relatedId);
      if (alreadySent) {
        results.push({
          type: "event",
          id: eventId,
          title: event.title,
          stage: matchedStage,
          scheduledTimeWAT: startsAtFormatted,
          recipientsCount: 0,
          status: "already_sent",
        });
        continue;
      }
    }

    if (dryRun) {
      results.push({
        type: "event",
        id: eventId,
        title: event.title,
        stage: matchedStage,
        scheduledTimeWAT: startsAtFormatted,
        recipientsCount: allSubscribers.length,
        status: "dry_run",
      });
      continue;
    }

    let sentCount = 0;
    const BATCH_SIZE = 5;

    for (let i = 0; i < allSubscribers.length; i += BATCH_SIZE) {
      const batch = allSubscribers.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(
        batch.map((sub) => {
          const rendered = renderEventReminderEmail({
            name: sub.name,
            eventTitle: event.title,
            summary: event.summary,
            location: event.location,
            startsAtFormatted,
            stage: matchedStage as "24h" | "1h" | "live",
            joinUrl,
          });
          return sendEmail(sub.email, rendered.subject, rendered.text, undefined, rendered.html);
        })
      );

      sentCount += batchResults.filter((r) => r.status === "fulfilled").length;
    }

    await recordReminderSent(
      "email",
      `all_subscribers (${sentCount})`,
      `${event.title} (${matchedStage})`,
      `Event reminder sent for ${event.title}`,
      relatedType,
      relatedId,
      "sent"
    );

    results.push({
      type: "event",
      id: eventId,
      title: event.title,
      stage: matchedStage,
      scheduledTimeWAT: startsAtFormatted,
      recipientsCount: sentCount,
      status: "sent",
    });
  }

  return {
    ok: true,
    timestamp: now.toISOString(),
    results,
  };
}

/**
 * Get preview of next upcoming reminders for dashboard
 */
export async function getUpcomingReminderSchedule() {
  const now = new Date();
  const [sessions, contact, subs] = await Promise.all([
    getSchedule(),
    getContactSettings(),
    getActiveSubscribers(),
  ]);

  const items = sessions.map((session: Session) => {
    const startMs = nextStartFor(session, now);
    const startDate = new Date(startMs);
    const diffMs = startMs - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return {
      id: session.id,
      title: session.title,
      focus: session.focus,
      startWAT: formatTimeWAT(session.start),
      nextOccurrence: startDate.toISOString(),
      hoursUntil: Math.round(diffHours * 10) / 10,
    };
  });

  items.sort((a, b) => a.hoursUntil - b.hoursUntil);

  return {
    subscribersCount: subs.length,
    whatsappUrl: contact.whatsapp || site.social.whatsappInvite,
    gatherings: items,
  };
}
