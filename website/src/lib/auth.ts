import crypto from "crypto";

const SESSION_SECRET = 
  process.env.SESSION_SECRET || 
  process.env.STRIPE_SECRET_KEY || 
  "ghostsweep_stateless_session_secret_dahlia_2026";

export interface SessionPayload {
  email: string;
  userId: string;
  unlockedAudits?: string[];
  iat: number;
  exp: number;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  return Buffer.from(str, "base64").toString("utf8");
}

/**
 * Creates a cryptographically signed stateless JWT session token
 */
export function createSessionToken(payload: {
  email: string;
  userId: string;
  unlockedAudits?: string[];
}): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: SessionPayload = {
    email: payload.email.trim().toLowerCase(),
    userId: payload.userId,
    unlockedAudits: payload.unlockedAudits || [],
    iat: now,
    exp: now + 60 * 60 * 24 * 30, // 30 days valid
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(signatureInput)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Cryptographically verifies a stateless JWT session token
 */
export function verifySessionToken(token: string): {
  valid: boolean;
  email?: string;
  userId?: string;
  unlockedAudits?: string[];
} {
  if (!token || typeof token !== "string") return { valid: false };

  const parts = token.split(".");
  if (parts.length !== 3) return { valid: false };

  const [encodedHeader, encodedPayload, signature] = parts;
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const expectedSignature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(signatureInput)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  if (signature !== expectedSignature) {
    return { valid: false };
  }

  try {
    const payload: SessionPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false };
    }

    return {
      valid: true,
      email: payload.email,
      userId: payload.userId,
      unlockedAudits: payload.unlockedAudits || [],
    };
  } catch (err) {
    return { valid: false };
  }
}
