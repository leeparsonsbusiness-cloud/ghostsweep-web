import { getSupabaseClient } from "./supabase";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    ttq?: {
      track: (event: string, params?: any) => void;
      page: () => void;
    };
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export type AnalyticsEventType =
  | "PAGE_VIEW"
  | "HEARTBEAT"
  | "SEARCH_INITIATED"
  | "SEARCH_COMPLETED"
  | "PAYWALL_VIEWED"
  | "CHECKOUT_CLICKED"
  | "PURCHASE_COMPLETED";

export interface AnalyticsEventRecord {
  id?: number | string;
  event_type: AnalyticsEventType;
  session_id: string;
  path?: string;
  referrer?: string;
  device_type?: string;
  target_username?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface ActiveSessionRecord {
  session_id: string;
  last_ping: string;
  current_path: string;
  device_type: string;
  referrer?: string;
}

// In-Memory fallback buffer (last 1000 events)
let localEventsBuffer: AnalyticsEventRecord[] = [];
let localActiveSessions: Record<string, { last_ping: number; current_path: string; device_type: string; referrer?: string }> = {};

/**
 * Record an analytics event to Supabase and in-memory cache (Server Side)
 */
export async function recordAnalyticsEvent(event: Omit<AnalyticsEventRecord, "id" | "created_at">): Promise<void> {
  const timestamp = new Date().toISOString();
  const record: AnalyticsEventRecord = {
    ...event,
    created_at: timestamp,
  };

  localEventsBuffer.unshift(record);
  if (localEventsBuffer.length > 1000) {
    localEventsBuffer = localEventsBuffer.slice(0, 1000);
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("analytics_events").insert({
        event_type: event.event_type,
        session_id: event.session_id,
        path: event.path || "/",
        referrer: event.referrer || "direct",
        device_type: event.device_type || "mobile",
        target_username: event.target_username ? event.target_username.toLowerCase().replace(/^@/, "") : null,
        metadata: event.metadata || {},
        created_at: timestamp,
      });
    } catch (err: any) {
      console.warn("[Analytics Sync] Error logging event:", err.message);
    }
  }
}

/**
 * Ping an active viewer session (Server Side)
 */
export async function pingActiveSession(
  sessionId: string,
  path: string,
  deviceType: string = "mobile",
  referrer?: string
): Promise<void> {
  const now = Date.now();
  localActiveSessions[sessionId] = {
    last_ping: now,
    current_path: path,
    device_type: deviceType,
    referrer,
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("active_sessions").upsert(
        {
          session_id: sessionId,
          last_ping: new Date(now).toISOString(),
          current_path: path,
          device_type: deviceType,
          referrer: referrer || "direct",
        },
        { onConflict: "session_id" }
      );
    } catch (err: any) {
      // Fail silently
    }
  }
}

/**
 * Calculate live active viewers count (sessions active in the last 2.5 minutes)
 */
export async function getLiveActiveViewers(): Promise<number> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const threshold = new Date(Date.now() - 150 * 1000).toISOString();
      const { count, error } = await supabase
        .from("active_sessions")
        .select("*", { count: "exact", head: true })
        .gt("last_ping", threshold);

      if (!error && typeof count === "number") {
        return Math.max(1, count);
      }
    } catch (err: any) {
      // fallback to memory
    }
  }

  const cutoff = Date.now() - 150 * 1000;
  let active = 0;
  for (const sid in localActiveSessions) {
    if (localActiveSessions[sid].last_ping > cutoff) {
      active++;
    } else {
      delete localActiveSessions[sid];
    }
  }
  return Math.max(1, active);
}

