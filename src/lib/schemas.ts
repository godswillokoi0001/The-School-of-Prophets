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
  phone: z.string().trim().max(40).optional(),
  whatsapp: z.string().trim().max(40).optional(),
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
  whatsapp: z.string().trim().max(40).optional(),
  country: z.string().trim().min(2, "Please tell us your country.").max(80),
  church: z.string().trim().min(2, "Please name your church or denomination.").max(160),
  inMinistry: z.enum(["yes", "no", "preparing"]),
  reason: message(20, 3000, "answer"),
  heardVia: z.string().trim().max(120).optional(),
});

export const newsletterSchema = z.object({
  email,
  firstName: z.string().trim().min(1, "First name is required.").max(60),
  lastName: z.string().trim().min(1, "Last name is required.").max(60),
  name: optionalName,
  phone: z.string().trim().max(40).optional(),
  whatsapp: z.string().trim().max(40).optional(),
});

export const registrationSchema = z.object({
  name,
  email,
  phone: z.string().trim().max(40).optional(),
  whatsapp: z.string().trim().max(40).optional(),
  guests: z.coerce.number().int().min(0).max(20).default(0),
  notes: z.string().trim().max(500).optional(),
  eventSlug: z.string().trim().max(120).optional(),
  eventTitle: z.string().trim().max(200).optional(),
});

/* ------------------------------------------------------------------
   Beta tester feedback. Long free text, a custom rating scale, and up to
   five issues with screenshots sent as data URLs (stripped server-side).
   ------------------------------------------------------------------ */

const stripTags = (value: string) =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const betaText = (max: number, min = 0, minMessage?: string) => {
  const base = z
    .string()
    .max(max, "This is longer than we can accept. Please shorten it.");
  return (min > 0 ? base.min(min, minMessage) : base).transform(stripTags);
};

const betaLine = (max: number) =>
  z
    .string()
    .max(max)
    .transform((v) => stripTags(v).replace(/\s+/g, " "));

const rating = z.coerce.number().int().min(1, "Choose a rating from 1 to 5.").max(5);

const betaIssueSchema = z.object({
  page: betaLine(60).default("Other"),
  description: betaText(2000).default(""),
  severity: z.enum(["Small annoyance", "Hard to use", "Something broke"]).default("Small annoyance"),
  screenshots: z.array(z.string().max(7_500_000)).max(3).default([]),
});

export const betaFeedbackSchema = z
  .object({
    name: z.string().trim().min(2, "Please tell us your name so we can thank you.").max(80),
    email: z.string().trim().email("Please add your email so we can say thank you.").max(160),
    whatsapp: betaLine(40).optional(),
    location: betaLine(120).optional(),
    device: z.enum(["Phone", "Tablet", "Computer", "More than one"]).optional(),
    overall_rating: rating,
    area_ratings: z
      .object({
        design: rating.optional(),
        ease: rating.optional(),
        speed: rating.optional(),
        content: rating.optional(),
        mobile: rating.optional(),
      })
      .partial()
      .default({}),
    liked: betaText(1200).optional(),
    take: betaText(2000, 10, "A sentence or two is enough — just tell us how it felt."),
    issues: z.array(betaIssueSchema).max(5).default([]),
    improve: betaText(2000, 1, "Tell us one thing we could do better."),
    wish: betaText(1200).optional(),
    story: betaText(1500).optional(),
    story_consent: z
      .enum(["public_named", "public_anonymous", "private"])
      .default("private"),
    display_name: betaLine(80).optional(),
    may_contact: z.boolean().default(true),
    wants_call: z.boolean().default(false),
    meta: z
      .object({
        browser: betaLine(120).optional(),
        os: betaLine(120).optional(),
        screen: betaLine(40).optional(),
        referrer: betaLine(300).optional(),
        timestamp: betaLine(40).optional(),
      })
      .default({}),
    isSample: z.boolean().optional(),
    sample_label: betaLine(40).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.take.trim().length < 10) {
      ctx.addIssue({
        code: "custom",
        path: ["take"],
        message: "A sentence or two is enough — just tell us how it felt.",
      });
    }
    if (!value.improve.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["improve"],
        message: "Tell us one thing we could do better.",
      });
    }
    if (value.story && value.story.length > 0 && !value.story_consent) {
      ctx.addIssue({
        code: "custom",
        path: ["story_consent"],
        message: "Please choose what we may do with your story.",
      });
    }
    value.issues.forEach((issue, index) => {
      if (value.issues.length > 0 && !issue.description.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["issues", index, "description"],
          message: "A line about what happened is enough.",
        });
      }
    });
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
export type BetaFeedbackInput = z.infer<typeof betaFeedbackSchema>;

export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
