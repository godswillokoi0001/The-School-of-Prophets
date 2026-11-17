import { unstable_cache } from "next/cache";
import { getServiceClient, supabaseConfigured } from "@/lib/supabase/server";
import {
  sessions as seedSessions,
  type Session as SeedSession,
} from "@/content/schedule";
import { seriesList, teachings as seedTeachings, type Teaching as SeedTeaching, type Series as SeedSeries } from "@/content/teachings";
import { events as seedEvents, type EventItem as SeedEvent } from "@/content/events";
import { testimonies as seedTestimonies, type Testimony as SeedTestimony } from "@/content/testimonies";
import { faqs as seedFaq } from "@/content/faq";
import { giving as seedGiving, training as seedTraining } from "@/content/ministry";
import { site as seedSite } from "@/config/site";

export type DbSeries = {
  id: string; title: string; slug: string; description: string;
  cover_url: string | null; cover_alt: string; status: string;
  sort_order: number; featured: boolean;
};
export type DbTeaching = {
  id: string; title: string; slug: string; series_id: string | null;
  part_number: number | null; date_taught: string | null; speaker: string;
  summary: string; body: string; cover_url: string | null; cover_alt: string;
  scripture: string[]; youtube_url: string | null; audio_url: string | null;
  pdf_url: string | null; links: { label: string; url: string }[];
  tags: string[]; featured: boolean; status: string; publish_at: string | null;
  seo_title: string | null; seo_description: string | null;
  share_image_url: string | null; view_count: number;
};
export type DbEvent = {
  id: string; title: string; slug: string; description: string;
  starts_at: string; ends_at: string | null; timezone: string; format: string;
  location: string; join_url: string; cover_url: string | null; cover_alt: string;
  registration_required: boolean; capacity: number | null; status: string;
  recurrence: string | null; featured: boolean; recap: string;
};
export type DbSession = {
  id: string; day: number; title: string; type: string; start_time: string;
  end_time: string | null; description: string; join_url: string; active: boolean;
  sort_order: number;
};
export type DbFaq = { id: string; question: string; answer: string; sort_order: number; active: boolean };
export type DbTeamMember = { id: string; name: string; role_label: string; bio: string; photo_url: string | null; sort_order: number; visible: boolean };

function db() {
  return getServiceClient();
}

const cached = <T>(tag: string, fn: () => Promise<T>, fallback: T): Promise<T> => {
  if (!supabaseConfigured()) return Promise.resolve(fallback);
  return unstable_cache(fn, [tag], { revalidate: 60, tags: [tag] })();
};

export const revalidateTag = (tag: string) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("next/cache").revalidateTag(tag);
  } catch {
    // build phase: no-op
  }
};

/* ---------------- schedule ---------------- */

export async function getSchedule(): Promise<SeedSession[]> {
  return cached("schedule", async () => {
    const { data } = await db()!
      .from("schedule_sessions")
      .select("*")
      .eq("active", true)
      .order("sort_order");
    if (!data) return seedSessions;
    return data.map((s: DbSession) => ({
      id: s.id,
      day: s.day as SeedSession["day"],
      title: s.title,
      focus: s.description,
      start: s.start_time,
      end: s.end_time ?? undefined,
    }));
  }, seedSessions);
}

/* ---------------- series / teachings ---------------- */

export async function getSeries(): Promise<SeedSeries[]> {
  return cached("series", async () => {
    const { data } = await db()!.from("series").select("*").eq("status", "published").order("sort_order");
    if (!data) return seriesList;
    return data.map((s: DbSeries) => ({ slug: s.slug, title: s.title, blurb: s.description }));
  }, seriesList);
}

export async function getTeachings(): Promise<SeedTeaching[]> {
  return cached("teachings", async () => {
    const { data } = await db()!
      .from("teachings")
      .select("*")
      .eq("status", "published")
      .order("date_taught", { ascending: false });
    if (!data) return seedTeachings;
    const series = await db()!.from("series").select("id,slug").eq("status", "published");
    const map = new Map((series.data ?? []).map((s) => [s.id, s.slug]));
    return data.map((t: DbTeaching) => ({
      slug: t.slug,
      title: t.title,
      series: t.series_id ? (map.get(t.series_id) ?? "") : "",
      topics: t.tags,
      format: ["notes"],
      date: t.date_taught ?? t.publish_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      scripture: t.scripture.join(", "),
      summary: t.summary,
      youtubeId: t.youtube_url ? extractYouTubeId(t.youtube_url) : null,
      image: t.cover_url ?? "",
      imageAlt: t.cover_alt,
      audioUrl: t.audio_url ?? undefined,
      notes: [],
      body: t.body,
      isSample: false,
    })) as SeedTeaching[];
  }, seedTeachings);
}

export async function getTeaching(slug: string): Promise<SeedTeaching | undefined> {
  const all = await getTeachings();
  return all.find((t) => t.slug === slug);
}

