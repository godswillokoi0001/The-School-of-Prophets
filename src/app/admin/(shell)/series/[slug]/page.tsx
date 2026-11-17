import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin";
import { getServiceClient, supabaseConfigured } from "@/lib/supabase/server";
import { SeriesEditor } from "@/components/admin/SeriesAdmin";

export const dynamic = "force-dynamic";

export default async function EditSeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireStaff("admin");
  const { slug } = await params;
  const svc = getServiceClient();
  if (!svc || !supabaseConfigured()) notFound();
  const { data } = await svc.from("series").select("*").eq("slug", slug).single();
  if (!data) notFound();
  return <SeriesEditor initial={data} />;
}
