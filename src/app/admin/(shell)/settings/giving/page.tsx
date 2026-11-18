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
    foreignBankName: "",
    foreignAccountName: "",
    foreignAccountNumber: "",
    foreignCurrency: "USD",
    foreignSwiftCode: "",
    foreignRoutingNumber: "",
    foreignNotes: "",
  });
  return (
    <SettingsEditor
      settingKey="giving"
      title="Giving & donation details"
      description="These appear on the public Give/Donate page. Manage Nigerian and international accounts separately."
      initial={initial}
      backHref="/admin/settings"
      backLabel="Back to settings"
      fields={[
        { key: "instructions", label: "Introductory message to givers", type: "textarea" },
        { key: "bankName", label: "Nigerian bank name", type: "text", placeholder: "e.g. Guaranty Trust Bank" },
        { key: "accountName", label: "Nigerian account name", type: "text" },
        { key: "accountNumber", label: "Nigerian account number", type: "text" },
        { key: "currency", label: "Nigerian currency", type: "text", placeholder: "NGN" },
        { key: "sortCode", label: "Nigerian sort code (optional)", type: "text", placeholder: "e.g. 058" },
        { key: "foreignBankName", label: "Foreign / Domiciliary bank name", type: "text", placeholder: "e.g. Guaranty Trust Bank (USD Dom) or Chase" },
        { key: "foreignAccountName", label: "Foreign account name", type: "text" },
        { key: "foreignAccountNumber", label: "Foreign account / IBAN number", type: "text" },
        { key: "foreignCurrency", label: "Foreign currency", type: "text", placeholder: "USD" },
        { key: "foreignSwiftCode", label: "SWIFT / BIC code", type: "text", placeholder: "e.g. GTBINGLA" },
        { key: "foreignRoutingNumber", label: "Routing / Sort code (optional)", type: "text" },
        { key: "foreignNotes", label: "Foreign transfer instructions", type: "textarea", placeholder: "e.g. For wire transfers, include reference..." },
        { key: "paystackEnabled", label: "Show Paystack card payment link", type: "toggle" },
        { key: "paystackLink", label: "Paystack checkout link", type: "text", placeholder: "https://paystack.shop/pay/…" },
      ]}
    />
  );
}
