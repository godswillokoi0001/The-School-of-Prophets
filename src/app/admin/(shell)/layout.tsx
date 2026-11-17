import { AdminShell } from "@/components/admin/AdminShell";
import { requireStaff } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};

async function counts() {
  const svc = await getAdminClient();
  if (!svc) return { inbox: 0, testimony: 0 };
  const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
  const [inbox, testimony] = await Promise.all([
    svc
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("status", "new")
      .is("deleted_at", null),
    svc
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("type", "testimony")
      .in("status", ["new", "seen"])
      .is("deleted_at", null),
  ]);
  void weekAgo;
  return { inbox: inbox.count ?? 0, testimony: testimony.count ?? 0 };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await requireStaff();
  const c = await counts();
  return (
    <AdminShell
      role={staff.role}
      email={staff.email}
      fullName={staff.fullName}
      unread={c.inbox}
      pendingTestimonies={c.testimony}
    >
      {children}
    </AdminShell>
  );
}
