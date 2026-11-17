import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin";
import { getServiceClient, supabaseConfigured } from "@/lib/supabase/server";
import { EventEditor } from "@/components/admin/EventEditor";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireStaff("admin");
  const { slug } = await params;
  const svc = getServiceClient();
  if (!svc || !supabaseConfigured()) notFound();
  const { data } = await svc.from("events").select("*").eq("slug", slug).single();
  if (!data) notFound();
  const { data: exceptions } = await svc
    .from("event_exceptions")
    .select("id,occurrence_date,action,new_starts_at,note")
    .eq("event_id", data.id);
  const media = (await svc.from("media").select("path,alt").order("created_at", { ascending: false })).data ?? [];
  return <EventEditor initial={data} media={media} exceptions={exceptions ?? []} />;
}
