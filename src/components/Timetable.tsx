import { dayNames, type Session } from "@/content/schedule";
import { formatTimeWAT } from "@/lib/time";
import { LocalClock } from "@/components/LocalClock";
import { AlertTriangle } from "lucide-react";
import type { PublicScheduleException } from "@/lib/data";

export function Timetable({
  sessions,
  exceptions = [],
  tone = "light",
}: {
  sessions: Session[];
  exceptions?: PublicScheduleException[];
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";

  return (
    <div className={dark ? "text-parchment" : "text-ink"}>
      {exceptions.length > 0 && (
        <div
          className={`mb-8 border-y border-t-2 py-4 ${
            dark ? "border-parchment/15 border-t-gold" : "border-ink/15 border-t-ember"
          }`}
        >
          <p className={`label flex items-center gap-2 ${dark ? "text-gold-soft" : "text-ember"}`}>
            <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            Changes this week
          </p>
          <ul className="mt-3 space-y-2">
            {exceptions.map((ex) => (
              <li key={ex.id} className="text-sm leading-relaxed">
                <span className="tabular-nums">
                  {new Date(ex.occurrenceDate).toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                {" · "}
                {ex.sessionTitle || "Session"}{" "}
                {ex.action === "cancel"
                  ? "is cancelled"
                  : `moves to ${ex.newStartTime} WAT`}
                {ex.note && (
                  <span className={dark ? "text-parchment/55" : "text-quiet"}> — {ex.note}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {exceptions.length > 0 && (
        <div
          className={`mb-6 rounded-md border p-4 text-xs ${
            dark
              ? "border-amber-400/40 bg-amber-500/15 text-parchment"
              : "border-ember/40 bg-ember/10 text-ink"
          }`}
        >
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-ember">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Special Gathering Notice / Schedule Exception</span>
          </div>
          <div className="mt-2.5 space-y-2">
            {exceptions.map((ex) => (
              <div key={ex.id} className="flex flex-wrap items-baseline gap-2 text-xs">
                <span className="font-semibold underline">
                  {new Date(ex.occurrenceDate).toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                  :
                </span>
                <span>
                  <strong className="text-parchment font-medium">{ex.sessionTitle || "Session"}</strong>{" "}
                  is{" "}
                  <span
                    className={`font-bold uppercase tracking-wider ${
                      ex.action === "cancel" ? "text-red-400" : "text-amber-400"
                    }`}
                  >
                    {ex.action === "cancel" ? "Cancelled" : `Rescheduled to ${ex.newStartTime} WAT`}
                  </span>
                </span>
                {ex.note && <span className="opacity-80 italic">({ex.note})</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className={`hidden grid-cols-[6.5rem_1.6fr_9rem_10rem] gap-6 border-b pb-3 md:grid ${
          dark ? "border-parchment/20" : "border-ink/20"
        }`}
      >
        <p className={`label ${dark ? "text-parchment/60" : "text-quiet"}`}>Day</p>
        <p className={`label ${dark ? "text-parchment/60" : "text-quiet"}`}>Session</p>
        <p className={`label ${dark ? "text-parchment/60" : "text-quiet"}`}>WAT</p>
        <p className={`label ${dark ? "text-parchment/60" : "text-quiet"}`}>Your time</p>
      </div>

      {sessions.map((session) => (
        <div
          key={session.id}
          className={`grid gap-2 border-b py-6 md:grid-cols-[6.5rem_1.6fr_9rem_10rem] md:items-baseline md:gap-6 ${
            dark ? "border-parchment/12" : "border-ink/12"
          }`}
        >
          <p className={`label ${dark ? "text-gold-soft" : "text-ember"}`}>
            {dayNames[session.day]}
          </p>
          <div>
            <p className="font-display text-xl leading-tight md:text-2xl">
              {session.title}
              {session.needsConfirmation && (
                <span
                  className={`ml-1 align-super text-sm ${dark ? "text-gold-soft" : "text-ember"}`}
                  aria-hidden="true"
                >
                  *
                </span>
              )}
            </p>
            <p
              className={`mt-1 max-w-[46ch] text-sm leading-relaxed ${
                dark ? "text-parchment/50" : "text-quiet"
              }`}
            >
              {session.focus}
            </p>
          </div>
          <p className="text-sm tabular-nums md:text-base">
            {formatTimeWAT(session.start)}
            {session.end ? `–${formatTimeWAT(session.end)}` : ""}
            <span className={`label ml-1.5 ${dark ? "text-parchment/60" : "text-quiet"}`}>
              WAT
            </span>
          </p>
          <p className={`text-sm tabular-nums ${dark ? "text-parchment/55" : "text-quiet"}`}>
            <LocalClock day={session.day} start={session.start} />
          </p>
        </div>
      ))}
    </div>
  );
}
