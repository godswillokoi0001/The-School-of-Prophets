import { fieldErrors, honeypotSchema, prayerSchema } from "@/lib/schemas";
import { clientKey, deliver, json, rateLimit } from "@/lib/forms";

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request));
  if (!limit.ok) {
    return json(
      { ok: false, message: "Please wait a little before sending another request." },
      429,
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, message: "We could not read that request." }, 400);
  }

  const trap = honeypotSchema.safeParse(payload);
  if (!trap.success) return json({ ok: true });

  const parsed = prayerSchema.safeParse(payload);
  if (!parsed.success) {
    return json(
      {
        ok: false,
        message: "Please check the fields marked below.",
        errors: fieldErrors(parsed.error),
      },
      422,
    );
  }

  const { isPrivate, name, request: text, whatsapp } = parsed.data;

  await deliver({
    kind: "prayer",
    subject: `Prayer request${isPrivate ? " (private)" : ""} · ${name ?? "Anonymous"}`,
    private: isPrivate,
    fields: {
      Name: name ?? "Not given",
      Request: text,
      Private: isPrivate ? "Yes — prayer team only" : "No preference",
      WhatsApp: whatsapp,
    },
  });

  return json({ ok: true });
}
