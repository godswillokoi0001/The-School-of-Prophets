import { fieldErrors, honeypotSchema, enrolmentSchema } from "@/lib/schemas";
import { clientKey, deliver, json, rateLimit } from "@/lib/forms";
import { training } from "@/content/ministry";

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request));
  if (!limit.ok) {
    return json(
      { ok: false, message: "Please wait a little before sending another application." },
      429,
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, message: "We could not read that application." }, 400);
  }

  const trap = honeypotSchema.safeParse(payload);
  if (!trap.success) return json({ ok: true });

  const parsed = enrolmentSchema.safeParse(payload);
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

  const d = parsed.data;
  const isOpen = training.status === "open";

  await deliver({
    kind: "enrolment",
    subject: `${isOpen ? "Enrolment application" : "Waitlist request"} · ${d.fullName}`,
    fields: {
      Type: isOpen ? "Application (enrolment open)" : "Waitlist (enrolment closed)",
      Name: d.fullName,
      Email: d.email,
      WhatsApp: d.whatsapp,
      Country: d.country,
      Church: d.church,
      "In ministry": d.inMinistry,
      Reason: d.reason,
      "Heard via": d.heardVia,
    },
  });

  return json({ ok: true });
}
