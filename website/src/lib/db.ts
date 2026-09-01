import Database from "better-sqlite3";
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

let dbInstance: Database.Database | null = null;

function getDatabase(): Database.Database {
  if (dbInstance) return dbInstance;

  // Store in a persistent local data directory
  const dataDir = path.join(process.cwd(), ".data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "ghostsweep.db");
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  // Initialize Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      stripe_customer_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS unlocked_audits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      target_username TEXT NOT NULL,
      unlocked_at TEXT NOT NULL,
      UNIQUE(user_id, target_username)
    );

    CREATE TABLE IF NOT EXISTS audit_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target_username TEXT NOT NULL,
      audit_type TEXT NOT NULL,
      data_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(target_username, audit_type)
    );

    CREATE TABLE IF NOT EXISTS magic_tokens (
      token TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_unlocked_audits_user ON unlocked_audits(user_id);
    CREATE INDEX IF NOT EXISTS idx_unlocked_audits_target ON unlocked_audits(target_username);
    CREATE INDEX IF NOT EXISTS idx_audit_cache_target ON audit_cache(target_username, audit_type);
  `);

  // Safe migration for new columns
  try {
    db.exec("ALTER TABLE users ADD COLUMN password_hash TEXT;");
  } catch {
    // Column already exists
  }

  dbInstance = db;
  return dbInstance;
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
export function registerUser(email: string, password?: string): { success: boolean; user?: DbUser; error?: string } {
  const db = getDatabase();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(cleanEmail) as DbUser | undefined;
  const passwordHash = password ? hashPassword(password) : null;

  if (existing) {
    if (passwordHash && !existing.password_hash) {
      db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(passwordHash, existing.id);
      existing.password_hash = passwordHash;
    }
    return { success: true, user: existing };
  }

  const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, email, password_hash, stripe_customer_id, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, cleanEmail, passwordHash, null, now);

  const newUser: DbUser = {
    id,
    email: cleanEmail,
    password_hash: passwordHash,
    stripe_customer_id: null,
    created_at: now,
  };

  return { success: true, user: newUser };
}

/**
 * Authenticate a user by email + password / access PIN
 */
export function authenticateUser(email: string, password?: string): { success: boolean; user?: DbUser; error?: string } {
  const db = getDatabase();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(cleanEmail) as DbUser | undefined;
  if (!existing) {
    // If user doesn't exist yet, auto-register them
    return registerUser(cleanEmail, password);
  }

  if (password && existing.password_hash) {
    const inputHash = hashPassword(password);
    if (inputHash !== existing.password_hash) {
      return { success: false, error: "Incorrect password. Please try again." };
    }
  } else if (password && !existing.password_hash) {
    // Set initial password for user who previously used magic link or checkout
    const passwordHash = hashPassword(password);
    db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(passwordHash, existing.id);
    existing.password_hash = passwordHash;
  }

  return { success: true, user: existing };
}

/**
 * Find or create a user by email
 */
export function getOrCreateUser(email: string, stripeCustomerId?: string): DbUser {
  const db = getDatabase();
  const cleanEmail = email.trim().toLowerCase();

  const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(cleanEmail) as DbUser | undefined;
  if (existing) {
    if (stripeCustomerId && !existing.stripe_customer_id) {
      db.prepare("UPDATE users SET stripe_customer_id = ? WHERE id = ?").run(stripeCustomerId, existing.id);
      existing.stripe_customer_id = stripeCustomerId;
    }
    return existing;
  }

  const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, email, stripe_customer_id, created_at)
    VALUES (?, ?, ?, ?)
  `).run(id, cleanEmail, stripeCustomerId || null, now);

  return {
    id,
    email: cleanEmail,
    stripe_customer_id: stripeCustomerId || null,
    created_at: now,
  };
}

/**
 * Unlock full forensic report for a user and target Instagram handle
 */
