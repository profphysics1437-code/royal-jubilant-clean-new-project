import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { ArrowLeft, ArrowRight, Calendar, Clock, User, ChevronRight, Phone, MessageCircle, Mail } from "lucide-react";
import { ShareButton } from "@/components/site/ShareButton";
import { BlogReadingProgress } from "@/components/site/BlogReadingProgress";
import { BlogNewsletterCTA } from "@/components/site/BlogNewsletterCTA";

// Always render fresh
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ---------- helpers --------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function findPostBySlug(slug: string) {
  const posts = await db.blogPost.findMany({
    where: { published: true },
    orderBy: { date: "desc" },
  });
  return (
    posts.find((p) => slugify(p.title) === slug) ||
    posts.find((p) => p.id === slug) ||
    null
  );
}

// Extract headings from HTML content for Table of Contents
function extractHeadings(html: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = [];
  const regex = /<h([23])[^>]*>(.*?)<\/h\1>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const text = match[2].replace(/<[^>]*>/g, "").trim();
    const id = slugify(text);
    if (text) headings.push({ id, text, level });
  }
  return headings;
}

// Add IDs to headings in HTML content for TOC anchor links
function addHeadingIds(html: string): string {
  return html.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, content) => {
    const text = content.replace(/<[^>]*>/g, "").trim();
    const id = slugify(text);
    return `<h${level}${attrs} id="${id}">${content}</h${level}>`;
  });
}

// ---------- metadata -------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await findPostBySlug(slug);
  if (!post) return { title: "Article Not Found · Royal Jubilant" };

  const headersList = await headers();
  const host = headersList.get("host") || "www.royaljubilant.com";
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const canonicalUrl = `${protocol}://${host}/market-insights/${slug}`;
  const description = post.excerpt?.slice(0, 160) || post.title;

  return {
    title: `${post.title} | Royal Jubilant Real Estate`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: post.title,
      description,
      url: canonicalUrl,
      siteName: "Royal Jubilant Real Estate",
      type: "article",
      locale: "en_AE",
      images: post.image ? [{ url: post.image, width: 1200, height: 630 }] : [],
      publishedTime: post.date.toISOString(),
      authors: [post.authorName],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.image ? [post.image] : [],
    },
  };
}

