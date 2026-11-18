import { requireStaff } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase/server";
import { BroadcastComposer, type BroadcastRecord } from "@/components/admin/BroadcastComposer";

export const dynamic = "force-dynamic";

export default async function BroadcastsPage() {
  await requireStaff("admin");
  const svc = await getAdminClient();
  let options: { kind: "teaching" | "event"; id: string; label: string }[] = [];
  let pastBroadcasts: BroadcastRecord[] = [];

  if (svc) {
    const [teachings, events, broadcasts] = await Promise.all([
      svc
        .from("teachings")
        .select("id,title")
        .eq("status", "published")
        .order("date_taught", { ascending: false })
        .limit(30),
      svc
        .from("events")
        .select("id,title")
        .eq("status", "published")
        .order("starts_at", { ascending: false })
        .limit(15),
      svc
        .from("broadcasts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    options = [
      ...(teachings.data ?? []).map((t) => ({ kind: "teaching" as const, id: t.id, label: `Teaching: ${t.title}` })),
      ...(events.data ?? []).map((e) => ({ kind: "event" as const, id: e.id, label: `Event: ${e.title}` })),
    ];
    pastBroadcasts = (broadcasts.data ?? []) as BroadcastRecord[];
  }
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-1 font-display text-2xl">Newsletter & broadcasts</h1>
      <p className="mb-4 text-xs opacity-60">
        Email everyone on the list or a segment. Unsubscribed people are always
        excluded. View past newsletters to modify and reuse them anytime.
      </p>
      <BroadcastComposer options={options} pastBroadcasts={pastBroadcasts} />
    </div>
  );
}
