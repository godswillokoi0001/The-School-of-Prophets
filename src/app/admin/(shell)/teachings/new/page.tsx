import { requireStaff } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase/server";
import { TeachingEditor } from "@/components/admin/TeachingEditor";
import type { TeachingInput } from "@/app/admin/(shell)/actions/teachings";

export const dynamic = "force-dynamic";

export default async function NewTeachingPage() {
  await requireStaff("admin");
  const svc = await getAdminClient();
  const media = svc
    ? (await svc.from("media").select("path,alt").order("created_at", { ascending: false })).data ?? []
    : [];
  const seriesOptions = svc
    ? (await svc.from("series").select("id,title,status").order("sort_order")).data ?? []
    : [];

  const initial: TeachingInput = {
    title: "",
    slug: "",
    series_id: null,
    part_number: null,
    date_taught: new Date().toISOString().slice(0, 10),
    speaker: "Prophet Lawrence Iwara",
    summary: "",
    body: "",
    cover_url: null,
    cover_alt: "",
    scripture: [],
    youtube_url: null,
    audio_url: null,
    pdf_url: null,
    links: [],
    tags: [],
    featured: false,
    status: "draft",
    publish_at: null,
    seo_title: null,
    seo_description: null,
    share_image_url: null,
  };

  return <TeachingEditor initial={initial} seriesOptions={seriesOptions} media={media} />;
}
