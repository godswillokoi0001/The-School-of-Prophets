import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase/server";
import { EventEditor } from "@/components/admin/EventEditor";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireStaff("admin");
  const { slug } = await params;
  const svc = await getAdminClient();
  if (!svc) notFound();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  const { data } = await (isUuid
    ? svc.from("events").select("*").eq("id", slug).maybeSingle()
    : svc.from("events").select("*").eq("slug", slug).maybeSingle());
  if (!data) notFound();
  const { data: exceptions } = await svc
    .from("event_exceptions")
    .select("id,occurrence_date,action,new_starts_at,note")
    .eq("event_id", data.id);
  const media = (await svc.from("media").select("path,alt").order("created_at", { ascending: false })).data ?? [];
  return <EventEditor initial={data} media={media} exceptions={exceptions ?? []} />;
}
