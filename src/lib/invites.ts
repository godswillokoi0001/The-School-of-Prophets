import crypto from "crypto";

function getSecret(): string {
  return (
    process.env.SUPABASE_JWT_SECRET ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "tsop-invite-secret-key-2026"
  );
}

export type InvitePayload = {
  email: string;
  role: string;
  fullName: string;
  exp: number;
};

/**
 * Generates an HMAC-signed, tamper-proof invitation token valid for 7 days.
 */
export function generateInviteToken(email: string, role: string, fullName: string): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const data: InvitePayload = {
    email: email.toLowerCase().trim(),
    role: role.toLowerCase().trim(),
    fullName: fullName.trim(),
    exp,
  };
  const b64Data = Buffer.from(JSON.stringify(data)).toString("base64url");
  const hmac = crypto.createHmac("sha256", getSecret()).update(b64Data).digest("base64url");
  return `${b64Data}.${hmac}`;
}

/**
 * Validates and unpacks an invitation token.
 */
export function parseInviteToken(token: string): {
  ok: boolean;
  data?: InvitePayload;
  error?: string;
} {
  if (!token || typeof token !== "string") {
    return { ok: false, error: "Missing invitation token." };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { ok: false, error: "Invalid invitation token structure." };
  }

  const [b64Data, hmac] = parts;
  const expectedHmac = crypto.createHmac("sha256", getSecret()).update(b64Data).digest("base64url");

  if (hmac !== expectedHmac) {
    return { ok: false, error: "Invalid invitation signature. This link may have been modified." };
  }

  try {
    const raw = Buffer.from(b64Data, "base64url").toString("utf8");
    const data = JSON.parse(raw) as InvitePayload;

    if (!data.email || !data.role) {
      return { ok: false, error: "Malformed invitation payload." };
    }

    if (Date.now() > data.exp) {
      return {
        ok: false,
        error: "This invitation link has expired. Please ask the Owner to send a new invitation.",
      };
    }

    return { ok: true, data };
  } catch {
    return { ok: false, error: "Could not decode invitation token." };
  }
}
