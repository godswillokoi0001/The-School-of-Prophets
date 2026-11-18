import { AdminShell } from "@/components/admin/AdminShell";
import { requireStaff } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase/server";
import type { NotificationItem } from "@/components/admin/NotificationBell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};

async function getDashboardData(role: string) {
  const svc = await getAdminClient();
  if (!svc) return { inbox: 0, testimony: 0, notifications: [] as NotificationItem[] };

  let inboxQuery = svc
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("status", "new")
    .is("deleted_at", null);

  let recentQuery = svc
    .from("submissions")
    .select("id,type,payload,status,created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(12);

  // Training form is for only owner
  if (role !== "owner") {
    inboxQuery = inboxQuery.neq("type", "enrolment");
    recentQuery = recentQuery.neq("type", "enrolment");
  }

  const [inboxRes, testimonyRes, recentRes] = await Promise.all([
    inboxQuery,
    svc
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("type", "testimony")
      .in("status", ["new", "seen"])
      .is("deleted_at", null),
    recentQuery,
  ]);

  const labels: Record<string, string> = {
    beta_feedback: "Beta review",
    contact: "Message",
    prayer: "Prayer request",
    testimony: "Testimony",
  };
  const notifications: NotificationItem[] = (recentRes.data ?? []).map((row) => {
    const payload = (row.payload as Record<string, unknown>) ?? {};
    const name = String(payload.name ?? payload.fullName ?? "Someone");
    const type = String(row.type);
    const rating = Number(payload.overall_rating ?? 0);
    const subtitle = String(
      payload.take ?? payload.message ?? payload.prayerRequest ?? payload.notes ?? payload.email ?? "",
    );
    const label = labels[type] ?? type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ");

    return {
      id: row.id,
      type,
      title: `${type === "beta_feedback" && rating > 0 ? `${rating}/5 · ` : ""}${label} from ${name}`,
      subtitle: subtitle ? subtitle.slice(0, 80) : undefined,
      created_at: row.created_at,
      status: row.status,
    };
  });

  return {
    inbox: inboxRes.count ?? 0,
    testimony: testimonyRes.count ?? 0,
    notifications,
  };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await requireStaff();
  const data = await getDashboardData(staff.role);

  return (
    <AdminShell
      role={staff.role}
      email={staff.email}
      fullName={staff.fullName}
      unread={data.inbox}
      pendingTestimonies={data.testimony}
      notifications={data.notifications}
    >
      {children}
    </AdminShell>
  );
}
