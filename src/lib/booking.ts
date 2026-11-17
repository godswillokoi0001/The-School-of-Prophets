import { getServiceClient, supabaseConfigured } from "@/lib/supabase/server";

export type Slot = { startsAt: string; wat: string };
export type CallType = {
  id: string; name: string; slug: string; description: string;
  duration_minutes: number; buffer_minutes: number; mode: string;
  approval_required: boolean; active: boolean;
};
export type AvailabilityRule = {
  id: string; weekday: number; start_time: string; end_time: string;
  slot_minutes: number; call_type_id: string | null; active: boolean;
};
export type AvailabilityException = {
  id: string; date: string; all_day: boolean;
  start_time: string | null; end_time: string | null; reason: string;
};

export async function getBookingConfig() {
  const svc = getServiceClient();
  if (!svc || !supabaseConfigured())
    return { callTypes: [] as CallType[], rules: [] as AvailabilityRule[], exceptions: [] as AvailabilityException[] };
  const [types, rules, exceptions] = await Promise.all([
    svc.from("call_types").select("*").eq("active", true).order("sort_order"),
    svc.from("availability_rules").select("*").eq("active", true),
    svc.from("availability_exceptions").select("*"),
  ]);
  return {
    callTypes: (types.data ?? []) as CallType[],
    rules: (rules.data ?? []) as AvailabilityRule[],
    exceptions: (exceptions.data ?? []) as AvailabilityException[],
  };
}

const MIN_NOTICE_HOURS = Number(process.env.BOOKING_MIN_NOTICE_HOURS ?? 12);
const MAX_DAYS_AHEAD = Number(process.env.BOOKING_MAX_DAYS_AHEAD ?? 30);
const DAILY_LIMIT = Number(process.env.BOOKING_DAILY_LIMIT ?? 10);

function watParts(dateISO: string) {
  const [y, m, d] = dateISO.split("-").map(Number);
  return { y, m: m - 1, d };
}

function slotUTC(dateISO: string, time: string) {
  const { y, m, d } = watParts(dateISO);
  const [h, min] = time.split(":").map(Number);
  return new Date(Date.UTC(y, m, d, h - 1, min, 0));
}

export function weekdayOf(dateISO: string) {
  return slotUTC(dateISO, "12:00").getUTCDay();
}

export async function availableSlots(
  dateISO: string,
  callTypeId: string,
): Promise<Slot[]> {
  const { rules, exceptions } = await getBookingConfig();
  const svc = getServiceClient();
  const weekday = weekdayOf(dateISO);
  const dayRules = rules.filter(
    (r) =>
      r.weekday === weekday &&
      (!r.call_type_id || r.call_type_id === callTypeId),
  );
  if (dayRules.length === 0) return [];

  const dayEx = exceptions.find((e) => e.date === dateISO);
  if (dayEx?.all_day) return [];

  const now = new Date();
  const minStart = new Date(now.getTime() + MIN_NOTICE_HOURS * 3600_000);
  const maxStart = new Date(now.getTime() + MAX_DAYS_AHEAD * 86400_000);
  const at = slotUTC(dateISO, "12:00");
  if (at < minStart || at > maxStart) return [];

  let bookings: { starts_at: string; ends_at: string }[] = [];
  let dailyCount = 0;
  if (svc) {
    const dayStart = `${dateISO}T00:00:00+01:00`;
    const dayEnd = `${dateISO}T23:59:59+01:00`;
    const { data } = await svc
      .from("bookings")
      .select("starts_at,ends_at")
      .in("status", ["pending", "confirmed"])
      .gte("starts_at", dayStart)
      .lte("starts_at", dayEnd);
    bookings = data ?? [];
    dailyCount = bookings.length;
  }
  if (dailyCount >= DAILY_LIMIT) return [];

  const out: Slot[] = [];
  for (const rule of dayRules) {
    const step = rule.slot_minutes;
    const start = timeToMinutes(rule.start_time);
    const end = timeToMinutes(rule.end_time);
    for (let t = start; t + step <= end; t += step) {
      const time = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
      const startsAt = slotUTC(dateISO, time);
      const endsAt = new Date(startsAt.getTime() + step * 60_000);
      if (dayEx && !dayEx.all_day) {
        const from = slotUTC(dateISO, dayEx.start_time ?? "00:00");
        const to = slotUTC(dateISO, dayEx.end_time ?? "23:59");
        if (startsAt < to && endsAt > from) continue;
      }
      const conflict = bookings.some((b) => {
        const bs = new Date(b.starts_at).getTime();
        const be = new Date(b.ends_at).getTime();
        return startsAt.getTime() < be + 5 * 60_000 && endsAt.getTime() > bs - 5 * 60_000;
      });
      if (conflict) continue;
      out.push({
        startsAt: startsAt.toISOString(),
        wat: `${time} WAT`,
      });
    }
  }
  return out.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function icsFor(
  title: string,
  description: string,
  startsAt: string,
  endsAt: string,
  uid: string,
) {
  const fmt = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d+/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TSOP//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${fmt(new Date().toISOString())}`,
    `DTSTART:${fmt(startsAt)}`,
    `DTEND:${fmt(endsAt)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
