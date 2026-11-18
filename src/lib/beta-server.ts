import sharp from "sharp";
import { getServiceClient } from "@/lib/supabase/server";
import {
  BETA_BUCKET,
  BETA_SETTING_KEY,
  BETA_TYPE,
  average,
  isHighPriority,
  type BetaIssue,
  type BetaPayload,
} from "@/lib/beta";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function betaAccepting(): Promise<boolean> {
  const svc = getServiceClient();
  if (!svc) return true;
  try {
    const { data } = await svc
      .from("site_settings")
      .select("value")
      .eq("key", BETA_SETTING_KEY)
      .maybeSingle();
    const value = (data?.value ?? {}) as { status?: string };
    return value.status !== "closed";
  } catch {
    return true;
  }
}

/** One review per email address per ten minutes; a later second review is fine. */
export async function betaDuplicate(email: string): Promise<boolean> {
  const svc = getServiceClient();
  if (!svc || !email) return false;
  try {
    const since = new Date(Date.now() - 10 * 60_000).toISOString();
    const { data } = await svc
      .from("submissions")
      .select("id")
      .eq("type", BETA_TYPE)
      .is("deleted_at", null)
      .gte("created_at", since)
      .eq("payload->>email", email.toLowerCase())
      .limit(1);
    return Boolean(data && data.length > 0);
  } catch {
    return false;
  }
}

async function storeScreenshot(dataUrl: string, path: string): Promise<string | null> {
  const svc = getServiceClient();
  if (!svc) return null;
  const match = /^data:(image\/[a-z+]+);base64,([\s\S]+)$/i.exec(dataUrl);
  if (!match) return null;
  const mime = match[1].toLowerCase();
  if (!ALLOWED.has(mime)) return null;
  let buffer: Buffer;
  try {
    buffer = Buffer.from(match[2], "base64");
  } catch {
    return null;
  }
  if (buffer.length === 0 || buffer.length > MAX_BYTES) return null;

  let cleaned: Buffer;
  try {
    // Re-encoding strips EXIF, GPS and device metadata; resizing keeps it small.
    cleaned = await sharp(buffer)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();
  } catch {
    return null;
  }

  try {
    await svc.storage.createBucket(BETA_BUCKET, { public: false });
  } catch {
    // bucket already exists, or storage is not provisioned
  }

  const { error } = await svc.storage.from(BETA_BUCKET).upload(path, cleaned, {
    contentType: "image/webp",
    upsert: false,
  });
  if (error) {
    console.warn("[beta] screenshot upload failed:", error.message);
    return null;
  }
  return path;
}

/**
 * Validate, strip and store any attached screenshots, then flag priority.
 * Runs before the row is written so the payload never carries image bytes.
 */
export async function prepareBetaSubmission(
  raw: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const payload = { ...raw } as BetaPayload;
  const meta = { ...(payload.meta ?? {}) };
  let errors = 0;

  const issues: BetaIssue[] = await Promise.all(
    (Array.isArray(payload.issues) ? payload.issues : []).slice(0, 5).map(async (issue, index) => {
      const shots = Array.isArray(issue?.screenshots) ? issue.screenshots.slice(0, 3) : [];
      const stored: string[] = [];
      for (const [shotIndex, shot] of shots.entries()) {
        if (typeof shot !== "string" || !shot.startsWith("data:")) continue;
        const path = `beta/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${index}-${shotIndex}.webp`;
        const saved = await storeScreenshot(shot, path);
        if (saved) stored.push(saved);
        else errors += 1;
      }
      return {
        page: String(issue?.page ?? "Other").slice(0, 60),
        description: String(issue?.description ?? "").slice(0, 2000),
        severity: String(issue?.severity ?? "Small annoyance").slice(0, 40),
        screenshots: stored,
      };
    }),
  );

  const clean: BetaPayload = {
    ...payload,
    name: String(payload.name ?? "").trim(),
    email: String(payload.email ?? "").trim().toLowerCase(),
    overall_rating: Number(payload.overall_rating ?? 0),
    issues,
    meta,
  };

  if (!clean.story || !String(clean.story).trim()) {
    clean.story = "";
    clean.story_consent = "private";
  }
  if (clean.story_consent === "private" || !clean.story_consent) {
    clean.display_name = "";
  }
  if (errors > 0) meta.screenshot_errors = errors;
  meta.priority = isHighPriority(clean);
  clean.meta = meta;

  return clean as unknown as Record<string, unknown>;
}

