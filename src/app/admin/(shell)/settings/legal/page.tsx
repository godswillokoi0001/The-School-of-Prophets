import { requireStaff } from "@/lib/admin";
import { getSetting } from "@/lib/data";
import { SettingsEditor } from "@/components/admin/SettingsEditor";

export const dynamic = "force-dynamic";

export default async function LegalSettings() {
  await requireStaff("admin");
  const initial = await getSetting("legal", { privacy: "", terms: "" });
  return (
    <SettingsEditor
      settingKey="legal"
      title="Privacy policy & terms"
      description="Plain text or simple HTML. Shown on /legal/privacy and /legal/terms and linked from every form."
      initial={initial}
      fields={[
        { key: "privacy", label: "Privacy policy", type: "textarea" },
        { key: "terms", label: "Terms of use", type: "textarea" },
      ]}
    />
  );
}
