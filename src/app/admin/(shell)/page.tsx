import Link from "next/link";
import { PlusCircle, Radio, Clock } from "lucide-react";
import { requireStaff } from "@/lib/admin";
import { getAdminClient, supabaseConfigured } from "@/lib/supabase/server";
import { getSchedule, getEnrolmentSettings } from "@/lib/data";
import { nextOccurrence } from "@/lib/schedule-time";
import { EnrolmentSwitch } from "@/components/admin/EnrolmentSwitch";
import { WeekChart } from "@/components/admin/WeekChart";

export const dynamic = "force-dynamic";

const typeLabels: Record<string, string> = {
  enrolment: "Applications",
  waitlist: "Waitlist",
  prayer: "Prayer",
  testimony: "Testimonies",
  contact: "Messages",
  registration: "Event registrations",
  booking: "Call bookings",
  newsletter: "Sign-ups",
};

export default async function AdminHome() {
  await requireStaff("viewer");
  const svc = await getAdminClient();

  const schedule = await getSchedule();
  const next = nextOccurrence(schedule);
  const enrolment = await getEnrolmentSettings();

  let newByType: { type: string; count: number }[] = [];
  let bookingsToday = 0;
  let bookingsWeek = 0;
  let pendingCalls = 0;
  let recent: {
    id: string;
    type: string;
    payload: Record<string, string>;
    created_at: string;
    status: string;
  }[] = [];
  let weekStats: { type: string; count: number }[] = [];

  if (svc) {
    const since = new Date(Date.now() - 7 * 86400_000).toISOString();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const weekEnd = new Date(Date.now() + 7 * 86400_000).toISOString();

    const [byType, bookings, pending, recentRows, weekly] = await Promise.all([
      svc
        .from("submissions")
        .select("type", { count: "exact", head: false })
        .eq("status", "new")
        .is("deleted_at", null),
      svc
        .from("bookings")
        .select("starts_at,status")
        .gte("starts_at", startOfDay.toISOString())
        .lte("starts_at", weekEnd),
      svc
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      svc
        .from("submissions")
        .select("id,type,payload,status,created_at")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(8),
      svc
        .from("submissions")
        .select("type,created_at")
        .gte("created_at", since)
        .is("deleted_at", null),
    ]);

    const tally = new Map<string, number>();
    (byType.data ?? []).forEach((r) =>
      tally.set(r.type, (tally.get(r.type) ?? 0) + 1),
    );
    newByType = [...tally].map(([type, count]) => ({ type, count }));

    const nowIso = new Date().toISOString();
    bookingsToday = (bookings.data ?? []).filter(
      (b) => b.starts_at.slice(0, 10) === nowIso.slice(0, 10),
    ).length;
    bookingsWeek = (bookings.data ?? []).length;
    pendingCalls = pending.count ?? 0;
    recent = (recentRows.data ?? []) as typeof recent;

    const weekTally = new Map<string, number>();
    (weekly.data ?? []).forEach((r) =>
      weekTally.set(r.type, (weekTally.get(r.type) ?? 0) + 1),
    );
    weekStats = [...weekTally].map(([type, count]) => ({ type, count }));
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Today at a glance</h1>
          <p className="text-xs opacity-60">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/teachings/new"
            className="admin-btn admin-btn-ghost"
          >
            <PlusCircle size={13} /> New teaching
          </Link>
          <Link href="/admin/events/new" className="admin-btn admin-btn-ghost">
            <PlusCircle size={13} /> New event
          </Link>
          <Link href="/admin/schedule" className="admin-btn admin-btn-ghost">
            <PlusCircle size={13} /> Add session
          </Link>
          <Link
            href="/admin/announcements"
            className="admin-btn admin-btn-gold"
          >
            <Radio size={13} /> Announcement
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Link
          href="/admin/inbox"
          className="admin-surface p-4 hover:border-gold/40"
        >
          <p className="admin-label">New submissions</p>
          <p className="font-display text-3xl text-gold-soft">
            {newByType.reduce((a, b) => a + b.count, 0)}
          </p>
        </Link>
        <Link
          href="/admin/calendar"
          className="admin-surface p-4 hover:border-gold/40"
        >
          <p className="admin-label">Calls today</p>
          <p className="font-display text-3xl">{bookingsToday}</p>
          <p className="text-[0.65rem] opacity-60">
            {bookingsWeek} this week · {pendingCalls} awaiting approval
          </p>
        </Link>
        <div className="admin-surface p-4">
          <p className="admin-label">Next gathering</p>
          {next ? (
            <>
              <p className="text-sm font-semibold">{next.title}</p>
              <p className="text-xs opacity-70">{next.when}</p>
            </>
          ) : (
            <p className="text-xs opacity-60">No active sessions</p>
          )}
        </div>
        <div className="admin-surface p-4 flex flex-col justify-between">
          <p className="admin-label">Enrolment</p>
          <div className="my-1">
            <EnrolmentSwitch initialStatus={enrolment.status} compact />
          </div>
          <p className="text-[0.65rem] opacity-60">{enrolment.cohortName}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <section className="admin-surface p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-lg">Inbox by type</h2>
            <Link href="/admin/inbox" className="admin-link text-xs">
              Open inbox
            </Link>
          </div>
          {newByType.length === 0 ? (
            <p className="text-xs opacity-60">
              Nothing unread. Every form on the site lands here: applications,
              prayer requests, testimonies, messages and call bookings.
            </p>
          ) : (
            <ul className="divide-y divide-parchment/10 text-sm">
              {newByType.map((t) => (
                <li
                  key={t.type}
                  className="flex items-center justify-between py-2 admin-row"
                >
                  <Link
                    href={`/admin/inbox?type=${t.type}&status=new`}
                    className="hover:text-gold-soft"
                  >
                    {typeLabels[t.type] ?? t.type}
                  </Link>
                  <span className="admin-badge admin-badge-new">{t.count}</span>
                </li>
              ))}
            </ul>
          )}
          {svc && (
            <p className="mt-2 text-xs opacity-60">
              Testimonies awaiting approval:{" "}
              <Link href="/admin/inbox?type=testimony" className="admin-link">
                review now
              </Link>
            </p>
          )}
        </section>

        <section className="admin-surface p-4">
          <h2 className="mb-2 font-display text-lg">Submissions this week</h2>
          <WeekChart data={weekStats} labels={typeLabels} />
        </section>
      </div>

      <section className="admin-surface mt-4 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-lg">Latest activity</h2>
          <span className="text-[0.65rem] uppercase tracking-widest opacity-50">
            Live in the bell above
          </span>
        </div>
        {recent.length === 0 ? (
          <p className="text-xs opacity-60">No submissions yet.</p>
        ) : (
          <ul className="divide-y divide-parchment/10 text-sm">
            {recent.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 py-2 admin-row"
              >
                <Link
                  href={`/admin/inbox/${r.id}`}
                  className="min-w-0 hover:text-gold-soft"
                >
                  <span className="font-semibold">
                    {typeLabels[r.type] ?? r.type}
                  </span>
                  <span className="opacity-70">
                    {" "}
                    · {(r.payload?.name as string) ?? "—"}{" "}
                  </span>
                </Link>
                <span className="shrink-0 text-[0.65rem] opacity-50">
                  {new Date(r.created_at).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-surface mt-4 p-4">
        <h2 className="mb-3 font-display text-lg">This week&apos;s rhythm</h2>
        <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {schedule.map((s) => (
            <li key={s.id} className="flex items-center gap-3 admin-row pb-2">
              <Clock size={14} className="shrink-0 opacity-50" />
              <span className="text-xs opacity-60 w-20 shrink-0">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][s.day]}
              </span>
              <span className="flex-1 truncate">{s.title}</span>
              <span className="text-xs opacity-60">{s.start} WAT</span>
            </li>
          ))}
        </ul>
        <Link
          href="/admin/schedule"
          className="admin-link mt-2 inline-block text-xs"
        >
          Edit weekly schedule
        </Link>
      </section>
    </div>
  );
}
