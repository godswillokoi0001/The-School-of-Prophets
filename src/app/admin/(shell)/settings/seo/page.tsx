import { requireStaff } from "@/lib/admin";
import { getSetting } from "@/lib/data";
import { SettingsEditor } from "@/components/admin/SettingsEditor";

export const dynamic = "force-dynamic";

export default async function SeoSettings() {
  await requireStaff("admin");
  const initial = await getSetting("seo", {
    title: "",
    description: "",
    shareImage: "",
    analytics: "",
  });
  return (
    <SettingsEditor
      settingKey="seo"
      title="SEO & analytics"
      description="Defaults used when a page does not set its own."
      initial={initial}
      fields={[
        { key: "title", label: "Default SEO title suffix", type: "text", placeholder: "The School of Prophets" },
        { key: "description", label: "Default description", type: "textarea" },
        { key: "shareImage", label: "Share image (social cards)", type: "image" },
        { key: "analytics", label: "Plausible domain", type: "text", hint: "Privacy-friendly analytics; leave empty for none." },
      ]}
    />
  );
}
