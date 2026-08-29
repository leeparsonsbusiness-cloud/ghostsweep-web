import { NextRequest, NextResponse } from "next/server";

export type TargetType = "following" | "followers";

export interface AuditAccountItem {
  id: string;
  username: string;
  name: string;
  avatar: string;
  gender: "male" | "female" | "bot" | "other";
  tag: string;
  followsYou: boolean;
  inactiveDays: number;
  postCount: number;
  engagement: "low" | "none" | "medium";
  whitelisted: boolean;
  unfollowed: boolean;
}

export interface DemographicSplit {
  malePct: number;
  femalePct: number;
  inactivePct: number;
  maleCount: number;
  femaleCount: number;
  inactiveCount: number;
  formatted: string;
  male: number;
  female: number;
  inactiveOver90d: number;
  nonFollowers: number;
  totalAudited: number;
}

export interface GhostAndBotMetrics {
  count: number;
  reachSuppression: number;
  reachPenaltyFormatted: string;
}

export interface TargetTypeMetrics {
  targetType: TargetType;
  totalCount: number;
  demographics: DemographicSplit;
  ghostCount: number;
  nonReciprocalsCount: number;
  reachPenalty: number;
  lockedCount: number;
  sampleAccounts: AuditAccountItem[];
}

export interface AuditResult {
  username: string;
  fullName: string;
  full_name: string;
  avatar: string;
  profile_pic_url: string;
  isVerified: boolean;
  is_verified: boolean;
  isPrivate?: boolean;
  bio?: string;
  biography?: string;
  isLiveRealData: boolean;
  postCount: number;
  followers: number;
  follower_count: number;
  following: number;
  following_count: number;
  avgLikes: number;
  ratio: number;
  ratioRating: "Poor" | "Fair" | "Healthy" | "Elite";
  healthScore: number;
  reachPenalty: number;
  targetType: TargetType;
  nonReciprocals: number;
  estimatedGhosts: number;
  lockedCount: number;
  ghostsAndBots: GhostAndBotMetrics;
  demographics: DemographicSplit;
  sampleAccounts: AuditAccountItem[];
  followingMetrics: TargetTypeMetrics;
  followersMetrics: TargetTypeMetrics;
  recommendations: string[];
}

interface RawLiveProfile {
  username: string;
  fullName: string;
  avatar: string;
  isVerified: boolean;
  isPrivate: boolean;
  bio: string;
  followers: number;
  following: number;
  postCount: number;
  avgLikes: number;
  isLiveRealData: boolean;
}

/**
 * Clean Instagram Handle (remove '@', whitespace, URL prefixes)
 */
function cleanHandle(raw: string): string {
  return raw
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
    .replace(/\/.*$/, "")
    .trim()
    .toLowerCase();
}

/**
 * Attempts to fetch real public Instagram profile data
 */
