import { SettingsTabs } from "@/components/admin/SettingsTabs";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-3">
        <h1 className="font-display text-2xl">Settings</h1>
        <p className="admin-hint">
          Site details, giving, contacts, email wording and access. Every change is
          recorded in the audit log.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-[11rem_1fr] md:gap-6">
        <SettingsTabs />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
