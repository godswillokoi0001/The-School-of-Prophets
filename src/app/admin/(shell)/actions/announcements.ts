"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminClient } from "@/lib/supabase/server";
import { requireStaff, audit } from "@/lib/admin";
import type { AnnouncementItem } from "@/lib/data";

export async function saveAnnouncementAction(input: {
  id?: string;
  headline: string;
  message: string;
  link?: string;
  buttonText?: string;
  variant: "default" | "emergency";
  active: boolean;
}) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "Database not connected" };

  const now = new Date().toISOString();

  // 1. Fetch current library
  const { data: current } = await svc
    .from("site_settings")
    .select("value")
    .eq("key", "announcements_library")
    .maybeSingle();

  let items: AnnouncementItem[] = Array.isArray((current?.value as { items?: AnnouncementItem[] })?.items)
    ? [...((current!.value as { items: AnnouncementItem[] }).items)]
    : [];

  // If empty, check legacy single setting to keep existing
  if (items.length === 0) {
    const { data: legacy } = await svc
      .from("site_settings")
      .select("value")
      .eq("key", "announcement")
      .maybeSingle();
    const legVal = legacy?.value as Record<string, unknown> | null;
    if (legVal && typeof legVal.message === "string" && legVal.message.trim()) {
      items.push({
        id: "ann-legacy-default",
        headline: String(legVal.headline || ""),
        message: String(legVal.message),
        link: String(legVal.link || ""),
        buttonText: String(legVal.buttonText || ""),
        variant: (legVal.variant === "emergency" ? "emergency" : "default") as "default" | "emergency",
        active: Boolean(legVal.active),
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  const cleanHeadline = input.headline?.trim() || "";
  const cleanMessage = input.message?.trim() || "";
  if (!cleanMessage) {
    return { ok: false, error: "Announcement message cannot be empty." };
  }

  const itemId = input.id || `ann_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const isNew = !input.id || !items.some((i) => i.id === input.id);

  // If activating this one, deactivate all others so only one is active at a time
  if (input.active) {
    items = items.map((i) => ({ ...i, active: false }));
  }

  if (isNew) {
    const newItem: AnnouncementItem = {
      id: itemId,
      headline: cleanHeadline,
      message: cleanMessage,
      link: input.link?.trim() || "",
      buttonText: input.buttonText?.trim() || "",
      variant: input.variant || "default",
      active: input.active,
      createdAt: now,
      updatedAt: now,
    };
    items.unshift(newItem);
  } else {
    items = items.map((i) => {
      if (i.id === input.id) {
        return {
          ...i,
          headline: cleanHeadline,
          message: cleanMessage,
          link: input.link?.trim() || "",
          buttonText: input.buttonText?.trim() || "",
          variant: input.variant || "default",
          active: input.active,
          updatedAt: now,
        };
      }
      return i;
    });
  }

  // Find currently active item if any
  const activeItem = items.find((i) => i.active && i.message.trim());

  // Save library
  const { error: libErr } = await svc.from("site_settings").upsert({
    key: "announcements_library",
    value: { items },
    updated_by: staff.id,
    updated_at: now,
  });
  if (libErr) return { ok: false, error: libErr.message };

  // Sync active announcement for getAnnouncement()
  await svc.from("site_settings").upsert({
    key: "announcement",
    value: activeItem
      ? {
          id: activeItem.id,
          active: true,
          headline: activeItem.headline,
          message: activeItem.message,
          link: activeItem.link,
          buttonText: activeItem.buttonText,
          variant: activeItem.variant,
        }
      : {
          active: false,
          headline: "",
          message: "",
          link: "",
          buttonText: "",
          variant: "default",
        },
    updated_by: staff.id,
    updated_at: now,
  });

  await audit(staff, isNew ? "create-announcement" : "update-announcement", "site_settings.announcements", itemId, {
    headline: cleanHeadline,
    active: input.active,
  });

  revalidateTag("setting:announcements_library");
  revalidateTag("setting:announcement");
  revalidatePath("/admin/announcements");
  revalidatePath("/");

  return { ok: true, itemId, items };
}

export async function toggleAnnouncementActiveAction(id: string, active: boolean) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "Database not connected" };

  const now = new Date().toISOString();
  const { data: current } = await svc
    .from("site_settings")
    .select("value")
    .eq("key", "announcements_library")
    .maybeSingle();

  let items: AnnouncementItem[] = Array.isArray((current?.value as { items?: AnnouncementItem[] })?.items)
    ? [...((current!.value as { items: AnnouncementItem[] }).items)]
    : [];

  // If empty, seed from legacy
  if (items.length === 0) {
    const { data: legacy } = await svc
      .from("site_settings")
      .select("value")
      .eq("key", "announcement")
      .maybeSingle();
    const legVal = legacy?.value as Record<string, unknown> | null;
    if (legVal && typeof legVal.message === "string" && legVal.message.trim()) {
      items.push({
        id: "ann-legacy-default",
        headline: String(legVal.headline || ""),
        message: String(legVal.message),
        link: String(legVal.link || ""),
        buttonText: String(legVal.buttonText || ""),
        variant: (legVal.variant === "emergency" ? "emergency" : "default") as "default" | "emergency",
        active: Boolean(legVal.active),
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  // When activating an announcement, set all others to false
  items = items.map((i) => {
    if (i.id === id) {
      return { ...i, active, updatedAt: now };
    }
    return active ? { ...i, active: false } : i;
  });

  const activeItem = items.find((i) => i.active && i.message.trim());

  await svc.from("site_settings").upsert({
    key: "announcements_library",
    value: { items },
    updated_by: staff.id,
    updated_at: now,
  });

  await svc.from("site_settings").upsert({
    key: "announcement",
    value: activeItem
      ? {
          id: activeItem.id,
          active: true,
          headline: activeItem.headline,
          message: activeItem.message,
          link: activeItem.link,
          buttonText: activeItem.buttonText,
          variant: activeItem.variant,
        }
      : {
          active: false,
          headline: "",
          message: "",
          link: "",
          buttonText: "",
          variant: "default",
        },
    updated_by: staff.id,
    updated_at: now,
  });

  await audit(staff, active ? "activate-announcement" : "deactivate-announcement", "site_settings.announcements", id, { active });

  revalidateTag("setting:announcements_library");
  revalidateTag("setting:announcement");
  revalidatePath("/admin/announcements");
  revalidatePath("/");

  return { ok: true, items };
}

export async function deleteAnnouncementAction(id: string) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "Database not connected" };

  const now = new Date().toISOString();
  const { data: current } = await svc
    .from("site_settings")
    .select("value")
    .eq("key", "announcements_library")
    .maybeSingle();

  let items: AnnouncementItem[] = Array.isArray((current?.value as { items?: AnnouncementItem[] })?.items)
    ? [...((current!.value as { items: AnnouncementItem[] }).items)]
    : [];

  const target = items.find((i) => i.id === id);
  items = items.filter((i) => i.id !== id);

  const activeItem = items.find((i) => i.active && i.message.trim());

  await svc.from("site_settings").upsert({
    key: "announcements_library",
    value: { items },
    updated_by: staff.id,
    updated_at: now,
  });

  if (target?.active || !activeItem) {
    await svc.from("site_settings").upsert({
      key: "announcement",
      value: activeItem
        ? {
            id: activeItem.id,
            active: true,
            headline: activeItem.headline,
            message: activeItem.message,
            link: activeItem.link,
            buttonText: activeItem.buttonText,
            variant: activeItem.variant,
          }
        : {
            active: false,
            headline: "",
            message: "",
            link: "",
            buttonText: "",
            variant: "default",
          },
      updated_by: staff.id,
      updated_at: now,
    });
  }

  await audit(staff, "delete-announcement", "site_settings.announcements", id, { headline: target?.headline });

  revalidateTag("setting:announcements_library");
  revalidateTag("setting:announcement");
  revalidatePath("/admin/announcements");
  revalidatePath("/");

  return { ok: true, items };
}

export async function duplicateAnnouncementAction(id: string) {
  const staff = await requireStaff("admin");
  const svc = await getAdminClient();
  if (!svc) return { ok: false, error: "Database not connected" };

  const now = new Date().toISOString();
  const { data: current } = await svc
    .from("site_settings")
    .select("value")
    .eq("key", "announcements_library")
    .maybeSingle();

  let items: AnnouncementItem[] = Array.isArray((current?.value as { items?: AnnouncementItem[] })?.items)
    ? [...((current!.value as { items: AnnouncementItem[] }).items)]
    : [];

  const source = items.find((i) => i.id === id);
  if (!source) return { ok: false, error: "Announcement not found" };

  const clone: AnnouncementItem = {
    ...source,
    id: `ann_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    headline: source.headline ? `${source.headline} (Copy)` : "Copied Announcement",
    active: false, // Copies start inactive
    createdAt: now,
    updatedAt: now,
  };

  items.unshift(clone);

  await svc.from("site_settings").upsert({
    key: "announcements_library",
    value: { items },
    updated_by: staff.id,
    updated_at: now,
  });

  await audit(staff, "duplicate-announcement", "site_settings.announcements", clone.id, { originalId: id });

  revalidateTag("setting:announcements_library");
  revalidatePath("/admin/announcements");

  return { ok: true, items, cloneId: clone.id };
}