// ---------- page -----------------------------------------------------------

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await findPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Fetch related posts (same category, exclude current, limit 3)
  let related: any[] = [];
  try {
    related = await db.blogPost.findMany({
      where: { published: true, category: post.category, id: { not: post.id } },
      take: 3,
      orderBy: { date: "desc" },
    });
  } catch { related = []; }

  // Fetch latest posts (any category, exclude current, limit 3)
  let latest: any[] = [];
  try {
    latest = await db.blogPost.findMany({
      where: { published: true, id: { not: post.id } },
      take: 3,
      orderBy: { date: "desc" },
    });
  } catch { latest = []; }

  // Fetch prev/next articles
  const allPosts = await db.blogPost.findMany({
    where: { published: true },
    orderBy: { date: "desc" },
  }).catch(() => []);
  const currentIdx = allPosts.findIndex((p) => p.id === post.id);
  const prevPost = currentIdx > 0 ? allPosts[currentIdx - 1] : null;
  const nextPost = currentIdx < allPosts.length - 1 ? allPosts[currentIdx + 1] : null;

  // Fetch recommended properties (limit 3)
  let recommendedProps: any[] = [];
  try {
    recommendedProps = await db.property.findMany({
      where: { published: true },
      take: 3,
      orderBy: { createdAt: "desc" },
    });
  } catch { recommendedProps = []; }

  // Build URLs
  const headersList = await headers();
  const host = headersList.get("host") || "www.royaljubilant.com";
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const canonicalUrl = `${protocol}://${host}/market-insights/${slug}`;

  // Process content: add IDs to headings for TOC
  const processedContent = post.content ? addHeadingIds(post.content) : "";
  const tocHeadings = post.content ? extractHeadings(post.content) : [];

  // Article + Breadcrumb structured data
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.date.toISOString(),
    author: { "@type": "Person", name: post.authorName },
    publisher: { "@type": "Organization", name: "Royal Jubilant Real Estate LLC" },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${protocol}://${host}` },
      { "@type": "ListItem", position: 2, name: "Market Insights", item: `${protocol}://${host}/#/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl },
    ],
  };

  const formattedDate = post.date.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Structured data for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Reading progress bar (client component) */}
      <BlogReadingProgress />

      {/* Top bar with breadcrumb */}
      <header className="border-b border-[#E5E7EB] bg-white/95 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs text-[#6B7280]">
            <Link href="/" className="hover:text-[#A68A3F] transition-colors">Home</Link>
            <ChevronRight className="size-3" />
            <Link href="/#/blog" className="hover:text-[#A68A3F] transition-colors">Market Insights</Link>
            <ChevronRight className="size-3" />
            <span className="text-[#0A1F44] font-medium truncate max-w-[200px]">{post.title}</span>
          </nav>
          <Link
            href="/#/blog"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[#0A1F44] hover:text-[#A68A3F] transition-colors flex-shrink-0"
          >
            <ArrowLeft className="size-4" /> Back
          </Link>
        </div>
      </header>

      {/* Hero image */}
      {post.image && (
        <div className="relative w-full aspect-[21/9] max-h-[520px] overflow-hidden bg-[#F4F5F7]">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
      )}

      {/* Article body — 2-column on desktop (content + TOC sidebar) */}
      <div className="container mx-auto px-4 lg:px-6 py-10 lg:py-14">
        <div className="flex gap-10 max-w-6xl mx-auto">
          {/* Main content column */}
          <article className="flex-1 min-w-0 max-w-3xl">
            {/* Category + date + read time */}
            <div className="flex items-center gap-3 text-xs text-[#6B7280] mb-4">
              <span className="px-2.5 py-1 rounded-full bg-[#C9A961]/15 text-[#A68A3F] font-medium">
                {post.category}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" /> {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" /> {post.readTime}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#0A1F44] leading-tight mb-4">
              {post.title}
            </h1>

            {/* Excerpt / lead paragraph */}
            {post.excerpt && (
              <p className="text-lg text-[#6B7280] leading-relaxed mb-6 font-light">
                {post.excerpt}
              </p>
            )}

            {/* Author + share */}
            <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <div className="size-9 rounded-full bg-gradient-to-br from-[#C9A961] to-[#A68A3F] flex items-center justify-center text-[#0A1F44] text-xs font-bold flex-shrink-0">
                  {post.authorName?.charAt(0) || "R"}
                </div>
                <div>
                  <p className="font-medium text-[#0A1F44] text-sm">{post.authorName}</p>
                  <p className="text-[10px] text-[#9CA3AF]">Royal Jubilant Real Estate</p>
                </div>
              </div>
              <ShareButton title={post.title} description={post.excerpt} size="sm" />
            </div>

            {/* Content */}
            {processedContent ? (
              <div
                className="prose prose-lg max-w-none text-[#374151] leading-relaxed
                  [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:text-[#0A1F44] [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:scroll-mt-20
                  [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-medium [&_h3]:text-[#0A1F44] [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:scroll-mt-20
                  [&_p]:mb-5 [&_p]:leading-[1.8]
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ul]:space-y-2
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_ol]:space-y-2
                  [&_img]:rounded-xl [&_img]:w-full [&_img]:my-8
                  [&_blockquote]:border-l-4 [&_blockquote]:border-[#C9A961] [&_blockquote]:pl-5 [&_blockquote]:py-3 [&_blockquote]:bg-[#F9FAFB] [&_blockquote]:rounded-r-lg [&_blockquote]:italic [&_blockquote]:text-[#6B7280] [&_blockquote]:my-8 [&_blockquote]:text-lg
                  [&_a]:text-[#A68A3F] [&_a]:underline [&_a]:font-medium"
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
            ) : (
              <p className="text-[#6B7280] text-lg">{post.excerpt}</p>
            )}

            {/* Share buttons at bottom */}
            <div className="mt-10 pt-6 border-t border-[#E5E7EB] flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-[#9CA3AF] font-medium mr-2">
                  Share this article
                </span>
                <ShareButton title={post.title} description={post.excerpt} size="sm" />
              </div>
              <Link
                href="/#/blog"
                className="inline-flex items-center gap-1.5 text-sm text-[#A68A3F] hover:underline font-medium"
              >
                <ArrowLeft className="size-3.5" /> Back to Market Insights
              </Link>
            </div>

            {/* Previous / Next article navigation */}
            {(prevPost || nextPost) && (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevPost ? (
                  <Link
                    href={`/market-insights/${slugify(prevPost.title)}`}
                    className="group flex flex-col gap-1 p-5 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#C9A961]/40 hover:shadow-md transition-all min-w-0"
                  >
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#9CA3AF] font-medium">
                      <ArrowLeft className="size-3" /> Previous Article
                    </span>
                    <span className="text-sm font-medium text-[#0A1F44] group-hover:text-[#A68A3F] transition-colors line-clamp-2">
                      {prevPost.title}
                    </span>
                  </Link>
                ) : <div className="hidden sm:block" />}
                {nextPost ? (
                  <Link
                    href={`/market-insights/${slugify(nextPost.title)}`}
                    className="group flex flex-col gap-1 p-5 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#C9A961]/40 hover:shadow-md transition-all text-right min-w-0"
                  >
                    <span className="flex items-center justify-end gap-1 text-[10px] uppercase tracking-wider text-[#9CA3AF] font-medium">
                      Next Article <ArrowRight className="size-3" />
                    </span>
                    <span className="text-sm font-medium text-[#0A1F44] group-hover:text-[#A68A3F] transition-colors line-clamp-2">
                      {nextPost.title}
                    </span>
                  </Link>
                ) : <div className="hidden sm:block" />}
              </div>
            )}
          </article>

          {/* Sticky sidebar — Table of Contents + WhatsApp CTA */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20 space-y-6">
              {/* Table of Contents */}
              {tocHeadings.length > 0 && (
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                  <h3 className="text-xs uppercase tracking-wider text-[#9CA3AF] font-semibold mb-3">
                    Table of Contents
                  </h3>
                  <nav className="space-y-1.5">
                    {tocHeadings.map((h, i) => (
                      <a
                        key={i}
                        href={`#${h.id}`}
                        className={`block text-sm text-[#6B7280] hover:text-[#A68A3F] transition-colors ${
                          h.level === 3 ? "pl-4 text-xs" : ""
                        }`}
                      >
                        {h.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* WhatsApp CTA */}
              <div className="bg-[#0A1F44] rounded-xl p-5 text-center">
                <div className="size-12 rounded-full bg-[#C9A961] flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="size-6 text-[#0A1F44]" />
                </div>
                <p className="text-white text-sm font-medium mb-1">Have questions?</p>
                <p className="text-white/60 text-xs mb-4">Speak to a senior advisor on WhatsApp</p>
                <a
                  href="https://wa.me/971524942329"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-[#25D366] hover:bg-[#1FB855] text-white text-xs font-semibold transition-colors"
                >
                  <MessageCircle className="size-4" /> Chat Now
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Related Articles */}
      {related.length > 0 && (
        <section className="bg-white border-t border-[#E5E7EB] py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-5xl">
            <h2 className="font-serif text-2xl font-medium text-[#0A1F44] mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 min-w-0">
              {related.map((rp) => (
                <Link key={rp.id} href={`/market-insights/${slugify(rp.title)}`}
                  className="group bg-[#F9FAFB] rounded-2xl overflow-hidden border border-[#E5E7EB] hover:shadow-lg transition-shadow min-w-0">
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    {rp.image && <img src={rp.image} alt={rp.title} className="w-full h-full object-cover zoom-img" loading="lazy" />}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md glass text-[10px] tracking-luxury uppercase font-medium text-[#0A1F44]">{rp.category}</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-[10px] text-[#6B7280] mb-2">
                      <Clock className="size-3" /> {rp.readTime}
                    </div>
                    <h3 className="font-serif text-base font-medium text-[#0A1F44] leading-tight line-clamp-2 group-hover:text-[#A68A3F] transition-colors">{rp.title}</h3>
                    <p className="text-xs text-[#6B7280] mt-2 line-clamp-2 leading-relaxed">{rp.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recommended Properties */}
      {recommendedProps.length > 0 && (
        <section className="bg-[#F9FAFB] border-t border-[#E5E7EB] py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-5xl">
            <h2 className="font-serif text-2xl font-medium text-[#0A1F44] mb-8">Recommended Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 min-w-0">
              {recommendedProps.map((p) => {
                const imgs = (() => { try { return JSON.parse(p.images || "[]"); } catch { return []; } })();
                const href = `/properties/${p.slug || p.reference || p.id}`;
                return (
                  <Link key={p.id} href={href}
                    className="group bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] hover:shadow-lg transition-shadow min-w-0">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#F4F5F7]">
                      <img src={imgs[0] || "/placeholder-property.jpg"} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]" loading="lazy" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-[#0A1F44] line-clamp-1 group-hover:text-[#A68A3F] transition-colors">{p.title}</h3>
                      <p className="text-xs text-[#6B7280] mt-1">{p.community}</p>
                      <p className="text-base font-bold text-[#0A1F44] font-serif mt-2">AED {p.price.toLocaleString()}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <BlogNewsletterCTA />

      {/* Contact CTA */}
      <section className="bg-[#0A1F44] py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-6 max-w-3xl text-center">
          <h2 className="font-serif text-2xl lg:text-3xl font-medium text-white mb-3">
            Speak to a Royal Jubilant Advisor
          </h2>
          <p className="text-white/70 text-sm mb-6 max-w-xl mx-auto">
            Our RERA-certified advisors provide personal, research-led counsel on Dubai's luxury property market.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="https://wa.me/971524942329" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#1FB855] text-white text-sm font-semibold transition-colors">
              <MessageCircle className="size-4" /> WhatsApp
            </a>
            <a href="tel:+97143278401"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C9A961] hover:bg-[#D4B875] text-[#0A1F44] text-sm font-semibold transition-colors">
              <Phone className="size-4" /> Call Us
            </a>
            <Link href="/#/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition-colors">
              <Mail className="size-4" /> Contact
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E5E7EB] py-6">
        <div className="container mx-auto px-4 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
          <span>© {new Date().getFullYear()} Royal Jubilant Real Estate LLC</span>
          <Link href="/#/blog" className="text-[#A68A3F] hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="size-3" /> Back to Market Insights
          </Link>
        </div>
      </footer>
    </div>
  );
}
