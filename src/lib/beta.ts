/**
 * Beta tester feedback: shared vocabulary.
 *
 * Kept free of server imports so the public form, the inbox and the summary
 * page all read from one list. Nothing here touches the database.
 */

export const BETA_TYPE = "beta_feedback";
export const BETA_SETTING_KEY = "beta_feedback";
export const BETA_BUCKET = "beta-screenshots";
export const BETA_SITE_URL = "https://the-school-of-prophets.vercel.app";
export const BETA_SHARE_URL = "https://theschoolofprophets.site/beta-testers";

export const DEVICES = ["Phone", "Tablet", "Computer", "More than one"] as const;

export const AREAS = [
  { key: "design", label: "Look and design" },
  { key: "ease", label: "Ease of use" },
  { key: "speed", label: "Speed" },
  { key: "content", label: "Content and teachings" },
  { key: "mobile", label: "Mobile experience" },
] as const;

export type AreaKey = (typeof AREAS)[number]["key"];

export const RATING_LABELS: Record<number, string> = {
  1: "Needs work",
  2: "Getting there",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

export const ISSUE_PAGES = [
  "Home",
  "About",
  "Weekly Gatherings",
  "Teachings",
  "Training/Enrolment",
  "Events",
  "Prayer",
  "Testimonies",
  "Book a Call",
  "Give",
  "Contact",
  "Other",
] as const;

export const SEVERITIES = ["Small annoyance", "Hard to use", "Something broke"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const CONSENT_OPTIONS = [
  {
    value: "public_named",
    label: "Yes, with my name",
    description: "We may publish it with the name you gave above.",
  },
  {
    value: "public_anonymous",
    label: "Yes, but keep me anonymous",
    description: "We may publish the words without naming you.",
  },
  {
    value: "private",
    label: "No, keep it private to the team",
    description: "It stays inside the fellowship and is never published.",
  },
] as const;

export type StoryConsent = (typeof CONSENT_OPTIONS)[number]["value"];

export const BETA_TAGS = ["bug", "design", "content", "feature request", "praise"] as const;

/** Workflow states for a beta review, on top of the shared submission states. */
export const BETA_STATUSES = [
  { value: "new", label: "New" },
  { value: "seen", label: "Seen" },
  { value: "triaged", label: "Triaged" },
  { value: "in_progress", label: "In progress" },
  { value: "fixed", label: "Fixed" },
  { value: "wont_fix", label: "Won't fix" },
  { value: "archived", label: "Archived" },
] as const;

export type BetaIssue = {
  page: string;
  description: string;
  severity: string;
  screenshots: string[];
};

export type BetaPayload = {
  name?: string;
  email?: string;
  whatsapp?: string;
  location?: string;
  device?: string;
  overall_rating?: number;
  area_ratings?: Partial<Record<AreaKey, number>>;
  liked?: string;
  take?: string;
  issues?: BetaIssue[];
  improve?: string;
  wish?: string;
  story?: string;
  story_consent?: StoryConsent;
  story_status?: "draft" | "approved";
  story_edit?: string;
  display_name?: string;
  may_contact?: boolean;
  wants_call?: boolean;
  meta?: {
    browser?: string;
    os?: string;
    screen?: string;
    referrer?: string;
    timestamp?: string;
    priority?: boolean;
    screenshot_errors?: number;
  };
  isSample?: boolean;
  sample_label?: string;
};

export function consentLabel(consent?: string) {
  switch (consent) {
    case "public_named":
      return "May publish · with name";
    case "public_anonymous":
      return "May publish · anonymous";
    case "private":
      return "Private to the team";
    default:
      return "No consent given";
  }
}

export function isHighPriority(payload: BetaPayload) {
  const rating = Number(payload.overall_rating ?? 0);
  const broke = (payload.issues ?? []).some((i) => i?.severity === "Something broke");
  return (rating > 0 && rating <= 2) || broke;
}

export function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function firstName(name?: string) {
  const clean = String(name ?? "").trim();
  if (!clean) return "friend";
  return clean.split(/\s+/)[0];
}

/** Short, human summary of a review used in the tester's confirmation email. */
export function summaryLines(payload: BetaPayload) {
  const rating = Number(payload.overall_rating ?? 0);
  const issues = payload.issues?.length ?? 0;
  const lines = [
    `Overall: ${rating > 0 ? `${rating}/5 — ${RATING_LABELS[rating]}` : "not rated"}`,
    `Your words: ${String(payload.take ?? "").slice(0, 240)}${String(payload.take ?? "").length > 240 ? "…" : ""}`,
    issues > 0 ? `Issues reported: ${issues}` : "Issues reported: none",
  ];
  if (payload.story) lines.push(`Story shared: yes (${consentLabel(payload.story_consent)})`);
  return lines;
}
