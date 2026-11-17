import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase/server";
import { TeachingEditor } from "@/components/admin/TeachingEditor";
import type { TeachingInput } from "@/app/admin/(shell)/actions/teachings";

export const dynamic = "force-dynamic";

export default async function EditTeachingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireStaff("admin");
  const { slug } = await params;
  const svc = await getAdminClient();
  if (!svc) notFound();

  const { data: teaching } = await svc
    .from("teachings")
    .select("*, teaching_links(label,url,sort_order)")
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .single();
  if (!teaching) notFound();

  const [seriesOptions, media] = await Promise.all([
    svc.from("series").select("id,title,status").order("sort_order"),
    svc.from("media").select("path,alt").order("created_at", { ascending: false }),
  ]);

  const initial: TeachingInput = {
    id: teaching.id,
    title: teaching.title,
    slug: teaching.slug,
    series_id: teaching.series_id,
    part_number: teaching.part_number,
    date_taught: teaching.date_taught,
    speaker: teaching.speaker,
    summary: teaching.summary,
    body: teaching.body,
    cover_url: teaching.cover_url,
    cover_alt: teaching.cover_alt,
    scripture: teaching.scripture ?? [],
    youtube_url: teaching.youtube_url,
    audio_url: teaching.audio_url,
    pdf_url: teaching.pdf_url,
    links: ((teaching.teaching_links ?? []) as { label: string; url: string; sort_order: number }[])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((l: { label: string; url: string }) => ({ label: l.label, url: l.url })),
    tags: teaching.tags ?? [],
    featured: teaching.featured,
    status: teaching.status,
    publish_at: teaching.publish_at,
    seo_title: teaching.seo_title,
    seo_description: teaching.seo_description,
    share_image_url: teaching.share_image_url,
  };

  return (
    <TeachingEditor
      initial={initial}
      seriesOptions={seriesOptions.data ?? []}
      media={media.data ?? []}
    />
  );
}
