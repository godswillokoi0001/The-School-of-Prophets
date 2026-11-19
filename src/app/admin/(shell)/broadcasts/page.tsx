import { requireStaff } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase/server";
import { BroadcastComposer, type BroadcastRecord } from "@/components/admin/BroadcastComposer";
import Link from "next/link";
import { Mail, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BroadcastsPage() {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  let options: { kind: "teaching" | "event"; id: string; label: string }[] = [];
  let pastBroadcasts: BroadcastRecord[] = [];
  let subscriberCount = 0;

  if (svc) {
    const [teachings, events, broadcasts, subs] = await Promise.all([
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
      svc
        .from("subscribers")
        .select("id", { count: "exact", head: true })
        .is("unsubscribed_at", null),
    ]);
    options = [
      ...(teachings.data ?? []).map((t) => ({ kind: "teaching" as const, id: t.id, label: `Teaching: ${t.title}` })),
      ...(events.data ?? []).map((e) => ({ kind: "event" as const, id: e.id, label: `Event: ${e.title}` })),
    ];
    pastBroadcasts = (broadcasts.data ?? []) as BroadcastRecord[];
    subscriberCount = subs.count ?? 0;
  }
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl">Newsletters & Broadcasts</h1>
          <p className="text-xs opacity-60">
            Compose, preview, schedule, and view sent newsletters, or modify and reuse past epistles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/broadcasts" className="admin-btn admin-btn-gold">
            <Mail size={13} /> Newsletters & Broadcasts
          </Link>
          <Link href="/admin/subscribers" className="admin-btn admin-btn-ghost">
            <Users size={13} /> Subscribers ({subscriberCount})
          </Link>
        </div>
      </div>
      <BroadcastComposer
        options={options}
        pastBroadcasts={pastBroadcasts}
        isOwner={staff.role === "owner"}
      />
    </div>
  );
}
