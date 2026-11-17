import { requireStaff } from "@/lib/admin";
import { getServiceClient, supabaseConfigured } from "@/lib/supabase/server";
import { BroadcastComposer } from "@/components/admin/BroadcastComposer";

export const dynamic = "force-dynamic";

export default async function BroadcastsPage() {
  await requireStaff("admin");
  const svc = getServiceClient();
  let options: { kind: "teaching" | "event"; id: string; label: string }[] = [];
  if (svc && supabaseConfigured()) {
    const [teachings, events] = await Promise.all([
      svc.from("teachings").select("id,title").eq("status", "published").order("date_taught", { ascending: false }).limit(30),
      svc.from("events").select("id,title").eq("status", "published").order("starts_at", { ascending: false }).limit(15),
    ]);
    options = [
      ...(teachings.data ?? []).map((t) => ({ kind: "teaching" as const, id: t.id, label: `Teaching: ${t.title}` })),
      ...(events.data ?? []).map((e) => ({ kind: "event" as const, id: e.id, label: `Event: ${e.title}` })),
    ];
  }
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-1 font-display text-2xl">Newsletter & broadcasts</h1>
      <p className="mb-4 text-xs opacity-60">
        Email everyone on the list or a segment. Unsubscribed people are always
        excluded. Use the snippet generator for WhatsApp and Telegram.
      </p>
      <BroadcastComposer options={options} />
    </div>
  );
}
