import { requireStaff } from "@/lib/admin";
import { getSetting } from "@/lib/data";
import { SettingsEditor } from "@/components/admin/SettingsEditor";
import { EnrolmentSwitch } from "@/components/admin/EnrolmentSwitch";

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
  const currentStatus = ((initial as { status?: string }).status === "open" ? "open" : "closed") as "open" | "closed";

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 admin-surface p-4 border border-parchment/15">
        <div>
          <h2 className="font-display text-base text-parchment">Enrolment switch</h2>
          <p className="admin-hint">
            Open takes applications; closed collects a waitlist. The change is live at once.
          </p>
        </div>
        <EnrolmentSwitch initialStatus={currentStatus} />
      </div>

      <SettingsEditor
        settingKey="enrolment"
        title="Enrolment details"
        description="Cohort name, deadline, fee note and the waitlist setting shown on the Training page."
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
    </div>
  );
}
