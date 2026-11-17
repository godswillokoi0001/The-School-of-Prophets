import { BookOpen, Flame, Sun, Users, type LucideIcon } from "lucide-react";
import { dayNames, type Session } from "@/content/schedule";
import { formatTimeWAT } from "@/lib/time";
import { LocalClock } from "@/components/LocalClock";

const icons: Record<string, LucideIcon> = {
  "monday-teaching": BookOpen,
  "wednesday-bible-study": Users,
  "friday-prayer": Flame,
  "sunday-exhortation": Sun,
};

export function Timetable({ sessions }: { sessions: Session[] }) {
  return (
    <div>
      <div className="hidden border-b border-ink/20 pb-3 md:grid md:grid-cols-[6rem_1.5fr_1fr_1fr] md:gap-4">
        <p className="label text-quiet">Day</p>
        <p className="label text-quiet">Session</p>
        <p className="label text-quiet">WAT</p>
        <p className="label text-quiet">Your local time</p>
      </div>

      {sessions.map((session) => {
        const Icon = icons[session.id] ?? BookOpen;
        return (
          <div
            key={session.id}
            className="grid gap-2 border-b border-ink/12 py-5 md:grid-cols-[6rem_1.5fr_1fr_1fr] md:items-baseline md:gap-4"
          >
            <p className="label flex items-center gap-2 text-ember">
              <Icon aria-hidden="true" className="h-3.5 w-3.5" />
              {dayNames[session.day]}
            </p>
            <div>
              <p className="font-display text-xl leading-tight">
                {session.title}
                {session.needsConfirmation && (
                  <span className="ml-1 align-super text-sm text-ember" aria-hidden="true">
                    *
                  </span>
                )}
              </p>
              <p className="mt-1 max-w-[46ch] text-sm leading-relaxed text-quiet">
                {session.focus}
              </p>
            </div>
            <p className="text-sm tabular-nums">
              {formatTimeWAT(session.start)}
              {session.end ? `–${formatTimeWAT(session.end)}` : ""}{" "}
              <span className="label text-quiet">WAT</span>
            </p>
            <p className="text-sm text-quiet">
              <LocalClock day={session.day} start={session.start} />
            </p>
          </div>
        );
      })}
    </div>
  );
}
