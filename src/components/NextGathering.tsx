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
      className={`relative border p-5 sm:p-7 md:p-8 ${
        light
          ? "border-ink/15 bg-parchment text-ink"
          : "border-parchment/20 bg-ink-2 text-parchment"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2 sm:gap-4">
        <p className={`label ${light ? "text-ember" : "text-gold"}`}>Next gathering</p>
        <p className={`label text-[0.65rem] sm:text-xs truncate ${light ? "text-quiet" : "text-parchment/60"}`} suppressHydrationWarning>
          {now ? localZoneLabel(start) : "local time"}
        </p>
      </div>

      <h2 className="mt-4 sm:mt-5 font-display text-2xl sm:text-3xl lg:text-[2.1rem] leading-tight break-words">
        {session.title}
      </h2>

      <p className={`mt-2 text-xs sm:text-sm ${light ? "text-quiet" : "text-parchment/65"}`}>
        {dayNames[session.day]} · {formatTimeWAT(session.start)} WAT
        {session.end ? `–${formatTimeWAT(session.end)}` : ""}
      </p>

      <p
        className={`mt-1 text-xs sm:text-sm tabular-nums ${light ? "text-ink" : "text-parchment"}`}
        aria-live="polite"
        suppressHydrationWarning
      >
        {now
          ? `Your time: ${formatLocal(start)}`
          : "Converting to your timezone…"}
      </p>

      <div
        className={`mt-5 sm:mt-6 grid grid-cols-4 border-t pt-4 sm:pt-5 ${
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
            className={`text-center sm:text-left ${
              i > 0
                ? `pl-2 sm:pl-3 ${light ? "border-l border-ink/12" : "border-l border-parchment/12"}`
                : ""
            }`}
          >
            <p className="font-display text-xl sm:text-2xl lg:text-3xl tabular-nums leading-none">
              {unit.value === undefined
                ? "––"
                : String(unit.value).padStart(2, "0")}
            </p>
            <p className={`label mt-1 text-[0.6rem] sm:text-xs ${light ? "text-quiet" : "text-parchment/60"}`}>
              {unit.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3 items-stretch">
        <a
          href={joinHref}
          {...(external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
          className={`btn w-full min-w-0 !px-1.5 sm:!px-3 !text-[0.6rem] sm:!text-[0.6875rem] !tracking-wider sm:!tracking-[0.13em] !min-h-[2.5rem] sm:!min-h-[2.75rem] text-center whitespace-nowrap overflow-hidden ${
            light ? "btn-ink" : "btn-gold"
          }`}
          title={joinLabel}
        >
          <span className="truncate">{joinLabel}</span>
        </a>
        <Link
          href="/gatherings"
          className="btn btn-outline w-full min-w-0 !px-1.5 sm:!px-3 !text-[0.6rem] sm:!text-[0.6875rem] !tracking-wider sm:!tracking-[0.13em] !min-h-[2.5rem] sm:!min-h-[2.75rem] text-center whitespace-nowrap overflow-hidden"
          title="How we meet"
        >
          <span className="truncate">How we meet</span>
        </Link>
      </div>

      <p className={`mt-4 text-xs ${light ? "text-quiet" : "text-parchment/60"} flex flex-wrap items-center gap-x-1.5 gap-y-1`}>
        <span>Add to calendar:</span>{" "}
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
