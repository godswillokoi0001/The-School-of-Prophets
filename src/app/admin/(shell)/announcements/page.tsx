import { requireStaff } from "@/lib/admin";
import { getSetting } from "@/lib/data";
import { SettingsEditor } from "@/components/admin/SettingsEditor";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  await requireStaff("admin");
  const initial = await getSetting("announcement", {
    active: false,
    headline: "",
    message: "",
    link: "",
    buttonText: "",
    variant: "default",
  });
  return (
    <SettingsEditor
      settingKey="announcement"
      title="Announcement pop-up modal & notice"
      description="Pops up when visitors arrive on the site with your message, a direct link/form button, and a button to close and continue browsing."
      initial={initial}
      backHref="/admin/settings"
      backLabel="Back to settings"
      fields={[
        { key: "active", label: "Show announcement pop-up on site visit", type: "toggle", hint: "When enabled, visitors will see this modal pop up when they visit the site." },
        { key: "headline", label: "Headline / Title", type: "text", placeholder: "e.g. Special Prophetic Convergence / Admissions Open" },
        { key: "message", label: "Announcement message", type: "textarea", hint: "Details of the notice, gathering, or update." },
        { key: "link", label: "Redirect / Form Link (optional)", type: "text", placeholder: "e.g. /training, /contact, or https://…" },
        { key: "buttonText", label: "Action button label", type: "text", placeholder: "e.g. Open Application Form / Learn More" },
        {
          key: "variant",
          label: "Style priority",
          type: "select",
          options: [
            { value: "default", label: "Standard Announcement" },
            { value: "emergency", label: "High Priority / Important Notice" },
          ],
        },
      ]}
    />
  );
}
