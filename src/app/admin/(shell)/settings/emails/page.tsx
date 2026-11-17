import { requireStaff } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase/server";
import { EmailTemplateEditor } from "@/components/admin/EmailTemplateEditor";
import { AdminBack } from "@/components/admin/AdminBack";

export const dynamic = "force-dynamic";

const defaultTemplates = [
  {
    key: "confirmation",
    label: "Submission confirmation",
    subject: "Thank you for reaching out — The School of Prophets",
    body: "Hello {{name}},\n\nThank you for reaching out to The School of Prophets. We have received your {{type}} and a member of the team will respond soon.\n\nBlessings,\nThe School of Prophets",
  },
  {
    key: "booking_confirmed",
    label: "Call confirmed",
    subject: "Your call is confirmed — The School of Prophets",
    body: "Hello {{name}},\n\nYour call has been confirmed for {{time}} (WAT).\n\nJoin link: {{link}}\n\nBlessings,\nThe School of Prophets",
  },
  {
    key: "booking_cancelled",
    label: "Call cancelled",
    subject: "Update regarding your booking — The School of Prophets",
    body: "Hello {{name}},\n\nYour call scheduled for {{time}} has been cancelled.\n\nReason: {{reason}}\n\nYou can book a new time here: {{link}}\n\nThe School of Prophets",
  },
  {
    key: "acceptance",
    label: "Enrolment accepted",
    subject: "Welcome to The School of Prophets — Application Accepted",
    body: "Hello {{name}},\n\nWe are joyful to inform you that your enrolment application has been accepted! Please check your portal for orientation details.\n\nThe School of Prophets",
  },
  {
    key: "decline",
    label: "Enrolment declined",
    subject: "Update regarding your application — The School of Prophets",
    body: "Hello {{name}},\n\nThank you for your interest in The School of Prophets. After prayerful review, we are unable to offer you a seat for this intake.\n\nGrace and peace,\nThe School of Prophets",
  },
  {
    key: "waitlist_open",
    label: "Waitlist notification",
    subject: "Applications are now open — The School of Prophets",
    body: "Hello {{name}},\n\nApplications have just opened for the upcoming intake! As you joined our waitlist, you have priority access:\n\n{{link}}\n\nThe School of Prophets",
  },
];

export default async function EmailSettings() {
  await requireStaff("admin");
  const svc = await getAdminClient();
  const dbTemplates = svc
    ? (await svc.from("email_templates").select("key,label,subject,body").order("key")).data ?? []
    : [];

  const templates = dbTemplates.length > 0 ? dbTemplates : defaultTemplates;

  return (
    <div className="mx-auto max-w-4xl">
      <AdminBack href="/admin/settings" label="Back to settings" />
      <h1 className="mb-1 font-display text-2xl">Email templates</h1>
      <p className="mb-4 text-xs opacity-60">
        The automatic emails the ministry sends: confirmations, acceptance,
        decline, waitlist-open, reminders and cancellation. Test before saving
        changes.
      </p>
      <EmailTemplateEditor templates={templates} />
    </div>
  );
}
