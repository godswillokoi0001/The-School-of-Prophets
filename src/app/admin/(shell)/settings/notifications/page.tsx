import { requireStaff } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase/server";
import { NotificationSettingsForm } from "@/components/admin/NotificationSettingsForm";
import { AdminBack } from "@/components/admin/AdminBack";

export const dynamic = "force-dynamic";

export default async function MyNotificationsPage() {
  const staff = await requireStaff("moderator");
  const svc = await getAdminClient();
  const initial = svc
    ? (await svc.from("notification_settings").select("*").eq("user_id", staff.id).maybeSingle()).data ?? {}
    : {};
  return (
    <div className="mx-auto max-w-3xl">
      <AdminBack href="/admin/settings" label="Back to settings" />
      <h1 className="mb-1 font-display text-2xl">My notifications</h1>
      <p className="mb-4 text-xs opacity-60">
        Choose what reaches you and how. Push notifications work even when the
        dashboard is closed, once you have allowed them in your browser
        (automatic on this device).
      </p>
      <NotificationSettingsForm userId={staff.id} initial={initial} />
    </div>
  );
}
