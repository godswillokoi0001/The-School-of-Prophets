import type { Session as SeedSession } from "@/content/schedule";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export type NextGathering = {
  title: string;
  when: string;
  startsAt: Date;
};

export function nextOccurrence(sessions: SeedSession[]): NextGathering | null {
  const active = sessions.filter((s) => s.start);
  if (active.length === 0) return null;
  const now = new Date();
  const candidates = active
    .map((s) => {
      const d = new Date(now);
      const diff = (s.day - now.getDay() + 7) % 7;
      d.setDate(d.getDate() + diff);
      const [h, m] = s.start.split(":").map(Number);
      d.setHours(h, m, 0, 0);
      if (d <= now) d.setDate(d.getDate() + 7);
      return { session: s, at: d };
    })
    .sort((a, b) => a.at.getTime() - b.at.getTime());
  const first = candidates[0];
  const diffDays = Math.round((first.at.getTime() - now.getTime()) / 86400_000);
  const when =
    diffDays === 0
      ? `Today ${first.at.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} WAT`
      : diffDays === 1
        ? `Tomorrow ${first.at.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} WAT`
        : `${dayNames[first.session.day]}s ${first.session.start} WAT`;
  return { title: first.session.title, when, startsAt: first.at };
}