export function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : url.length === 11 ? url : null;
}

/* ---------------- events ---------------- */

export async function getEvents(): Promise<SeedEvent[]> {
  return cached("events", async () => {
    const { data } = await db()!.from("events").select("*").eq("status", "published").order("starts_at");
    if (!data) return seedEvents;
    return data.map((e: DbEvent) => ({
      slug: e.slug,
      title: e.title,
      kind: new Date(e.starts_at) < new Date() ? ("past" as const) : ("upcoming" as const),
      date: e.starts_at.slice(0, 10),
      time: e.starts_at.slice(11, 16) || undefined,
      endTime: e.ends_at?.slice(11, 16) || undefined,
      location: e.location || "Online",
      summary: e.description,
      detail: [],
      image: e.cover_url ?? "",
      imageAlt: e.cover_alt,
      isSample: false,
      registrationRequired: e.registration_required,
      eventId: e.id,
    })) as unknown as SeedEvent[];
  }, seedEvents);
}

/* ---------------- testimonies ---------------- */

export async function getTestimonies(): Promise<SeedTestimony[]> {
  return cached("testimonies", async () => {
    const { data } = await db()!
      .from("submissions")
      .select("id,payload,created_at")
      .eq("type", "testimony")
      .eq("status", "approved")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (!data) return seedTestimonies;
    return data.map((s) => {
      const p = s.payload as Record<string, string>;
      return {
        id: s.id,
        name: p.name ?? "Anonymous",
        location: p.location || undefined,
        date: s.created_at.slice(0, 10),
        body: p.testimony ?? "",
        isSample: false,
      };
    });
  }, seedTestimonies);
}

/* ---------------- faq / team ---------------- */

export async function getFaqs(): Promise<{ id: string; question: string; answer: string }[]> {
  return cached("faqs", async () => {
    const { data } = await db()!.from("faqs").select("*").eq("active", true).order("sort_order");
    if (!data) return seedFaq.map((f, i) => ({ id: String(i), question: f.q, answer: f.a }));
    return data.map((f: DbFaq) => ({ id: f.id, question: f.question, answer: f.answer }));
  }, seedFaq.map((f, i) => ({ id: String(i), question: f.q, answer: f.a })));
}

export async function getTeam(): Promise<DbTeamMember[]> {
  return cached("team", async () => {
    const { data } = await db()!.from("team_members").select("*").eq("visible", true).order("sort_order");
    return data ?? [];
  }, []);
}

/* ---------------- settings ---------------- */

type Json = Record<string, unknown>;

export async function getSetting(key: string, fallback: Json): Promise<Json> {
  return cached(`setting:${key}`, async () => {
    const { data } = await db()!.from("site_settings").select("value").eq("key", key).maybeSingle();
    return (data?.value as Json) ?? fallback;
  }, fallback);
}

export async function getEnrolmentSettings() {
  const s = await getSetting("enrolment", {
    status: seedTraining.status,
    cohortName: seedTraining.cohortLabel,
    cohortNote: seedTraining.cohortNote,
    closedMessage: "Enrolment is currently closed. Join the waitlist and you will be told first when the next cohort opens.",
    waitlistOn: true,
    feeText: seedTraining.costs,
  });
  return s as { status: "open" | "closed"; cohortName: string; cohortNote: string; closedMessage: string; waitlistOn: boolean; feeText: string; deadline?: string | null };
}

export async function getGivingSettings() {
  const s = await getSetting("giving", {});
  return {
    ...seedGiving,
    bank: {
      bankName: String(s.bankName ?? seedGiving.bank.bankName),
      accountName: String(s.accountName ?? seedGiving.bank.accountName),
      accountNumber: String(s.accountNumber ?? seedGiving.bank.accountNumber),
      sortCode: seedGiving.bank.sortCode,
      currency: seedGiving.bank.currency,
    },
    paystack: {
      link: String(s.paystackLink ?? seedGiving.paystack.link),
      enabled: Boolean(s.paystackEnabled ?? seedGiving.paystack.enabled),
    },
  };
}

export async function getContactSettings() {
  const s = await getSetting("contact", {});
  return {
    whatsapp: String(s.whatsapp ?? seedSite.social.whatsappInvite),
    telegram: String(s.telegram ?? seedSite.social.telegramInvite),
    facebookPage: String(s.facebookPage ?? seedSite.social.facebookPage),
    facebookGroup: String(s.facebookGroup ?? seedSite.social.facebookGroup),
    youtube: String(s.youtube ?? seedSite.social.youtube),
    email: String(s.email ?? seedSite.email.publicAddress),
    phone: String(s.phone ?? ""),
    address: String(s.address ?? ""),
  };
}

export async function getAnnouncement() {
  const s = await getSetting("announcement", { active: false, message: "", link: "", variant: "default" });
  return s as { active: boolean; message: string; link: string; variant: "default" | "emergency" };
}
