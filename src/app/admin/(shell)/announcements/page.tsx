import { requireStaff } from "@/lib/admin";
import { getAnnouncementsLibrary } from "@/lib/data";
import { AnnouncementsManager } from "@/components/admin/AnnouncementsManager";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  await requireStaff("admin");
  const items = await getAnnouncementsLibrary();

  return (
    <div className="mx-auto max-w-5xl">
      <AnnouncementsManager initial={items} />
    </div>
  );
}
