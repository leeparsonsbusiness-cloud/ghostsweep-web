/**
 * Shared Client & Server Types & Helpers
 */

export type UserPlan = "free" | "standard" | "unlimited";

export const VIP_ADMIN_EMAILS = [
  "leeparsonsbusiness@gmail.com",
  "dev",
  "dev@ghostsweep.info"
];
export const BLOCKED_EMAILS = ["jyacinda@gmail.com"];

export function isVipEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return VIP_ADMIN_EMAILS.includes(clean) || clean === "dev";
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

export interface TrackedTarget {
  id: string;
  userEmail: string;
  targetUsername: string;
  targetType: "following" | "followers" | "both";
  status: "active" | "paused";
  frequencyHours: number;
  lastScannedAt: string | null;
  nextScanAt: string;
  totalNewFollowsDetected: number;
  totalUnfollowsDetected: number;
  lastKnownFollowerCount?: number;
  lastKnownFollowingCount?: number;
  avatarUrl?: string;
  fullName?: string;
  createdAt: string;
}

export interface RadarActivityEvent {
  id: string;
  targetUsername: string;
  eventType: "NEW_FOLLOW" | "UNFOLLOW" | "MUTUAL_CHANGE";
  subjectUsername: string;
  subjectName: string;
  subjectAvatar: string;
  subjectGender: "female" | "male" | "brand" | "bot" | "other";
  isBrand: boolean;
  isVerified: boolean;
  detectedAt: string;
  timeWindowFormatted: string;
}

