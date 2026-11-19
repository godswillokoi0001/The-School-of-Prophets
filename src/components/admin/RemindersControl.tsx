"use client";

import { useState, useTransition } from "react";
import {
  Bell,
  Clock,
  Send,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  Radio,
  Calendar,
} from "lucide-react";
import {
  runRemindersCheckAction,
  testSendReminderAction,
} from "@/app/admin/(shell)/actions/site-admin";
import type { ReminderStage } from "@/lib/reminders";

export function RemindersControl({
  subscribersCount,
}: {
  subscribersCount: number;
}) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
    details?: string[];
  } | null>(null);

  function handleRunCheck() {
    setFeedback(null);
    startTransition(async () => {
      const res = await runRemindersCheckAction();
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: "Failed to run automated reminders check.",
        });
        return;
      }
      const sent = res.result.results.filter((r) => r.status === "sent");
      const alreadySent = res.result.results.filter((r) => r.status === "already_sent");

      const lines: string[] = [];
      if (sent.length > 0) {
        lines.push(`Dispatched ${sent.length} reminder(s):`);
        for (const s of sent) {
          lines.push(`• ${s.title} (${s.stage}) to ${s.recipientsCount} recipient(s)`);
        }
      } else {
        lines.push("All current gathering reminders are up to date.");
      }
      if (alreadySent.length > 0) {
        lines.push(`${alreadySent.length} reminder(s) were already dispatched previously.`);
      }

      setFeedback({
        type: "success",
        text: `Reminders check complete. Evaluated ${res.result.results.length} activity stage(s).`,
        details: lines,
      });
    });
  }

  function handleTestSend(stage: ReminderStage) {
    setFeedback(null);
    startTransition(async () => {
      const res = await testSendReminderAction(stage);
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: res.error || "Failed to send test reminder.",
        });
        return;
      }
      setFeedback({
        type: "success",
        text: res.message || `Test ${stage} reminder sent successfully.`,
      });
    });
  }

  return (
    <div className="admin-surface mt-8 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-gold" />
            <h2 className="font-display text-lg">Automated Gathering & Event Reminders</h2>
          </div>
          <p className="mt-1 text-xs opacity-65">
            Every active subscriber ({subscribersCount}) automatically receives reminders ahead of weekly activities and events.
          </p>
        </div>
        <button
          onClick={handleRunCheck}
          disabled={pending}
          className="admin-btn admin-btn-gold"
          title="Manually trigger an automated check right now"
        >
          {pending ? <LoaderCircle size={13} className="animate-spin" /> : <Clock size={13} />}
          Check &amp; Dispatch Due Reminders
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded border border-border bg-ink-2/40 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gold-soft">
            <Calendar size={13} /> 24 Hours to Time
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed opacity-70">
            Sent 1 day ahead to announce the activity, reading focus, and start time in WAT.
          </p>
          <button
            onClick={() => handleTestSend("24h")}
            disabled={pending}
            className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-gold hover:underline"
          >
            Send test to me &rarr;
          </button>
        </div>

        <div className="rounded border border-border bg-ink-2/40 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gold-soft">
            <Clock size={13} /> 12 Hours to Time
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed opacity-70">
            Sent morning/midday reminding disciples of tonight&apos;s gathering and time.
          </p>
          <button
            onClick={() => handleTestSend("12h")}
            disabled={pending}
            className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-gold hover:underline"
          >
            Send test to me &rarr;
          </button>
        </div>

        <div className="rounded border border-border bg-ink-2/40 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gold-soft">
            <Clock size={13} /> 1 Hour to Time
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed opacity-70">
            60-minute alert urging disciples to set aside distractions and prepare their Bible.
          </p>
          <button
            onClick={() => handleTestSend("1h")}
            disabled={pending}
            className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-gold hover:underline"
          >
            Send test to me &rarr;
          </button>
        </div>

        <div className="rounded border border-border bg-ink-2/40 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <Radio size={13} /> We Are Live Now
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed opacity-70">
            Immediate notification when the room opens with a direct one-click WhatsApp link.
          </p>
          <button
            onClick={() => handleTestSend("live")}
            disabled={pending}
            className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 hover:underline"
          >
            Send test to me &rarr;
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded bg-ink/30 px-3.5 py-2.5 text-xs opacity-75">
        <span>
          <strong>Cron Endpoint:</strong> <code>/api/cron/reminders</code> (Configured in <code>vercel.json</code> to run every 15 mins).
        </span>
        <span className="text-[11px] text-gold-soft">Auto-deduplicated via notification log</span>
      </div>

      {feedback && (
        <div
          role="status"
          className={`mt-4 rounded border p-4 text-xs ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-200"
              : "border-rose-500/30 bg-rose-950/20 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {feedback.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span>{feedback.text}</span>
          </div>
          {feedback.details && feedback.details.length > 0 && (
            <ul className="mt-2 space-y-1 pl-5 opacity-90">
              {feedback.details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
