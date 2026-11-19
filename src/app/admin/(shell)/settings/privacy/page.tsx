import { requireStaff } from "@/lib/admin";
import { PrivacyTools } from "@/components/admin/PrivacyTools";
import { AdminBack } from "@/components/admin/AdminBack";

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  await requireStaff("owner");
  return (
    <div className="mx-auto max-w-3xl">
      <AdminBack href="/admin/settings" label="Back to settings" />
      <h1 className="mb-1 font-display text-title">Privacy tools</h1>
      <p className="mb-4 text-xs opacity-60">
        NDPR / GDPR support: data access, export and erase requests, handled by
        the Owner only.
      </p>
      <PrivacyTools />
    </div>
  );
}
