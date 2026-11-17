import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { requireStaff } from "@/lib/admin";
import { getServiceClient, supabaseConfigured } from "@/lib/supabase/server";
import { SeriesList, type SeriesRow } from "@/components/admin/SeriesAdmin";

export const dynamic = "force-dynamic";

export default async function SeriesPage() {
  await requireStaff("admin");
  const svc = getServiceClient();
  let rows: SeriesRow[] = [];
  if (svc && supabaseConfigured()) {
    const { data } = await svc
      .from("series")
      .select("id,title,slug,description,status,sort_order,featured,teachings(count)")
      .order("sort_order");
    rows = (data ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      description: s.description,
      status: s.status,
      sort_order: s.sort_order,
      featured: s.featured,
      teaching_count: s.teachings?.[0]?.count ?? 0,
    }));
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Series</h1>
          <p className="text-xs opacity-60">
            Order teachings into series such as “Faith Series” or “Word of
            Knowledge”. The order here is the order visitors see.
          </p>
        </div>
        <Link href="/admin/series/new" className="admin-btn admin-btn-gold">
          <PlusCircle size={13} /> New series
        </Link>
      </div>
      {!supabaseConfigured() ? (
        <div className="admin-surface p-6 text-sm opacity-70">Connect Supabase to manage series (see README).</div>
      ) : (
        <SeriesList initial={rows} />
      )}
    </div>
  );
}
