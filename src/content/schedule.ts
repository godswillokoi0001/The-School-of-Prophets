/**
 * Weekly rhythm. Times are wall-clock times in WAT (Africa/Lagos, UTC+1,
 * no daylight saving). `needsConfirmation` renders a visible draft marker:
 * never silently present an unconfirmed time as settled.
 */

export type Session = {
  id: string;
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  title: string;
  focus: string;
  start: string; // "20:00" in WAT
  end?: string;
  durationMinutes?: number;
  needsConfirmation?: boolean;
};

export const sessions: Session[] = [
  {
    id: "monday-teaching",
    day: 1,
    title: "Teaching / Convergence",
    focus:
      "The week opens here. A full teaching from the Word, followed by ministry and convergence in prayer.",
    start: "20:00",
    end: "21:00",
    durationMinutes: 60,
    needsConfirmation: true,
  },
  {
    id: "wednesday-bible-study",
    day: 3,
    title: "Bible Study",
    focus:
      "Book by book, line by line. We stay in a passage until it is understood, not merely read.",
    start: "21:00",
    end: "22:00",
    durationMinutes: 60,
    needsConfirmation: true,
  },
  {
    id: "friday-prayer",
    day: 5,
    title: "Prayer",
    focus:
      "Intercession for the body, the nations and one another. Bring your requests; we stand together.",
    start: "21:00",
    end: "22:00",
    durationMinutes: 60,
    needsConfirmation: true,
  },
  {
    id: "sunday-exhortation",
    day: 0,
    title: "Exhortation & Teaching",
    focus:
      "A shorter weekend session: exhortation, questions and a word to carry into the week.",
    start: "18:00",
    end: "19:00",
    durationMinutes: 60,
    needsConfirmation: true,
  },
];

export const scheduleNote =
  "Session times marked * are still being confirmed with the ministry. The pattern of the week is settled; the exact clock times are not yet published.";

export const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
