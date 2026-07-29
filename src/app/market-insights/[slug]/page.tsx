import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { ArrowLeft, ArrowRight, Calendar, Clock, ChevronRight, Phone, MessageCircle, Mail, Printer, ArrowUp } from "lucide-react";
import { ShareButton } from "@/components/site/ShareButton";
import { BlogReadingProgress } from "@/components/site/BlogReadingProgress";
import { BlogNewsletterCTA } from "@/components/site/BlogNewsletterCTA";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ─── Helpers ─────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

async function findPostBySlug(slug: string) {
  const posts = await db.blogPost.findMany({ where: { published: true }, orderBy: { date: "desc" } });
  return posts.find((p) => slugify(p.title) === slug) || posts.find((p) => p.id === slug) || null;
}

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

function addHeadingIds(html: string): string {
  return html.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (_, level, attrs, content) => {
    const text = content.replace(/<[^>]*>/g, "").trim();
    const id = slugify(text);
    return `<h${level}${attrs} id="${id}">${content}</h${level}>`;
  });
}

// ─── Metadata ────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await findPostBySlug(slug);
  if (!post) return { title: "Article Not Found · Royal Jubilant" };

  const h = await headers();
  const host = h.get("host") || "www.royaljubilant.com";
  const proto = h.get("x-forwarded-proto") || "https";
  const canonicalUrl = `${proto}://${host}/market-insights/${slug}`;
  const description = post.excerpt?.slice(0, 160) || post.title;

  return {
    title: `${post.title} | Royal Jubilant Real Estate`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: post.title, description, url: canonicalUrl,
      siteName: "Royal Jubilant Real Estate", type: "article", locale: "en_AE",
      images: post.image ? [{ url: post.image, width: 1200, height: 630 }] : [],
      publishedTime: post.date.toISOString(), authors: [post.authorName],
    },
    twitter: { card: "summary_large_image", title: post.title, description, images: post.image ? [post.image] : [] },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await findPostBySlug(slug);
  if (!post) notFound();

  // Related posts (same category)
  let related: any[] = [];
  try { related = await db.blogPost.findMany({ where: { published: true, category: post.category, id: { not: post.id } }, take: 3, orderBy: { date: "desc" } }); } catch {}

  // Latest posts (any category)
  let latest: any[] = [];
  try { latest = await db.blogPost.findMany({ where: { published: true, id: { not: post.id } }, take: 3, orderBy: { date: "desc" } }); } catch {}

  // Prev/next
  const allPosts = await db.blogPost.findMany({ where: { published: true }, orderBy: { date: "desc" } }).catch(() => []);
  const currentIdx = allPosts.findIndex((p) => p.id === post.id);
  const prevPost = currentIdx > 0 ? allPosts[currentIdx - 1] : null;
  const nextPost = currentIdx >= 0 && currentIdx < allPosts.length - 1 ? allPosts[currentIdx + 1] : null;

  // Recommended properties
  let recommendedProps: any[] = [];
  try { recommendedProps = await db.property.findMany({ where: { published: true }, take: 3, orderBy: { createdAt: "desc" } }); } catch {}

  const h = await headers();
  const host = h.get("host") || "www.royaljubilant.com";
  const proto = h.get("x-forwarded-proto") || "https";
  const canonicalUrl = `${proto}://${host}/market-insights/${slug}`;

  const processedContent = post.content ? addHeadingIds(post.content) : "";
  const tocHeadings = post.content ? extractHeadings(post.content) : [];

  const articleSchema = {
    "@context": "https://schema.org", "@type": "Article",
    headline: post.title, description: post.excerpt, image: post.image,
    datePublished: post.date.toISOString(),
    author: { "@type": "Person", name: post.authorName },
    publisher: { "@type": "Organization", name: "Royal Jubilant Real Estate LLC" },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${proto}://${host}` },
      { "@type": "ListItem", position: 2, name: "Market Insights", item: `${proto}://${host}/#/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl },
    ],
  };

  const formattedDate = post.date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <BlogReadingProgress />

      {/* ════════════════════════════════════════════════════════════════
          IMMERSIVE HERO — full-width image with dark gradient overlay
          ════════════════════════════════════════════════════════════════ */}
      <header className="relative min-h-[70vh] flex items-end overflow-hidden bg-[#0A1F44]">
        {post.image && (
          <>
            <img src={post.image} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44] via-[#0A1F44]/60 to-[#0A1F44]/20" />
          </>
        )}

        {/* Breadcrumb on hero */}
        <div className="absolute top-0 inset-x-0 z-20 pt-20 lg:pt-24">
          <div className="container mx-auto px-4 lg:px-6">
            <nav className="flex items-center gap-2 text-xs text-white/50">
              <Link href="/" className="hover:text-[#C9A961] transition-colors">Home</Link>
              <ChevronRight className="size-3" />
              <Link href="/#/blog" className="hover:text-[#C9A961] transition-colors">Market Insights</Link>
            </nav>
          </div>
        </div>

        {/* Hero content — bottom-aligned */}
        <div className="relative z-10 w-full pb-12 lg:pb-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
            {/* Category badge */}
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="px-3 py-1 rounded-full bg-[#C9A961] text-[#0A1F44] text-[10px] font-bold tracking-luxury uppercase">
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium text-white leading-[1.1] mb-5 max-w-3xl"
              style={{ textShadow: "0 2px 30px rgba(0,0,0,0.5)" }}>
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-base lg:text-lg text-white/80 leading-relaxed max-w-2xl mb-6 font-light">
                {post.excerpt}
              </p>
            )}

            {/* Meta row — author, date, read time */}
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-full bg-gradient-to-br from-[#C9A961] to-[#A68A3F] flex items-center justify-center text-[#0A1F44] text-sm font-bold flex-shrink-0 ring-2 ring-white/20">
                  {post.authorName?.charAt(0) || "R"}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{post.authorName}</p>
                  <p className="text-[10px] text-white/50">Royal Jubilant Real Estate</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-white/60">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" /> {formattedDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5" /> {post.readTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════
          ARTICLE BODY — max 800px reading width + sticky sidebar
          ════════════════════════════════════════════════════════════════ */}
      <div className="container mx-auto px-4 lg:px-6 py-12 lg:py-20">
        <div className="flex gap-12 max-w-6xl mx-auto">
          {/* Sidebar — sticky TOC + share (desktop only) */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {tocHeadings.length > 0 && (
                <div className="border-l-2 border-[#E5E7EB] pl-5">
                  <p className="text-[10px] uppercase tracking-luxury text-[#9CA3AF] font-semibold mb-3">
                    In this article
                  </p>
                  <nav className="space-y-2">
                    {tocHeadings.map((heading, i) => (
                      <a
                        key={i}
                        href={`#${heading.id}`}
                        className={`block text-sm transition-colors leading-snug ${
                          heading.level === 3
                            ? "pl-3 text-xs text-[#9CA3AF] hover:text-[#A68A3F]"
                            : "text-[#6B7280] hover:text-[#A68A3F]"
                        }`}
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Share + actions */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-luxury text-[#9CA3AF] font-semibold mb-2">Share</p>
                <ShareButton title={post.title} description={post.excerpt} size="sm" />
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 text-xs text-[#6B7280] hover:text-[#A68A3F] transition-colors mt-2"
                >
                  <Printer className="size-3.5" /> Print article
                </button>
                <Link
                  href="/#/blog"
                  className="flex items-center gap-2 text-xs text-[#6B7280] hover:text-[#A68A3F] transition-colors"
                >
                  <ArrowLeft className="size-3.5" /> All articles
                </Link>
              </div>
            </div>
          </aside>

          {/* Main article — max 800px for optimal reading */}
          <article className="flex-1 min-w-0" style={{ maxWidth: "800px" }}>
            {/* Content */}
            {processedContent ? (
              <div
                className="text-[#1a1a1a] text-[17px] leading-[1.85]
                  [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:font-medium [&_h2]:text-[#0A1F44] [&_h2]:mt-14 [&_h2]:mb-5 [&_h2]:scroll-mt-24 [&_h2]:tracking-tight
                  [&_h3]:font-serif [&_h3]:text-2xl [&_h3]:font-medium [&_h3]:text-[#0A1F44] [&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:scroll-mt-24
                  [&_p]:mb-6 [&_p]:leading-[1.85]
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul]:space-y-2.5 [&_ul]:leading-[1.8]
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol]:space-y-2.5 [&_ol]:leading-[1.8]
                  [&_li]:text-[17px] [&_li]:text-[#1a1a1a]
                  [&_img]:rounded-2xl [&_img]:w-full [&_img]:my-10 [&_img]:shadow-lg
                  [&_blockquote]:border-l-4 [&_blockquote]:border-[#C9A961] [&_blockquote]:pl-6 [&_blockquote]:py-2 [&_blockquote]:my-10 [&_blockquote]:text-xl [&_blockquote]:font-serif [&_blockquote]:italic [&_blockquote]:text-[#0A1F44] [&_blockquote]:leading-relaxed
                  [&_a]:text-[#A68A3F] [&_a]:underline [&_a]:font-medium [&_a]:decoration-[#C9A961]/40 [&_a]:hover:decoration-[#C9A961]
                  [&_strong]:text-[#0A1F44] [&_strong]:font-semibold
                  [&_table]:w-full [&_table]:border-collapse [&_table]:my-8 [&_table]:text-sm
                  [&_th]:bg-[#0A1F44] [&_th]:text-white [&_th]:p-3 [&_th]:text-left [&_th]:font-medium
                  [&_td]:p-3 [&_td]:border-b [&_td]:border-[#E5E7EB] [&_td]:text-[#374151]"
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
            ) : (
              <p className="text-lg text-[#6B7280]">{post.excerpt}</p>
            )}

            {/* Share at bottom */}
            <div className="mt-12 pt-8 border-t border-[#E5E7EB] flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-luxury text-[#9CA3AF] font-semibold">Share</span>
                <ShareButton title={post.title} description={post.excerpt} size="sm" />
              </div>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#A68A3F] transition-colors"
              >
                <ArrowUp className="size-3.5" /> Back to top
              </button>
            </div>

            {/* Prev / Next navigation */}
            {(prevPost || nextPost) && (
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevPost ? (
                  <Link href={`/market-insights/${slugify(prevPost.title)}`}
                    className="group p-6 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#C9A961]/40 hover:shadow-md transition-all min-w-0">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-luxury text-[#9CA3AF] font-semibold mb-2">
                      <ArrowLeft className="size-3" /> Previous
                    </span>
                    <span className="text-sm font-medium text-[#0A1F44] group-hover:text-[#A68A3F] transition-colors line-clamp-2 font-serif">
                      {prevPost.title}
                    </span>
                  </Link>
                ) : <div className="hidden sm:block" />}
                {nextPost ? (
                  <Link href={`/market-insights/${slugify(nextPost.title)}`}
                    className="group p-6 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#C9A961]/40 hover:shadow-md transition-all text-right min-w-0">
                    <span className="flex items-center justify-end gap-1.5 text-[10px] uppercase tracking-luxury text-[#9CA3AF] font-semibold mb-2">
                      Next <ArrowRight className="size-3" />
                    </span>
                    <span className="text-sm font-medium text-[#0A1F44] group-hover:text-[#A68A3F] transition-colors line-clamp-2 font-serif">
                      {nextPost.title}
                    </span>
                  </Link>
                ) : <div className="hidden sm:block" />}
              </div>
            )}

            {/* Author bio */}
            <div className="mt-12 p-8 rounded-2xl bg-[#0A1F44] text-center">
              <div className="size-16 rounded-full bg-gradient-to-br from-[#C9A961] to-[#A68A3F] flex items-center justify-center text-[#0A1F44] text-xl font-bold mx-auto mb-4 ring-4 ring-white/10">
                {post.authorName?.charAt(0) || "R"}
              </div>
              <h3 className="font-serif text-lg font-medium text-white mb-1">{post.authorName}</h3>
              <p className="text-xs text-[#C9A961] uppercase tracking-luxury mb-3">Royal Jubilant Real Estate</p>
              <p className="text-sm text-white/60 max-w-md mx-auto leading-relaxed mb-5">
                {post.authorName} is a RERA-certified property consultant at Royal Jubilant Real Estate LLC, specialising in Dubai's luxury residential and investment property market.
              </p>
              <Link href="/#/agents" className="text-xs text-[#C9A961] hover:underline font-medium">
                View all advisors →
              </Link>
            </div>
          </article>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          RELATED ARTICLES
          ════════════════════════════════════════════════════════════════ */}
      {related.length > 0 && (
        <section className="bg-[#F9FAFB] border-t border-[#E5E7EB] py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-6 max-w-5xl">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="font-serif text-2xl lg:text-3xl font-medium text-[#0A1F44]">Related Articles</h2>
              <Link href="/#/blog" className="text-xs text-[#A68A3F] hover:underline font-medium">View all →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 min-w-0">
              {related.map((rp) => (
                <Link key={rp.id} href={`/market-insights/${slugify(rp.title)}`}
                  className="group min-w-0">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted mb-4">
                    {rp.image && <img src={rp.image} alt={rp.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md glass text-[10px] tracking-luxury uppercase font-medium text-[#0A1F44]">{rp.category}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#9CA3AF] mb-2">
                    <Clock className="size-3" /> {rp.readTime}
                  </div>
                  <h3 className="font-serif text-lg font-medium text-[#0A1F44] leading-tight line-clamp-2 group-hover:text-[#A68A3F] transition-colors">{rp.title}</h3>
                  <p className="text-sm text-[#6B7280] mt-2 line-clamp-2 leading-relaxed">{rp.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════
          RECOMMENDED PROPERTIES
          ════════════════════════════════════════════════════════════════ */}
      {recommendedProps.length > 0 && (
        <section className="bg-white border-t border-[#E5E7EB] py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-6 max-w-5xl">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="font-serif text-2xl lg:text-3xl font-medium text-[#0A1F44]">Featured Properties</h2>
              <Link href="/#/buy" className="text-xs text-[#A68A3F] hover:underline font-medium">Browse all →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 min-w-0">
              {recommendedProps.map((p) => {
                const imgs = (() => { try { return JSON.parse(p.images || "[]"); } catch { return []; } })();
                const href = `/properties/${p.slug || p.reference || p.id}`;
                return (
                  <Link key={p.id} href={href} className="group bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] hover:shadow-xl transition-shadow min-w-0">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#F4F5F7]">
                      <img src={imgs[0] || "/placeholder-property.jpg"} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-sm font-semibold text-[#0A1F44] line-clamp-1 group-hover:text-[#A68A3F] transition-colors">{p.title}</h3>
                      <p className="text-xs text-[#6B7280] mt-1">{p.community}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F4F5F7]">
                        <span className="font-serif text-lg font-bold text-[#0A1F44]">AED {p.price.toLocaleString()}</span>
                        <span className="text-xs text-[#A68A3F] font-medium group-hover:underline">View →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════
          NEWSLETTER CTA
          ════════════════════════════════════════════════════════════════ */}
      <BlogNewsletterCTA />

      {/* ════════════════════════════════════════════════════════════════
          CONTACT CTA — premium navy section
          ════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#0A1F44] py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 1) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="container mx-auto px-4 lg:px-6 max-w-3xl text-center relative">
          <h2 className="font-serif text-2xl lg:text-4xl font-medium text-white mb-4">
            Speak to a Royal Jubilant Advisor
          </h2>
          <p className="text-white/60 text-sm lg:text-base mb-8 max-w-xl mx-auto leading-relaxed">
            Our RERA-certified advisors provide personal, research-led counsel on Dubai's luxury property market — from first viewing to title deed handover.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="https://wa.me/971524942329" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#25D366] hover:bg-[#1FB855] text-white text-sm font-semibold transition-colors shadow-lg">
              <MessageCircle className="size-4" /> WhatsApp an Advisor
            </a>
            <a href="tel:+97143278401"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#C9A961] hover:bg-[#D4B875] text-[#0A1F44] text-sm font-semibold transition-colors shadow-lg">
              <Phone className="size-4" /> Book a Consultation
            </a>
            <Link href="/#/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition-colors">
              <Mail className="size-4" /> Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A1F44] border-t border-white/10 py-6">
        <div className="container mx-auto px-4 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <span>© {new Date().getFullYear()} Royal Jubilant Real Estate LLC</span>
          <Link href="/#/blog" className="text-[#C9A961] hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="size-3" /> Back to Market Insights
          </Link>
        </div>
      </footer>
    </div>
  );
}
