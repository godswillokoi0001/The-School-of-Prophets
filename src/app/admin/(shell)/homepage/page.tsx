import { requireStaff } from "@/lib/admin";
import { getSetting } from "@/lib/data";
import { SettingsEditor } from "@/components/admin/SettingsEditor";
import { getAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function optionsFor(key: "teachings" | "events") {
  const svc = await getAdminClient();
  if (!svc) return [{ value: "", label: "None" }];
  const { data } = await svc
    .from(key)
    .select(key === "teachings" ? "title,slug" : "title,slug")
    .eq(key === "teachings" ? "status" : "status", "published");
  return [
    { value: "", label: "Choose automatically" },
    ...(data ?? []).map((r) => ({ value: r.slug, label: r.title })),
  ];
}

export default async function HomepageSettings() {
  await requireStaff("admin");
  const initial = await getSetting("homepage", {
    heroText: "",
    heroImageUrl: "",
    featuredTeachingSlug: "",
    featuredSeriesSlug: "",
    featuredEventSlug: "",
    showSchedule: true,
    showTeachings: true,
    showEvents: true,
    showGiving: true,
    showTestimonies: true,
  });
  const [teachings, events] = await Promise.all([optionsFor("teachings"), optionsFor("events")]);

  return (
    <SettingsEditor
      settingKey="homepage"
      title="Homepage"
      description="Choose what visitors see first: the hero, the featured teaching and event, and which sections appear."
      initial={initial}
      fields={[
        { key: "heroText", label: "Hero text (optional override)", type: "textarea", hint: "Leave empty to keep the default." },
        { key: "heroImageUrl", label: "Hero image", type: "image" },
        { key: "featuredTeachingSlug", label: "Featured teaching", type: "select", options: teachings },
        { key: "featuredEventSlug", label: "Featured event", type: "select", options: events },
        { key: "showSchedule", label: "Show weekly schedule section", type: "toggle" },
        { key: "showTeachings", label: "Show teachings section", type: "toggle" },
        { key: "showEvents", label: "Show events section", type: "toggle" },
        { key: "showGiving", label: "Show giving section", type: "toggle" },
        { key: "showTestimonies", label: "Show testimonies section", type: "toggle" },
      ]}
    />
  );
}
