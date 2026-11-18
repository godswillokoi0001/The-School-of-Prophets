import { requireStaff } from "@/lib/admin";
import { betaAccepting, betaStats, getBetaRows } from "@/lib/beta-server";
import { BetaDashboard } from "@/components/admin/BetaDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Beta feedback",
  robots: { index: false, follow: false },
};

export default async function BetaPage() {
  await requireStaff("moderator");
  const [rows, open] = await Promise.all([getBetaRows(), betaAccepting()]);
  const stats = betaStats(rows);
  const sampleCount = rows.filter((row) => row.payload?.isSample).length;

  return (
    <BetaDashboard rows={rows} stats={stats} open={open} sampleCount={sampleCount} />
  );
}
