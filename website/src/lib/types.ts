/**
 * Shared Client & Server Types & Helpers
 */

export type UserPlan = "free" | "standard" | "unlimited";

export const VIP_ADMIN_EMAILS = ["leeparsonsbusiness@gmail.com"];
export const BLOCKED_EMAILS = ["jyacinda@gmail.com"];

export function isVipEmail(email?: string | null): boolean {
  if (!email) return false;
  return VIP_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export function isBlockedEmail(email?: string | null): boolean {
  if (!email) return false;
  return BLOCKED_EMAILS.includes(email.trim().toLowerCase());
}

export interface AuditHistoryEntry {
  id: string;
  username: string;
  name: string;
  avatar: string;
  isUnlocked: boolean;
  timestamp: string;
  targetType: "following" | "followers";
}