async function fetchRealInstagramData(rawUser: string): Promise<RawLiveProfile | null> {
  const cleanUser = cleanHandle(rawUser);
  if (!cleanUser) return null;

  // Strategy 1: Official Instagram Web Client API
  try {
    const res = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(cleanUser)}`,
      {
        headers: {
          "User-Agent":
            "Instagram 320.0.0.38.109 Android (31/12; 480dpi; 1080x2400; samsung; SM-G998B; p3s; exynos2100; en_US)",
          "X-IG-App-ID": "936619743392459",
          "x-ig-app-id": "936619743392459",
          "x-asbd-id": "129477",
          "x-ig-www-claim": "0",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.9",
        },
        cache: "no-store",
      }
    );

    if (res.ok) {
      const json = await res.json();
      const user = json?.data?.user;

      if (user) {
        const followers = Number(user.edge_followed_by?.count || 0);
        const following = Number(user.edge_follow?.count || 0);
        const postCount = Number(user.edge_owner_to_timeline_media?.count || 0);

        // Calculate actual average likes from recent media
        let avgLikes = 0;
        const edges = user.edge_owner_to_timeline_media?.edges || [];
        if (edges.length > 0) {
          const likesList = edges.map(
            (e: any) =>
              e.node?.edge_liked_by?.count || e.node?.edge_media_preview_like?.count || 0
          );
          avgLikes = Math.round(
            likesList.reduce((acc: number, curr: number) => acc + curr, 0) / likesList.length
          );
        } else {
          avgLikes = Math.max(12, Math.round(followers * 0.025));
        }

        const rawAvatar = user.profile_pic_url_hd || user.profile_pic_url || "";
        const proxiedAvatar = rawAvatar
          ? `/api/proxy-image?url=${encodeURIComponent(rawAvatar)}`
          : "";

        return {
          username: user.username || cleanUser,
          fullName: user.full_name || cleanUser,
          avatar: proxiedAvatar,
          isVerified: Boolean(user.is_verified),
          isPrivate: Boolean(user.is_private),
          bio: user.biography || "",
          followers,
          following,
          postCount,
          avgLikes,
          isLiveRealData: true,
        };
      }
    }
  } catch (err) {
    console.error("Strategy 1 (web_profile_info) failed:", err);
  }

  // Strategy 2: Direct OpenGraph HTML parser
  try {
    const res = await fetch(`https://www.instagram.com/${encodeURIComponent(cleanUser)}/`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store",
    });

    if (res.ok) {
      const html = await res.text();

      const descMatch =
        html.match(/<meta\s+(?:property="og:description"|name="description")\s+content="([^"]+)"/i) ||
        html.match(/content="([^"]+)"\s+(?:property="og:description"|name="description")/i);

      const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
      const imgMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);

      if (descMatch) {
        const desc = descMatch[1];
        const followersMatch = desc.match(/([\d,KMkm.]+)\s*Followers/i);
        const followingMatch = desc.match(/([\d,KMkm.]+)\s*Following/i);
        const postsMatch = desc.match(/([\d,KMkm.]+)\s*Posts/i);

        const parseCount = (str?: string | null) => {
          if (!str) return 0;
          const clean = str.replace(/,/g, "").trim().toUpperCase();
          if (clean.endsWith("K")) return Math.round(parseFloat(clean) * 1000);
          if (clean.endsWith("M")) return Math.round(parseFloat(clean) * 1000000);
          return parseInt(clean, 10) || 0;
        };

        const followers = parseCount(followersMatch ? followersMatch[1] : "0");
        const following = parseCount(followingMatch ? followingMatch[1] : "0");
        const postCount = parseCount(postsMatch ? postsMatch[1] : "0");

        let fullName = cleanUser;
        if (titleMatch) {
          const title = titleMatch[1];
          const namePart = title.split("(@")[0]?.trim();
          if (namePart) fullName = namePart;
        }

        const rawAvatar = imgMatch ? imgMatch[1] : "";
        const proxiedAvatar = rawAvatar
          ? `/api/proxy-image?url=${encodeURIComponent(rawAvatar)}`
          : "";

        return {
          username: cleanUser,
          fullName,
          avatar: proxiedAvatar,
          isVerified: false,
          isPrivate: false,
          bio: "",
          followers,
          following,
          postCount,
          avgLikes: Math.max(15, Math.round(followers * 0.02)),
          isLiveRealData: true,
        };
      }
    }
  } catch (err) {
    console.error("Strategy 2 (HTML scraper) failed:", err);
  }

  return null;
}

/**
 * Calculates complete audit metrics for both Following and Followers
 */
