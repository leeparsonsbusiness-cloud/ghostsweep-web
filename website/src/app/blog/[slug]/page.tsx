import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogPostBySlug, getAllBlogSlugs, BLOG_POSTS } from "@/lib/blog-data";
import { QuickAuditBox } from "@/components/QuickAuditBox";
import { 
  Clock, 
  ArrowLeft, 
  Share2, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  BookOpen
} from "lucide-react";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug);
  if (!post) return { title: "Article Not Found | GhostSweeper" };

  const canonicalUrl = `https://ghostsweep.info/blog/${post.slug}`;

  return {
    title: `${post.metaTitle} | GhostSweeper`,
    description: post.metaDescription,
    keywords: post.targetKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: canonicalUrl,
      siteName: "GhostSweeper",
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription,
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) notFound();

  // JSON-LD Structured Data for Google SERP
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: post.author,
      url: "https://ghostsweep.info",
    },
    publisher: {
      "@type": "Organization",
      name: "GhostSweeper",
      logo: {
        "@type": "ImageObject",
        url: "https://ghostsweep.info/og-image.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://ghostsweep.info/blog/${post.slug}`,
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://ghostsweep.info",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Forensic Guides",
        item: "https://ghostsweep.info/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://ghostsweep.info/blog/${post.slug}`,
      },
    ],
  };

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500/20">
      {/* Inject Structured Data Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Sticky Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Guides</span>
            </Link>
          </div>

          <Link href="/" className="flex items-center gap-1 text-white font-black text-sm">
            <span className="text-sky-400">ghostsweep</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono">
              Live
            </span>
          </Link>
        </div>
      </header>

      {/* Article Container */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-20">
        {/* Category & Meta */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400 mb-4">
          <span className="px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 font-semibold uppercase font-mono">
            {post.category}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {post.readTime}
          </span>
          <span>•</span>
          <span>Updated {new Date(post.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-6">
          {post.title}
        </h1>

        {/* Lead Excerpt */}
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed pb-6 border-b border-slate-800/80">
          {post.summary}
        </p>

        {/* Embedded Interactive Audit Box (Immediate Conversion Tool) */}
        <QuickAuditBox />

        {/* Sections */}
        <div className="space-y-12 mt-10">
          {post.sections.map((sec, idx) => (
            <div key={idx} className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {sec.heading}
              </h2>
              {sec.subheading && (
                <h3 className="text-sm font-semibold text-sky-400">
                  {sec.subheading}
                </h3>
              )}

              <div className="space-y-4 text-sm sm:text-base text-slate-300 leading-relaxed">
                {sec.body.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>

              {sec.callout && (
                <div
                  className={`p-5 rounded-xl border my-6 ${
                    sec.callout.type === "warning"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                      : sec.callout.type === "tip"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                      : "bg-sky-500/10 border-sky-500/30 text-sky-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm mb-1.5">
                    {sec.callout.type === "warning" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : sec.callout.type === "tip" ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-sky-400" />
                    )}
                    <span>{sec.callout.title}</span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed opacity-90">
                    {sec.callout.text}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Second Quick Audit Box at the end of reading */}
        <div className="mt-14 pt-8 border-t border-slate-800">
          <QuickAuditBox suggestedUsername="alex.creator" />
        </div>

        {/* FAQs Accordion */}
        {post.faqs && post.faqs.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-800/80">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-sky-400" />
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {post.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl p-5"
                >
                  <h3 className="text-sm sm:text-base font-bold text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Guides Carousel */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-800/80">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              Related Forensic Investigations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="group bg-slate-900/50 border border-slate-800 hover:border-sky-500/40 rounded-xl p-5 flex flex-col justify-between transition-colors"
                >
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {rel.category}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors mt-2 mb-1 line-clamp-2">
                      {rel.title}
                    </h4>
                  </div>
                  <div className="text-xs text-sky-400 font-semibold flex items-center gap-1 mt-4">
                    <span>Read Guide</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

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
