/**
 * Global Analytics & Ad Pixels Dispatcher (Meta Pixel, TikTok Pixel, Google Analytics 4)
 */

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

/**
 * Track an audit search submitted by a user
 */
export function trackSearchEvent(username: string) {
  if (typeof window === "undefined") return;

  // Meta Pixel
  if (window.fbq) {
    window.fbq("track", "Search", {
      search_string: username,
      content_category: "Instagram Audit",
    });
  }

  // TikTok Pixel
  if (window.ttq) {
    window.ttq.track("Search", {
      query: username,
    });
  }

  // Google Analytics 4
  if (window.gtag) {
    window.gtag("event", "search", {
      search_term: username,
    });
  }
}

/**
 * Track checkout modal opened / initiated
 */
export function trackInitiateCheckout(plan: "standard" | "unlimited" = "standard", price: number = 3.99) {
  if (typeof window === "undefined") return;

  const value = plan === "unlimited" ? 9.99 : price;

  // Meta Pixel
  if (window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      value: value,
      currency: "USD",
      content_name: `GhostSweep ${plan === "unlimited" ? "Unlimited" : "Standard"} Plan`,
    });
  }

  // TikTok Pixel
  if (window.ttq) {
    window.ttq.track("InitiateCheckout", {
      value: value,
      currency: "USD",
      content_type: "product",
    });
  }

  // Google Analytics 4
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
export function trackPurchase(plan: "standard" | "unlimited" = "standard", price: number = 3.99, targetUsername?: string) {
  if (typeof window === "undefined") return;

  const value = plan === "unlimited" ? 9.99 : price;

  // Meta Pixel
  if (window.fbq) {
    window.fbq("track", "Purchase", {
      value: value,
      currency: "USD",
      content_name: `GhostSweep ${plan} Plan`,
      content_ids: [targetUsername || "instagram_audit"],
    });
  }

  // TikTok Pixel
  if (window.ttq) {
    window.ttq.track("CompletePayment", {
      value: value,
      currency: "USD",
      content_type: "product",
    });
  }

  // Google Analytics 4
  if (window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: `tx_${Date.now()}`,
      value: value,
      currency: "USD",
      items: [{ item_name: `GhostSweep ${plan} Plan`, price: value }],
    });
  }
}
