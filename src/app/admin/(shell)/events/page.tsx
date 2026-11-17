import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { requireStaff } from "@/lib/admin";
import { getServiceClient, supabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  await requireStaff("admin");
  const svc = getServiceClient();
  let rows: {
    id: string; title: string; slug: string; status: string;
    starts_at: string; format: string; registration_required: boolean;
  }[] = [];
  if (svc && supabaseConfigured()) {
    const { data } = await svc.from("events").select("id,title,slug,status,starts_at,format,registration_required").order("starts_at", { ascending: false });
    rows = data ?? [];
  }
  const past = new Date().toISOString();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Events</h1>
          <p className="text-xs opacity-60">
            Conferences, anniversary services and special gatherings. Past events
            move to the archive automatically.
          </p>
        </div>
        <Link href="/admin/events/new" className="admin-btn admin-btn-gold">
          <PlusCircle size={13} /> New event
        </Link>
      </div>
      {!supabaseConfigured() ? (
        <div className="admin-surface p-6 text-sm opacity-70">Connect Supabase to manage events (see README).</div>
      ) : (
        <div className="admin-surface overflow-x-auto">
          <table className="admin-table min-w-[560px]">
            <thead>
              <tr>
                <th>Title</th><th>Status</th><th>When (WAT)</th><th>Format</th><th>Registration</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="admin-row hover:bg-parchment/5">
                  <td>
                    <Link href={`/admin/events/${e.slug}`} className="hover:text-gold-soft">
                      {e.title}
                    </Link>
                  </td>
                  <td>
                    <span className={`admin-badge ${e.status === "published" ? "admin-badge-ok" : e.status === "cancelled" ? "admin-badge-bad" : ""}`}>
                      {e.status}{e.starts_at < past && e.status === "published" ? " (past)" : ""}
                    </span>
                  </td>
                  <td className="text-xs whitespace-nowrap opacity-70">
                    {new Date(e.starts_at).toLocaleString("en-GB", { timeZone: "Africa/Lagos", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="text-xs opacity-70">{e.format}</td>
                  <td className="text-xs opacity-70">{e.registration_required ? "Required" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="p-6 text-center text-sm opacity-60">No events yet.</p>}
        </div>
      )}
    </div>
  );
}
