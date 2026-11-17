import { requireStaff } from "@/lib/admin";
import { getAdminClient } from "@/lib/supabase/server";
import { ListEditor } from "@/components/admin/ListEditor";
import { saveTeam, deleteTeamMember } from "@/app/admin/(shell)/actions/site-admin";

export const dynamic = "force-dynamic";

export default async function TeamSettings() {
  await requireStaff("admin");
  const svc = await getAdminClient();
  const rows = svc
    ? (await svc.from("team_members").select("id,name,role_label,bio,photo_url,sort_order,visible").order("sort_order")).data ?? []
    : [];
  return (
    <ListEditor
      title="Leaders & team"
      description="People shown on the public site (when the section is enabled). Photos come from the media library."
      rows={rows}
      saveAction={saveTeam}
      deleteAction={deleteTeamMember}
      newRow={() => ({ id: "", name: "", role_label: "", bio: "", photo_url: "", sort_order: rows.length + 1, visible: true })}
      fields={[
        { key: "name", label: "Name", type: "text", width: "half" },
        { key: "role_label", label: "Role title", type: "text", width: "half" },
        { key: "photo_url", label: "Photo", type: "image", width: "full" },
        { key: "bio", label: "Short bio", type: "textarea", width: "full" },
        { key: "sort_order", label: "Order", type: "number", width: "small" },
        { key: "visible", label: "Show publicly", type: "toggle", width: "small" },
      ]}
    />
  );
}
