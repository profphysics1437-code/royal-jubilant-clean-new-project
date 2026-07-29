import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { ArrowLeft, Calendar, Clock, User, Share2, Facebook, Twitter, MessageCircle, Mail } from "lucide-react";
import { ShareButton } from "@/components/site/ShareButton";

// Always render fresh — DB data changes often
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ---------- helpers --------------------------------------------------------

/** Generate a URL-friendly slug from a title string. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove special chars
    .replace(/[\s_-]+/g, "-") // collapse spaces/underscores to dashes
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes
}

/** Reverse-lookup a blog post by checking if its slugified title matches. */
async function findPostBySlug(slug: string) {
  const posts = await db.blogPost.findMany({
    where: { published: true },
    orderBy: { date: "desc" },
  });
  // Find the post whose slugified title matches the URL slug.
  // Fall back to matching by ID (for legacy URLs that use the cuid).
  return (
    posts.find((p) => slugify(p.title) === slug) ||
    posts.find((p) => p.id === slug) ||
    null
  );
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
    title: `${post.title} | Royal Jubilant Market Insights`,
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
      where: {
        published: true,
        category: post.category,
        id: { not: post.id },
      },
      take: 3,
      orderBy: { date: "desc" },
    });
  } catch {
    related = [];
  }

  // Build canonical URL for sharing
  const headersList = await headers();
  const host = headersList.get("host") || "www.royaljubilant.com";
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const canonicalUrl = `${protocol}://${host}/market-insights/${slug}`;

  // Article structured data (JSON-LD for SEO)
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.date.toISOString(),
    author: {
      "@type": "Person",
      name: post.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Royal Jubilant Real Estate LLC",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  };

  const formattedDate = post.date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Inject Article structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Top bar */}
      <header className="border-b border-[#E5E7EB] bg-white/95 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
          <Link
            href="/#/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#0A1F44] hover:text-[#A68A3F] transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to Market Insights
          </Link>
          <div className="flex items-center gap-3 text-xs text-[#6B7280]">
            <span className="hidden sm:inline">{post.category}</span>
          </div>
        </div>
      </header>

      {/* Hero image */}
      {post.image && (
        <div className="relative w-full aspect-[16/9] max-h-[500px] overflow-hidden bg-[#F4F5F7]">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      )}

      {/* Article body */}
      <article className="container mx-auto px-4 lg:px-6 py-10 lg:py-14 max-w-3xl">
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

        {/* Author */}
        <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-8 pb-6 border-b border-[#E5E7EB]">
          <User className="size-4 text-[#A68A3F]" />
          <span className="font-medium text-[#0A1F44]">{post.authorName}</span>
        </div>

        {/* Content — rendered as HTML (admin rich-text editor output) */}
        {post.content ? (
          <div
            className="prose prose-lg max-w-none text-[#374151] leading-relaxed
              [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:text-[#0A1F44] [&_h2]:mt-8 [&_h2]:mb-4
              [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-medium [&_h3]:text-[#0A1F44] [&_h3]:mt-6 [&_h3]:mb-3
              [&_p]:mb-4 [&_p]:leading-relaxed
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-2
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-2
              [&_img]:rounded-xl [&_img]:w-full [&_img]:my-6
              [&_blockquote]:border-l-4 [&_blockquote]:border-[#C9A961] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#6B7280] [&_blockquote]:my-6
              [&_a]:text-[#A68A3F] [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <p className="text-[#6B7280] text-lg">{post.excerpt}</p>
        )}

        {/* Share buttons */}
        <div className="mt-10 pt-6 border-t border-[#E5E7EB] flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-[#9CA3AF] font-medium mr-2">
              Share
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
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="bg-white border-t border-[#E5E7EB] py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-6 max-w-5xl">
            <h2 className="font-serif text-2xl font-medium text-[#0A1F44] mb-8">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 min-w-0">
              {related.map((rp, i) => {
                const rpSlug = slugify(rp.title);
                return (
                  <Link
                    key={rp.id}
                    href={`/market-insights/${rpSlug}`}
                    className="group bg-[#F9FAFB] rounded-2xl overflow-hidden border border-[#E5E7EB] hover:shadow-lg transition-shadow min-w-0"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      {rp.image && (
                        <img
                          src={rp.image}
                          alt={rp.title}
                          className="w-full h-full object-cover zoom-img"
                          loading="lazy"
                        />
                      )}
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md glass text-[10px] tracking-luxury uppercase font-medium text-[#0A1F44]">
                        {rp.category}
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-[10px] text-[#6B7280] mb-2">
                        <Clock className="size-3" /> {rp.readTime}
                      </div>
                      <h3 className="font-serif text-base font-medium text-[#0A1F44] leading-tight line-clamp-2 group-hover:text-[#A68A3F] transition-colors">
                        {rp.title}
                      </h3>
                      <p className="text-xs text-[#6B7280] mt-2 line-clamp-2 leading-relaxed">
                        {rp.excerpt}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-[#E5E7EB] py-6 mt-0">
        <div className="container mx-auto px-4 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
          <span>© {new Date().getFullYear()} Royal Jubilant Real Estate LLC</span>
          <Link
            href="/#/blog"
            className="text-[#A68A3F] hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="size-3" /> Back to Market Insights
          </Link>
        </div>
      </footer>
    </div>
  );
}
