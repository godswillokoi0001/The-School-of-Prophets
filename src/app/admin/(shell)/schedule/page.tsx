import { requireStaff } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase/server";
import { ScheduleEditor, type SessionRow, type ExceptionRow } from "@/components/admin/ScheduleEditor";
import { RemindersControl } from "@/components/admin/RemindersControl";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  await requireStaff("admin");
  const svc = await getAdminClient();
  let rows: SessionRow[] = [];
  let exceptions: ExceptionRow[] = [];
  let subscriberCount = 0;

  if (svc) {
    const today = new Date().toISOString().slice(0, 10);
    const [sessions, ex, subs] = await Promise.all([
      svc.from("schedule_sessions").select("*").order("sort_order"),
      svc.from("schedule_exceptions").select("*").gte("occurrence_date", today).order("occurrence_date"),
      svc.from("subscribers").select("id", { count: "exact", head: true }).is("unsubscribed_at", null),
    ]);
    rows = (sessions.data ?? []) as SessionRow[];
    exceptions = (ex.data ?? []) as ExceptionRow[];
    subscriberCount = subs.count ?? 0;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="mb-3">
        <h1 className="font-display text-2xl">Weekly schedule</h1>
        <p className="text-xs opacity-60">
          Times are stored and edited in WAT (Lagos). Visitors see them in their
          own timezone, with WAT always shown too. Saving publishes instantly to
          the Weekly Gatherings page, the home page and calendar feeds.
        </p>
      </div>
      {rows.length === 0 ? (
        <div className="admin-surface p-6 text-sm opacity-70">
          No sessions yet. Add your weekly rhythm: teachings, Bible study,
          prayer and Convergence.
        </div>
      ) : null}
      <ScheduleEditor initial={rows} exceptions={exceptions} />
      <RemindersControl subscribersCount={subscriberCount} />
    </div>
  );
}
