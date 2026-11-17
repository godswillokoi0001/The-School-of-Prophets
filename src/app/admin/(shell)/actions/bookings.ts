"use server";

import { getServiceClient } from "@/lib/supabase/server";
import { audit, requireStaff } from "@/lib/admin";
import { sendTemplated } from "@/lib/notify";
import { availableSlots } from "@/lib/booking";

export async function bookingAction(id: string, action: string, reason: string, newStartsAt?: string) {
  const staff = await requireStaff("moderator");
  const svc = getServiceClient();
  if (!svc) return { ok: false, error: "No database" };
  const { data: booking } = await svc.from("bookings").select("*, call_types(name)").eq("id", id).single();
  if (!booking) return { ok: false, error: "Not found" };
  const email = booking.email as string;
  const name = String(booking.name);
  const when = new Date(booking.starts_at).toLocaleString("en-GB", { timeZone: "Africa/Lagos" });
  const link = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/book`;

  if (action === "confirm") {
    await svc.from("bookings").update({ status: "confirmed" }).eq("id", id);
    await sendTemplated("confirmation", email, { name, type: `call (${when})` });
  } else if (action === "cancel") {
    if (!reason.trim()) return { ok: false, error: "A reason is required so we can tell the person what happened." };
    await svc.from("bookings").update({ status: "cancelled", cancel_reason: reason }).eq("id", id);
    await sendTemplated("cancellation", email, { name, time: when, reason, link });
  } else if (action === "reschedule" && newStartsAt) {
    const slots = await availableSlots(newStartsAt.slice(0, 10), booking.call_type_id);
    if (!slots.find((s) => s.startsAt === newStartsAt))
      return { ok: false, error: "That new time is not available." };
    await svc.from("bookings").update({ starts_at: newStartsAt, status: "confirmed" }).eq("id", id);
    await sendTemplated("confirmation", email, { name, type: `rescheduled call (${when} → ${newStartsAt})` });
  } else if (action === "completed") {
    await svc.from("bookings").update({ status: "completed" }).eq("id", id);
  } else if (action === "no_show") {
    await svc.from("bookings").update({ status: "no_show" }).eq("id", id);
  } else if (action === "notes") {
    await svc.from("bookings").update({ admin_notes: reason }).eq("id", id);
  }
  await audit(staff, action, "bookings", id, { reason });
  return { ok: true };
}
