import path from "path";
import fs from "fs";
import crypto from "crypto";

export { 
  VIP_ADMIN_EMAILS, 
  BLOCKED_EMAILS, 
  isVipEmail, 
  isBlockedEmail, 
  type UserPlan, 
  type AuditHistoryEntry,
  type TrackedTarget,
  type RadarActivityEvent
} from "./types";
import { isVipEmail, isBlockedEmail, UserPlan, AuditHistoryEntry, TrackedTarget, RadarActivityEvent } from "./types";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

export interface DbUser {
  id: string;
  email: string;
  password_hash?: string | null;
  stripe_customer_id?: string | null;
  plan: UserPlan;
  searches_this_week?: number;
  searches_this_month: number;
  searched_accounts: string[];
  search_week_reset?: string;
  search_month_reset: string;
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

export interface FollowsSnapshot {
  targetUsername: string;
  targetType: string;
  usernames: string[];
  timestamp: string;
}

export interface DiffResult {
  newFollows: string[];
  unfollowed: string[];
  isBaseline: boolean;
  baselineTimestamp?: string;
  baselineCount: number;
}

export interface VaultState {
  users: Record<string, DbUser>; // keyed by email
  usersById: Record<string, string>; // userId -> email
  unlockedAudits: Record<string, Record<string, string>>; // email -> { targetUsername: unlockedAt }
  auditCache: Record<string, { data_json: string; created_at: string }>; // `target_username:audit_type` -> data
  auditHistory: Record<string, AuditHistoryEntry[]>; // email -> list of history items
  followsSnapshots: Record<string, FollowsSnapshot[]>; // `target:type` -> list of snapshots
  magicTokens: Record<string, DbMagicToken>;
  trackedTargets: Record<string, TrackedTarget>; // targetKey: `${userEmail}:${targetUsername}`
  activityEvents: Record<string, RadarActivityEvent[]>; // targetUsername -> list of events
}

// In-Memory Storage Layer (Serverless & Container Safe)
let memoryVault: VaultState = {
  users: {},
  usersById: {},
  unlockedAudits: {},
  auditCache: {},
  auditHistory: {},
  followsSnapshots: {},
  magicTokens: {},
  trackedTargets: {},
  activityEvents: {},
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
          auditHistory: parsed.auditHistory || {},
          followsSnapshots: parsed.followsSnapshots || {},
          magicTokens: parsed.magicTokens || {},
          trackedTargets: parsed.trackedTargets || {},
          activityEvents: parsed.activityEvents || {},
        };
      }
    }
  } catch (err: any) {
    console.warn("[Vault] Could not read vault file, using in-memory store:", err.message);
  }

  // Ensure Dev VIP Account exists with full access
  const devHash = hashPassword("dev");
  if (!memoryVault.users["dev"] || memoryVault.users["dev"].password_hash !== devHash || memoryVault.users["dev"].plan !== "unlimited") {
    memoryVault.users["dev"] = {
      id: "usr_dev_master",
      email: "dev",
      password_hash: devHash,
      stripe_customer_id: null,
      plan: "unlimited",
      searches_this_month: 0,
      searched_accounts: [],
      search_month_reset: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    };
    memoryVault.usersById["usr_dev_master"] = "dev";
  }

  // Ensure Founder VIP Account (leeparsonsbusiness@gmail.com) exists with full access
  const leeEmail = "leeparsonsbusiness@gmail.com";
  const leeHash = hashPassword("332844");
  if (!memoryVault.users[leeEmail] || memoryVault.users[leeEmail].password_hash !== leeHash || memoryVault.users[leeEmail].plan !== "unlimited") {
    memoryVault.users[leeEmail] = {
      id: "usr_lee_founder",
      email: leeEmail,
      password_hash: leeHash,
      stripe_customer_id: null,
      plan: "unlimited",
      searches_this_month: 0,
      searched_accounts: [],
      search_month_reset: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    };
    memoryVault.usersById["usr_lee_founder"] = leeEmail;
  }

  isInitialized = true;
  return memoryVault;
}

function persistVault(): void {
  try {
    const vaultPath = getVaultPath();
    const dir = path.dirname(vaultPath);

    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (mkdirErr: any) {
        return;
      }
    }

    fs.writeFileSync(vaultPath, JSON.stringify(memoryVault, null, 2), "utf8");
  } catch (err: any) {
    // Fail silently in serverless environments to prevent unhandled 500s
  }
}

/**
 * Sync helpers for permanent cloud PostgreSQL storage via Supabase
 */
async function syncUserToSupabase(user: DbUser) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    const { error } = await supabase.from("users").upsert({
      id: user.id,
      email: user.email,
      password_hash: user.password_hash || null,
      stripe_customer_id: user.stripe_customer_id || null,
      plan: user.plan,
      searches_this_month: user.searches_this_month || 0,
      searched_accounts: user.searched_accounts || [],
      search_month_reset: user.search_month_reset || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "email" });
    if (error) {
      console.warn("[Supabase Sync] User upsert warning:", error.message);
    }
  } catch (err: any) {
    console.warn("[Supabase Sync] User error:", err.message);
  }
}

async function syncUnlockedAuditToSupabase(userEmail: string, targetUsername: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    await supabase.from("unlocked_audits").upsert({
      user_email: userEmail.toLowerCase(),
      target_username: targetUsername.toLowerCase(),
      unlocked_at: new Date().toISOString(),
    }, { onConflict: "user_email,target_username" });
  } catch (err: any) {
    console.warn("[Supabase Sync] Unlocked audit error:", err.message);
  }
}

async function syncSnapshotToSupabase(targetUsername: string, targetType: string, usernames: string[]) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    await supabase.from("follows_snapshots").insert({
      target_username: targetUsername.toLowerCase(),
      target_type: targetType,
      usernames,
      snapshot_count: usernames.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.warn("[Supabase Sync] Snapshot error:", err.message);
  }
}

