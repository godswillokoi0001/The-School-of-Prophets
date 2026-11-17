import { requireStaff } from "@/lib/admin";
import { getServiceClient, supabaseConfigured } from "@/lib/supabase/server";
import { EventEditor } from "@/components/admin/EventEditor";
import type { EventInput } from "@/app/admin/(shell)/actions/events";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  await requireStaff("admin");
  const svc = getServiceClient();
  const media = svc && supabaseConfigured()
    ? (await svc.from("media").select("path,alt").order("created_at", { ascending: false })).data ?? []
    : [];

  const initial: EventInput = {
    title: "",
    slug: "",
    description: "",
    starts_at: "",
    ends_at: null,
    timezone: "Africa/Lagos",
    format: "online",
    location: "Online",
    join_url: "",
    cover_url: null,
    cover_alt: "",
    registration_required: false,
    capacity: null,
    status: "draft",
    recurrence: "none",
    featured: false,
    recap: "",
    recap_video_url: null,
  };

  return <EventEditor initial={initial} media={media} />;
}
