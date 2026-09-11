import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { BLOG_POSTS } from "@/lib/blog-data";
import { BookOpen, ArrowRight, Clock, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Instagram Forensics & Following Order Guides | GhostSweeper",
  description: "Explore in-depth technical breakdowns of Instagram's following algorithm, chronological follow orders, and forensic tracking methods.",
  keywords: [
    "instagram follow order",
    "how to see who someone recently followed on instagram",
    "is instagram following list in chronological order",
    "instagram forensics",
    "who did they follow last night",
  ],
  openGraph: {
    title: "Instagram Forensics & Following Order Guides | GhostSweeper",
    description: "Explore in-depth technical breakdowns of Instagram's following algorithm, chronological follow orders, and forensic tracking methods.",
    url: "https://ghostsweep.info/blog",
    siteName: "GhostSweeper",
    type: "website",
  },
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500/20">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white font-black tracking-tight text-lg">
            <span className="text-sky-400">ghostsweep</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase font-mono">
              Research Lab
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
          >
            <span>Live Audit Tool</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Forensic Intelligence & Algorithmic Analysis
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          Instagram Forensics, Follow Orders & Algorithms
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Authoritative technical breakdowns explaining how Meta sorts following lists, why chronological order was removed from the native app, and how snapshot forensics restores transparency.
        </p>
      </section>

      {/* Post Grid */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-slate-900/60 border border-slate-800/80 hover:border-sky-500/40 rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all hover:bg-slate-900/90 shadow-lg hover:shadow-sky-500/5"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-sky-400 transition-colors mb-3 leading-snug">
                  {post.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                  {post.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-sky-400 group-hover:text-sky-300">
                <span>Read Forensic Guide</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto space-y-3">
          <p>© 2026 GhostSweeper. Independent Instagram forensic utility and research lab.</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/" className="hover:text-slate-400">Scanner</Link>
            <span>•</span>
            <Link href="/history" className="hover:text-slate-400">History Portal</Link>
            <span>•</span>
            <Link href="/blog" className="text-sky-400">Forensic Guides</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