async function syncSearchHistoryToSupabase(entry: { user_email: string; target_username: string; target_name?: string; target_avatar?: string; is_unlocked?: boolean; target_type?: string }) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    await supabase.from("search_history").insert({
      user_email: entry.user_email.toLowerCase(),
      target_username: entry.target_username.toLowerCase(),
      target_name: entry.target_name,
      target_avatar: entry.target_avatar,
      target_type: entry.target_type || "following",
      is_unlocked: Boolean(entry.is_unlocked),
      searched_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.warn("[Supabase Sync] History error:", err.message);
  }
}

async function syncAuditCacheToSupabase(key: string, data: any) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    const { error } = await supabase.from("audit_cache").upsert({
      cache_key: key,
      data: data,
      created_at: new Date().toISOString(),
    }, { onConflict: "cache_key" });
    if (error) {
      console.warn("[Supabase Sync] Audit cache upsert warning:", error.message);
    }
  } catch (err: any) {
    console.warn("[Supabase Sync] Audit cache error:", err.message);
  }
}

export async function getAuditCacheFromSupabase(key: string, maxAgeSeconds: number = 7 * 86400): Promise<any | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("audit_cache")
      .select("data, created_at")
      .eq("cache_key", key)
      .maybeSingle();

    if (error || !data) return null;

    const createdAt = new Date(data.created_at).getTime();
    const ageMs = Date.now() - createdAt;
    const maxAgeMs = maxAgeSeconds * 1000;

    if (ageMs > maxAgeMs) {
      return null;
    }

    return data.data;
  } catch (err: any) {
    console.warn("[Supabase] Audit cache lookup error:", err.message);
    return null;
  }
}

/**
 * Direct Supabase database readers (bypasses serverless container memory isolation)
 */
export async function getUserFromSupabase(email: string): Promise<DbUser | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      password_hash: data.password_hash,
      stripe_customer_id: data.stripe_customer_id,
      plan: data.plan || "free",
      searches_this_month: data.searches_this_month || 0,
      searched_accounts: data.searched_accounts || [],
      search_month_reset: data.search_month_reset || new Date().toISOString(),
      created_at: data.created_at || new Date().toISOString(),
    };
  } catch (err) {
    return null;
  }
}

export async function getUnlockedAuditsFromSupabase(email: string): Promise<string[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  try {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from("unlocked_audits")
      .select("target_username")
      .eq("user_email", cleanEmail);

    if (error || !data) return [];
    return data.map((row: any) => row.target_username.toLowerCase());
  } catch (err) {
    return [];
  }
}

/**
 * Normalizes username (lowercase, trimmed, strip '@')
 */
export function normalizeTargetUsername(raw: string): string {
  let cleaned = raw.replace(/^@/, "").trim().toLowerCase();
  if (cleaned === "lee parsons" || cleaned === "the lee parsons") return "theleeparsons";
  return cleaned.replace(/\s+/g, "");
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
export async function registerUserAsync(
  email: string,
  password?: string
): Promise<{ success: boolean; user?: DbUser; error?: string }> {
  loadVault();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || (!cleanEmail.includes("@") && cleanEmail !== "dev")) {
    return { success: false, error: "Please enter a valid email address or username." };
  }

  if (isBlockedEmail(cleanEmail)) {
    return { success: false, error: "Nah shorty." };
  }

  let existing = memoryVault.users[cleanEmail];
  if (!existing) {
    const dbUser = await getUserFromSupabase(cleanEmail);
    if (dbUser) {
      existing = dbUser;
      memoryVault.users[cleanEmail] = existing;
      memoryVault.usersById[existing.id] = cleanEmail;
    }
  }

  const passwordHash = password ? hashPassword(password) : null;
  const isVip = isVipEmail(cleanEmail);

  if (existing) {
    if (existing.password_hash && cleanEmail !== "dev" && cleanEmail !== "leeparsonsbusiness@gmail.com") {
      if (password && existing.password_hash === passwordHash) {
        return { success: true, user: existing };
      }
      return { success: false, error: "An account with this email already exists. Please switch to Sign In." };
    }
    if (isVip) existing.plan = "unlimited";
    if (passwordHash) {
      existing.password_hash = passwordHash;
    }
    persistVault();
    await syncUserToSupabase(existing);
    return { success: true, user: existing };
  }

  const id = cleanEmail === "leeparsonsbusiness@gmail.com" ? "usr_lee_founder" : `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();
  const resetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const newUser: DbUser = {
    id,
    email: cleanEmail,
    password_hash: passwordHash,
    stripe_customer_id: null,
    plan: isVip ? "unlimited" : "free",
    searches_this_month: 0,
    searched_accounts: [],
    search_month_reset: resetDate,
    created_at: now,
  };

  memoryVault.users[cleanEmail] = newUser;
  memoryVault.usersById[id] = cleanEmail;
  persistVault();
  await syncUserToSupabase(newUser);

  return { success: true, user: newUser };
}

export function registerUser(
  email: string,
  password?: string
): { success: boolean; user?: DbUser; error?: string } {
  loadVault();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || (!cleanEmail.includes("@") && cleanEmail !== "dev")) {
    return { success: false, error: "Please enter a valid email address or username." };
  }

  if (isBlockedEmail(cleanEmail)) {
    return { success: false, error: "Nah shorty." };
  }

  const existing = memoryVault.users[cleanEmail];
  const passwordHash = password ? hashPassword(password) : null;
  const isVip = isVipEmail(cleanEmail);

  if (existing) {
    if (existing.password_hash && cleanEmail !== "dev" && cleanEmail !== "leeparsonsbusiness@gmail.com") {
      return { success: false, error: "An account with this email already exists. Please switch to Sign In." };
    }
    if (isVip) existing.plan = "unlimited";
    if (passwordHash) {
      existing.password_hash = passwordHash;
      persistVault();
    }
    return { success: true, user: existing };
  }

  const id = cleanEmail === "leeparsonsbusiness@gmail.com" ? "usr_lee_founder" : `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();
  const resetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const newUser: DbUser = {
    id,
    email: cleanEmail,
    password_hash: passwordHash,
    stripe_customer_id: null,
    plan: isVip ? "unlimited" : "free",
    searches_this_month: 0,
    searched_accounts: [],
    search_month_reset: resetDate,
    created_at: now,
  };

  memoryVault.users[cleanEmail] = newUser;
  memoryVault.usersById[id] = cleanEmail;
  persistVault();
  syncUserToSupabase(newUser).catch(() => {});

  return { success: true, user: newUser };
}

