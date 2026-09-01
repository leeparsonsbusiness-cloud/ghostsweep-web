import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ghostsweep.info"),
  title: "GhostSweep — Instagram Intelligence & Forensic Profile Auditor",
  description: "Web-based Instagram intelligence and forensic audit tool to inspect non-reciprocals, analyze chronological follower data, and calculate reach suppression without logging in.",
  keywords: ["instagram intelligence", "instagram forensic audit", "non-reciprocal followers", "instagram reach booster", "ghostsweep", "instagram ratio analyzer", "demographic split"],
  authors: [{ name: "GhostSweep Team" }],
  openGraph: {
    title: "GhostSweep — Instagram Intelligence & Forensic Profile Auditor",
    description: "Audit non-reciprocal accounts, analyze chronological follower data, and calculate reach suppression without logging in.",
    url: "https://ghostsweep.info",
    siteName: "GhostSweep",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GhostSweep Instagram Auditor Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GhostSweep — Instagram Forensic Intelligence",
    description: "Audit non-reciprocal accounts, filter demographics, and calculate reach suppression without logging in.",
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
