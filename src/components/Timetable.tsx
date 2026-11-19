import { dayNames, type Session } from "@/content/schedule";
import { formatTimeWAT } from "@/lib/time";
import { LocalClock } from "@/components/LocalClock";
import { CalendarClock } from "lucide-react";
import type { PublicScheduleException } from "@/lib/data";

/**
 * The weekly timetable. One row per gathering: day, name and focus, the time
 * in WAT, and the reader's own local time. On a phone the day and time sit on
 * one line and the session reads beneath, so nothing has to be pinched.
 */
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
  const quiet = dark ? "text-parchment/60" : "text-quiet";
  const rule = dark ? "border-parchment/12" : "border-ink/12";

  return (
    <div className={dark ? "text-parchment" : "text-ink"}>
      {exceptions.length > 0 && (
        <div
          className={`mb-10 border-y py-4 ${
            dark ? "border-parchment/15 border-t-gold" : "border-ink/15 border-t-ember"
          }`}
        >
          <p className={`label flex items-center gap-2 ${dark ? "text-gold-soft" : "text-ember"}`}>
            <CalendarClock aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
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
                {ex.note && <span className={quiet}> — {ex.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        className={`hidden gap-4 border-b pb-3 md:grid md:grid-cols-[5.5rem_minmax(0,1.6fr)_8rem_9rem] lg:grid-cols-[6.5rem_1.6fr_9rem_10rem] lg:gap-6 ${
          dark ? "border-parchment/20" : "border-ink/20"
        }`}
      >
        {["Day", "Session", "WAT", "Your time"].map((heading) => (
          <p key={heading} className={`label ${quiet}`}>
            {heading}
          </p>
        ))}
      </div>

      {sessions.map((session) => (
        <div
          key={session.id}
          className={`grid gap-2 border-b py-6 md:grid-cols-[5.5rem_minmax(0,1.6fr)_8rem_9rem] md:items-baseline md:gap-4 lg:grid-cols-[6.5rem_1.6fr_9rem_10rem] lg:gap-6 ${rule}`}
        >
          <div className="flex items-baseline justify-between gap-4 md:block">
            <p className={`label ${dark ? "text-gold-soft" : "text-ember"}`}>
              {dayNames[session.day]}
            </p>
            <p className={`text-sm tabular-nums md:hidden ${quiet}`}>
              {formatTimeWAT(session.start)}
              {session.end ? `–${formatTimeWAT(session.end)}` : ""} WAT
            </p>
          </div>

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
            <p className={`mt-1 max-w-[46ch] text-sm leading-relaxed ${quiet}`}>
              {session.focus}
            </p>
          </div>

          <p className="hidden text-sm tabular-nums md:block md:text-base">
            {formatTimeWAT(session.start)}
            {session.end ? `–${formatTimeWAT(session.end)}` : ""}
            <span className={`label ml-1.5 ${quiet}`}>WAT</span>
          </p>

          <p className={`flex items-baseline gap-1.5 text-sm tabular-nums ${quiet} md:block`}>
            <span className="label md:hidden">Your time</span>
            <LocalClock day={session.day} start={session.start} />
          </p>
        </div>
      ))}
    </div>
  );
}
