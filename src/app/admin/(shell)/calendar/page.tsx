import { requireStaff } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase/server";
import { CalendarView } from "@/components/admin/CalendarView";

export const dynamic = "force-dynamic";

export default async function AdminCalendarPage() {
  await requireStaff("moderator");
  const svc = await getAdminClient();
  let sessions: { title: string; day: number; start: string }[] = [];
  if (svc) {
    const { data } = await svc.from("schedule_sessions").select("title,day,start_time").eq("active", true);
    sessions = (data ?? []).map((s) => ({ title: s.title, day: s.day, start: s.start_time }));
  }
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-3">
        <h1 className="font-display text-title">Calendar</h1>
        <p className="admin-hint">
          Calls, weekly gatherings and events on one grid. Open a day or a booking for its details.
        </p>
      </div>
      <CalendarView initialMonth={new Date().toISOString().slice(0, 7)} sessions={sessions} />
      <p className="mt-4 text-xs opacity-60">
        A private feed is available for any calendar app. Ask the developer to set it up if you need it.
      </p>
    </div>
  );
}
