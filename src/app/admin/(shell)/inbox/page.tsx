import Link from "next/link";
import { Download } from "lucide-react";
import { requireStaff } from "@/lib/admin";
import { getServiceClient, supabaseConfigured } from "@/lib/supabase/server";
import { InboxList, type SubmissionRow } from "@/components/admin/InboxUI";

export const dynamic = "force-dynamic";

const typeLabels: Record<string, string> = {
  all: "All forms", enrolment: "Applications", waitlist: "Waitlist",
  prayer: "Prayer", testimony: "Testimonies", contact: "Messages",
  registration: "Registrations", booking: "Bookings", newsletter: "Sign-ups",
};
const statuses = ["all", "new", "seen", "in_progress", "replied", "approved", "declined", "waitlist", "archived", "spam"];

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; q?: string; from?: string; to?: string }>;
}) {
  const staff = await requireStaff("moderator");
  const sp = await searchParams;
  const type = sp.type ?? "all";
  const status = sp.status ?? "all";
  const q = sp.q ?? "";
  const from = sp.from ?? "";
  const to = sp.to ?? "";
  const svc = getServiceClient();

  let rows: SubmissionRow[] = [];
  if (svc && supabaseConfigured()) {
    let query = svc
      .from("submissions")
      .select("id,type,status,private,payload,created_at,submission_notes(body,created_at)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(300);
    if (type !== "all") query = query.eq("type", type);
    if (status !== "all") query = query.eq("status", status);
    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to);
    const { data } = await query;
    const mapped: (SubmissionRow | null)[] = (data ?? []).map((r) => {
      const p = (r.payload ?? {}) as Record<string, unknown>;
      const haystack = `${p.name ?? ""} ${p.fullName ?? ""} ${p.email ?? ""} ${p.whatsapp ?? ""} ${JSON.stringify(p)}`.toLowerCase();
      if (q && !haystack.includes(q.toLowerCase())) return null;
      const row: SubmissionRow = {
        id: r.id,
        type: r.type,
        status: r.status,
        private: r.private,
        name: String(p.name ?? p.fullName ?? ""),
        email: String(p.email ?? ""),
        whatsapp: String(p.whatsapp ?? ""),
        created_at: r.created_at,
        payload: p,
        notes: r.submission_notes ?? [],
      };
      const prayed = Number(p.prayedFor ?? 0);
      if (prayed) row.prayedFor = prayed;
      return row;
    });
    rows = mapped.filter((r): r is SubmissionRow => r !== null);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Inbox</h1>
          <p className="text-xs opacity-60">
            Every form on the site lands here: applications, prayer requests,
            testimonies, messages, registrations and call bookings.
          </p>
        </div>
        <a
          className="admin-btn admin-btn-ghost"
          href={`/api/admin/inbox/export?type=${type === "all" ? "" : type}${from ? `&from=${from}` : ""}${to ? `&to=${to}` : ""}`}
        >
          <Download size={13} /> Export CSV
        </a>
      </div>

      <form className="admin-surface mb-3 flex flex-wrap items-end gap-2 p-3" method="get">
        <div className="min-w-40 flex-1">
          <label className="admin-label" htmlFor="f-type">Form</label>
          <select id="f-type" name="type" defaultValue={type} className="admin-select">
            {Object.entries(typeLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="min-w-40">
          <label className="admin-label" htmlFor="f-status">Status</label>
          <select id="f-status" name="status" defaultValue={status} className="admin-select">
            {statuses.map((s) => (
              <option key={s} value={s}>{s === "in_progress" ? "In progress" : s.replace("_", " ")}</option>
            ))}
          </select>
        </div>
        <div className="min-w-36 flex-1">
          <label className="admin-label" htmlFor="f-q">Search</label>
          <input id="f-q" name="q" defaultValue={q} placeholder="Name, email, phone, keywords…" className="admin-input" />
        </div>
        <div>
          <label className="admin-label" htmlFor="f-from">From</label>
          <input id="f-from" name="from" type="date" defaultValue={from} className="admin-input" />
        </div>
        <div>
          <label className="admin-label" htmlFor="f-to">To</label>
          <input id="f-to" name="to" type="date" defaultValue={to} className="admin-input" />
        </div>
        <button className="admin-btn admin-btn-gold">Apply</button>
        <Link href="/admin/inbox" className="admin-btn admin-btn-ghost">Reset</Link>
      </form>

      {!supabaseConfigured() ? (
        <div className="admin-surface p-6 text-sm opacity-70">
          Connect Supabase to start receiving submissions (see the README setup
          guide). The public forms already work; without a database they are
          logged to the server only.
        </div>
      ) : (
        <InboxList rows={rows} role={staff.role} />
      )}
    </div>
  );
}