/**
 * Authenticate a user by email + password / access PIN (Async with cloud Supabase fallback)
 */
export async function authenticateUserAsync(
  email: string,
  password?: string
): Promise<{ success: boolean; user?: DbUser; error?: string }> {
  loadVault();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || (!cleanEmail.includes("@") && cleanEmail !== "dev")) {
    return { success: false, error: "Please enter a valid email address or username." };
  }

  if (isBlockedEmail(cleanEmail)) {
    return { success: false, error: "Nah shorty." };
  }

  let existing = memoryVault.users[cleanEmail];

  // Auto-provision known VIP accounts on-demand if missing in runtime state
  if (!existing && isVipEmail(cleanEmail)) {
    const isLee = cleanEmail === "leeparsonsbusiness@gmail.com";
    const defaultVipPass = isLee ? "332844" : "dev";
    existing = {
      id: isLee ? "usr_lee_founder" : "usr_dev_master",
      email: cleanEmail,
      password_hash: hashPassword(defaultVipPass),
      stripe_customer_id: null,
      plan: "unlimited",
      searches_this_month: 0,
      searched_accounts: [],
      search_month_reset: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    };
    memoryVault.users[cleanEmail] = existing;
    memoryVault.usersById[existing.id] = cleanEmail;
    persistVault();
    await syncUserToSupabase(existing);
  }

  // If not found in memory vault, check Supabase
  if (!existing) {
    const dbUser = await getUserFromSupabase(cleanEmail);
    if (dbUser) {
      existing = dbUser;
      memoryVault.users[cleanEmail] = existing;
      memoryVault.usersById[existing.id] = cleanEmail;
      persistVault();
    }
  }

  if (!existing) {
    return { 
      success: false, 
      error: "No account found with this email. Please switch to the 'Create Account' tab to register." 
    };
  }

  const isVip = isVipEmail(cleanEmail);
  if (isVip) existing.plan = "unlimited";

  if (password && existing.password_hash) {
    const inputHash = hashPassword(password);
    if (inputHash !== existing.password_hash) {
      return { success: false, error: "Incorrect password. Please try again." };
    }
  } else if (password && !existing.password_hash) {
    const passwordHash = hashPassword(password);
    existing.password_hash = passwordHash;
    persistVault();
    await syncUserToSupabase(existing);
  }

  return { success: true, user: existing };
}

export function authenticateUser(
  email: string,
  password?: string
): { success: boolean; user?: DbUser; error?: string } {
  loadVault();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || (!cleanEmail.includes("@") && cleanEmail !== "dev")) {
    return { success: false, error: "Please enter a valid email address or username." };
  }

  if (isBlockedEmail(cleanEmail)) {
    return { success: false, error: "Nah shorty." };
  }

  let existing = memoryVault.users[cleanEmail];

  // Auto-provision known VIP accounts on-demand if missing in runtime state
  if (!existing && isVipEmail(cleanEmail)) {
    const isLee = cleanEmail === "leeparsonsbusiness@gmail.com";
    const defaultVipPass = isLee ? "332844" : "dev";
    existing = {
      id: isLee ? "usr_lee_founder" : "usr_dev_master",
      email: cleanEmail,
      password_hash: hashPassword(defaultVipPass),
      stripe_customer_id: null,
      plan: "unlimited",
      searches_this_month: 0,
      searched_accounts: [],
      search_month_reset: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    };
    memoryVault.users[cleanEmail] = existing;
    memoryVault.usersById[existing.id] = cleanEmail;
    persistVault();
  }

  if (!existing) {
    return { 
      success: false, 
      error: "No account found with this email. Please switch to the 'Create Account' tab to register." 
    };
  }

  const isVip = isVipEmail(cleanEmail);
  if (isVip) existing.plan = "unlimited";

  if (password && existing.password_hash) {
    const inputHash = hashPassword(password);
    if (inputHash !== existing.password_hash) {
      return { success: false, error: "Incorrect password. Please try again." };
    }
  } else if (password && !existing.password_hash) {
    const passwordHash = hashPassword(password);
    existing.password_hash = passwordHash;
    persistVault();
  }

  return { success: true, user: existing };
}

/**
 * Get user by email
 */
export function getUserByEmail(email: string): DbUser | null {
  loadVault();
  return memoryVault.users[email.trim().toLowerCase()] || null;
}

/**
 * Find or create a user by email
 */
export function getOrCreateUser(email: string, stripeCustomerId?: string): DbUser {
  loadVault();
  const cleanEmail = email.trim().toLowerCase();
  const isVip = isVipEmail(cleanEmail);

  const existing = memoryVault.users[cleanEmail];
  if (existing) {
    if (isVip) existing.plan = "unlimited";
    if (stripeCustomerId && !existing.stripe_customer_id) {
      existing.stripe_customer_id = stripeCustomerId;
      persistVault();
    }
    return existing;
  }

  const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();
  const resetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const weekResetDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const newUser: DbUser = {
    id,
    email: cleanEmail,
    stripe_customer_id: stripeCustomerId || null,
    plan: isVip ? "unlimited" : "free",
    searches_this_week: 0,
    searches_this_month: 0,
    searched_accounts: [],
    search_week_reset: weekResetDate,
    search_month_reset: resetDate,
    created_at: now,
  };

  memoryVault.users[cleanEmail] = newUser;
  memoryVault.usersById[id] = cleanEmail;
  persistVault();

  return newUser;
}

/**
 * Update user plan after successful payment/subscription
 */
