import { requireStaff } from "@/lib/admin";
import { getSetting } from "@/lib/data";
import { SettingsEditor } from "@/components/admin/SettingsEditor";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  await requireStaff("admin");
  const initial = await getSetting("announcement", {
    active: false,
    message: "",
    link: "",
    variant: "default",
  });
  return (
    <SettingsEditor
      settingKey="announcement"
      title="Announcement bar"
      description="A bar above every page: notices, links, or an emergency banner for cancellations."
      initial={initial}
      fields={[
        { key: "active", label: "Show the bar", type: "toggle" },
        { key: "message", label: "Message", type: "textarea", hint: "Keep it short; it appears on every page." },
        { key: "link", label: "Link (optional)", type: "text", placeholder: "https://…" },
        {
          key: "variant",
          label: "Style",
          type: "select",
          options: [
            { value: "default", label: "Default (quiet)" },
            { value: "emergency", label: "Emergency (attention, for cancellations)" },
          ],
        },
      ]}
    />
  );
}
