"use client";

import { Calendar, Download, ExternalLink } from "lucide-react";
import type { EventItem } from "@/content/events";
import { googleCalendarUrl } from "@/lib/time";

export function EventCalendarLink({ event }: { event: EventItem }) {
  const [hours, minutes] = (event.time ?? "20:00").split(":").map(Number);
  const start = Date.UTC(
    Number(event.date.slice(0, 4)),
    Number(event.date.slice(5, 7)) - 1,
    Number(event.date.slice(8, 10)),
    hours - 1,
    minutes,
  );

  const googleUrl = googleCalendarUrl(`TSOP — ${event.title}`, event.summary, start, 90);

  // Generate dynamic .ics data URI for Apple / Outlook
  const startDateStr = new Date(start).toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const endDateStr = new Date(start + 90 * 60000).toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The School of Prophets//Events//EN",
    "BEGIN:VEVENT",
    `SUMMARY:TSOP — ${event.title}`,
    `DESCRIPTION:${event.summary}`,
    `LOCATION:${event.location || "Online"}`,
    `DTSTART:${startDateStr}`,
    `DTEND:${endDateStr}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const icsUri = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      <a
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5  bg-gold px-3.5 py-2 text-xs font-semibold text-ink  hover:bg-gold/90 transition-colors"
      >
        <Calendar size={14} />
        <span>Add to Google Calendar</span>
        <ExternalLink size={11} className="opacity-70" />
      </a>
      <a
        href={icsUri}
        download={`${event.slug}.ics`}
        className="inline-flex items-center gap-1.5  border border-ink/20 px-3.5 py-2 text-xs font-semibold text-ink hover:bg-ink/5 transition-colors"
      >
        <Download size={14} />
        <span>Apple / Outlook (.ics)</span>
      </a>
    </div>
  );
}