export function unlockAudit(emailOrUserId: string, targetUsername: string): boolean {
  const db = getDatabase();
  const cleanTarget = normalizeTargetUsername(targetUsername);
  if (!cleanTarget) return false;

  let userId = emailOrUserId;
  if (emailOrUserId.includes("@")) {
    const user = getOrCreateUser(emailOrUserId);
    userId = user.id;
  }

  const now = new Date().toISOString();
  try {
    db.prepare(`
      INSERT OR REPLACE INTO unlocked_audits (user_id, target_username, unlocked_at)
      VALUES (?, ?, ?)
    `).run(userId, cleanTarget, now);
    return true;
  } catch (err) {
    console.error("Failed to record unlocked audit:", err);
    return false;
  }
}

/**
 * Check if a specific Instagram audit is unlocked for a user/email or guest session
 */
export function isAuditUnlocked(emailOrUserId: string | null | undefined, targetUsername: string): boolean {
  if (!emailOrUserId) return false;
  const db = getDatabase();
  const cleanTarget = normalizeTargetUsername(targetUsername);
  if (!cleanTarget) return false;

  let userId = emailOrUserId;
  if (emailOrUserId.includes("@")) {
    const user = db.prepare("SELECT id FROM users WHERE email = ?").get(emailOrUserId.trim().toLowerCase()) as { id: string } | undefined;
    if (!user) return false;
    userId = user.id;
  }

  const record = db.prepare(`
    SELECT id FROM unlocked_audits WHERE user_id = ? AND target_username = ?
  `).get(userId, cleanTarget);

  return Boolean(record);
}

/**
 * Get all unlocked target usernames for a user
 */
export function getUserUnlockedAudits(emailOrUserId: string): string[] {
  const db = getDatabase();
  let userId = emailOrUserId;
  if (emailOrUserId.includes("@")) {
    const user = db.prepare("SELECT id FROM users WHERE email = ?").get(emailOrUserId.trim().toLowerCase()) as { id: string } | undefined;
    if (!user) return [];
    userId = user.id;
  }

  const rows = db.prepare(`
    SELECT target_username FROM unlocked_audits WHERE user_id = ? ORDER BY unlocked_at DESC
  `).all(userId) as { target_username: string }[];

  return rows.map((r) => r.target_username);
}

/**
 * Save audit cache payload
 */
export function saveAuditCache(targetUsername: string, auditType: string, data: any): void {
  const db = getDatabase();
  const cleanTarget = normalizeTargetUsername(targetUsername);
  const now = new Date().toISOString();
  try {
    db.prepare(`
      INSERT OR REPLACE INTO audit_cache (target_username, audit_type, data_json, created_at)
      VALUES (?, ?, ?, ?)
    `).run(cleanTarget, auditType, JSON.stringify(data), now);
  } catch (err) {
    console.error("Failed to save audit cache:", err);
  }
}

/**
 * Get cached audit data
 */
export function getAuditCache(targetUsername: string, auditType: string): any | null {
  const db = getDatabase();
  const cleanTarget = normalizeTargetUsername(targetUsername);
  try {
    const row = db.prepare(`
      SELECT data_json FROM audit_cache WHERE target_username = ? AND audit_type = ?
    `).get(cleanTarget, auditType) as { data_json: string } | undefined;

    if (row && row.data_json) {
      return JSON.parse(row.data_json);
    }
  } catch (err) {
    console.error("Failed to load audit cache:", err);
  }
  return null;
}

/**
 * Create a magic authentication token for email login
 */
export function createMagicToken(email: string): string {
  const db = getDatabase();
  const cleanEmail = email.trim().toLowerCase();
  const token = `mag_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour

  db.prepare(`
    INSERT INTO magic_tokens (token, email, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `).run(token, cleanEmail, expiresAt, now.toISOString());

  return token;
}

/**
 * Verify a magic authentication token
 */
export function verifyMagicToken(token: string): { valid: boolean; email?: string } {
  const db = getDatabase();
  const record = db.prepare(`
    SELECT * FROM magic_tokens WHERE token = ?
  `).get(token) as DbMagicToken | undefined;

  if (!record) return { valid: false };

  const isExpired = new Date(record.expires_at).getTime() < Date.now();
  if (isExpired) {
    db.prepare("DELETE FROM magic_tokens WHERE token = ?").run(token);
    return { valid: false };
  }

  // Token is valid; delete it after single-use
  db.prepare("DELETE FROM magic_tokens WHERE token = ?").run(token);
  return { valid: true, email: record.email };
}
