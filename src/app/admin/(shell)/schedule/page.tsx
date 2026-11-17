import { requireStaff } from "@/lib/admin";
import { getServiceClient, supabaseConfigured } from "@/lib/supabase/server";
import { ScheduleEditor, type SessionRow, type ExceptionRow } from "@/components/admin/ScheduleEditor";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  await requireStaff("admin");
  const svc = getServiceClient();
  let rows: SessionRow[] = [];
  let exceptions: ExceptionRow[] = [];

  if (svc && supabaseConfigured()) {
    const today = new Date().toISOString().slice(0, 10);
    const [sessions, ex] = await Promise.all([
      svc.from("schedule_sessions").select("*").order("sort_order"),
      svc.from("schedule_exceptions").select("*").gte("occurrence_date", today).order("occurrence_date"),
    ]);
    rows = (sessions.data ?? []) as SessionRow[];
    exceptions = (ex.data ?? []) as ExceptionRow[];
  }

  return (
    <div className="mx-auto max-w-5xl">
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
    </div>
  );
}
