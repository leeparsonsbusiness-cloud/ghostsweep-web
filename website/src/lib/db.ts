import path from "path";
import fs from "fs";
import crypto from "crypto";

export interface DbUser {
  id: string;
  email: string;
  password_hash?: string | null;
  stripe_customer_id?: string | null;
  created_at: string;
}

export interface DbUnlockedAudit {
  id: number;
  user_id: string;
  target_username: string;
  unlocked_at: string;
}

export interface DbMagicToken {
  token: string;
  email: string;
  expires_at: string;
  created_at: string;
}

export interface VaultState {
  users: Record<string, DbUser>; // keyed by email
  usersById: Record<string, string>; // userId -> email
  unlockedAudits: Record<string, Record<string, string>>; // email -> { targetUsername: unlockedAt }
  auditCache: Record<string, { data_json: string; created_at: string }>; // `target_username:audit_type` -> data
  magicTokens: Record<string, DbMagicToken>;
}

// In-Memory Storage Layer (Serverless & Container Safe)
let memoryVault: VaultState = {
  users: {},
  usersById: {},
  unlockedAudits: {},
  auditCache: {},
  magicTokens: {},
};

let isInitialized = false;

function getVaultPath(): string {
  const isVercel = process.env.VERCEL === "1" || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (isVercel) {
    return path.join("/tmp", "ghostsweep_vault.json");
  }
  return path.join(process.cwd(), ".data", "ghostsweep_vault.json");
}

function loadVault(): VaultState {
  if (isInitialized) return memoryVault;

  try {
    const vaultPath = getVaultPath();
    if (fs.existsSync(vaultPath)) {
      const raw = fs.readFileSync(vaultPath, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        memoryVault = {
          users: parsed.users || {},
          usersById: parsed.usersById || {},
          unlockedAudits: parsed.unlockedAudits || {},
          auditCache: parsed.auditCache || {},
          magicTokens: parsed.magicTokens || {},
        };
      }
    }
  } catch (err: any) {
    console.warn("[Vault] Could not read vault file, using in-memory store:", err.message);
  }

  isInitialized = true;
  return memoryVault;
}

function persistVault(): void {
  try {
    const vaultPath = getVaultPath();
    const dir = path.dirname(vaultPath);

    // Only attempt directory creation if dir does not exist
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (mkdirErr: any) {
        // Read-only filesystem warning - continue in-memory
        return;
      }
    }

    fs.writeFileSync(vaultPath, JSON.stringify(memoryVault, null, 2), "utf8");
  } catch (err: any) {
    // Fail silently in serverless environments to prevent unhandled 500s
  }
}

/**
 * Normalizes username (lowercase, trimmed, strip '@')
 */
export function normalizeTargetUsername(raw: string): string {
  return raw.replace(/^@/, "").trim().toLowerCase();
}

/**
 * Salt and hash password securely
 */
export function hashPassword(password: string): string {
  const salt = "ghostsweep_secure_salt_2026";
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}

/**
 * Register a new user with password / access PIN
 */
export function registerUser(
  email: string,
  password?: string
): { success: boolean; user?: DbUser; error?: string } {
  loadVault();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const existing = memoryVault.users[cleanEmail];
  const passwordHash = password ? hashPassword(password) : null;

  if (existing) {
    if (passwordHash && !existing.password_hash) {
      existing.password_hash = passwordHash;
      persistVault();
    }
    return { success: true, user: existing };
  }

  const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  const newUser: DbUser = {
    id,
    email: cleanEmail,
    password_hash: passwordHash,
    stripe_customer_id: null,
    created_at: now,
  };

  memoryVault.users[cleanEmail] = newUser;
  memoryVault.usersById[id] = cleanEmail;
  persistVault();

  return { success: true, user: newUser };
}

/**
 * Authenticate a user by email + password / access PIN
 */
export function authenticateUser(
  email: string,
  password?: string
): { success: boolean; user?: DbUser; error?: string } {
  loadVault();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const existing = memoryVault.users[cleanEmail];
  if (!existing) {
    // If user does not exist yet, auto-register them
    return registerUser(cleanEmail, password);
  }

  if (password && existing.password_hash) {
    const inputHash = hashPassword(password);
    if (inputHash !== existing.password_hash) {
      return { success: false, error: "Incorrect password. Please try again." };
    }
  } else if (password && !existing.password_hash) {
    // Set initial password for user who previously unlocked via checkout
    const passwordHash = hashPassword(password);
    existing.password_hash = passwordHash;
    persistVault();
  }

  return { success: true, user: existing };
}

