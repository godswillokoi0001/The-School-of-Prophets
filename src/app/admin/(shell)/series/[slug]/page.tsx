import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase/server";
import { SeriesEditor } from "@/components/admin/SeriesAdmin";

export const dynamic = "force-dynamic";

export default async function EditSeriesPage({
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
    ? svc.from("series").select("*").eq("id", slug).maybeSingle()
    : svc.from("series").select("*").eq("slug", slug).maybeSingle());
  if (!data) notFound();
  return <SeriesEditor initial={data} />;
}
