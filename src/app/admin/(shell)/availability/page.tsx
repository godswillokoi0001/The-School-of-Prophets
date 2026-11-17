import { requireStaff } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase/server";
import { AvailabilityEditor } from "@/components/admin/AvailabilityEditor";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  await requireStaff("admin");
  const svc = await getAdminClient();
  let rules = [];
  let callTypes = [];
  let blocks: { id: string; date: string; all_day: boolean; reason: string }[] = [];
  if (svc) {
    const [r, t, b] = await Promise.all([
      svc.from("availability_rules").select("*").order("weekday"),
      svc.from("call_types").select("*").order("sort_order"),
      svc.from("availability_exceptions").select("id,date,all_day,reason").order("date"),
    ]);
    rules = r.data ?? [];
    callTypes = t.data ?? [];
    blocks = b.data ?? [];
  }
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-3">
        <h1 className="font-display text-2xl">Call availability</h1>
        <p className="text-xs opacity-60">
          When people can book calls with the ministry, and how long each type
          of call lasts. Minimum notice is 12 hours and bookings open up to 30
          days ahead (change these with BOOKING_MIN_NOTICE_HOURS and
          BOOKING_MAX_DAYS_AHEAD in the environment).
        </p>
      </div>
      <AvailabilityEditor rules={rules} callTypes={callTypes} blocks={blocks} />
    </div>
  );
}
