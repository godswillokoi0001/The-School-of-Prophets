import { requireStaff } from "@/lib/admin";
import { getSetting } from "@/lib/data";
import { SettingsEditor } from "@/components/admin/SettingsEditor";

export const dynamic = "force-dynamic";

export default async function EnrolmentPage() {
  await requireStaff("admin");
  const initial = await getSetting("enrolment", {
    status: "closed",
    cohortName: "Next cohort",
    cohortNote: "",
    deadline: "",
    closedMessage: "",
    waitlistOn: true,
    feeText: "",
  });
  return (
    <SettingsEditor
      settingKey="enrolment"
      title="Enrolment"
      description="Controls the public Training page form: applications when open, waitlist when closed."
      initial={initial}
      backHref="/admin/settings"
      backLabel="Back to settings"
      fields={[
        {
          key: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "closed", label: "Closed (waitlist only)" },
            { value: "open", label: "Open (accepting applications)" },
          ],
        },
        { key: "cohortName", label: "Cohort name", type: "text", placeholder: "e.g. Cohort 6 — September intake" },
        { key: "deadline", label: "Application deadline (optional)", type: "date" },
        { key: "feeText", label: "Fee note", type: "textarea" },
        { key: "closedMessage", label: "Message shown while closed", type: "textarea" },
        { key: "waitlistOn", label: "Waitlist enabled", type: "toggle", hint: "While closed, visitors join a waitlist and are emailed first when enrolment opens." },
      ]}
    />
  );
}