function categorizeReferrer(raw?: string): string {
  if (!raw || raw === "direct" || raw.includes("ghostsweep")) return "Direct";
  const lower = raw.toLowerCase();
  if (lower.includes("tiktok")) return "TikTok";
  if (lower.includes("instagram") || lower.includes("ig")) return "Instagram";
  if (lower.includes("google")) return "Google Search";
  if (lower.includes("youtube")) return "YouTube";
  if (lower.includes("twitter") || lower.includes("t.co") || lower.includes("x.com")) return "X / Twitter";
  if (lower.includes("facebook") || lower.includes("fb")) return "Facebook";
  if (lower.includes("reddit")) return "Reddit";
  return "Referral / Other";
}

/**
 * Comprehensive Analytics Summary for Owner Admin Dashboard
 */
export async function getAnalyticsSummary(timeframe: "today" | "7d" | "all" = "today") {
  const liveViewers = await getLiveActiveViewers();
  const supabase = getSupabaseClient();

  let events: AnalyticsEventRecord[] = [];

  let sinceDate = new Date();
  if (timeframe === "today") {
    sinceDate.setHours(0, 0, 0, 0);
  } else if (timeframe === "7d") {
    sinceDate.setDate(sinceDate.getDate() - 7);
  } else {
    sinceDate = new Date(0);
  }
  const sinceIso = sinceDate.toISOString();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("analytics_events")
        .select("*")
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false })
        .limit(2000);

      if (!error && Array.isArray(data)) {
        events = data;
      }
    } catch (err: any) {
      console.warn("[Analytics Summary] Supabase query error:", err.message);
    }
  }

  if (events.length === 0) {
    events = localEventsBuffer.filter((e) => !e.created_at || new Date(e.created_at) >= sinceDate);
  }

  const uniqueSessions = new Set<string>();
  let pageViews = 0;
  let searches = 0;
  let paywallViews = 0;
  let checkoutClicks = 0;
  let purchases = 0;
  let totalRevenue = 0;
  let standardCount = 0;
  let unlimitedCount = 0;

  const targetSearchCounts: Record<string, number> = {};
  const referrerCounts: Record<string, number> = {
    Direct: 0,
    TikTok: 0,
    Instagram: 0,
    "Google Search": 0,
    "X / Twitter": 0,
    "Referral / Other": 0,
  };
  const deviceCounts: Record<string, number> = {
    mobile: 0,
    desktop: 0,
    tablet: 0,
  };

  const recentFeed: {
    id: string;
    type: AnalyticsEventType;
    description: string;
    target?: string;
    device?: string;
    referrer?: string;
    time: string;
    amount?: number;
  }[] = [];

  for (const e of events) {
    if (e.session_id) uniqueSessions.add(e.session_id);

    const dev = (e.device_type || "mobile").toLowerCase();
    if (deviceCounts[dev] !== undefined) {
      deviceCounts[dev]++;
    } else {
      deviceCounts["mobile"]++;
    }

    const refCat = categorizeReferrer(e.referrer);
    referrerCounts[refCat] = (referrerCounts[refCat] || 0) + 1;

    if (e.target_username) {
      const cleanT = e.target_username.toLowerCase();
      targetSearchCounts[cleanT] = (targetSearchCounts[cleanT] || 0) + 1;
    }

    if (e.event_type === "PAGE_VIEW") {
      pageViews++;
    } else if (e.event_type === "SEARCH_INITIATED") {
      searches++;
    } else if (e.event_type === "PAYWALL_VIEWED") {
      paywallViews++;
    } else if (e.event_type === "CHECKOUT_CLICKED") {
      checkoutClicks++;
    } else if (e.event_type === "PURCHASE_COMPLETED") {
      purchases++;
      const amount = Number(e.metadata?.amount) || (e.metadata?.plan === "unlimited" ? 9.99 : 3.99);
      totalRevenue += amount;
      if (e.metadata?.plan === "unlimited") {
        unlimitedCount++;
      } else {
        standardCount++;
      }
    }

    if (recentFeed.length < 25 && e.event_type !== "HEARTBEAT") {
      let desc = "Viewed homepage";
      if (e.event_type === "SEARCH_INITIATED") desc = `Audited @${e.target_username || "unknown"}`;
      else if (e.event_type === "PAYWALL_VIEWED") desc = `Encountered unlock teaser for @${e.target_username || "user"}`;
      else if (e.event_type === "CHECKOUT_CLICKED") desc = `Clicked "Unlock" for @${e.target_username || "target"}`;
      else if (e.event_type === "PURCHASE_COMPLETED") desc = `Purchased unlock for @${e.target_username || "target"}`;

      recentFeed.push({
        id: String(e.id || Math.random().toString(36).substring(2, 9)),
        type: e.event_type,
        description: desc,
        target: e.target_username,
        device: e.device_type || "mobile",
        referrer: refCat,
        time: e.created_at || new Date().toISOString(),
        amount: e.metadata?.amount,
      });
    }
  }

  const sortedTargets = Object.entries(targetSearchCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([username, count]) => ({ username, count }));

  const visitorsCount = Math.max(uniqueSessions.size, pageViews > 0 ? Math.round(pageViews * 0.7) : 1);
  const searchRate = visitorsCount > 0 ? ((searches / visitorsCount) * 100).toFixed(1) : "0.0";
  const paywallRate = searches > 0 ? ((paywallViews / searches) * 100).toFixed(1) : "0.0";
  const checkoutRate = paywallViews > 0 ? ((checkoutClicks / paywallViews) * 100).toFixed(1) : "0.0";
  const purchaseRate = checkoutClicks > 0 ? ((purchases / checkoutClicks) * 100).toFixed(1) : "0.0";
  const overallConversionRate = visitorsCount > 0 ? ((purchases / visitorsCount) * 100).toFixed(2) : "0.00";

  const totalDeviceActions = deviceCounts.mobile + deviceCounts.desktop + deviceCounts.tablet || 1;
  const mobilePct = Math.round((deviceCounts.mobile / totalDeviceActions) * 100);
  const desktopPct = Math.round((deviceCounts.desktop / totalDeviceActions) * 100);
  const tabletPct = 100 - mobilePct - desktopPct;

  return {
    timeframe,
    liveViewers,
    summary: {
      totalVisitors: visitorsCount,
      totalPageViews: pageViews,
      totalSearches: searches,
      paywallViews,
      checkoutClicks,
      totalPurchases: purchases,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      revenueStandard: Number((standardCount * 3.99).toFixed(2)),
      revenueUnlimited: Number((unlimitedCount * 9.99).toFixed(2)),
      standardCount,
      unlimitedCount,
      overallConversionRate: `${overallConversionRate}%`,
    },
    funnel: [
      {
        step: 1,
        name: "Landed on Site",
        count: visitorsCount,
        rate: "100%",
        subtext: "Total unique visitors",
      },
      {
        step: 2,
        name: "Searched Instagram Handle",
        count: searches,
        rate: `${searchRate}%`,
        subtext: `${searchRate}% search initiation`,
      },
      {
        step: 3,
        name: "Hit Paywall Teaser",
        count: paywallViews,
        rate: `${paywallRate}%`,
        subtext: `${paywallRate}% saw teaser card`,
      },
      {
        step: 4,
        name: "Clicked Checkout / Unlock",
        count: checkoutClicks,
        rate: `${checkoutRate}%`,
        subtext: `${checkoutRate}% clicked purchase`,
      },
      {
        step: 5,
        name: "Completed Payment",
        count: purchases,
        rate: `${purchaseRate}%`,
        subtext: `${purchaseRate}% checkout conversion`,
      },
    ],
    topTargets: sortedTargets,
    trafficSources: Object.entries(referrerCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count),
    deviceBreakdown: {
      mobile: `${mobilePct}%`,
      desktop: `${desktopPct}%`,
      tablet: `${tabletPct}%`,
    },
    recentFeed,
  };
}

