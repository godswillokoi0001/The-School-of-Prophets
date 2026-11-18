"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { getAdminClient } from "@/lib/supabase/server";
import { audit, requireStaff } from "@/lib/admin";

export async function toggleEnrolment(): Promise<{ ok: boolean; status: "open" | "closed"; error?: string }> {
  try {
    const staff = await requireStaff("admin");
    const svc = await getAdminClient();
    if (!svc) return { ok: false, status: "closed", error: "No database connected" };

    const { data } = await svc
      .from("site_settings")
      .select("value")
      .eq("key", "enrolment")
      .maybeSingle();

    const current = (data?.value ?? { status: "closed" }) as Record<string, unknown>;
    const next: "open" | "closed" = current.status === "open" ? "closed" : "open";

    await svc.from("site_settings").upsert({
      key: "enrolment",
      value: { ...current, status: next },
      updated_by: staff.id,
    });

    audit(staff, "update", "site_settings.enrolment", "enrolment", {
      status: next,
    }).catch(() => {});

    revalidateTag("setting:enrolment");
    revalidatePath("/admin");
    revalidatePath("/training");
    revalidatePath("/");

    return { ok: true, status: next };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, status: "closed", error: msg };
  }
}
