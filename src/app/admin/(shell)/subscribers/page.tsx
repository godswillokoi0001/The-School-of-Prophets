import { requireStaff } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  await requireStaff("admin");
  const svc = await getAdminClient();
  let rows: { id: string; email: string; name: string; consent_at: string; unsubscribed_at: string | null }[] = [];
  if (svc) {
    const { data } = await svc.from("subscribers").select("id,email,name,consent_at,unsubscribed_at").order("consent_at", { ascending: false });
    rows = data ?? [];
  }
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Subscribers</h1>
          <p className="text-xs opacity-60">
            People who signed up from the site form. Consent date is recorded;
            anyone who unsubscribed is excluded from sends.
          </p>
        </div>
        <Link href="/admin/broadcasts" className="admin-btn admin-btn-gold">
          <Mail size={13} /> Compose broadcast
        </Link>
      </div>
      <div className="admin-surface overflow-x-auto">
        <table className="admin-table min-w-[480px]">
          <thead><tr><th>Email</th><th>Name</th><th>Consent</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="admin-row">
                <td>{r.email}</td>
                <td className="opacity-70">{r.name || "—"}</td>
                <td className="text-xs opacity-70">{r.consent_at.slice(0, 10)}</td>
                <td>
                  <span className={`admin-badge ${r.unsubscribed_at ? "admin-badge-warn" : "admin-badge-ok"}`}>
                    {r.unsubscribed_at ? "Unsubscribed" : "Active"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-center text-sm opacity-60">No subscribers yet.</p>}
      </div>
    </div>
  );
}