/* =========================================================================
   CLIENT-SIDE DISPATCHERS (Supports Pixels + First-Party Backend Tracking)
   ========================================================================= */

function sendInternalEvent(
  eventType: AnalyticsEventType,
  targetUsername?: string,
  metadata?: Record<string, any>
) {
  if (typeof window === "undefined") return;
  try {
    let sid = localStorage.getItem("ghostsweep_sid");
    if (!sid) {
      sid = "gs_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("ghostsweep_sid", sid);
    }

    const payload = {
      event_type: eventType,
      session_id: sid,
      path: window.location.pathname,
      referrer: document.referrer || "direct",
      device_type: window.innerWidth < 768 ? "mobile" : "desktop",
      target_username: targetUsername,
      metadata,
    };

    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/track", blob);
    } else {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  } catch (err) {
    // Non-blocking
  }
}

/**
 * Track an audit search submitted by a user
 */
export function trackSearchEvent(username: string) {
  if (typeof window === "undefined") return;

  // 1. Internal First-Party Tracking
  sendInternalEvent("SEARCH_INITIATED", username);

  // 2. Meta Pixel
  if (window.fbq) {
    window.fbq("track", "Search", {
      search_string: username,
      content_category: "Instagram Audit",
    });
  }

  // 3. TikTok Pixel
  if (window.ttq) {
    window.ttq.track("Search", {
      query: username,
    });
  }

  // 4. Google Analytics 4
  if (window.gtag) {
    window.gtag("event", "search", {
      search_term: username,
    });
  }
}

