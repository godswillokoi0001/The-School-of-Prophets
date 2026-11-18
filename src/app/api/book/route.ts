import { NextResponse } from "next/server";
import { getServiceClient, supabaseConfigured } from "@/lib/supabase/server";
import { availableSlots, getBookingConfig } from "@/lib/booking";
import { clientKey, rateLimit } from "@/lib/forms";
import { notifySubmission, sendConfirmation, getFromAddress } from "@/lib/notify";
import { icsFor } from "@/lib/booking";
import crypto from "crypto";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? "";
  const callType = url.searchParams.get("callType") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return NextResponse.json({ error: "bad date" }, { status: 400 });
  const slots = await availableSlots(date, callType);
  const { callTypes } = await getBookingConfig();
  return NextResponse.json({ slots, callTypes }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request));
  if (!limit.ok)
    return NextResponse.json({ ok: false, message: "Please wait a little before booking again." }, { status: 429 });

  const body = await request.json().catch(() => ({}));
  const svc = getServiceClient();
  if (!svc || !supabaseConfigured())
    return NextResponse.json({ ok: false, message: "Booking is being set up. Please use the contact form meanwhile." }, { status: 400 });

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const whatsapp = String(body.whatsapp ?? "").trim();
  const topic = String(body.topic ?? "").trim();
  const notes = String(body.notes ?? "").trim();
  const callTypeId = String(body.callTypeId ?? "");
  const startsAt = String(body.startsAt ?? "");

  if (!name || name.length < 2)
    return NextResponse.json({ ok: false, message: "Please give your name.", errors: { name: "Please give your name." } }, { status: 422 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return NextResponse.json({ ok: false, message: "Please use a valid email address.", errors: { email: "Use a valid email address." } }, { status: 422 });
  if (whatsapp.length < 7)
    return NextResponse.json({ ok: false, message: "Please give a WhatsApp number we can reach you on.", errors: { whatsapp: "A reachable number is required." } }, { status: 422 });

  const { data: callType } = await svc.from("call_types").select("*").eq("id", callTypeId).eq("active", true).single();
  if (!callType)
    return NextResponse.json({ ok: false, message: "Please choose a call type." }, { status: 422 });

  const slots = await availableSlots(startsAt.slice(0, 10), callTypeId);
  const slot = slots.find((s) => s.startsAt === startsAt);
  if (!slot)
    return NextResponse.json({ ok: false, message: "That time is no longer available. Please pick another slot." }, { status: 409 });

  const endsAt = new Date(new Date(startsAt).getTime() + callType.duration_minutes * 60_000).toISOString();
  const status = callType.approval_required ? "pending" : "confirmed";

  const { data: booking, error } = await svc
    .from("bookings")
    .insert({ call_type_id: callTypeId, starts_at: startsAt, ends_at: endsAt, name, email, whatsapp, topic, notes, status })
    .select("id")
    .single();

  if (error) {
    if (error.message.includes("duplicate") || error.message.includes("conflict"))
      return NextResponse.json({ ok: false, message: "Someone just took that slot. Please choose another time." }, { status: 409 });
    return NextResponse.json({ ok: false, message: "Booking failed. Please try again." }, { status: 500 });
  }

  await notifySubmission({
    id: booking.id,
    type: "booking",
    payload: { name, email, whatsapp, topic, notes, callType: callType.name, when: startsAt },
    created_at: new Date().toISOString(),
  });
  await sendConfirmation({ id: booking.id, type: "booking", payload: { name, email }, created_at: new Date().toISOString() }, email);

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const token = crypto.createHash("sha256").update(`${booking.id}:${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`).digest("hex").slice(0, 24);
  const ics = icsFor(
    `TSOP ${callType.name} call`,
    `Your call with The School of Prophets. Cancel: ${site}/book/cancel?b=${booking.id}&t=${token}`,
    startsAt,
    endsAt,
    booking.id,
  );

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: getFromAddress(email),
          to: [email],
          subject: `Your call is booked: ${new Date(startsAt).toLocaleString("en-GB", { timeZone: "Africa/Lagos" })} (WAT)`,
          text: `Hello ${name},\n\nYour ${callType.name} call is booked for ${new Date(startsAt).toLocaleString("en-GB", { timeZone: "Africa/Lagos" })} WAT (shown in your timezone when you open the calendar file).\n\nCancel or reschedule: ${site}/book/cancel?b=${booking.id}&t=${token}\n\nThe School of Prophets`,
          attachments: [{ filename: "tsop-call.ics", content: Buffer.from(ics).toString("base64") }],
        }),
      });
    } catch {
      // email is best-effort; booking is stored either way
    }
  }

  return NextResponse.json({
    ok: true,
    id: booking.id,
    status,
    message:
      status === "pending"
        ? "Request received. We will confirm your call by email shortly."
        : "Your call is confirmed. Check your inbox for the details and calendar invite.",
  });
}
