import { requireStaff } from "@/lib/admin";
import { getServiceClient, supabaseConfigured } from "@/lib/supabase/server";
import { EmailTemplateEditor } from "@/components/admin/EmailTemplateEditor";

export const dynamic = "force-dynamic";

export default async function EmailSettings() {
  await requireStaff("admin");
  const svc = getServiceClient();
  const templates = svc && supabaseConfigured()
    ? (await svc.from("email_templates").select("key,label,subject,body").order("key")).data ?? []
    : [];
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 font-display text-2xl">Email templates</h1>
      <p className="mb-4 text-xs opacity-60">
        The automatic emails the ministry sends: confirmations, acceptance,
        decline, waitlist-open, reminders and cancellation. Test before saving
        changes.
      </p>
      {templates.length === 0 ? (
        <div className="admin-surface p-6 text-sm opacity-70">Connect Supabase to edit templates (see README).</div>
      ) : (
        <EmailTemplateEditor templates={templates} />
      )}
    </div>
  );
}