export function setUserPlan(email: string, plan: UserPlan): DbUser {
  const user = getOrCreateUser(email);
  if (isVipEmail(email)) {
    user.plan = "unlimited";
  } else {
    user.plan = plan;
  }
  // Start fresh weekly period from purchase date
  user.searches_this_week = 0;
  user.search_week_reset = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  persistVault();
  return user;
}

/**
 * Update user plan after successful payment with immediate Supabase cloud persistence
 */
export async function setUserPlanAsync(email: string, plan: UserPlan, stripeCustomerId?: string): Promise<DbUser> {
  const user = getOrCreateUser(email, stripeCustomerId);
  if (isVipEmail(email)) {
    user.plan = "unlimited";
  } else {
    user.plan = plan;
  }
  if (stripeCustomerId) {
    user.stripe_customer_id = stripeCustomerId;
  }
  user.searches_this_week = 0;
  user.search_week_reset = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  persistVault();
  await syncUserToSupabase(user);
  return user;
}

/**
 * Check user plan and usage status (Async with Supabase cloud check)
 */
export async function getUserPlanAndUsageAsync(emailOrUserId: string | null | undefined): Promise<{
  plan: UserPlan;
  searchesUsed: number;
  searchLimit: number;
  resetsAt: string;
  isRestricted: boolean;
  canSearchTarget: (target: string) => boolean;
}> {
  const defaultReset = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  if (!emailOrUserId) {
    return {
      plan: "free",
      searchesUsed: 0,
      searchLimit: 1,
      resetsAt: defaultReset,
      isRestricted: false,
      canSearchTarget: () => true,
    };
  }

  loadVault();
  let email = emailOrUserId.trim().toLowerCase();
  if (!email.includes("@") && memoryVault.usersById[emailOrUserId]) {
    email = memoryVault.usersById[emailOrUserId];
  }

  if (isVipEmail(email)) {
    return {
      plan: "unlimited",
      searchesUsed: 0,
      searchLimit: 999999,
      resetsAt: defaultReset,
      isRestricted: false,
      canSearchTarget: () => true,
    };
  }

  let user = memoryVault.users[email];
  if (!user) {
    const dbUser = await getUserFromSupabase(email);
    if (dbUser) {
      memoryVault.users[email] = dbUser;
      memoryVault.usersById[dbUser.id] = email;
      user = dbUser;
    }
  }

  if (!user) {
    return {
      plan: "free",
      searchesUsed: 0,
      searchLimit: 1,
      resetsAt: defaultReset,
      isRestricted: false,
      canSearchTarget: () => true,
    };
  }

  const plan = user.plan || "free";
  const limit = plan === "unlimited" ? 30 : plan === "standard" ? 10 : 1;
  const searchesUsed = user.searches_this_month || 0;

  return {
    plan,
    searchesUsed,
    searchLimit: limit,
    resetsAt: user.search_month_reset || defaultReset,
    isRestricted: plan !== "unlimited" && !isVipEmail(email) && searchesUsed >= limit,
    canSearchTarget: (_target: string) => {
      if (isVipEmail(email)) return true;
      return searchesUsed < limit;
    },
  };
}

/**
 * Check user plan and usage status
 */
export function getUserPlanAndUsage(emailOrUserId: string | null | undefined): {
  plan: UserPlan;
  searchesUsed: number;
  searchLimit: number;
  resetsAt: string;
  isRestricted: boolean;
  canSearchTarget: (target: string) => boolean;
} {
  const defaultReset = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  if (!emailOrUserId) {
    return {
      plan: "free",
      searchesUsed: 0,
      searchLimit: 1,
      resetsAt: defaultReset,
      isRestricted: false,
      canSearchTarget: () => true,
    };
  }

  loadVault();
  let email = emailOrUserId.trim().toLowerCase();
  if (!email.includes("@") && memoryVault.usersById[emailOrUserId]) {
    email = memoryVault.usersById[emailOrUserId];
  }

  if (isVipEmail(email)) {
    return {
      plan: "unlimited",
      searchesUsed: 0,
      searchLimit: 999999,
      resetsAt: defaultReset,
      isRestricted: false,
      canSearchTarget: () => true,
    };
  }

  const user = memoryVault.users[email];
  if (!user) {
    return {
      plan: "free",
      searchesUsed: 0,
      searchLimit: 1,
      resetsAt: defaultReset,
      isRestricted: false,
      canSearchTarget: () => true,
    };
  }

  // Weekly rolling 7-day reset check from signup/purchase date
  const now = new Date();
  const resetTime = user.search_week_reset ? new Date(user.search_week_reset).getTime() : 0;
  if (resetTime && resetTime < now.getTime()) {
    let nextReset = resetTime;
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    while (nextReset < now.getTime()) {
      nextReset += sevenDaysMs;
    }
    user.searches_this_week = 0;
    user.search_week_reset = new Date(nextReset).toISOString();
    persistVault();
  }

  const plan = user.plan || "free";
  const limit = plan === "unlimited" ? 30 : plan === "standard" ? 10 : 1;
  const searchesUsed = typeof user.searches_this_week === "number" ? user.searches_this_week : (user.searches_this_month || 0);

  return {
    plan,
    searchesUsed,
    searchLimit: limit,
    resetsAt: user.search_week_reset || defaultReset,
    isRestricted: plan !== "unlimited" && !isVipEmail(email) && searchesUsed >= limit,
    canSearchTarget: (_target: string) => {
      if (isVipEmail(email)) return true;
      return searchesUsed < limit;
    },
  };
}

/**
 * Record a search performed by a user
 */
