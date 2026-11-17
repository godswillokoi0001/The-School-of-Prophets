import { contactSchema, fieldErrors, honeypotSchema } from "@/lib/schemas";
import { clientKey, deliver, json, rateLimit } from "@/lib/forms";

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request));
  if (!limit.ok) {
    return json(
      {
        ok: false,
        message: "That is a few messages in a short space of time. Please try again later.",
      },
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

  const parsed = contactSchema.safeParse(payload);
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

  await deliver({
    kind: "contact",
    subject: `Website contact · ${parsed.data.name}`,
    fields: {
      Name: parsed.data.name,
      Email: parsed.data.email,
      Message: parsed.data.message,
    },
  });

  return json({ ok: true });
}
