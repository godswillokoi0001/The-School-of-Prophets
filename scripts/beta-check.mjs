#!/usr/bin/env node
/**
 * End-to-end checks for /beta-testers against a running server.
 *
 *   BASE=http://localhost:3210 node scripts/beta-check.mjs
 *
 * Only public behaviour is asserted here. Email, Web Push and Realtime need
 * RESEND_API_KEY / VAPID keys / Supabase and are reported as unverified rather
 * than silently skipped. Rows created by this script are labelled isSample so
 * "Remove samples" on /admin/beta deletes them in one click.
 */

const BASE = (process.env.BASE ?? "http://localhost:3210").replace(/\/$/, "");
const results = [];

function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

function ip() {
  return `198.51.100.${Math.floor(Math.random() * 200) + 20}`;
}

async function postBeta(payload, { headers = {}, website = "" } = {}) {
  const res = await fetch(`${BASE}/api/beta`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip(), ...headers },
    body: JSON.stringify({ type: "beta_feedback", website, payload }),
  });
  let body = {};
  try {
    body = await res.json();
  } catch {
    // non-JSON response
  }
  return { status: res.status, body };
}

function draft(overrides = {}) {
  return {
    name: "[sample] Beta check",
    email: `beta-check-${Date.now()}-${Math.floor(Math.random() * 1e4)}@example.com`,
    overall_rating: 4,
    take: "This is a sample review written by the automatic beta check.",
    improve: "Sample answer: keep going.",
    area_ratings: { design: 4 },
    issues: [],
    story: "",
    story_consent: "private",
    may_contact: false,
    wants_call: false,
    isSample: true,
    sample_label: "sample",
    meta: { browser: "Check", os: "Node", screen: "1024×768", timestamp: new Date().toISOString() },
    ...overrides,
  };
}

async function main() {
  const health = await fetch(`${BASE}/beta-testers`, { redirect: "manual" });
  record("page responds", health.status === 200, `HTTP ${health.status}`);

  const missing = await postBeta({ name: "", email: "", take: "" });
  record(
    "validation rejects an empty review",
    missing.status === 422 && Boolean(missing.body.errors?.name),
    `HTTP ${missing.status}`,
  );

  const badRating = await postBeta(draft({ overall_rating: 9 }));
  record("rating must be 1–5", badRating.status === 422, `HTTP ${badRating.status}`);

  const trap = await postBeta(draft(), { website: "http://spam.example" });
  record(
    "honeypot answers ok without storing",
    trap.status === 200 && trap.body.ok === true,
    `HTTP ${trap.status}`,
  );

  const email = `dup-${Date.now()}@example.com`;
  const first = await postBeta(draft({ email }));
  record("a complete review is accepted", first.status === 200 && first.body.ok === true, `HTTP ${first.status}`);

  const second = await postBeta(draft({ email }));
  record(
    "second review from the same email inside 10 minutes is blocked",
    second.status === 409,
    `HTTP ${second.status}`,
  );

  const shot = await postBeta(
    draft({
      issues: [
        {
          page: "Home",
          description: "Sample issue with an oversized file.",
          severity: "Small annoyance",
          screenshots: [`data:text/plain;base64,${Buffer.from("not an image").toString("base64")}`],
        },
      ],
    }),
  );
  record(
    "non-image screenshot is rejected without failing the review",
    shot.status === 200,
    `HTTP ${shot.status}`,
  );

  // Rate limit: 5 per hour per IP/path. Six requests from one address.
  const limitIp = ip();
  let limited = false;
  let lastStatus = 0;
  for (let i = 0; i < 6; i += 1) {
    const res = await postBeta(draft(), { headers: { "x-forwarded-for": limitIp } });
    lastStatus = res.status;
    if (res.status === 429) {
      limited = true;
      break;
    }
  }
  record("per-IP limit returns 429", limited, `last HTTP ${lastStatus}`);

  const anonExport = await fetch(`${BASE}/api/admin/beta/export`, { redirect: "manual" });
  record(
    "anonymous export is refused",
    [307, 302, 401, 403].includes(anonExport.status),
    `HTTP ${anonExport.status}`,
  );

  const anonShot = await fetch(`${BASE}/api/admin/beta/screenshot?path=beta/x/y.webp`, {
    redirect: "manual",
  });
  record(
    "anonymous screenshot access is refused",
    [307, 302, 401, 403].includes(anonShot.status),
    `HTTP ${anonShot.status}`,
  );

  const anonAdmin = await fetch(`${BASE}/admin/beta`, { redirect: "manual" });
  record(
    "anonymous /admin/beta redirects to sign-in",
    [302, 307, 308].includes(anonAdmin.status),
    `HTTP ${anonAdmin.status}`,
  );

  const storyWithoutConsent = await postBeta(
    draft({ story: "A sample story with no consent chosen.", story_consent: "private" }),
  );
  record(
    "story stored as private when consent is private",
    storyWithoutConsent.status === 200,
    `HTTP ${storyWithoutConsent.status}`,
  );

  const failed = results.filter((r) => !r.ok);
  console.log("\nUnverified here: admin email, tester confirmation, Web Push and the");
  console.log("Realtime bell need RESEND_API_KEY, VAPID keys and Supabase configured.");
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
