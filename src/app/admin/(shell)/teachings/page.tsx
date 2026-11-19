import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { requireStaff } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase/server";
import { TeachingList, type TeachingRow } from "@/components/admin/TeachingList";

export const dynamic = "force-dynamic";

export default async function TeachingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireStaff("admin");
  const sp = await searchParams;
  const status = sp.status ?? "all";
  const q = sp.q ?? "";
  const svc = await getAdminClient();

  let rows: TeachingRow[] = [];
  let seriesOptions: { id: string; title: string }[] = [];

  if (svc) {
    const [teachingsRes, seriesRes] = await Promise.all([
      svc
        .from("teachings")
        .select("id,title,slug,status,date_taught,featured,series_id")
        .order("date_taught", { ascending: false }),
      svc.from("series").select("id,title").order("sort_order"),
    ]);

    const seriesMap = new Map((seriesRes.data ?? []).map((s) => [s.id, s.title]));
    seriesOptions = (seriesRes.data ?? []).map((s) => ({ id: s.id, title: s.title }));
    rows = (teachingsRes.data ?? [])
      .map((t) => ({
        id: t.id,
        title: t.title,
        slug: t.slug,
        status: t.status,
        series_title: seriesMap.get(t.series_id ?? "") ?? null,
        date_taught: t.date_taught,
        featured: t.featured,
      }))
      .filter((t) => status === "all" || t.status === status)
      .filter((t) => !q || t.title.toLowerCase().includes(q.toLowerCase()));
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Teachings</h1>
          <p className="text-xs opacity-60">
            Every teaching written here appears on the public Teachings page once
            published.
          </p>
        </div>
        <Link href="/admin/teachings/new" className="admin-btn admin-btn-gold">
          <PlusCircle size={13} /> New teaching
        </Link>
      </div>
      <form className="admin-surface mb-3 flex flex-wrap items-end gap-2 p-3" method="get">
        <div>
          <label className="admin-label">Status</label>
          <select name="status" defaultValue={status} className="admin-select">
            {["all", "published", "scheduled", "draft"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="admin-label">Search</label>
          <input name="q" defaultValue={q} placeholder="Search by title…" className="admin-input" />
        </div>
        <button className="admin-btn admin-btn-gold">Apply</button>
        <Link href="/admin/teachings" className="admin-btn admin-btn-ghost">Reset</Link>
      </form>

      <TeachingList rows={rows} seriesOptions={seriesOptions} />
    </div>
  );
}