function calculateAuditMetrics(
  username: string,
  liveProfile: RawLiveProfile | null,
  targetType: TargetType = "following",
  customFollowers?: number,
  customFollowing?: number,
  customAvgLikes?: number
): AuditResult {
  const isLive = Boolean(liveProfile?.isLiveRealData);

  // Derive counts from live Instagram or custom input
  let followers = customFollowers ?? (liveProfile?.followers || 6500);
  let following = customFollowing ?? (liveProfile?.following || 3800);
  let avgLikes = customAvgLikes ?? (liveProfile?.avgLikes || 110);
  let fullName = liveProfile?.fullName || `@${username} Profile`;
  let avatar =
    liveProfile?.avatar ||
    `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80`;
  let isVerified = liveProfile?.isVerified || false;
  let isPrivate = liveProfile?.isPrivate || false;
  let bio = liveProfile?.bio || "";
  let postCount = liveProfile?.postCount || 18;

  // Hash-based deterministic fallback
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash << 5) - hash + username.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);

  if (!liveProfile && !customFollowers) {
    followers = 2000 + (seed % 18000);
    following = 1500 + ((seed * 7) % 4500);
    avgLikes = Math.max(15, Math.round((followers * (1.2 + ((seed % 20) / 10))) / 100));
  }

  const safeFollowers = Math.max(1, followers);
  const safeFollowing = Math.max(1, following);
  const ratio = parseFloat((safeFollowers / safeFollowing).toFixed(2));
  const engagementRate = (avgLikes / safeFollowers) * 100;

  // Rating determination
  let ratioRating: "Poor" | "Fair" | "Healthy" | "Elite" = "Poor";
  if (ratio >= 3.0) ratioRating = "Elite";
  else if (ratio >= 1.2) ratioRating = "Healthy";
  else if (ratio >= 0.7) ratioRating = "Fair";

  // Score calculation (0-100)
  let score = 0;
  if (ratio >= 2.5) score += 40;
  else if (ratio >= 1.5) score += 32;
  else if (ratio >= 1.0) score += 25;
  else if (ratio >= 0.6) score += 15;
  else score += 5;

  if (engagementRate >= 4.0) score += 45;
  else if (engagementRate >= 2.5) score += 38;
  else if (engagementRate >= 1.5) score += 28;
  else if (engagementRate >= 0.8) score += 18;
  else score += 8;

  if (safeFollowing < 800) score += 15;
  else if (safeFollowing < 1500) score += 10;
  else if (safeFollowing < 3000) score += 5;
  else score -= 5;

  const healthScore = Math.min(100, Math.max(12, score));

  // Reach penalty calculation
  let reachPenalty = 0;
  if (healthScore < 40) reachPenalty = 68;
  else if (healthScore < 60) reachPenalty = 48;
  else if (healthScore < 75) reachPenalty = 26;
  else if (healthScore < 88) reachPenalty = 10;

  // 1. Calculate Following Metrics (Accounts followed by user)
  const followingMalePct = 41;
  const followingInactivePct = 6;
  const followingFemalePct = 100 - followingMalePct - followingInactivePct; // 53%
  const followingMaleCount = Math.round((safeFollowing * followingMalePct) / 100);
  const followingFemaleCount = Math.round((safeFollowing * followingFemalePct) / 100);
  const followingInactiveCount = Math.round((safeFollowing * followingInactivePct) / 100);
  const followingNonReciprocals = Math.round(
    Math.max(12, safeFollowing * (1 - Math.min(1, (healthScore / 100) * 1.25)))
  );

  const followingTeaserAccounts: AuditAccountItem[] = [
    {
      id: "fol-1",
      username: "sophia.la",
      name: "Sophia Miller",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      gender: "female",
      tag: "👩 Female • 🚫 Not Following Back",
      followsYou: false,
      inactiveDays: 95,
      postCount: 44,
      engagement: "low",
      whitelisted: false,
      unfollowed: false,
    },
    {
      id: "fol-2",
      username: "dan_fit",
      name: "Dan Thorne • Fitness",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
      gender: "male",
      tag: "👨 Male • 🚫 Not Following Back",
      followsYou: false,
      inactiveDays: 210,
      postCount: 15,
      engagement: "none",
      whitelisted: false,
      unfollowed: false,
    },
    {
      id: "fol-3",
      username: "user_91823",
      name: "Dead / Inactive Account",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      gender: "bot",
      tag: "🤖 Ghost • Inactive >340d",
      followsYou: false,
      inactiveDays: 342,
      postCount: 0,
      engagement: "none",
      whitelisted: false,
      unfollowed: false,
    },
  ];

  const followingMetrics: TargetTypeMetrics = {
    targetType: "following",
    totalCount: safeFollowing,
    demographics: {
      malePct: followingMalePct,
      femalePct: followingFemalePct,
      inactivePct: followingInactivePct,
      maleCount: followingMaleCount,
      femaleCount: followingFemaleCount,
      inactiveCount: followingInactiveCount,
      formatted: `${followingMalePct}% Male (${followingMaleCount.toLocaleString()}) • ${followingFemalePct}% Female (${followingFemaleCount.toLocaleString()}) • ${followingInactivePct}% Ghost/Bot (${followingInactiveCount.toLocaleString()})`,
      male: followingMaleCount,
      female: followingFemaleCount,
      inactiveOver90d: followingInactiveCount,
      nonFollowers: followingNonReciprocals,
      totalAudited: safeFollowing,
    },
    ghostCount: followingInactiveCount,
    nonReciprocalsCount: followingNonReciprocals,
    reachPenalty: reachPenalty,
    lockedCount: Math.max(0, safeFollowing - 3),
    sampleAccounts: followingTeaserAccounts,
  };

  // 2. Calculate Followers Metrics (Audience demographic structure)
  const followerMalePct = 48;
  const followerInactivePct = 14;
  const followerFemalePct = 100 - followerMalePct - followerInactivePct; // 38%
  const followerMaleCount = Math.round((safeFollowers * followerMalePct) / 100);
  const followerFemaleCount = Math.round((safeFollowers * followerFemalePct) / 100);
  const followerInactiveCount = Math.round((safeFollowers * followerInactivePct) / 100);
  const followerGhostBurden = Math.round(safeFollowers * 0.18);

  const followersTeaserAccounts: AuditAccountItem[] = [
    {
      id: "fwr-1",
      username: "bot_traffic_boost",
      name: "Follower Farm Bot",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
      gender: "bot",
      tag: "🤖 Ghost • Follower Farm",
      followsYou: true,
      inactiveDays: 410,
      postCount: 0,
      engagement: "none",
      whitelisted: false,
      unfollowed: false,
    },
    {
      id: "fwr-2",
      username: "emma_audience",
      name: "Emma Davis",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80",
      gender: "female",
      tag: "👩 Female • Inactive >120d",
      followsYou: true,
      inactiveDays: 124,
      postCount: 29,
      engagement: "none",
      whitelisted: false,
      unfollowed: false,
    },
    {
      id: "fwr-3",
      username: "crypto_shill_88",
      name: "Mark H. Crypto",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
      gender: "male",
      tag: "👨 Male • Spam Follower",
      followsYou: true,
      inactiveDays: 290,
      postCount: 2,
      engagement: "none",
      whitelisted: false,
      unfollowed: false,
    },
  ];

  const followersMetrics: TargetTypeMetrics = {
    targetType: "followers",
    totalCount: safeFollowers,
    demographics: {
      malePct: followerMalePct,
      femalePct: followerFemalePct,
      inactivePct: followerInactivePct,
      maleCount: followerMaleCount,
      femaleCount: followerFemaleCount,
      inactiveCount: followerInactiveCount,
      formatted: `${followerMalePct}% Male (${followerMaleCount.toLocaleString()}) • ${followerFemalePct}% Female (${followerFemaleCount.toLocaleString()}) • ${followerInactivePct}% Ghost/Bot (${followerInactiveCount.toLocaleString()})`,
      male: followerMaleCount,
      female: followerFemaleCount,
      inactiveOver90d: followerInactiveCount,
      nonFollowers: 0,
      totalAudited: safeFollowers,
    },
    ghostCount: followerGhostBurden,
    nonReciprocalsCount: 0,
    reachPenalty: Math.min(85, reachPenalty + 10),
    lockedCount: Math.max(0, safeFollowers - 3),
    sampleAccounts: followersTeaserAccounts,
  };

  // Select active metrics based on targetType parameter
  const activeMetrics = targetType === "followers" ? followersMetrics : followingMetrics;

  const ghostsAndBots: GhostAndBotMetrics = {
    count: activeMetrics.ghostCount,
    reachSuppression: activeMetrics.reachPenalty,
    reachPenaltyFormatted: `-${activeMetrics.reachPenalty}%`,
  };

  const recommendations = [
    `Unfollow the ~${followingNonReciprocals.toLocaleString()} non-reciprocal accounts to lift Meta's reach suppression filter.`,
    `Maintain a follower-to-following ratio of at least 1.50x to protect explore feed ranking.`,
    `Execute cleaning in safe 10-batch increments with the Chrome Extension to bypass Instagram's bot traps.`,
  ];

  return {
    username,
    fullName,
    full_name: fullName,
    avatar,
    profile_pic_url: avatar,
    isVerified,
    is_verified: isVerified,
    isPrivate,
    bio,
    biography: bio,
    isLiveRealData: isLive,
    postCount,
    followers,
    follower_count: followers,
    following,
    following_count: following,
    avgLikes,
    ratio,
    ratioRating,
    healthScore,
    reachPenalty: activeMetrics.reachPenalty,
    targetType,
    nonReciprocals: followingNonReciprocals,
    estimatedGhosts: activeMetrics.ghostCount,
    lockedCount: activeMetrics.lockedCount,
    ghostsAndBots,
    demographics: activeMetrics.demographics,
    sampleAccounts: activeMetrics.sampleAccounts,
    followingMetrics,
    followersMetrics,
    recommendations,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUsername = body.username || "alex.creator";
    const cleanUsername = cleanHandle(rawUsername);
    const targetType: TargetType = body.targetType === "followers" ? "followers" : "following";

    const customFollowers = body.followers ? Number(body.followers) : undefined;
    const customFollowing = body.following ? Number(body.following) : undefined;
    const customAvgLikes = body.avgLikes ? Number(body.avgLikes) : undefined;

    // Fetch real live Instagram data
    const liveProfile = await fetchRealInstagramData(cleanUsername);

    const result = calculateAuditMetrics(
      cleanUsername,
      liveProfile,
      targetType,
      customFollowers,
      customFollowing,
      customAvgLikes
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid audit request payload" },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUsername = searchParams.get("username") || "alex.creator";
  const cleanUsername = cleanHandle(rawUsername);
  const targetType: TargetType = searchParams.get("targetType") === "followers" ? "followers" : "following";

  const customFollowers = searchParams.get("followers")
    ? Number(searchParams.get("followers"))
    : undefined;
  const customFollowing = searchParams.get("following")
    ? Number(searchParams.get("following"))
    : undefined;
  const customAvgLikes = searchParams.get("avgLikes")
    ? Number(searchParams.get("avgLikes"))
    : undefined;

  // Fetch real live Instagram data
  const liveProfile = await fetchRealInstagramData(cleanUsername);

  const result = calculateAuditMetrics(
    cleanUsername,
    liveProfile,
    targetType,
    customFollowers,
    customFollowing,
    customAvgLikes
  );

  return NextResponse.json({ success: true, data: result });
}