export function recordUserSearch(emailOrUserId: string, targetUsername: string): {
  allowed: boolean;
  searchesUsed: number;
  limit: number;
  plan: UserPlan;
} {
  loadVault();
  const cleanTarget = normalizeTargetUsername(targetUsername);
  let email = emailOrUserId.trim().toLowerCase();
  if (!email.includes("@") && memoryVault.usersById[emailOrUserId]) {
    email = memoryVault.usersById[emailOrUserId];
  }

  if (isVipEmail(email)) {
    return {
      allowed: true,
      searchesUsed: 0,
      limit: 999999,
      plan: "unlimited",
    };
  }

  const user = getOrCreateUser(email);
  if (!user.searched_accounts) user.searched_accounts = [];
  if (typeof user.searches_this_week !== "number") {
    user.searches_this_week = 0;
  }

  // Weekly rolling 7-day reset check from signup/purchase date
  const now = new Date();
  const resetTime = user.search_week_reset ? new Date(user.search_week_reset).getTime() : 0;
  if (resetTime && resetTime < now.getTime()) {
    let nextReset = resetTime;
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    while (nextReset < now.getTime()) {
      nextReset += sevenDaysMs;
    }
    user.searches_this_week = 0;
    user.search_week_reset = new Date(nextReset).toISOString();
  }

  const plan = user.plan || "free";
  const limit = plan === "unlimited" ? 30 : plan === "standard" ? 10 : 1;

  if (user.searches_this_week >= limit) {
    return {
      allowed: false,
      searchesUsed: user.searches_this_week,
      limit,
      plan,
    };
  }

  user.searches_this_week += 1;
  user.searches_this_month = (user.searches_this_month || 0) + 1;
  if (!user.searched_accounts.includes(cleanTarget)) {
    user.searched_accounts.push(cleanTarget);
  }
  persistVault();

  return {
    allowed: true,
    searchesUsed: user.searches_this_week,
    limit,
    plan,
  };
}

/**
 * Unlock full forensic report for a user and target Instagram handle
 */
/**
 * Unlock full forensic report for a user and target Instagram handle (Async with Supabase cloud persistence)
 */
export async function unlockAuditAsync(emailOrUserId: string, targetUsername: string): Promise<boolean> {
  loadVault();
  const cleanTarget = normalizeTargetUsername(targetUsername);
  if (!cleanTarget) return false;

  let email = emailOrUserId.trim().toLowerCase();
  if (!email.includes("@") && memoryVault.usersById[emailOrUserId]) {
    email = memoryVault.usersById[emailOrUserId];
  }

  if (!email) return false;

  const user = getOrCreateUser(email);
  if (user.plan === "free") {
    user.plan = "standard";
  }

  if (!memoryVault.unlockedAudits[email]) {
    memoryVault.unlockedAudits[email] = {};
  }

  memoryVault.unlockedAudits[email][cleanTarget] = new Date().toISOString();
  if (!user.searched_accounts) user.searched_accounts = [];
  if (!user.searched_accounts.includes(cleanTarget)) {
    user.searched_accounts.push(cleanTarget);
    user.searches_this_month = user.searched_accounts.length;
  }

  persistVault();

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await Promise.all([
        supabase.from("unlocked_audits").upsert({
          user_email: email,
          target_username: cleanTarget,
          unlocked_at: new Date().toISOString(),
        }, { onConflict: "user_email,target_username" }),
        syncUserToSupabase(user)
      ]);
    } catch (err: any) {
      console.warn("[Supabase unlockAuditAsync error]:", err.message);
    }
  }

  return true;
}

export function unlockAudit(emailOrUserId: string, targetUsername: string): boolean {
  loadVault();
  const cleanTarget = normalizeTargetUsername(targetUsername);
  if (!cleanTarget) return false;

  let email = emailOrUserId.trim().toLowerCase();
  if (!email.includes("@") && memoryVault.usersById[emailOrUserId]) {
    email = memoryVault.usersById[emailOrUserId];
  }

  if (!email) return false;

  const user = getOrCreateUser(email);
  if (user.plan === "free") {
    user.plan = "standard";
  }

  if (!memoryVault.unlockedAudits[email]) {
    memoryVault.unlockedAudits[email] = {};
  }

  memoryVault.unlockedAudits[email][cleanTarget] = new Date().toISOString();
  if (!user.searched_accounts) user.searched_accounts = [];
  if (!user.searched_accounts.includes(cleanTarget)) {
    user.searched_accounts.push(cleanTarget);
    user.searches_this_month = user.searched_accounts.length;
  }

  persistVault();
  syncUnlockedAuditToSupabase(email, cleanTarget).catch(() => {});
  syncUserToSupabase(user).catch(() => {});
  return true;
}

/**
 * Check if a specific Instagram audit is unlocked for a user (Async with Supabase cloud query)
 */
export async function isAuditUnlockedAsync(
  emailOrUserId: string | null | undefined,
  targetUsername: string
): Promise<boolean> {
  if (!emailOrUserId) return false;
  loadVault();
  const cleanTarget = normalizeTargetUsername(targetUsername);
  if (!cleanTarget) return false;

  let email = emailOrUserId.trim().toLowerCase();
  if (!email.includes("@") && memoryVault.usersById[emailOrUserId]) {
    email = memoryVault.usersById[emailOrUserId];
  }

  if (isVipEmail(email)) {
    return true; // VIP access unlocked for all profiles
  }

  // 1. In-memory check
  if (memoryVault.unlockedAudits[email]?.[cleanTarget]) {
    return true;
  }
  const memUser = memoryVault.users[email];
  if (memUser && memUser.plan === "unlimited") {
    return true;
  }

  // 2. Supabase Cloud Check
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      // Check user plan in Supabase
      const dbUser = await getUserFromSupabase(email);
      if (dbUser) {
        memoryVault.users[email] = dbUser;
        memoryVault.usersById[dbUser.id] = email;
        if (dbUser.plan === "unlimited") {
          return true;
        }
      }

      // Check unlocked_audits table
      const { data, error } = await supabase
        .from("unlocked_audits")
        .select("id")
        .eq("user_email", email)
        .eq("target_username", cleanTarget)
        .maybeSingle();

      if (!error && data) {
        if (!memoryVault.unlockedAudits[email]) memoryVault.unlockedAudits[email] = {};
        memoryVault.unlockedAudits[email][cleanTarget] = new Date().toISOString();
        return true;
      }
    } catch (err: any) {
      console.warn("[Supabase isAuditUnlockedAsync error]:", err.message);
    }
  }

  return false;
}

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

  if (isVipEmail(email)) {
    return true; // VIP access unlocked for all profiles
  }

  const user = memoryVault.users[email];
  if (user && user.plan === "unlimited") {
    return true; // Unlimited plan users have access to all profiles
  }

  const userAudits = memoryVault.unlockedAudits[email];
  return Boolean(userAudits && userAudits[cleanTarget]);
}