/**
 * Find or create a user by email
 */
export function getOrCreateUser(email: string, stripeCustomerId?: string): DbUser {
  loadVault();
  const cleanEmail = email.trim().toLowerCase();

  const existing = memoryVault.users[cleanEmail];
  if (existing) {
    if (stripeCustomerId && !existing.stripe_customer_id) {
      existing.stripe_customer_id = stripeCustomerId;
      persistVault();
    }
    return existing;
  }

  const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  const newUser: DbUser = {
    id,
    email: cleanEmail,
    stripe_customer_id: stripeCustomerId || null,
    created_at: now,
  };

  memoryVault.users[cleanEmail] = newUser;
  memoryVault.usersById[id] = cleanEmail;
  persistVault();

  return newUser;
}

/**
 * Unlock full forensic report for a user and target Instagram handle
 */
export function unlockAudit(emailOrUserId: string, targetUsername: string): boolean {
  loadVault();
  const cleanTarget = normalizeTargetUsername(targetUsername);
  if (!cleanTarget) return false;

  let email = emailOrUserId.trim().toLowerCase();
  if (!email.includes("@") && memoryVault.usersById[emailOrUserId]) {
    email = memoryVault.usersById[emailOrUserId];
  }

  if (!email) return false;

  // Ensure user is created
  getOrCreateUser(email);

  if (!memoryVault.unlockedAudits[email]) {
    memoryVault.unlockedAudits[email] = {};
  }

  memoryVault.unlockedAudits[email][cleanTarget] = new Date().toISOString();
  persistVault();
  return true;
}

/**
 * Check if a specific Instagram audit is unlocked for a user/email or guest session
 */
export function isAuditUnlocked(
  emailOrUserId: string | null | undefined,
  targetUsername: string
): boolean {
  if (!emailOrUserId) return false;
  loadVault();
  const cleanTarget = normalizeTargetUsername(targetUsername);
  if (!cleanTarget) return false;

  let email = emailOrUserId.trim().toLowerCase();
  if (!email.includes("@") && memoryVault.usersById[emailOrUserId]) {
    email = memoryVault.usersById[emailOrUserId];
  }

  const userAudits = memoryVault.unlockedAudits[email];
  return Boolean(userAudits && userAudits[cleanTarget]);
}

/**
 * Get all unlocked target usernames for a user
 */
export function getUserUnlockedAudits(emailOrUserId: string): string[] {
  if (!emailOrUserId) return [];
  loadVault();
  let email = emailOrUserId.trim().toLowerCase();
  if (!email.includes("@") && memoryVault.usersById[emailOrUserId]) {
    email = memoryVault.usersById[emailOrUserId];
  }

  const userAudits = memoryVault.unlockedAudits[email];
  if (!userAudits) return [];

  return Object.keys(userAudits);
}

/**
 * Save audit cache payload
 */
export function saveAuditCache(targetUsername: string, auditType: string, data: any): void {
  loadVault();
  const cleanTarget = normalizeTargetUsername(targetUsername);
  const key = `${cleanTarget}:${auditType}`;
  const now = new Date().toISOString();

  memoryVault.auditCache[key] = {
    data_json: JSON.stringify(data),
    created_at: now,
  };
  persistVault();
}

/**
 * Get cached audit data
 */
export function getAuditCache(targetUsername: string, auditType: string): any | null {
  loadVault();
  const cleanTarget = normalizeTargetUsername(targetUsername);
  const key = `${cleanTarget}:${auditType}`;

  const entry = memoryVault.auditCache[key];
  if (entry && entry.data_json) {
    try {
      return JSON.parse(entry.data_json);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Create a magic authentication token for email login
 */
export function createMagicToken(email: string): string {
  loadVault();
  const cleanEmail = email.trim().toLowerCase();
  const token = `mag_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour

  memoryVault.magicTokens[token] = {
    token,
    email: cleanEmail,
    expires_at: expiresAt,
    created_at: now.toISOString(),
  };
  persistVault();

  return token;
}

/**
 * Verify a magic authentication token
 */
export function verifyMagicToken(token: string): { valid: boolean; email?: string } {
  loadVault();
  const record = memoryVault.magicTokens[token];
  if (!record) return { valid: false };

  const isExpired = new Date(record.expires_at).getTime() < Date.now();
  delete memoryVault.magicTokens[token];
  persistVault();

  if (isExpired) {
    return { valid: false };
  }

  return { valid: true, email: record.email };
}
