import Link from "next/link";
import { PlusCircle, Radio, Clock, BookOpen, LibraryBig, Users, Star, ArrowRight } from "lucide-react";
import { requireStaff } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase/server";
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
  beta_feedback: "Beta reviews",
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function AdminHome() {
  const staff = await requireStaff("viewer");
  const svc = await getAdminClient();

  const schedule = await getSchedule();
  const next = nextOccurrence(schedule);
  const enrolment = await getEnrolmentSettings();

  let newByType: { type: string; count: number }[] = [];
  let bookingsToday = 0;
  let bookingsWeek = 0;
  let pendingCalls = 0;
  let pendingTestimonies = 0;
  let recent: {
    id: string;
    type: string;
    payload: Record<string, string>;
    created_at: string;
    status: string;
  }[] = [];
  let weekStats: { type: string; count: number }[] = [];
  let counts = { teachings: 0, series: 0, profiles: 0, beta: 0 };

  if (svc) {
    const since = new Date(Date.now() - 7 * 86400_000).toISOString();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const weekEnd = new Date(Date.now() + 7 * 86400_000).toISOString();

    const [byType, bookings, pending, testimonies, recentRows, weekly, teachingsRes, seriesRes, profilesRes, betaRes] =
      await Promise.all([
        svc.from("submissions").select("type", { count: "exact", head: false }).eq("status", "new").is("deleted_at", null),
        svc.from("bookings").select("starts_at,status").gte("starts_at", startOfDay.toISOString()).lte("starts_at", weekEnd),
        svc.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
        svc.from("submissions").select("id", { count: "exact", head: true }).eq("type", "testimony").in("status", ["new", "seen"]).is("deleted_at", null),
        svc.from("submissions").select("id,type,payload,status,created_at").is("deleted_at", null).order("created_at", { ascending: false }).limit(6),
        svc.from("submissions").select("type,created_at").gte("created_at", since).is("deleted_at", null),
        svc.from("teachings").select("id", { count: "exact", head: true }),
        svc.from("series").select("id", { count: "exact", head: true }),
        svc.from("profiles").select("id", { count: "exact", head: true }),
        svc.from("submissions").select("id", { count: "exact", head: true }).eq("type", "beta_feedback").is("deleted_at", null),
      ]);

    const tally = new Map<string, number>();
    (byType.data ?? []).forEach((r) => tally.set(r.type, (tally.get(r.type) ?? 0) + 1));
    newByType = [...tally].map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);

    const nowIso = new Date().toISOString();
    bookingsToday = (bookings.data ?? []).filter((b) => b.starts_at.slice(0, 10) === nowIso.slice(0, 10)).length;
    bookingsWeek = (bookings.data ?? []).length;
    pendingCalls = pending.count ?? 0;
    pendingTestimonies = testimonies.count ?? 0;
    recent = (recentRows.data ?? []) as typeof recent;

    counts = {
      teachings: teachingsRes.count ?? 0,
      series: seriesRes.count ?? 0,
      profiles: profilesRes.count ?? 0,
      beta: betaRes.count ?? 0,
    };

    const weekTally = new Map<string, number>();
    (weekly.data ?? []).forEach((r) => weekTally.set(r.type, (weekTally.get(r.type) ?? 0) + 1));
    weekStats = [...weekTally].map(([type, count]) => ({ type, count }));
  }

  const unreadTotal = newByType.reduce((a, b) => a + b.count, 0);

  return (
    <div className="mx-auto max-w-5xl">
      {/* Greeting and the one primary action */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label text-gold">{greeting()}, {staff.fullName.split(" ")[0] || "friend"}</p>
          <h1 className="mt-1 font-display text-2xl">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/teachings/new" className="admin-btn admin-btn-gold">
            <PlusCircle size={13} /> Write a teaching
          </Link>
          <Link href="/admin/inbox" className="admin-btn admin-btn-ghost">
            Open inbox <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Four numbers */}
      <div className="grid grid-cols-2 gap-px border border-parchment/12 bg-parchment/12 md:grid-cols-4">
        <Link href="/admin/inbox?status=new" className="bg-ink-2 p-4 transition-colors hover:bg-ink-3">
          <p className="admin-label">New in inbox</p>
          <p className={`font-display text-3xl ${unreadTotal > 0 ? "text-gold-soft" : ""}`}>{unreadTotal}</p>
          <p className="mt-1 text-[0.65rem] opacity-55">Across every form</p>
        </Link>
        <Link href="/admin/calendar" className="bg-ink-2 p-4 transition-colors hover:bg-ink-3">
          <p className="admin-label">Calls today</p>
          <p className="font-display text-3xl">{bookingsToday}</p>
          <p className="mt-1 text-[0.65rem] opacity-55">
            {bookingsWeek} this week · {pendingCalls} awaiting approval
          </p>
        </Link>
        <Link href="/admin/inbox?type=testimony&status=new" className="bg-ink-2 p-4 transition-colors hover:bg-ink-3">
          <p className="admin-label">Testimonies to read</p>
          <p className="font-display text-3xl">{pendingTestimonies}</p>
          <p className="mt-1 text-[0.65rem] opacity-55">Waiting for approval</p>
        </Link>
        <div className="bg-ink-2 p-4">
          <p className="admin-label">Next gathering</p>
          {next ? (
            <>
              <p className="text-sm font-semibold leading-snug">{next.title}</p>
              <p className="mt-1 text-[0.65rem] opacity-55">{next.when}</p>
            </>
          ) : (
            <p className="text-xs opacity-55">Nothing scheduled. Check the weekly rhythm.</p>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-5">
        {/* Activity */}
        <section className="md:col-span-3">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="admin-label !mb-0 text-gold">Latest activity</h2>
            <span className="text-[0.65rem] opacity-45">Updated when the page loads</span>
          </div>
          {recent.length === 0 ? (
            <p className="border-t border-parchment/12 py-6 text-sm opacity-60">
              Nothing yet. When someone writes, prays, applies or books a call, it appears here.
            </p>
          ) : (
            <ul className="border-t border-parchment/12">
              {recent.map((r) => (
                <li key={r.id} className="border-b border-parchment/12">
                  <Link
                    href={`/admin/inbox/${r.id}`}
                    className="flex items-baseline justify-between gap-3 py-2.5 text-sm transition-colors hover:text-gold-soft"
                  >
                    <span className="min-w-0">
                      <span className="font-medium">{typeLabels[r.type] ?? r.type}</span>
                      <span className="opacity-60"> · {r.payload?.name || r.payload?.fullName || "No name"}</span>
                    </span>
                    <span className="shrink-0 text-[0.65rem] tabular-nums opacity-50">
                      {new Date(r.created_at).toLocaleString("en-GB", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/inbox" className="admin-link mt-3 inline-block text-xs">
            All submissions
          </Link>
        </section>

        {/* Quick actions */}
        <section className="md:col-span-2">
          <h2 className="admin-label mb-2 text-gold">Do something</h2>
          <ul className="border-t border-parchment/12">
            {[
              { href: "/admin/events/new", label: "Add an event", icon: PlusCircle },
              { href: "/admin/schedule", label: "Edit the weekly rhythm", icon: Clock },
              { href: "/admin/announcements", label: "Post an announcement", icon: Radio },
              { href: "/admin/beta", label: "Read beta reviews", icon: Star },
            ].map((a) => (
              <li key={a.href} className="border-b border-parchment/12">
                <Link
                  href={a.href}
                  className="flex items-center gap-3 py-2.5 text-sm transition-colors hover:text-gold-soft"
                >
                  <a.icon size={14} className="shrink-0 opacity-50" />
                  {a.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Everything else, folded away */}
      <details className="group mt-6 border-t border-parchment/12">
        <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-semibold">
          More insights
          <span className="text-[0.65rem] uppercase tracking-[0.12em] opacity-45 group-open:hidden">
            Numbers, charts and the week
          </span>
          <span className="hidden text-[0.65rem] uppercase tracking-[0.12em] opacity-45 group-open:inline">
            Hide
          </span>
        </summary>

        <div className="space-y-4 pb-2">
          <div className="grid gap-4 md:grid-cols-2">
            <section>
              <h3 className="mb-2 font-display text-base">Inbox by form</h3>
              {newByType.length === 0 ? (
                <p className="text-xs opacity-60">Nothing unread.</p>
              ) : (
                <ul className="border-t border-parchment/12">
                  {newByType.map((t) => (
                    <li key={t.type} className="flex items-center justify-between border-b border-parchment/12 py-2 text-sm">
                      <Link href={`/admin/inbox?type=${t.type}&status=new`} className="hover:text-gold-soft">
                        {typeLabels[t.type] ?? t.type}
                      </Link>
                      <span className="tabular-nums opacity-70">{t.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="mb-2 font-display text-base">Submitted this week</h3>
              <WeekChart data={weekStats} labels={typeLabels} />
            </section>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <section>
              <h3 className="mb-2 font-display text-base">Library and team</h3>
              <ul className="border-t border-parchment/12">
                {[
                  { href: "/admin/teachings", label: "Teachings", value: counts.teachings, icon: BookOpen },
                  { href: "/admin/series", label: "Series", value: counts.series, icon: LibraryBig },
                  { href: "/admin/users", label: "Team members", value: counts.profiles, icon: Users },
                  { href: "/admin/beta", label: "Beta reviews received", value: counts.beta, icon: Star },
                ].map((row) => (
                  <li key={row.href} className="border-b border-parchment/12">
                    <Link href={row.href} className="flex items-center justify-between gap-3 py-2 text-sm hover:text-gold-soft">
                      <span className="flex items-center gap-2">
                        <row.icon size={13} className="opacity-45" />
                        {row.label}
                      </span>
                      <span className="tabular-nums opacity-70">{row.value}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="mb-2 font-display text-base">This week&apos;s rhythm</h3>
              <ul className="border-t border-parchment/12">
                {schedule.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 border-b border-parchment/12 py-2 text-sm">
                    <span className="w-9 shrink-0 text-[0.65rem] uppercase tracking-[0.1em] opacity-50">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][s.day]}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{s.title}</span>
                    <span className="shrink-0 text-xs tabular-nums opacity-55">{s.start} WAT</span>
                  </li>
                ))}
              </ul>
              <Link href="/admin/schedule" className="admin-link mt-2 inline-block text-xs">
                Edit the weekly rhythm
              </Link>
            </section>
          </div>

          <section className="flex flex-wrap items-center justify-between gap-3 border-t border-parchment/12 pt-4">
            <div>
              <h3 className="font-display text-base">Enrolment</h3>
              <p className="text-xs opacity-60">{enrolment.cohortName}</p>
            </div>
            <EnrolmentSwitch initialStatus={enrolment.status} compact />
          </section>
        </div>
      </details>
    </div>
  );
}