/**
 * Get all unlocked target usernames for a user (Async with Supabase cloud query)
 */
export async function getUserUnlockedAuditsAsync(emailOrUserId: string): Promise<string[]> {
  if (!emailOrUserId) return [];
  loadVault();
  let email = emailOrUserId.trim().toLowerCase();
  if (!email.includes("@") && memoryVault.usersById[emailOrUserId]) {
    email = memoryVault.usersById[emailOrUserId];
  }

  if (isVipEmail(email)) {
    return ["* (VIP Unlimited Access)"];
  }

  const memoryAudits = Object.keys(memoryVault.unlockedAudits[email] || {});
  const supabaseAudits = await getUnlockedAuditsFromSupabase(email);

  const combined = Array.from(new Set([...memoryAudits, ...supabaseAudits]));
  if (combined.length > 0) {
    if (!memoryVault.unlockedAudits[email]) memoryVault.unlockedAudits[email] = {};
    for (const t of combined) {
      if (!memoryVault.unlockedAudits[email][t]) {
        memoryVault.unlockedAudits[email][t] = new Date().toISOString();
      }
    }
  }

  return combined;
}

export function getUserUnlockedAudits(emailOrUserId: string): string[] {
  if (!emailOrUserId) return [];
  loadVault();
  let email = emailOrUserId.trim().toLowerCase();
  if (!email.includes("@") && memoryVault.usersById[emailOrUserId]) {
    email = memoryVault.usersById[emailOrUserId];
  }

  if (isVipEmail(email)) {
    return ["* (VIP Unlimited Access)"];
  }

  const userAudits = memoryVault.unlockedAudits[email];
  if (!userAudits) return [];

  return Object.keys(userAudits);
}

/**
 * Record an audit in user search history
 */
export function recordAuditHistory(
  emailOrUserId: string,
  entry: {
    username: string;
    name?: string;
    avatar?: string;
    targetType?: "following" | "followers";
  }
): void {
  loadVault();
  let email = emailOrUserId.trim().toLowerCase();
  if (!email.includes("@") && memoryVault.usersById[emailOrUserId]) {
    email = memoryVault.usersById[emailOrUserId];
  }

  if (!email) return;

  if (!memoryVault.auditHistory) memoryVault.auditHistory = {};
  if (!memoryVault.auditHistory[email]) memoryVault.auditHistory[email] = [];

  const cleanTarget = normalizeTargetUsername(entry.username);
  const isUnlocked = isAuditUnlocked(email, cleanTarget);

  const historyList = memoryVault.auditHistory[email];
  const filtered = historyList.filter((item) => item.username.toLowerCase() !== cleanTarget);

  filtered.unshift({
    id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    username: cleanTarget,
    name: entry.name || cleanTarget,
    avatar: entry.avatar || `/api/proxy-image?url=https%3A%2F%2Fui-avatars.com%2Fapi%2F%3Fname%3D${encodeURIComponent(cleanTarget)}%26background%3D0284c7%26color%3Dfff`,
    isUnlocked,
    timestamp: new Date().toISOString(),
    targetType: entry.targetType || "following",
  });

  memoryVault.auditHistory[email] = filtered.slice(0, 50);
  persistVault();
  syncSearchHistoryToSupabase({
    user_email: email,
    target_username: cleanTarget,
    target_name: entry.name || cleanTarget,
    target_avatar: entry.avatar,
    is_unlocked: isUnlocked,
    target_type: entry.targetType,
  }).catch(() => {});
}

/**
 * Get user audit history
 */
export function getUserAuditHistory(emailOrUserId: string): AuditHistoryEntry[] {
  if (!emailOrUserId) return [];
  loadVault();
  let email = emailOrUserId.trim().toLowerCase();
  if (!email.includes("@") && memoryVault.usersById[emailOrUserId]) {
    email = memoryVault.usersById[emailOrUserId];
  }

  if (!memoryVault.auditHistory || !memoryVault.auditHistory[email]) {
    return [];
  }

  return memoryVault.auditHistory[email].map((item) => ({
    ...item,
    isUnlocked: isAuditUnlocked(email, item.username),
  }));
}

/**
 * Record a Follows Snapshot and calculate diff against previous snapshot
 */
export function recordFollowsSnapshot(
  targetUsername: string,
  targetType: string,
  currentList: string[]
): DiffResult {
  loadVault();
  const cleanTarget = normalizeTargetUsername(targetUsername);
  const key = `${cleanTarget}:${targetType}`;
  const now = new Date().toISOString();

  if (!memoryVault.followsSnapshots) {
    memoryVault.followsSnapshots = {};
  }

  const history = memoryVault.followsSnapshots[key] || [];
  const previousSnapshot = history.length > 0 ? history[history.length - 1] : null;

  const currentSet = new Set(currentList.map((u) => u.toLowerCase().replace(/^@/, "")));

  let newFollows: string[] = [];
  let unfollowed: string[] = [];
  let isBaseline = false;
  let baselineTimestamp = previousSnapshot?.timestamp;

  if (!previousSnapshot) {
    // First time this account is audited -> Create baseline
    isBaseline = true;
    newFollows = [];
    unfollowed = [];
  } else {
    const prevSet = new Set(previousSnapshot.usernames.map((u) => u.toLowerCase().replace(/^@/, "")));

    // Detect new follows: accounts in current scrape that were not in previous snapshot
    if (previousSnapshot.usernames.length <= 50 && currentList.length > 100) {
      // Upgraded from preview (e.g. 25) to full scrape (e.g. 500)
      // Compare the top slice to avoid false positives across older accounts
      newFollows = currentList
        .slice(0, previousSnapshot.usernames.length)
        .filter((u) => !prevSet.has(u.toLowerCase().replace(/^@/, "")));
    } else {
      newFollows = currentList.filter((u) => !prevSet.has(u.toLowerCase().replace(/^@/, "")));
    }

    // Only detect unfollows if the current scrape is comparable in size to the previous snapshot
    // to prevent small preview scrapes from falsely marking full-list accounts as unfollowed
    if (currentList.length >= previousSnapshot.usernames.length * 0.8) {
      unfollowed = previousSnapshot.usernames.filter((u) => !currentSet.has(u.toLowerCase().replace(/^@/, "")));
    } else {
      unfollowed = [];
    }
  }

  // Push new snapshot to history (keep last 20 snapshots)
  history.push({
    targetUsername: cleanTarget,
    targetType,
    usernames: currentList,
    timestamp: now,
  });

  memoryVault.followsSnapshots[key] = history.slice(-20);
  persistVault();
  syncSnapshotToSupabase(cleanTarget, targetType, currentList).catch(() => {});

  return {
    newFollows,
    unfollowed,
    isBaseline,
    baselineTimestamp,
    baselineCount: previousSnapshot ? previousSnapshot.usernames.length : currentList.length,
  };
}

