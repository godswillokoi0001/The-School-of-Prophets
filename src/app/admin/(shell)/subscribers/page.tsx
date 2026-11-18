import { requireStaff } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Mail, Users } from "lucide-react";
import { SubscribersTable } from "@/components/admin/SubscribersTable";

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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl">Subscriber List</h1>
          <p className="text-xs opacity-60">
            People who signed up from the site form. Anyone who unsubscribed is excluded from sends.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/broadcasts" className="admin-btn admin-btn-ghost">
            <Mail size={13} /> Newsletters & Broadcasts
          </Link>
          <Link href="/admin/subscribers" className="admin-btn admin-btn-gold">
            <Users size={13} /> Subscribers ({rows.length})
          </Link>
        </div>
      </div>
      <SubscribersTable rows={rows} />
    </div>
  );
}
