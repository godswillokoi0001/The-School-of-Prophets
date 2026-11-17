import { requireStaff } from "@/lib/admin";
import { getSetting } from "@/lib/data";
import { SettingsEditor } from "@/components/admin/SettingsEditor";

export const dynamic = "force-dynamic";

export default async function ContactSettings() {
  await requireStaff("admin");
  const initial = await getSetting("contact", {
    whatsapp: "",
    telegram: "",
    facebookPage: "",
    facebookGroup: "",
    youtube: "",
    email: "",
    phone: "",
    address: "",
  });
  return (
    <SettingsEditor
      settingKey="contact"
      title="Contact & social links"
      description="Paste the current invite links; they update the site instantly without a developer."
      initial={initial}
      fields={[
        { key: "whatsapp", label: "WhatsApp invite link", type: "text", placeholder: "https://chat.whatsapp.com/…" },
        { key: "telegram", label: "Telegram invite link", type: "text", placeholder: "https://t.me/…" },
        { key: "facebookPage", label: "Facebook page", type: "text" },
        { key: "facebookGroup", label: "Facebook group", type: "text" },
        { key: "youtube", label: "YouTube channel", type: "text" },
        { key: "email", label: "Public email address", type: "text" },
        { key: "phone", label: "Phone number", type: "text" },
        { key: "address", label: "Address", type: "text" },
      ]}
    />
  );
}
