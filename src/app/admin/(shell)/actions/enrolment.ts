"use server";

import { revalidateTag } from "next/cache";
import { getAdminClient } from "@/lib/supabase/server";
import { audit, requireStaff } from "@/lib/admin";

export async function toggleEnrolment() {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return;
  const { data } = await svc.from("site_settings").select("value").eq("key", "enrolment").maybeSingle();
  const current = (data?.value ?? { status: "closed" }) as Record<string, unknown>;
  const next = current.status === "open" ? "closed" : "open";
  await svc.from("site_settings").upsert({
    key: "enrolment",
    value: { ...current, status: next },
    updated_by: staff.id,
  });
  await audit(staff, "update", "site_settings.enrolment", "enrolment", {
    status: next,
  });
  revalidateTag("setting:enrolment");
}
