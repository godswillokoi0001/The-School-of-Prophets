import { NextResponse } from "next/server";
import { processReminders } from "@/lib/reminders";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}

async function handleCron(request: Request) {
  const url = new URL(request.url);
  const secretParam = url.searchParams.get("secret");
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // If a CRON_SECRET is configured, require authorization header or secret param
  if (cronSecret) {
    const isAuthorized =
      secretParam === cronSecret ||
      authHeader === `Bearer ${cronSecret}` ||
      authHeader === cronSecret;

    if (!isAuthorized) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized. Provide valid CRON_SECRET." },
        { status: 401 }
      );
    }
  }

  const dryRun = url.searchParams.get("dryRun") === "true";

  try {
    const outcome = await processReminders({ dryRun });
    return NextResponse.json(outcome);
  } catch (err) {
    console.error("[api/cron/reminders] Error running reminders job:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