/**
 * Track user viewing the paywall / locked teaser card
 */
export function trackPaywallView(targetUsername?: string) {
  sendInternalEvent("PAYWALL_VIEWED", targetUsername);
}

/**
 * Track checkout modal opened / initiated
 */
export function trackInitiateCheckout(
  plan: "standard" | "unlimited" = "standard",
  price: number = 3.99,
  targetUsername?: string
) {
  if (typeof window === "undefined") return;
  const value = plan === "unlimited" ? 9.99 : price;

  // 1. Internal First-Party Tracking
  sendInternalEvent("CHECKOUT_CLICKED", targetUsername, { plan, value });

  // 2. Meta Pixel
  if (window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      value: value,
      currency: "USD",
      content_name: `GhostSweep ${plan === "unlimited" ? "Unlimited" : "Standard"} Plan`,
    });
  }

  // 3. TikTok Pixel
  if (window.ttq) {
    window.ttq.track("InitiateCheckout", {
      value: value,
      currency: "USD",
      content_type: "product",
    });
  }

  // 4. Google Analytics 4
  if (window.gtag) {
    window.gtag("event", "begin_checkout", {
      value: value,
      currency: "USD",
      items: [{ item_name: `GhostSweep ${plan} Plan`, price: value }],
    });
  }
}

/**
 * Track successful subscription / purchase unlock
 */
export function trackPurchase(
  plan: "standard" | "unlimited" = "standard",
  price: number = 3.99,
  targetUsername?: string
) {
  if (typeof window === "undefined") return;
  const value = plan === "unlimited" ? 9.99 : price;

  // 1. Internal First-Party Tracking
  sendInternalEvent("PURCHASE_COMPLETED", targetUsername, { plan, amount: value });

  // 2. Meta Pixel
  if (window.fbq) {
    window.fbq("track", "Purchase", {
      value: value,
      currency: "USD",
      content_name: `GhostSweep ${plan} Plan`,
      content_ids: [targetUsername || "instagram_audit"],
    });
  }

  // 3. TikTok Pixel
  if (window.ttq) {
    window.ttq.track("CompletePayment", {
      value: value,
      currency: "USD",
      content_type: "product",
    });
  }

  // 4. Google Analytics 4
  if (window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: `tx_${Date.now()}`,
      value: value,
      currency: "USD",
      items: [{ item_name: `GhostSweep ${plan} Plan`, price: value }],
    });
  }
}
