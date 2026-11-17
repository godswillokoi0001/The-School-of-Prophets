import { requireStaff } from "@/lib/admin";
import { SeriesEditor } from "@/components/admin/SeriesAdmin";

export const dynamic = "force-dynamic";

export default async function NewSeriesPage() {
  await requireStaff("admin");
  return (
    <SeriesEditor
      initial={{
        title: "",
        slug: "",
        description: "",
        cover_url: null,
        cover_alt: "",
        status: "draft",
        sort_order: 99,
        featured: false,
      }}
    />
  );
}
