"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { dayNames, type Session } from "@/content/schedule";
import { site } from "@/config/site";
import {
  countdownParts,
  formatLocal,
  formatTimeWAT,
  googleCalendarUrl,
  localZoneLabel,
  nextSession,
} from "@/lib/time";

export function NextGathering({
  tone = "dark",
  sessions,
  joinHref: joinHrefProp,
}: {
  tone?: "dark" | "light";
  sessions: Session[];
  joinHref?: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const next = nextSession(sessions, now ? new Date(now) : new Date());
  const session = next.session;
  const start = next.start;
  const parts = now ? countdownParts(start, now) : null;

  const light = tone === "light";

  if (!session) {
    return (
      <div
        className={`border p-6 sm:p-8 ${
          light ? "border-ink/15 bg-parchment text-ink" : "border-parchment/20 bg-ink-2 text-parchment"
        }`}
      >
        <p className={`label ${light ? "text-ember" : "text-gold"}`}>Next gathering</p>
        <p className="mt-4 text-sm leading-relaxed">
          The weekly schedule is being prepared. Please check back shortly.
        </p>
      </div>
    );
  }
  const joinHref = joinHrefProp || site.social.whatsappInvite || "/contact";
  const joinLabel = site.social.whatsappInvite ? "Join on WhatsApp" : "Request the invite";
  const external = joinHref.startsWith("http");

  return (
    <div
      className={`relative border p-6 sm:p-8 ${
        light
          ? "border-ink/15 bg-parchment text-ink"
          : "border-parchment/20 bg-ink-2 text-parchment"
      }`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <p className={`label ${light ? "text-ember" : "text-gold"}`}>Next gathering</p>
        <p className={`label ${light ? "text-quiet" : "text-parchment/60"}`} suppressHydrationWarning>
          {now ? localZoneLabel(start) : "local time"}
        </p>
      </div>

      <h2 className="mt-5 font-display text-3xl leading-tight sm:text-[2.1rem]">
        {session.title}
      </h2>

      <p className={`mt-2 text-sm ${light ? "text-quiet" : "text-parchment/65"}`}>
        {dayNames[session.day]} · {formatTimeWAT(session.start)} WAT
        {session.end ? `–${formatTimeWAT(session.end)}` : ""}
      </p>

      <p
        className={`mt-1 text-sm tabular-nums ${light ? "text-ink" : "text-parchment"}`}
        aria-live="polite"
        suppressHydrationWarning
      >
        {now
          ? `Your time: ${formatLocal(start)}`
          : "Converting to your timezone…"}
      </p>

      <div
        className={`mt-6 grid grid-cols-4 border-t pt-5 ${
          light ? "border-ink/15" : "border-parchment/15"
        }`}
      >
        {[
          { value: parts?.days, label: "Days" },
          { value: parts?.hours, label: "Hrs" },
          { value: parts?.minutes, label: "Min" },
          { value: parts?.seconds, label: "Sec" },
        ].map((unit, i) => (
          <div
            key={unit.label}
            className={
              i > 0
                ? `pl-3 ${light ? "border-l border-ink/12" : "border-l border-parchment/12"}`
                : ""
            }
          >
            <p className="font-display text-2xl tabular-nums sm:text-3xl">
              {unit.value === undefined
                ? "––"
                : String(unit.value).padStart(2, "0")}
            </p>
            <p className={`label mt-1 ${light ? "text-quiet" : "text-parchment/60"}`}>
              {unit.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={joinHref}
          {...(external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
          className={`btn ${light ? "btn-ink" : "btn-gold"}`}
        >
          {joinLabel}
        </a>
        <Link href="/gatherings" className="btn btn-outline">
          How we meet
        </Link>
      </div>

      <p className={`mt-4 text-xs ${light ? "text-quiet" : "text-parchment/60"}`}>
        Add to calendar:{" "}
        <a
          className="link-underline"
          href={googleCalendarUrl(
            `TSOP — ${session.title}`,
            session.focus,
            start,
            session.durationMinutes,
          )}
          target="_blank"
          rel="noopener noreferrer"
          suppressHydrationWarning
        >
          Google
        </a>{" "}
        ·{" "}
        <a className="link-underline" href="/schedule.ics" download>
          Apple / Outlook (.ics)
        </a>
      </p>
    </div>
  );
}
