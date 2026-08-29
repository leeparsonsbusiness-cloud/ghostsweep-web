import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ghostsweep.info"),
  title: "GhostSweep — Clean Your Following. Reclaim Your Instagram Algorithm.",
  description: "High-performance, client-side Chrome extension to audit non-reciprocal accounts, filter demographics, and safely unfollow ghost profiles in the background.",
  keywords: ["instagram cleaner", "ghost follower audit", "safe unfollow extension", "instagram reach booster", "ghostsweep", "instagram ratio analyzer"],
  authors: [{ name: "GhostSweep Team" }],
  openGraph: {
    title: "GhostSweep — Instagram Follower Audit & Safe Batch Unfollow",
    description: "Audit non-reciprocal accounts, filter demographics, and safely unfollow ghost profiles in the background.",
    url: "https://ghostsweep.info",
    siteName: "GhostSweep",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GhostSweep Instagram Cleaner Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GhostSweep — Reclaim Your Instagram Algorithm",
    description: "Audit non-reciprocal accounts, filter demographics, and safely unfollow ghost profiles.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-background text-slate-100 antialiased selection:bg-accent-sky/30 selection:text-accent-sky">
        {children}
      </body>
    </html>
  );
}
