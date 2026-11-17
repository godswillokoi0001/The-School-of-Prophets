import { fieldErrors, honeypotSchema, testimonySchema } from "@/lib/schemas";
import { clientKey, deliver, json, rateLimit } from "@/lib/forms";

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request));
  if (!limit.ok) {
    return json(
      { ok: false, message: "Please wait a little before sending another testimony." },
      429,
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, message: "We could not read that submission." }, 400);
  }

  const trap = honeypotSchema.safeParse(payload);
  if (!trap.success) return json({ ok: true });

  const parsed = testimonySchema.safeParse(payload);
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
    kind: "testimony",
    subject: `Testimony for review · ${parsed.data.name || "Anonymous"}`,
    fields: {
      Name: parsed.data.name || "Anonymous",
      Email: parsed.data.email || "Not given",
      Testimony: parsed.data.body,
      Consent: "Given — checked the publish consent box",
      Status: "Held for admin approval. Do not publish without written consent on file.",
    },
  });

  return json({ ok: true });
}