/**
 * Get the latest Snapshot Diff for an account without writing a new snapshot
 */
export function getFollowsDiff(
  targetUsername: string,
  targetType: string,
  currentList: string[]
): DiffResult {
  loadVault();
  const cleanTarget = normalizeTargetUsername(targetUsername);
  const key = `${cleanTarget}:${targetType}`;

  if (!memoryVault.followsSnapshots || !memoryVault.followsSnapshots[key] || memoryVault.followsSnapshots[key].length === 0) {
    return {
      newFollows: [],
      unfollowed: [],
      isBaseline: true,
      baselineCount: currentList.length,
    };
  }

  const history = memoryVault.followsSnapshots[key];
  const previousSnapshot = history[history.length - 1];
  const prevSet = new Set(previousSnapshot.usernames.map((u) => u.toLowerCase().replace(/^@/, "")));
  const currentSet = new Set(currentList.map((u) => u.toLowerCase().replace(/^@/, "")));

  const newFollows = currentList.filter((u) => !prevSet.has(u.toLowerCase().replace(/^@/, "")));
  const unfollowed = previousSnapshot.usernames.filter((u) => !currentSet.has(u.toLowerCase().replace(/^@/, "")));

  return {
    newFollows,
    unfollowed,
    isBaseline: false,
    baselineTimestamp: previousSnapshot.timestamp,
    baselineCount: previousSnapshot.usernames.length,
  };
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
 * Get cached audit data with expiration check (60s anti-spam debounce window)
 */
export function getAuditCache(
  targetUsername: string,
  auditType: string,
  maxAgeSeconds: number = 60
): any | null {
  loadVault();
  const cleanTarget = normalizeTargetUsername(targetUsername);
  const key = `${cleanTarget}:${auditType}`;

  const entry = memoryVault.auditCache[key];
  if (entry && entry.data_json) {
    try {
      const createdAt = new Date(entry.created_at).getTime();
      const ageMs = Date.now() - createdAt;
      const maxAgeMs = maxAgeSeconds * 1000;

      if (ageMs > maxAgeMs) {
        return null; // Expired cache -> trigger fresh live scan
      }

      return JSON.parse(entry.data_json);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Async persistent audit cache getter with 7-day default TTL
 * Checks memoryVault first, then falls back to Supabase audit_cache table.
 */
export async function getAuditCacheAsync(
  targetUsername: string,
  auditType: string,
  maxAgeSeconds: number = 7 * 86400 // Default 7 days
): Promise<any | null> {
  const cleanTarget = normalizeTargetUsername(targetUsername);
  const key = `${cleanTarget}:${auditType}`;

  // 1. Check in-memory vault first
  const memoryEntry = getAuditCache(cleanTarget, auditType, maxAgeSeconds);
  if (memoryEntry) {
    return memoryEntry;
  }

  // 2. Fall back to shared Supabase audit_cache
  const sbData = await getAuditCacheFromSupabase(key, maxAgeSeconds);
  if (sbData) {
    loadVault();
    memoryVault.auditCache[key] = {
      data_json: JSON.stringify(sbData),
      created_at: new Date().toISOString(),
    };
    return sbData;
  }

  return null;
}

/**
 * Async persistent audit cache saver
 * Saves to local memoryVault and writes to Supabase audit_cache table.
 */
export async function saveAuditCacheAsync(
  targetUsername: string,
  auditType: string,
  data: any
): Promise<void> {
  const cleanTarget = normalizeTargetUsername(targetUsername);
  const key = `${cleanTarget}:${auditType}`;

  saveAuditCache(cleanTarget, auditType, data);
  await syncAuditCacheToSupabase(key, data);
}

/**
 * Clear cached audit entries
 */
export function clearAuditCache(targetUsername?: string): void {
  loadVault();
  if (targetUsername) {
    const cleanTarget = normalizeTargetUsername(targetUsername);
    delete memoryVault.auditCache[`${cleanTarget}:following`];
    delete memoryVault.auditCache[`${cleanTarget}:followers`];
  } else {
    memoryVault.auditCache = {};
  }
  persistVault();
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

/**
 * Add an Instagram account to active radar tracking
 */
export function addTrackedTarget(
  emailOrUserId: string,
  targetUsername: string,
  frequencyHours: number = 12,
  targetType: "following" | "followers" | "both" = "following",
  meta?: { avatarUrl?: string; fullName?: string; followersCount?: number; followingCount?: number }
): { success: boolean; target?: TrackedTarget; error?: string } {
  loadVault();
  const cleanTarget = normalizeTargetUsername(targetUsername);
  if (!cleanTarget) {
    return { success: false, error: "Invalid target username." };
  }

  let email = emailOrUserId.trim().toLowerCase();
  if (!email.includes("@") && memoryVault.usersById[emailOrUserId]) {
    email = memoryVault.usersById[emailOrUserId];
  }

  if (!email) {
    return { success: false, error: "User authentication required." };
  }

  const user = getOrCreateUser(email);
  const isVip = isVipEmail(email);
  const plan = isVip ? "unlimited" : user.plan || "free";
  const targetLimit = plan === "unlimited" ? 999999 : plan === "standard" ? 3 : 1;

  if (!memoryVault.trackedTargets) {
    memoryVault.trackedTargets = {};
  }

  const key = `${email}:${cleanTarget}`;
  const existing = memoryVault.trackedTargets[key];
  if (existing) {
    existing.status = "active";
    if (meta?.avatarUrl) existing.avatarUrl = meta.avatarUrl;
    if (meta?.fullName) existing.fullName = meta.fullName;
    if (meta?.followersCount !== undefined) existing.lastKnownFollowerCount = meta.followersCount;
    if (meta?.followingCount !== undefined) existing.lastKnownFollowingCount = meta.followingCount;
    persistVault();
    return { success: true, target: existing };
  }

  // Count active targets for this user
  const userTargets = Object.values(memoryVault.trackedTargets).filter(
    (t) => t.userEmail === email && t.status === "active"
  );

  if (userTargets.length >= targetLimit) {
    return {
      success: false,
      error: `You have reached your tracking limit (${targetLimit} account${targetLimit > 1 ? "s" : ""}) on the ${plan.toUpperCase()} plan. Upgrade to unlock more monitored targets.`,
    };
  }

  const now = new Date();
  const nextScan = new Date(now.getTime() + frequencyHours * 60 * 60 * 1000).toISOString();

  const newTarget: TrackedTarget = {
    id: `tgt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    userEmail: email,
    targetUsername: cleanTarget,
    targetType,
    status: "active",
    frequencyHours,
    lastScannedAt: now.toISOString(),
    nextScanAt: nextScan,
    totalNewFollowsDetected: 0,
    totalUnfollowsDetected: 0,
    lastKnownFollowerCount: meta?.followersCount,
    lastKnownFollowingCount: meta?.followingCount,
    avatarUrl: meta?.avatarUrl,
    fullName: meta?.fullName,
    createdAt: now.toISOString(),
  };

  memoryVault.trackedTargets[key] = newTarget;
  persistVault();

  return { success: true, target: newTarget };
}

/**
 * Get all tracked targets for a user
 */
export function getTrackedTargets(emailOrUserId: string): TrackedTarget[] {
  if (!emailOrUserId) return [];
  loadVault();

  let email = emailOrUserId.trim().toLowerCase();
  if (!email.includes("@") && memoryVault.usersById[emailOrUserId]) {
    email = memoryVault.usersById[emailOrUserId];
  }

  if (!memoryVault.trackedTargets) return [];

  return Object.values(memoryVault.trackedTargets).filter(
    (t) => t.userEmail === email
  );
}

/**
 * Remove a tracked target
 */
export function removeTrackedTarget(emailOrUserId: string, targetUsername: string): boolean {
  loadVault();
  const cleanTarget = normalizeTargetUsername(targetUsername);
  let email = emailOrUserId.trim().toLowerCase();
  if (!email.includes("@") && memoryVault.usersById[emailOrUserId]) {
    email = memoryVault.usersById[emailOrUserId];
  }

  const key = `${email}:${cleanTarget}`;
  if (memoryVault.trackedTargets && memoryVault.trackedTargets[key]) {
    delete memoryVault.trackedTargets[key];
    persistVault();
    return true;
  }
  return false;
}

/**
 * Get all active targets across all users due for automated scan
 */
export function getAllActiveTargetsDueForScan(): TrackedTarget[] {
  loadVault();
  if (!memoryVault.trackedTargets) return [];

  const now = Date.now();
  const targets = Object.values(memoryVault.trackedTargets).filter((t) => {
    if (t.status !== "active") return false;
    const nextScanTime = new Date(t.nextScanAt).getTime();
    return !t.nextScanAt || nextScanTime <= now;
  });

  return targets;
}

/**
 * Update target scan state
 */
export function updateTrackedTarget(
  userEmail: string,
  targetUsername: string,
  updates: Partial<TrackedTarget>
): void {
  loadVault();
  const cleanTarget = normalizeTargetUsername(targetUsername);
  const cleanEmail = userEmail.trim().toLowerCase();
  const key = `${cleanEmail}:${cleanTarget}`;

  if (memoryVault.trackedTargets && memoryVault.trackedTargets[key]) {
    memoryVault.trackedTargets[key] = {
      ...memoryVault.trackedTargets[key],
      ...updates,
    };
    persistVault();
  }
}

/**
 * Record Radar Activity Events (New follows, unfollows)
 */
export function recordActivityEvents(
  targetUsername: string,
  events: RadarActivityEvent[]
): void {
  if (!events || events.length === 0) return;
  loadVault();
  const cleanTarget = normalizeTargetUsername(targetUsername);

  if (!memoryVault.activityEvents) {
    memoryVault.activityEvents = {};
  }

  const existing = memoryVault.activityEvents[cleanTarget] || [];
  const combined = [...events, ...existing];

  // De-duplicate by id or (subjectUsername + eventType + detectedAt)
  const seen = new Set<string>();
  const deduped: RadarActivityEvent[] = [];

  for (const ev of combined) {
    const key = `${ev.eventType}:${ev.subjectUsername}:${ev.detectedAt.substring(0, 13)}`; // 1-hour window dedup
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(ev);
    }
  }

  // Keep last 200 activity events
  memoryVault.activityEvents[cleanTarget] = deduped.slice(0, 200);
  persistVault();
}

/**
 * Get Activity Timeline Events for a Target
 */
export function getTargetActivityEvents(
  targetUsername: string,
  limit: number = 50
): RadarActivityEvent[] {
  loadVault();
  const cleanTarget = normalizeTargetUsername(targetUsername);
  if (!memoryVault.activityEvents || !memoryVault.activityEvents[cleanTarget]) {
    return [];
  }
  return memoryVault.activityEvents[cleanTarget].slice(0, limit);
}

