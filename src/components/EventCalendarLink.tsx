import type { EventItem } from "@/content/events";
import { googleCalendarUrl } from "@/lib/time";

/** Adds a dated event to Google Calendar. Weekly sessions use /schedule.ics. */
export function EventCalendarLink({ event }: { event: EventItem }) {
  const [hours, minutes] = (event.time ?? "20:00").split(":").map(Number);
  // WAT is UTC+1: subtract an hour to build the UTC timestamp.
  const start = Date.UTC(
    Number(event.date.slice(0, 4)),
    Number(event.date.slice(5, 7)) - 1,
    Number(event.date.slice(8, 10)),
    hours - 1,
    minutes,
  );

  return (
    <a
      href={googleCalendarUrl(`TSOP — ${event.title}`, event.summary, start, 90)}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-outline w-fit"
    >
      Add to calendar
    </a>
  );
}
