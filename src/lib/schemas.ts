import { z } from "zod";

const name = z.string().trim().min(2, "Please give your name.").max(80);
const optionalName = z
  .string()
  .trim()
  .max(80)
  .optional()
  .transform((v) => (v ? v : undefined));
const email = z.string().trim().email("Use a valid email address.").max(160);
const message = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `Please write at least ${min} characters for your ${label}.`)
    .max(max, "This is longer than we can accept. Please shorten it.");

export const contactSchema = z.object({
  name,
  email,
  message: message(10, 3000, "message"),
});

export const prayerSchema = z.object({
  name: optionalName,
  request: message(10, 3000, "request"),
  isPrivate: z.boolean().default(false),
  whatsapp: z.string().trim().max(40).optional(),
});

export const testimonySchema = z.object({
  name: z.string().trim().max(80).optional(),
  body: message(40, 4000, "testimony"),
  consent: z
    .boolean()
    .refine((v) => v, "We can only publish a testimony with your consent."),
  email: z.string().trim().max(160).optional(),
});

export const enrolmentSchema = z.object({
  fullName: name,
  email,
  whatsapp: z.string().trim().min(7, "A WhatsApp number we can reach you on.").max(40),
  country: z.string().trim().min(2, "Please tell us your country.").max(80),
  church: z.string().trim().min(2, "Please name your church or denomination.").max(160),
  inMinistry: z.enum(["yes", "no", "preparing"]),
  reason: message(20, 3000, "answer"),
  heardVia: z.string().trim().max(120).optional(),
});

export const newsletterSchema = z.object({
  email,
  name: optionalName,
});

export const registrationSchema = z.object({
  name,
  email,
  guests: z.coerce.number().int().min(0).max(20).default(0),
  notes: z.string().trim().max(500).optional(),
  eventSlug: z.string().trim().max(120).optional(),
  eventTitle: z.string().trim().max(200).optional(),
});

/** Every public form carries a honeypot and a client timestamp. */
export const honeypotSchema = z.object({
  website: z.string().max(0, "Rejected.").optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type PrayerInput = z.infer<typeof prayerSchema>;
export type TestimonyInput = z.infer<typeof testimonySchema>;
export type EnrolmentInput = z.infer<typeof enrolmentSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;

export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
