"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem("ghostsweep_sid");
  if (!sid) {
    sid = "gs_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("ghostsweep_sid", sid);
  }
  return sid;
}

export function getDeviceType(): "mobile" | "desktop" | "tablet" {
  if (typeof window === "undefined") return "mobile";
  const ua = navigator.userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua)) return "mobile";
  return window.innerWidth < 768 ? "mobile" : "desktop";
}

export function trackClientEvent(
  eventType: "PAGE_VIEW" | "HEARTBEAT" | "SEARCH_INITIATED" | "SEARCH_COMPLETED" | "PAYWALL_VIEWED" | "CHECKOUT_CLICKED" | "PURCHASE_COMPLETED",
  details?: {
    target_username?: string;
    path?: string;
    metadata?: Record<string, any>;
  }
) {
  if (typeof window === "undefined") return;
  try {
    const sessionId = getSessionId();
    const payload = {
      event_type: eventType,
      session_id: sessionId,
      path: details?.path || window.location.pathname,
      referrer: document.referrer || "direct",
      device_type: getDeviceType(),
      target_username: details?.target_username,
      metadata: details?.metadata,
    };

    // Use sendBeacon for guaranteed non-blocking delivery, fallback to fetch
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

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Initial Page View
    trackClientEvent("PAGE_VIEW", { path: pathname });

    // 2. Continuous Heartbeat (Active viewer ping every 40s while tab is visible)
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        trackClientEvent("HEARTBEAT", { path: pathname });
      }
    }, 40000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        trackClientEvent("HEARTBEAT", { path: pathname });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname]);

  return null;
}