export type BetaRow = {
  id: string;
  status: string;
  created_at: string;
  tags: string[];
  assignee: string | null;
  payload: BetaPayload;
};

export async function getBetaRows(limit = 500): Promise<BetaRow[]> {
  const svc = getServiceClient();
  if (!svc) return [];
  try {
    const { data } = await svc
      .from("submissions")
      .select("id,status,created_at,tags,assignee,payload")
      .eq("type", BETA_TYPE)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data ?? []).map((row) => ({
      id: row.id,
      status: row.status,
      created_at: row.created_at,
      tags: (row.tags ?? []) as string[],
      assignee: row.assignee ?? null,
      payload: (row.payload ?? {}) as BetaPayload,
    }));
  } catch {
    return [];
  }
}

const STOPWORDS = new Set(
  `the and but for with that this from have has had was were are is it its it's i you we they he she them us our your my me
  not no yes just very really about into over under more most some any all can could would should will shall do does did
  there here what when where who whom which how why than then too also only even still much many lot bit like feel felt
  site page website use using used one two three four five good great nice really thing things get got make made see seen
  going go went well but so if because as at by on in of to a an be been being or`
    .split(/\s+/)
    .filter(Boolean),
);

export function wordFrequency(rows: BetaRow[], limit = 16) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const text = [
      row.payload.take,
      row.payload.improve,
      row.payload.liked,
      row.payload.wish,
      row.payload.story,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    for (const word of text.match(/[a-z][a-z'-]{2,}/g) ?? []) {
      if (STOPWORDS.has(word)) continue;
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }
  return [...counts]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, limit);
}

export function betaStats(rows: BetaRow[]) {
  const ratings = rows.map((r) => Number(r.payload.overall_rating ?? 0)).filter((n) => n >= 1 && n <= 5);
  const distribution = [1, 2, 3, 4, 5].map((n) => ({ rating: n, count: ratings.filter((r) => r === n).length }));
  const areas = ["design", "ease", "speed", "content", "mobile"].map((key) => {
    const values = rows
      .map((r) => Number(r.payload.area_ratings?.[key as "design"] ?? 0))
      .filter((n) => n >= 1 && n <= 5);
    return { key, average: average(values), count: values.length };
  });

  const issues = rows.flatMap((row) =>
    (row.payload.issues ?? []).map((issue) => ({
      ...issue,
      submissionId: row.id,
      name: row.payload.name ?? "",
      email: row.payload.email ?? "",
      created_at: row.created_at,
      status: row.status,
      tags: row.tags,
    })),
  );

  const devices = new Map<string, number>();
  const browsers = new Map<string, number>();
  for (const row of rows) {
    const device = row.payload.device || "Not given";
    devices.set(device, (devices.get(device) ?? 0) + 1);
    const browser = row.payload.meta?.browser || "Unknown";
    browsers.set(browser, (browsers.get(browser) ?? 0) + 1);
  }

  const stories = rows.filter((r) => r.payload.story && String(r.payload.story).trim().length > 0);

  return {
    total: rows.length,
    average: average(ratings),
    rated: ratings.length,
    distribution,
    areas,
    issues,
    devices: [...devices].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
    browsers: [...browsers].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
    stories,
    priority: rows.filter((r) => isHighPriority(r.payload)).length,
    tags: [...tagCounts(rows)]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count),
    words: wordFrequency(rows),
  };
}

function tagCounts(rows: BetaRow[]) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    for (const tag of row.tags ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return counts;
}
