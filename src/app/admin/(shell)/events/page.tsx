import { requireStaff } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase/server";
import { EventList } from "@/components/admin/EventList";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  await requireStaff("admin");
  const svc = await getAdminClient();
  let rows: {
    id: string;
    title: string;
    slug: string;
    status: string;
    starts_at: string;
    format: string;
    registration_required: boolean;
  }[] = [];

  if (svc) {
    const { data } = await svc
      .from("events")
      .select("id,title,slug,status,starts_at,format,registration_required")
      .order("starts_at", { ascending: false });
    rows = data ?? [];
  }

  return <EventList rows={rows} />;
}
