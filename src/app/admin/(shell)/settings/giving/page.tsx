import { requireStaff } from "@/lib/admin";
import { getSetting } from "@/lib/data";
import { SettingsEditor } from "@/components/admin/SettingsEditor";

export const dynamic = "force-dynamic";

export default async function GivingSettings() {
  await requireStaff("admin");
  const initial = await getSetting("giving", {
    bankName: "",
    accountName: "",
    accountNumber: "",
    currency: "NGN",
    sortCode: "",
    instructions: "",
    paystackEnabled: false,
    paystackLink: "",
  });
  return (
    <SettingsEditor
      settingKey="giving"
      title="Giving details"
      description="These appear on the public Give page. Every change is recorded in the audit log."
      initial={initial}
      backHref="/admin/settings"
      backLabel="Back to settings"
      fields={[
        { key: "bankName", label: "Bank name", type: "text", placeholder: "e.g. Guaranty Trust Bank" },
        { key: "accountName", label: "Account name", type: "text" },
        { key: "accountNumber", label: "Account number", type: "text" },
        { key: "currency", label: "Currency (e.g. NGN, USD, GBP)", type: "text", placeholder: "NGN" },
        { key: "sortCode", label: "Sort code (optional)", type: "text", placeholder: "e.g. 058" },
        { key: "instructions", label: "Introductory message / instructions to givers", type: "textarea" },
        { key: "paystackEnabled", label: "Show Paystack link", type: "toggle" },
        { key: "paystackLink", label: "Paystack checkout link", type: "text", placeholder: "https://paystack.shop/pay/…" },
      ]}
    />
  );
}
