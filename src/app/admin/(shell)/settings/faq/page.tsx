import { requireStaff } from "@/lib/admin";
import { getServiceClient, supabaseConfigured } from "@/lib/supabase/server";
import { ListEditor } from "@/components/admin/ListEditor";
import { saveFaqs, deleteFaq } from "@/app/admin/(shell)/actions/site-admin";

export const dynamic = "force-dynamic";

export default async function FaqSettings() {
  await requireStaff("admin");
  const svc = getServiceClient();
  const rows = svc && supabaseConfigured()
    ? (await svc.from("faqs").select("id,question,answer,sort_order,active").order("sort_order")).data ?? []
    : [];
  return (
    <ListEditor
      title="Frequently asked questions"
      description="Shown on the public site in the order listed here."
      rows={rows}
      saveAction={saveFaqs}
      deleteAction={deleteFaq}
      newRow={() => ({ id: "", question: "", answer: "", sort_order: rows.length + 1, active: true })}
      fields={[
        { key: "question", label: "Question", type: "text", width: "full" },
        { key: "answer", label: "Answer", type: "textarea", width: "full" },
        { key: "sort_order", label: "Order", type: "number", width: "small" },
        { key: "active", label: "Visible", type: "toggle", width: "small" },
      ]}
    />
  );
}
