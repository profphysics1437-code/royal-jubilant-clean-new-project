"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Award, Quote, Star, ExternalLink, Star as StarIcon } from "lucide-react";
import { marketStats as fallbackMarketStats, awards as fallbackAwards, testimonials as fallbackTestimonials } from "@/lib/data";
import { useApi } from "@/lib/useApi";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { SectionHeader } from "./FeaturedProperties";

// Animated counter
function Counter({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString();

  return (
    <span ref={ref} className="font-serif text-4xl lg:text-5xl font-medium">
      {prefix}{formatted}{suffix}
    </span>
  );
}

export function MarketStats() {
  const { get } = useSiteSettings();
  const marketStats = [
    { label: "Active Listings", value: parseFloat(get("stats.activeListings", "240+").replace(/[^\d.]/g, "")) || 240, suffix: get("stats.activeListings", "240+").replace(/[\d.]/g, "") || "+", prefix: "" },
    { label: "AED Closed (Lifetime)", value: parseFloat(get("stats.aedClosed", "2.4B")) || 2.4, suffix: "B", prefix: "AED " },
    { label: "RERA-Certified Advisors", value: parseInt(get("stats.advisors", "8")) || 8, suffix: "", prefix: "" },
    { label: "Years Serving Dubai", value: parseInt(get("stats.years", "10+")) || 10, suffix: "+", prefix: "" },
    { label: "Average Client Rating", value: parseFloat(get("stats.rating", "4.8")) || 4.8, suffix: "/5", prefix: "" },
    { label: "Property Categories", value: parseInt(get("stats.categories", "18")) || 18, suffix: "", prefix: "" },
  ];
  return (
    <section className="py-20 lg:py-24 bg-royal-gradient text-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(191,160,106,1) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="container mx-auto px-4 lg:px-6 relative">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C9A961]/15 text-[#A68A3F] text-xs tracking-luxury uppercase mb-5"
          >
            <Award className="size-3.5" /> By the Numbers
          </motion.div>
          <h2 className="font-serif text-3xl lg:text-5xl font-medium">
            A decade of <span className="text-gradient-gold italic">Dubai property</span> expertise
          </h2>
          <p className="mt-5 text-white/70 leading-relaxed">
            Numbers that reflect Royal Jubilant's commitment to Dubai — and the families, investors, tenants and corporates we serve from our Burjuman Business Tower office.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {marketStats.map((stat, i) => {
            const decimals = stat.value % 1 !== 0 ? 1 : 0;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-gradient-gold">
                  <Counter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={decimals}
                  />
                </div>
                <div className="text-[10px] lg:text-xs tracking-luxury uppercase text-white/70 mt-3">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Awards() {
  const { data } = useApi<{ awards: any[] }>("/api/public/awards", { awards: fallbackAwards });
  const awards = data?.awards || fallbackAwards;
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 lg:px-6">
        <SectionHeader
          eyebrow="Recognition"
          title="Awards & Accolades"
          subtitle="Industry recognition that affirms our commitment to a more discreet, client-first approach to Dubai real estate."
          icon={<Award className="size-4" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {awards.map((award, i) => (
            <motion.div
              key={award.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group relative bg-[#F9FAFB] rounded-2xl p-6 border border-border/60 hover:border-[#C9A961] transition-all lift-on-hover"
            >
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-xl bg-gradient-to-br from-[#C9A961] to-[#A68A3F] flex items-center justify-center flex-shrink-0 shadow-md">
                  <Award className="size-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-xs tracking-luxury uppercase text-[#A68A3F] font-medium mb-1.5">
                    {award.year} · {award.issuer}
                  </div>
                  <h3 className="font-serif text-base font-medium text-[#0A1F44] leading-tight">
                    {award.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  const { data } = useApi<{ testimonials: any[] }>("/api/public/testimonials", { testimonials: fallbackTestimonials });
  const { get } = useSiteSettings();
  const testimonials = data?.testimonials || fallbackTestimonials;
  // Google review link — admin can change in /admin/settings → contact
  const googleReviewUrl = get("reviews.google", "https://g.page/r/CWwdHxw2Au2NEBM/review");
  const googleRating = get("reviews.googleRating", "4.7");
  const googleReviewCount = get("reviews.googleCount", "49");

  return (
    <section id="testimonials" className="py-20 lg:py-28 bg-[#F9FAFB] scroll-mt-24">
      <div className="container mx-auto px-4 lg:px-6">
        <SectionHeader
          eyebrow="Client Voices"
          title="What Our Clients Say"
          subtitle="Discretion is the foundation of our practice. With permission, a selection of our clients share their Royal Jubilant experience."
          icon={<Quote className="size-4" />}
        />

        {/* Testimonial cards — equal height + width, Read More for long quotes.
            - Grid forces equal column widths (grid-cols).
            - Each card uses flex flex-col + fixed-aspect header + flex-1 body
              so the longest quote determines row height, all siblings match.
            - Quote text is clamped to 4 lines by default with a "Read More"
              toggle that expands to show the full quote inline.
            - Same number of cards (6) and same responsive grid as before:
              2 cols on mobile, 3 on tablet, 6 on desktop.
        */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 mt-12 items-stretch">
          {testimonials.slice(0, 6).map((t, i) => (
            <TestimonialCard key={t.id} t={t} i={i} />
          ))}
        </div>

        {/* Google Reviews CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 flex flex-col items-center"
        >
          <div className="bg-white rounded-2xl border border-border/60 p-6 lg:p-8 max-w-2xl w-full text-center lift-on-hover">
            <div className="flex items-center justify-center gap-2 mb-3">
              {/* Google "G" logo */}
              <svg className="size-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-serif text-lg font-medium text-[#0A1F44]">Google Reviews</span>
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map((n) => (
                  <StarIcon key={n} className={`size-5 ${n <= Math.round(parseFloat(googleRating)) ? "fill-[#C9A961] text-[#A68A3F]" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <span className="text-sm font-medium text-[#0A1F44]">{googleRating}</span>
              <span className="text-sm text-muted-foreground">· {googleReviewCount} reviews</span>
            </div>

            <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
              Had a great experience with Royal Jubilant? We'd love to hear from you. Your review helps other clients and supports our team.
            </p>

            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0A1F44] hover:bg-[#C9A961] hover:text-[#0A1F44] text-white font-medium px-6 py-3 rounded-full transition-all text-sm group"
            >
              Leave a Google Review
              <ExternalLink className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TestimonialCard — single testimonial with equal height + Read More
// ═══════════════════════════════════════════════════════════════════════

/**
 * Character threshold above which the "Read More" toggle kicks in.
 * Quotes shorter than this are shown in full — no toggle.
 * Tuned for the 12px serif italic body text in a 6-column grid card.
 */
const TESTIMONIAL_READ_MORE_THRESHOLD = 140;

function TestimonialCard({ t, i }: { t: any; i: number }) {
  const [expanded, setExpanded] = useState(false);

  // Determine if the quote is long enough to warrant a Read More toggle.
  // We measure by character count (consistent across screen widths — line
  // counting via the DOM would reflow on resize and cause layout shifts).
  const isLong = (t.quote?.length || 0) > TESTIMONIAL_READ_MORE_THRESHOLD;
  const displayQuote = isLong && !expanded
    ? (t.quote as string).slice(0, TESTIMONIAL_READ_MORE_THRESHOLD).trimEnd() + "…"
    : t.quote;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: i * 0.06 }}
      // flex flex-col + h-full → card stretches to row height (matches siblings)
      // items-stretch on the parent grid ensures all cards in a row share height
      className="flex flex-col h-full bg-white rounded-xl overflow-hidden border border-border/60 shadow-sm hover:shadow-xl transition-shadow"
    >
      {/* Navy header — avatar + name + role + rating (fixed-height, flex-shrink-0) */}
      <div className="bg-[#0A1F44] text-white p-3 flex flex-col items-center text-center flex-shrink-0">
        <img
          src={t.avatar}
          alt={t.name}
          className="size-12 rounded-full object-cover border-2 border-[#C9A961]/50 mb-2"
        />
        <div className="text-[13px] font-semibold leading-tight">{t.name}</div>
        {t.role && (
          <div className="text-[10px] text-[#C9A961] mt-0.5 uppercase tracking-wider">{t.role}</div>
        )}
        <div className="flex items-center gap-0.5 mt-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={`size-2.5 ${n <= t.rating ? "fill-[#C9A961] text-[#A68A3F]" : "text-white/20"}`}
            />
          ))}
        </div>
      </div>

      {/* White body — quote + footer.
          flex-1 makes the body grow to fill any extra height so the
          footer (location · service) sits at the bottom of every card
          regardless of quote length. flex-col + justify-between keeps
          the layout balanced. */}
      <div className="flex-1 flex flex-col p-3 bg-white">
        <Quote className="size-5 text-[#A68A3F]/20 mb-1 flex-shrink-0" />
        <p className="text-[12px] text-[#0A1F44] leading-snug font-serif italic flex-1">
          &ldquo;{displayQuote}&rdquo;
        </p>

        {/* Read More / Read Less toggle — only renders for long quotes */}
        {isLong && (
          <button
            onClick={(e) => {
              e.preventDefault();
              setExpanded((v) => !v);
            }}
            className="self-start mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#A68A3F] hover:text-[#0A1F44] transition-colors"
            aria-expanded={expanded}
          >
            {expanded ? "Read Less" : "Read More"}
          </button>
        )}

        <div className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border/40 flex-shrink-0">
          {t.location}{t.service ? ` · ${t.service}` : ""}
        </div>
      </div>
    </motion.div>
  );
}
