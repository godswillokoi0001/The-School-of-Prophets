import { sessions, type Session } from "@/content/schedule";

export const WAT_OFFSET_MS = 60 * 60 * 1000; // Africa/Lagos is UTC+1, no DST
const DAY_MS = 24 * 60 * 60 * 1000;

export function parseTime(value: string) {
  const [h, m] = value.split(":").map(Number);
  return { h, m };
}

/** Wall clock in WAT, read through the UTC getters. */
function watWallClock(now: Date) {
  return new Date(now.getTime() + WAT_OFFSET_MS);
}

/** The next real timestamp (ms) at which this session starts. */
export function nextStartFor(session: Session, now = new Date()): number {
  const { h, m } = parseTime(session.start);
  const wall = watWallClock(now);
  const today = wall.getUTCDay();
  let delta = (session.day - today + 7) % 7;
  let wallMs = Date.UTC(
    wall.getUTCFullYear(),
    wall.getUTCMonth(),
    wall.getUTCDate() + delta,
    h,
    m,
  );
  let start = wallMs - WAT_OFFSET_MS;
  if (start <= now.getTime()) {
    delta += 7;
    wallMs = Date.UTC(
      wall.getUTCFullYear(),
      wall.getUTCMonth(),
      wall.getUTCDate() + delta,
      h,
      m,
    );
    start = wallMs - WAT_OFFSET_MS;
  }
  return start;
}

export function nextSession(now = new Date()) {
  return sessions
    .map((session) => ({ session, start: nextStartFor(session, now) }))
    .sort((a, b) => a.start - b.start)[0];
}

export function formatTimeWAT(time: string) {
  const { h, m } = parseTime(time);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function formatLocal(startMs: number, timeZone?: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(new Date(startMs));
}

export function localZoneLabel(startMs: number) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZoneName: "short",
  }).formatToParts(new Date(startMs));
  return parts.find((p) => p.type === "timeZoneName")?.value ?? "your time";
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso.slice(0, 10)}T12:00:00Z`));
}

export function formatDateShort(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${iso.slice(0, 10)}T12:00:00Z`));
}

function icsStamp(ms: number) {
  return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function googleCalendarUrl(
  title: string,
  detail: string,
  startMs: number,
  minutes = 60,
) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${icsStamp(startMs)}/${icsStamp(startMs + minutes * 60_000)}`,
    details: detail,
    location: "Online",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function icsForSessions(weeks = 8, now = new Date()) {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The School of Prophets//Weekly Gatherings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:The School of Prophets",
    "X-WR-TIMEZONE:Africa/Lagos",
  ];

  for (const session of sessions) {
    let start = nextStartFor(session, now);
    for (let week = 0; week < weeks; week++) {
      const end = start + (session.durationMinutes ?? 60) * 60_000;
      lines.push(
        "BEGIN:VEVENT",
        `UID:tsop-${session.id}-${icsStamp(start)}@theschoolofprophets.org`,
        `DTSTAMP:${icsStamp(now.getTime())}`,
        `DTSTART:${icsStamp(start)}`,
        `DTEND:${icsStamp(end)}`,
        `SUMMARY:TSOP — ${session.title}`,
        `DESCRIPTION:${session.focus.replace(/\n/g, " ")}`,
        "LOCATION:Online",
        "END:VEVENT",
      );
      start += 7 * DAY_MS;
    }
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function countdownParts(targetMs: number, nowMs: number) {
  const diff = Math.max(0, targetMs - nowMs);
  return {
    days: Math.floor(diff / DAY_MS),
    hours: Math.floor((diff % DAY_MS) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
    done: diff === 0,
  };
}
