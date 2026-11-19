import { requireStaff } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ actor?: string; entity?: string; q?: string }>;
}) {
  await requireStaff("moderator");
  const sp = await searchParams;
  const svc = await getAdminClient();
  let rows: { id: number; actor_email: string; action: string; entity: string; entity_id: string | null; detail: Record<string, unknown>; created_at: string }[] = [];
  if (svc) {
    let q = svc.from("audit_log").select("*").order("created_at", { ascending: false }).limit(200);
    if (sp.entity) q = q.ilike("entity", `%${sp.entity}%`);
    if (sp.q) q = q.or(`action.ilike.%${sp.q}%,actor_email.ilike.%${sp.q}%,entity.ilike.%${sp.q}%`);
    const { data } = await q;
    rows = data ?? [];
  }
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-1 font-display text-title">Audit log</h1>
      <p className="mb-4 text-xs opacity-60">
        Who did what and when: creations, edits, publishes, deletions, exports
        and privacy erasures. Entries cannot be edited or removed.
      </p>
      <form className="admin-surface mb-3 flex flex-wrap items-end gap-2 p-3" method="get">
        <div className="flex-1 min-w-40">
          <label className="admin-label">Search</label>
          <input name="q" defaultValue={sp.q ?? ""} placeholder="action, person, area…" className="admin-input" />
        </div>
        <div>
          <label className="admin-label">Area</label>
          <input name="entity" defaultValue={sp.entity ?? ""} placeholder="e.g. submissions" className="admin-input" />
        </div>
        <button className="admin-btn admin-btn-gold">Filter</button>
      </form>
      <div className="admin-surface overflow-x-auto">
        <table data-stack className="admin-table min-w-[640px]">
          <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Area</th><th>Details</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="admin-row align-top">
                <td data-label="When" className="whitespace-nowrap text-xs tabular-nums opacity-70">{new Date(r.created_at).toLocaleString("en-GB")}</td>
                <td data-label="Who" className="text-xs">{r.actor_email ?? "system"}</td>
                <td data-label="Action"><span>{r.action}</span></td>
                <td data-label="Area" className="text-xs opacity-80">{r.entity}{r.entity_id ? ` · ${r.entity_id.slice(0, 8)}` : ""}</td>
                <td data-label="Details" className="max-w-72 break-all text-[0.7rem] opacity-60">{JSON.stringify(r.detail)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-center text-sm opacity-60">No entries yet.</p>}
      </div>
    </div>
  );
}
