"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowLeft, MapPin, Star, TrendingUp, ArrowRight, Building2, ShieldCheck, Tag, Award, X, Play } from "lucide-react";
import {
  communities as fallbackCommunities,
  developers as fallbackDevelopers,
  blogPosts as fallbackBlogPosts,
  properties as fallbackProperties,
  Property,
} from "@/lib/data";
import { useStore } from "@/lib/store";
import { useApi } from "@/lib/useApi";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { Agents as AgentsSection } from "@/components/site/sections/Agents";
import { PropertyCard } from "@/components/site/PropertyCard";

export function CommunitiesView() {
  const { setActiveView, openCommunity } = useStore();
  const { data } = useApi<{ communities: any[] }>("/api/public/communities", { communities: fallbackCommunities });
  const communities = data?.communities || fallbackCommunities;
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-royal-gradient-diagonal text-white py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <button onClick={() => setActiveView("home")} className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-[#A68A3F] mb-5">
            <ArrowLeft className="size-3.5" /> Back to Home
          </button>
          <div className="text-[10px] tracking-luxury uppercase text-[#A68A3F] mb-3">Dubai Neighbourhoods</div>
          <h1 className="h1 text-white">Explore Communities</h1>
          <p className="mt-4 body-lg text-white/70 max-w-2xl">From beachfront fronds on the Palm to golf-course estates in Dubai Hills — every Royal Jubilant community is documented with lifestyle intelligence, market trends and investment potential.</p>
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {communities.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              onClick={() => openCommunity(c.id)}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer lift-on-hover"
            >
              <img src={c.hero} alt={c.name} className="absolute inset-0 w-full h-full object-cover zoom-img" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white">
                <span className="px-2.5 py-1 rounded-md glass-dark text-[10px] tracking-luxury uppercase font-medium">{c.totalProperties.toLocaleString()} properties</span>
                <span className="px-2.5 py-1 rounded-md glass-dark text-[10px] flex items-center gap-1 font-medium"><Star className="size-3 fill-[#C9A961] text-[#A68A3F]" />{c.rating}</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="text-[10px] tracking-luxury uppercase text-[#A68A3F] mb-2">Dubai · UAE</p>
                <h3 className="font-serif text-2xl font-medium leading-tight mb-3">{c.name}</h3>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1"><TrendingUp className="size-3.5 text-[#A68A3F]" />ROI <strong className="font-semibold ml-1">{c.roi}</strong></span>
                  <span className="text-white/70">·</span>
                  <span>From <strong className="font-semibold">{c.averagePrice}</strong></span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AgentsView() {
  const { setActiveView } = useStore();
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-royal-gradient-diagonal text-white py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <button onClick={() => setActiveView("home")} className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-[#A68A3F] mb-5">
            <ArrowLeft className="size-3.5" /> Back to Home
          </button>
          <div className="text-[10px] tracking-luxury uppercase text-[#A68A3F] mb-3">The Team</div>
          <h1 className="h1 text-white">Meet Our Advisors</h1>
          <p className="mt-4 body-lg text-white/70 max-w-2xl">Senior, multilingual and certified — our advisors serve clients across 9 markets with discreet, relationship-led counsel.</p>
        </div>
      </div>
      <AgentsSection />
    </div>
  );
}

export function DevelopersView() {
  const { setActiveView, openDeveloper } = useStore();
  const { data } = useApi<{ developers: any[] }>("/api/public/developers", { developers: fallbackDevelopers });
  const developers = data?.developers || fallbackDevelopers;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-royal-gradient-diagonal text-white py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <button onClick={() => setActiveView("home")} className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-[#A68A3F] mb-5">
            <ArrowLeft className="size-3.5" /> Back to Home
          </button>
          <div className="text-[10px] tracking-luxury uppercase text-[#A68A3F] mb-3">Trusted Partnerships</div>
          <h1 className="h1 text-white">Featured Developers</h1>
          <p className="mt-4 body-lg text-white/70 max-w-2xl">Royal Jubilant maintains first-call access to inventory from Dubai's leading master developers.</p>
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {developers.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              onClick={() => openDeveloper(d.id)}
              className="group bg-white rounded-2xl overflow-hidden border border-border/60 lift-on-hover cursor-pointer shadow-sm"
            >
              <div className="relative h-44 overflow-hidden bg-[#0A1F44]">
                <img src={d.hero} alt={d.name} className="w-full h-full object-cover zoom-img opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44]/90 via-[#0A1F44]/40 to-[#0A1F44]/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white rounded-xl px-6 py-4 shadow-2xl max-w-[80%] flex items-center justify-center">
                    <img
                      src={d.logo}
                      alt={`${d.name} logo`}
                      className="max-h-14 max-w-[160px] object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; const p = (e.target as HTMLImageElement).parentElement; if (p && !p.querySelector('.fb')) { const s = document.createElement('span'); s.className = 'fb font-serif text-xl font-bold text-[#0A1F44]'; s.textContent = d.name; p.appendChild(s); } }}
                    />
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="text-[9px] tracking-luxury uppercase text-white/80 bg-black/30 backdrop-blur-sm px-2 py-1 rounded">Est. {d.founded}</span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif text-lg font-medium text-[#0A1F44] group-hover:text-[#A68A3F] transition-colors">{d.name}</h3>
                  <span className="text-[10px] text-muted-foreground">{d.headquarters}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">{d.overview}</p>
                <div className="grid grid-cols-3 gap-2 pb-4 mb-4 border-b border-border/60">
                  <div className="text-center"><div className="font-serif text-xl font-semibold text-[#0A1F44]">{d.totalProjects}</div><div className="text-[9px] tracking-luxury uppercase text-muted-foreground mt-0.5">Total</div></div>
                  <div className="text-center"><div className="font-serif text-xl font-semibold text-[#0A1F44]">{d.completedProjects}</div><div className="text-[9px] tracking-luxury uppercase text-muted-foreground mt-0.5">Completed</div></div>
                  <div className="text-center"><div className="font-serif text-xl font-semibold text-[#0A1F44]">{d.ongoingProjects}</div><div className="text-[9px] tracking-luxury uppercase text-muted-foreground mt-0.5">Ongoing</div></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#A68A3F]"><Award className="size-3.5" /><span className="line-clamp-1">{d.awards[0]}</span></div>
                  <span className="text-[10px] tracking-luxury uppercase text-muted-foreground group-hover:text-[#A68A3F] transition-colors flex items-center gap-1">View Profile <ArrowRight className="size-3" /></span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Generate a URL-friendly slug from a title string. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function BlogView() {
  const { setActiveView } = useStore();
  const { data } = useApi<{ posts: any[] }>("/api/public/blog", { posts: [] });
  const blogPosts = data?.posts || [];
  if (blogPosts.length === 0) return null;
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-royal-gradient-diagonal text-white py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <button onClick={() => setActiveView("home")} className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-[#A68A3F] mb-5">
            <ArrowLeft className="size-3.5" /> Back to Home
          </button>
          <div className="text-[10px] tracking-luxury uppercase text-[#A68A3F] mb-3">Research & Insights</div>
          <h1 className="h1 text-white">Market Insights</h1>
          <p className="mt-4 body-lg text-white/70 max-w-2xl">Quarterly indices, advisor notes and buyer guides — the research that informs every Royal Jubilant recommendation.</p>
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-6 py-12">
        {/* Featured article */}
        <Link href={`/market-insights/${slugify(blogPosts[0].title)}`}>
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 cursor-pointer group bg-white rounded-3xl overflow-hidden border border-border/60 lift-on-hover"
          >
            <div className="aspect-[16/10] overflow-hidden bg-muted">
              <img src={blogPosts[0].image} alt={blogPosts[0].title} className="w-full h-full object-cover zoom-img" />
            </div>
            <div className="p-8 lg:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                <span className="px-2.5 py-1 rounded-full bg-[#C9A961]/15 text-[#A68A3F] font-medium">{blogPosts[0].category}</span>
                <span>{blogPosts[0].readTime}</span>
                <span>·</span>
                <span>{new Date(blogPosts[0].date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              <h2 className="font-serif text-2xl lg:text-3xl font-medium text-[#0A1F44] leading-tight group-hover:text-[#A68A3F] transition-colors mb-4">
                {blogPosts[0].title}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-5">{blogPosts[0].excerpt}</p>
              <div className="text-sm text-[#A68A3F] font-medium">By {(blogPosts[0] as any).author || (blogPosts[0] as any).authorName}</div>
            </div>
          </motion.article>
        </Link>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {blogPosts.slice(1).map((post, i) => (
            <Link key={post.id} href={`/market-insights/${slugify(post.title)}`}>
              <motion.article
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-border/60 lift-on-hover h-full"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover zoom-img" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md glass text-[10px] tracking-luxury uppercase font-medium text-[#0A1F44]">{post.category}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
                    <span>{post.readTime}</span>
                    <span>·</span>
                    <span>{new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <h3 className="font-serif text-lg font-medium text-[#0A1F44] leading-tight line-clamp-2 group-hover:text-[#A68A3F] transition-colors">{post.title}</h3>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed">{post.excerpt}</p>
                  <div className="text-xs text-[#A68A3F] font-medium mt-3">By {(post as any).author || (post as any).authorName}</div>
                </div>
              </motion.article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AboutView() {
  const { setActiveView } = useStore();
  const reasons = [
    { icon: ShieldCheck, title: "RERA-Certified Advisors", desc: "Every engagement is led by a senior, RERA-certified consultant — not a call centre or junior hand-off. Direct, accountable advice from a dedicated advisor who knows your goals." },
    { icon: Award, title: "12+ Years in Dubai", desc: "Founded in 2014, Royal Jubilant has closed 1,200+ transactions across Palm Jumeirah, Downtown, Dubai Hills, Business Bay and beyond. Track record that speaks for itself." },
    { icon: Building2, title: "Full-Spectrum Coverage", desc: "Residential, commercial, off-plan, industrial and bulk units — one firm, every Dubai property category. No need to juggle multiple brokers for different asset classes." },
    { icon: TrendingUp, title: "Research-Led Advice", desc: "We publish quarterly market reports and back every recommendation with data — rental yields, price-per-sqft trends, handover timelines, and developer track records." },
    { icon: Tag, title: "Transparent Pricing", desc: "No hidden fees, no surprise charges. Buyer-side costs, agent fees, DLD transfer — all disclosed upfront in writing before any commitment." },
    { icon: Star, title: "Multilingual Team", desc: "English, Urdu, Arabic, Hindi, Pashto, Punjabi — served clients from across GCC, South Asia, Europe and Africa. Cultural fluency that matters in a global city." },
    { icon: ShieldCheck, title: "End-to-End Support", desc: "From first viewing to title deed handover, NOC, mortgage facilitation, and post-purchase property management — we handle the entire lifecycle." },
    { icon: Award, title: "Off-Plan Allocations", desc: "Authorised channel partner with Emaar, DAMAC, Sobha, Omniyat — first-call allocations 12-24 months ahead of public release, at pre-launch pricing." },
  ];
  const stats = [
    { value: "1,200+", label: "Transactions Closed" },
    { value: "240+", label: "Active Listings" },
    { value: "12+", label: "Years in Dubai" },
    { value: "9", label: "Languages Spoken" },
  ];
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-royal-gradient-diagonal text-white py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <button onClick={() => setActiveView("home")} className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-[#A68A3F] mb-5">
            <ArrowLeft className="size-3.5" /> Back to Home
          </button>
          <div className="text-[10px] tracking-luxury uppercase text-[#A68A3F] mb-3">Why Choose Us</div>
          <h1 className="h1 text-white">What sets Royal Jubilant<br />apart from the rest.</h1>
          <p className="mt-6 text-base lg:text-lg text-white/85 max-w-2xl leading-relaxed font-light">
            Dubai has thousands of brokerages. Here are eight concrete reasons discerning buyers, sellers and investors choose Royal Jubilant — and stay with us for life.
          </p>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="bg-[#0A1F44] text-white py-10">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-serif text-3xl lg:text-4xl text-[#C9A961]">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-white/60 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MD Portrait + Message */}
      <div className="container mx-auto px-4 lg:px-6 py-16 lg:py-20 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12 items-center">
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-br from-[#C9A961]/20 to-transparent rounded-2xl" />
              <img
                src="/team/muhammad-javed-zafar.webp"
                alt="Muhammad Javed Zafar — Managing Director"
                className="relative w-full aspect-[3/4] object-cover rounded-2xl shadow-xl border border-[#C9A961]/30"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'; }}
              />
              <div className="absolute -bottom-4 -right-4 bg-[#0A1F44] text-white px-4 py-2 rounded-lg shadow-lg">
                <div className="text-[9px] uppercase tracking-wider text-[#C9A961]">Managing Director</div>
                <div className="text-sm font-serif">M. Javed Zafar</div>
              </div>
            </div>
          </div>
          <div className="md:col-span-3">
            <div className="text-[10px] tracking-luxury uppercase text-[#A68A3F] mb-3">A Message from our MD</div>
            <h2 className="font-serif text-3xl lg:text-4xl text-[#0A1F44] mb-6 leading-tight">
              "Real estate is not about properties.<br />It's about people."
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              When I founded Royal Jubilant, I wanted to build something different — a brokerage where every client feels like our only client. In a market as dynamic as Dubai, that means combining deep local knowledge with genuine, personal care.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed mb-6">
              Our team of RERA-certified advisors doesn't just close transactions. We build relationships that span years and multiple moves — guiding first-time buyers, growing families, and seasoned investors with the same level of attention and integrity.
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-border/60">
              <div>
                <div className="font-serif text-lg text-[#0A1F44]">Muhammad Javed Zafar</div>
                <div className="text-xs text-muted-foreground">Founder & Managing Director · Royal Jubilant Real Estate LLC</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8 Reasons Grid */}
      <div className="container mx-auto px-4 lg:px-6 py-16 lg:py-20 max-w-6xl">
        <div className="text-center mb-12">
          <div className="text-[10px] tracking-luxury uppercase text-[#A68A3F] mb-3">The Royal Jubilant Difference</div>
          <h2 className="font-serif text-3xl lg:text-4xl text-[#0A1F44]">Eight reasons clients stay with us</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {reasons.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="bg-white rounded-2xl p-7 lg:p-8 border border-border/60 hover:border-[#C9A961]/40 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 size-14 rounded-xl bg-[#0A1F44] flex items-center justify-center">
                    <Icon className="size-7 text-[#C9A961]" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-luxury text-[#A68A3F] mb-1">Reason {String(i + 1).padStart(2, '0')}</div>
                    <h3 className="font-serif text-xl lg:text-2xl text-[#0A1F44] mb-3">{r.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Comparison Band */}
      <div className="bg-white border-y border-border/60">
        <div className="container mx-auto px-4 lg:px-6 py-16 max-w-5xl">
          <div className="text-center mb-10">
            <div className="text-[10px] tracking-luxury uppercase text-[#A68A3F] mb-3">The Difference</div>
            <h2 className="font-serif text-3xl lg:text-4xl text-[#0A1F44]">Royal Jubilant vs typical brokerages</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-50/50 border border-red-200/60 rounded-2xl p-7">
              <h3 className="font-serif text-lg text-[#0A1F44] mb-4 flex items-center gap-2">
                <span className="size-2 rounded-full bg-red-400" /> Typical Dubai Brokerage
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>• Junior agents handling senior clients</li>
                <li>• Volume-driven, transaction-focused</li>
                <li>• Limited to one property category</li>
                <li>• No post-purchase support</li>
                <li>• Hidden fees and surprise charges</li>
                <li>• English-only communication</li>
              </ul>
            </div>
            <div className="bg-[#0A1F44] text-white rounded-2xl p-7">
              <h3 className="font-serif text-lg mb-4 flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#C9A961]" /> Royal Jubilant
              </h3>
              <ul className="space-y-3 text-sm text-white/80">
                <li>• Senior RERA-certified advisors only</li>
                <li>• Relationship-driven, multi-year clients</li>
                <li>• Residential, commercial, off-plan, industrial</li>
                <li>• End-to-end lifecycle support</li>
                <li>• Transparent, written fee disclosure</li>
                <li>• 9 languages, global cultural fluency</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 lg:px-6 py-16 text-center max-w-3xl">
        <h2 className="font-serif text-3xl lg:text-4xl text-[#0A1F44] mb-4">Experience the difference.</h2>
        <p className="text-base text-muted-foreground mb-8">
          Book a no-obligation consultation with a senior advisor. We'll discuss your goals, walk you through current market opportunities, and only recommend properties that genuinely fit your brief.
        </p>
        <button
          onClick={() => setActiveView("contact")}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white font-medium text-sm transition-colors"
        >
          Get in Touch
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function ContactView() {
  const { setActiveView } = useStore();
  const { get } = useSiteSettings();
  const phone = get("company.phone", "+971 4 327 8401");
  const whatsapp = get("company.whatsapp", "971524942329");
  const email = get("company.email", "info@royaljubilant.ae");
  const address = get("company.address", "13th Floor, Office #54, Burjuman Business Tower, Dubai, UAE");
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-royal-gradient-diagonal text-white py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <button onClick={() => setActiveView("home")} className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-[#A68A3F] mb-5">
            <ArrowLeft className="size-3.5" /> Back to Home
          </button>
          <div className="text-[10px] tracking-luxury uppercase text-[#A68A3F] mb-3">Get in Touch</div>
          <h1 className="h1 text-white">Speak to an advisor.</h1>
          <p className="mt-4 body-lg text-white/70 max-w-2xl">Whether you're buying, selling, renting or simply exploring — a senior Royal Jubilant advisor is one message away.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-3xl p-8 border border-border/60">
            <h2 className="font-serif text-2xl font-medium text-[#0A1F44] mb-2">Send us a message</h2>
            <p className="text-sm text-muted-foreground mb-6">We respond to all enquiries within 2 hours during business days.</p>
            <ContactForm />
          </div>

          {/* Contact details */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-border/60">
              <h3 className="text-xs tracking-luxury uppercase text-[#A68A3F] font-semibold mb-3">Head Office — Dubai</h3>
              <div className="space-y-2 text-sm text-[#0A1F44]">
                <p className="flex items-start gap-2"><MapPin className="size-4 text-[#A68A3F] mt-0.5" /> {address.split(", ").map((line, i, arr) => i === arr.length - 1 ? <span key={i}>{line}</span> : <span key={i}>{line}<br /></span>)}</p>
                <p className="flex items-center gap-2"><Star className="size-4 text-[#A68A3F]" /> {phone}</p>
                <p className="flex items-center gap-2"><Star className="size-4 text-[#A68A3F]" /> {email}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-border/60 flex gap-2">
                <span className="text-[10px] tracking-luxury uppercase text-muted-foreground self-center mr-1">Follow</span>
                {["Facebook", "Instagram", "TikTok"].map((s) => (
                  <span key={s} className="text-[10px] px-2 py-1 rounded-full bg-[#F9FAFB] text-[#A68A3F] font-medium">{s}</span>
                ))}
              </div>
            </div>

            <div className="bg-royal-gradient-diagonal text-white rounded-3xl p-6">
              <h3 className="text-xs tracking-luxury uppercase text-[#A68A3F] font-semibold mb-3">Speak to an Advisor</h3>
              <p className="text-sm text-white/70 mb-4">A senior RERA-certified consultant is on call to help you.</p>
              <div className="space-y-2 text-sm">
                <p>📞 {phone}</p>
                <p>💬 WhatsApp {phone}</p>
                <p>🌐 English · Urdu · Arabic · Hindi · Pashto · Punjabi</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-border/60">
              <h3 className="text-xs tracking-luxury uppercase text-[#A68A3F] font-semibold mb-3">Office Hours</h3>
              <div className="space-y-1 text-sm text-[#0A1F44]">
                <div className="flex justify-between"><span>Mon – Sat</span><span>09:00 – 18:00</span></div>
                <div className="flex justify-between"><span>Sunday</span><span>By appointment</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactForm() {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fd.get("name"),
            email: fd.get("email"),
            phone: fd.get("phone"),
            message: fd.get("message"),
            source: "contact",
            intent: fd.get("intent"),
          }),
        });
        const { toast } = await import("sonner");
        toast.success("Message sent", { description: "We'll respond within 2 hours." });
        e.currentTarget.reset();
      }}
      className="space-y-4"
    >
      <input name="name" required placeholder="Full name *" className="w-full h-11 px-4 bg-[#F9FAFB] rounded-lg border border-border text-sm" />
      <div className="grid grid-cols-2 gap-3">
        <input name="email" type="email" required placeholder="Email *" className="h-11 px-4 bg-[#F9FAFB] rounded-lg border border-border text-sm" />
        <input name="phone" placeholder="Phone" className="h-11 px-4 bg-[#F9FAFB] rounded-lg border border-border text-sm" />
      </div>
      <select name="intent" className="w-full h-11 px-4 bg-[#F9FAFB] rounded-lg border border-border text-sm text-[#0A1F44]">
        <option value="">I'm interested in...</option>
        <option value="buy">Buying a property</option>
        <option value="sell">Selling a property</option>
        <option value="rent">Renting</option>
        <option value="invest">Investing / Portfolio</option>
        <option value="mortgage">Mortgage advisory</option>
        <option value="valuation">Property valuation</option>
        <option value="other">Something else</option>
      </select>
      <textarea name="message" rows={5} placeholder="Tell us how we can help..." className="w-full px-4 py-3 bg-[#F9FAFB] rounded-lg border border-border text-sm resize-none" />
      <button type="submit" className="w-full h-11 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-full text-sm font-medium transition-colors">
        Send Message
      </button>
    </form>
  );
}

export function FAQsView() {
  const { setActiveView } = useStore();
  const fallbackFaqs = [
    { question: "What is RERA and why is it important?", answer: "RERA (Real Estate Regulatory Agency) is the regulatory arm of the Dubai Land Department (DLD). It regulates and licenses real estate brokers, agents, and developers in Dubai. Always work with a RERA-certified broker like Royal Jubilant to ensure your transaction is legally protected.", category: "general" },
    { question: "Can foreigners buy property in Dubai?", answer: "Yes, foreigners can buy property in Dubai's designated freehold areas. These include Dubai Marina, Downtown Dubai, Palm Jumeirah, Dubai Hills Estate, Business Bay, and JVC. You get full ownership rights in these areas.", category: "buying" },
    { question: "What is the process of buying a property in Dubai?", answer: "The process involves: 1) Selecting a property, 2) Signing a Memorandum of Understanding (MOU) and paying a deposit, 3) Obtaining a No Objection Certificate (NOC) from the developer, 4) Transferring ownership at the DLD. Royal Jubilant handles this entire process for you.", category: "buying" },
    { question: "What are the costs associated with buying property in Dubai?", answer: "Additional costs include: DLD transfer fee (4% of property value), agent fee (2% + VAT), NOC fee (AED 500-5,000), and trustee office fee. Budget approximately 7% above the purchase price for all fees.", category: "buying" },
    { question: "What is Ejari?", answer: "Ejari is the online registration system by RERA that regulates all rental contracts in Dubai. Every rental agreement must be registered with Ejari. It protects both landlords and tenants and is required for utilities connection, visa applications, and other services.", category: "renting" },
    { question: "What is a payment plan for off-plan properties?", answer: "A payment plan is a schedule of payments spread over the construction period. Instead of paying the full price upfront, you pay in installments (e.g., 20% on booking, 10% every 6 months, 40% on handover). Royal Jubilant secures the best payment plans from developers.", category: "off-plan" },
    { question: "What is the difference between freehold and leasehold?", answer: "Freehold means you own the property and the land it's on permanently. Leasehold means you lease the property for a fixed period (usually 99 years). In Dubai, most properties available to foreigners are freehold in designated areas.", category: "general" },
    { question: "How long does the property buying process take?", answer: "For ready properties, the process typically takes 30-60 days from signing the MOU to receiving the title deed. For off-plan properties, you sign the SPA immediately and pay according to the payment plan until handover.", category: "buying" },
  ];
  const { data } = useApi<{ faqs: any[] }>("/api/public/faqs", { faqs: fallbackFaqs });
  const faqs = (data?.faqs && data.faqs.length > 0 ? data.faqs : fallbackFaqs).map((f) => ({ q: f.question, a: f.answer, category: f.category }));

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-royal-gradient-diagonal text-white py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <button onClick={() => setActiveView("home")} className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-[#A68A3F] mb-5">
            <ArrowLeft className="size-3.5" /> Back to Home
          </button>
          <div className="text-[10px] tracking-luxury uppercase text-[#A68A3F] mb-3">Frequently Asked</div>
          <h1 className="h1 text-white">Questions, answered.</h1>
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-6 py-12 max-w-4xl">
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="group bg-white rounded-2xl border border-border/60 overflow-hidden">
              <summary className="p-5 cursor-pointer flex items-center justify-between gap-4">
                <h3 className="font-serif text-lg font-medium text-[#0A1F44]">{faq.q}</h3>
                <span className="text-[#A68A3F] text-xl flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CareersView() {
  const { setActiveView } = useStore();
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cvFileName, setCvFileName] = useState("");
  const cvRef = useRef<HTMLInputElement>(null);

  const jobs = [
    { title: "Senior Property Advisor — Arabic & English", location: "Burjuman, Dubai", type: "Full-time", salary: "AED 35-55k + commission" },
    { title: "Off-Plan Investment Advisor", location: "Burjuman, Dubai", type: "Full-time", salary: "AED 30-50k + commission" },
    { title: "Commercial Real Estate Consultant", location: "Burjuman, Dubai", type: "Full-time", salary: "AED 25-40k + commission" },
    { title: "Property Valuer (RERA certified)", location: "Burjuman, Dubai", type: "Full-time", salary: "AED 28-45k" },
    { title: "Marketing & Digital Lead", location: "Burjuman, Dubai", type: "Full-time", salary: "AED 25-40k" },
    { title: "Leasing Consultant — Furnished Apartments", location: "Burjuman, Dubai", type: "Full-time", salary: "AED 18-28k + commission" },
  ];

  const handleApply = (jobTitle: string) => {
    setSelectedPosition(jobTitle);
    setShowForm(true);
    setSubmitted(false);
    setTimeout(() => {
      document.getElementById("application-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/public/careers", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-royal-gradient-diagonal text-white py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <button onClick={() => setActiveView("home")} className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-[#A68A3F] mb-5">
            <ArrowLeft className="size-3.5" /> Back to Home
          </button>
          <div className="text-[10px] tracking-luxury uppercase text-[#A68A3F] mb-3">Join Us</div>
          <h1 className="h1 text-white">Build your career<br />at Royal Jubilant.</h1>
          <p className="mt-4 body-lg text-white/70 max-w-2xl">We hire senior, multilingual, RERA-certified advisors who share our belief in discreet, research-led counsel. If that sounds like you, we should talk.</p>
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-6 py-12 max-w-5xl">
        {/* Job listings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
          {jobs.map((job) => (
            <div key={job.title} className="bg-white rounded-2xl p-6 border border-border/60 hover:border-[#C9A961] transition-colors">
              <h3 className="font-serif text-base font-medium text-[#0A1F44] mb-2">{job.title}</h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>📍 {job.location}</p>
                <p>⏱ {job.type}</p>
                <p>💰 {job.salary}</p>
              </div>
              <button
                onClick={() => handleApply(job.title)}
                className="mt-4 text-xs text-[#A68A3F] font-medium hover:underline"
              >
                Apply →
              </button>
            </div>
          ))}
        </div>

        {/* Application Form */}
        <div id="application-form" className="bg-white rounded-2xl p-6 lg:p-8 border border-border/60 shadow-sm">
          {submitted ? (
            <div className="text-center py-10">
              <div className="size-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="size-6 text-green-600" />
              </div>
              <h3 className="font-serif text-2xl text-[#0A1F44] mb-2">Application submitted!</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Thank you for your interest in joining Royal Jubilant Real Estate. Our HR team will review your application and contact you within 5-7 business days.
              </p>
              <button
                onClick={() => { setSubmitted(false); setShowForm(false); setSelectedPosition(""); }}
                className="mt-4 text-sm text-[#A68A3F] font-medium hover:underline"
              >
                Submit another application
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-2xl font-medium text-[#0A1F44] mb-2">
                {showForm ? "Job Application Form" : "Don't see your role?"}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {showForm
                  ? `Applying for: ${selectedPosition}`
                  : "We are always interested in speaking with talented, multilingual property professionals. Send us your CV and a short note."}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Position */}
                <div>
                  <label className="text-[10px] tracking-luxury uppercase text-[#A68A3F] font-medium mb-2 block">Position *</label>
                  <select
                    name="position"
                    required
                    value={selectedPosition}
                    onChange={(e) => setSelectedPosition(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-[#F9FAFB] px-3 text-sm"
                  >
                    <option value="">Select a position...</option>
                    {jobs.map((j) => <option key={j.title} value={j.title}>{j.title}</option>)}
                    <option value="General Application">General Application (open role)</option>
                  </select>
                </div>

                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] tracking-luxury uppercase text-[#A68A3F] font-medium mb-2 block">Full Name *</label>
                    <input name="name" required className="w-full h-10 rounded-md border border-input bg-[#F9FAFB] px-3 text-sm" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="text-[10px] tracking-luxury uppercase text-[#A68A3F] font-medium mb-2 block">Email *</label>
                    <input name="email" type="email" required className="w-full h-10 rounded-md border border-input bg-[#F9FAFB] px-3 text-sm" placeholder="your@email.com" />
                  </div>
                </div>

                {/* Phone + Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] tracking-luxury uppercase text-[#A68A3F] font-medium mb-2 block">Phone</label>
                    <input name="phone" className="w-full h-10 rounded-md border border-input bg-[#F9FAFB] px-3 text-sm" placeholder="+971 50 123 4567" />
                  </div>
                  <div>
                    <label className="text-[10px] tracking-luxury uppercase text-[#A68A3F] font-medium mb-2 block">Years of Experience</label>
                    <input name="experience" className="w-full h-10 rounded-md border border-input bg-[#F9FAFB] px-3 text-sm" placeholder="e.g. 5 years" />
                  </div>
                </div>

                {/* CV Upload */}
                <div>
                  <label className="text-[10px] tracking-luxury uppercase text-[#A68A3F] font-medium mb-2 block">Upload CV (PDF or Word, max 10MB) *</label>
                  <input
                    ref={cvRef}
                    type="file"
                    name="cv"
                    accept=".pdf,.doc,.docx"
                    required
                    onChange={(e) => setCvFileName(e.target.files?.[0]?.name || "")}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => cvRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-dashed border-[#C9A961]/40 hover:border-[#C9A961] hover:bg-[#C9A961]/5 transition-colors text-sm text-[#0A1F44]"
                    >
                      <ArrowRight className="size-4 text-[#A68A3F] rotate-45" />
                      {cvFileName ? "Change File" : "Choose File"}
                    </button>
                    {cvFileName && (
                      <span className="text-xs text-green-600 font-medium truncate">{cvFileName}</span>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-[10px] tracking-luxury uppercase text-[#A68A3F] font-medium mb-2 block">Cover Note</label>
                  <textarea
                    name="message"
                    rows={4}
                    className="w-full rounded-md border border-input bg-[#F9FAFB] px-3 py-2 text-sm resize-none"
                    placeholder="Tell us about yourself, your languages, and why you'd be a great fit..."
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-full bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
                <p className="text-[10px] text-muted-foreground text-center">
                  Your CV will be uploaded securely and reviewed by our HR team. We respond to all applications within 5-7 business days.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function SavedView() {
  const { setActiveView, savedProperties } = useStore();
  const { data } = useApi<{ properties: Property[] }>("/api/public/properties?limit=0", { properties: fallbackProperties });
  const properties: Property[] = data?.properties || fallbackProperties;
  const saved = properties.filter((p: Property) => savedProperties.includes(p.id));
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-royal-gradient-diagonal text-white py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <button onClick={() => setActiveView("home")} className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-[#A68A3F] mb-5">
            <ArrowLeft className="size-3.5" /> Back to Home
          </button>
          <div className="text-[10px] tracking-luxury uppercase text-[#A68A3F] mb-3">Your Collection</div>
          <h1 className="h1 text-white">Saved Properties</h1>
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-6 py-12">
        {saved.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-6">You haven't saved any properties yet.</p>
            <button onClick={() => setActiveView("buy")} className="px-7 py-3 rounded-full bg-[#0A1F44] text-white text-sm font-medium">Browse Properties</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
            {saved.map((p: Property, i: number) => (
              <PropertyCard key={p.id} property={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdviceView() {
  const { setActiveView } = useStore();
  const [playingVideo, setPlayingVideo] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Fetch videos from DB; fall back to hardcoded array while loading
  const { data } = useApi<{ videos: any[] }>("/api/public/videos", { videos: advisorVideosData });
  const videos = data?.videos || advisorVideosData;

  return (
    <div className="min-h-screen bg-[#0A1F44]">
      <div className="bg-royal-gradient-diagonal text-white py-14 lg:py-16">
        <div className="container mx-auto px-4 lg:px-6">
          <button onClick={() => setActiveView("home")} className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-[#C9A961] mb-5">
            <ArrowLeft className="size-3.5" /> Back to Home
          </button>
          <h1 className="h1 text-white">Our Advice</h1>
          <p className="mt-4 body-text text-white/70 leading-relaxed">
            Our advisors share first-hand insights on market opportunities, off-plan projects, and investment strategies — straight from the communities they specialize in. Watch their latest video updates to stay ahead of Dubai's dynamic property market.
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 min-w-0">
          {videos.map((video, i) => (
            <motion.div
              key={video.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              onClick={() => video.videoUrl && setPlayingVideo(video)}
              className="group relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer bg-[#1E3A6F] min-w-0"
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover zoom-img"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44]/95 via-[#0A1F44]/20 to-[#0A1F44]/40" />
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-[#C9A961]">
                <span className="text-[8px] text-[#0A1F44] font-bold tracking-wide">{video.category}</span>
              </div>
              <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded bg-[#0A1F44]/80 backdrop-blur-sm">
                <span className="text-[8px] text-white font-medium">{video.duration}</span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="size-10 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:bg-[#C9A961] group-hover:border-[#C9A961] transition-all duration-300 group-hover:scale-110">
                  <Play className="size-4 text-white group-hover:text-[#0A1F44] ml-0.5 transition-colors" fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-white text-xs font-semibold leading-tight line-clamp-2 mb-1.5">{video.title}</h3>
                <div className="flex items-center gap-1.5">
                  <div className="size-4 rounded-full bg-[#C9A961] flex items-center justify-center text-[#0A1F44] text-[8px] font-bold flex-shrink-0">
                    {video.advisor?.charAt(0) || "R"}
                  </div>
                  <span className="text-[9px] text-white/60 truncate">{video.advisor}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Full-screen video modal — portaled to document.body */}
      {mounted && createPortal(
        <AnimatePresence>
          {playingVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPlayingVideo(null)}
              className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            >
              <button
                onClick={() => setPlayingVideo(null)}
                className="absolute top-4 right-4 z-10 size-11 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center backdrop-blur-sm flex-shrink-0"
                aria-label="Close video"
              >
                <X className="size-5 text-white" />
              </button>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-[#0A1F44] rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm md:max-w-2xl max-h-[90vh] min-w-0 flex flex-col"
              >
                <div className="relative w-full aspect-[9/16] md:aspect-video bg-black max-h-[80vh] flex-shrink-0">
                  <video
                    autoPlay
                    controls
                    playsInline
                    className="absolute inset-0 w-full h-full object-contain"
                  >
                    <source src={playingVideo.videoUrl} type="video/mp4" />
                  </video>
                </div>
                <div className="p-3 md:p-4 flex-shrink-0">
                  <h3 className="font-serif text-sm md:text-base font-medium text-white truncate">{playingVideo.title}</h3>
                  <p className="text-[10px] text-white/50 mt-0.5">{playingVideo.advisor} · {playingVideo.category}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

const advisorVideosData = [
  {
    title: "Palm Jumeirah Market Update — Q2 2026",
    advisor: "Muhammad Javed Zafar",
    role: "Managing Director",
    duration: "4:32",
    category: "Market Insights",
    thumbnail: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=600&q=80",
    description: "Why Palm Jumeirah villa prices are up 18% year-on-year and where the next opportunities lie.",
  },
  {
    title: "Off-Plan Investment Strategy — Creek Harbour",
    advisor: "Muhammad Saleem Khan",
    role: "Property Consultant",
    duration: "6:15",
    category: "Off-Plan",
    thumbnail: "https://images.unsplash.com/photo-1606293459339-aa5d34a7b0e1?auto=format&fit=crop&w=600&q=80",
    description: "Projected rental yields, payment plans, and why Creek Harbour is the top pick for 2026 investors.",
  },
  {
    title: "Golden Visa Through Property Investment",
    advisor: "Maria Raza",
    role: "Administration Manager",
    duration: "5:48",
    category: "Investor Guide",
    thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80",
    description: "Everything you need to know about the AED 2M Golden Visa route and eligible off-plan properties.",
  },
  {
    title: "Dubai Hills Estate — Family Living ROI",
    advisor: "Ahmad Raza",
    role: "Property Consultant",
    duration: "3:56",
    category: "Market Insights",
    thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    description: "Why Dubai Hills townhouses deliver the best family-living ROI in Dubai right now.",
  },
  {
    title: "Branded Residences — Are They Worth the Premium?",
    advisor: "Maria Raza",
    role: "Administration Manager",
    duration: "7:22",
    category: "Off-Plan",
    thumbnail: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    description: "Cavalli, Bugatti, Six Senses — we break down whether branded residences justify their 30% premium.",
  },
  {
    title: "Dubai Marina Rental Yields — 2026 Outlook",
    advisor: "Zeerak Hussain",
    role: "Property Consultant",
    duration: "4:10",
    category: "Investor Guide",
    thumbnail: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80",
    description: "Short-term vs long-term rental yields in Dubai Marina — which strategy wins in 2026?",
  },
];

// ─── About Off Plan View ─────────────────────────────────────────────
export function AboutOffPlanView() {
  const { setActiveView, setMortgageOpen } = useStore();
  const { get } = useSiteSettings();
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Hero */}
      <div className="bg-royal-gradient-diagonal text-white py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <button onClick={() => setActiveView("home")} className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-[#A68A3F] mb-5">
            <ArrowLeft className="size-3.5" /> Back to Home
          </button>
          <div className="text-[10px] tracking-luxury uppercase text-[#A68A3F] mb-3">{get("offplan.about.eyebrow", "Off-Plan Investment")}</div>
          <h1 className="h1 text-white">{get("offplan.about.title", "Dubai's leading Off Plan property experts")}</h1>
          <p className="mt-5 body-lg text-white/70 max-w-3xl leading-relaxed">
            {get("offplan.about.subtitle", "Dubai's residential real estate market recorded AED 139.1 billion in transactions in Q1 2026...")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={() => setActiveView("off-plan")}
              className="inline-flex items-center justify-center gap-2 bg-[#C9A961] hover:bg-[#D4AF37] text-[#0A1F44] font-semibold px-6 py-3 rounded-full transition-colors text-sm"
            >
              {get("offplan.about.button1", "Browse Off Plan projects")}
              <ArrowRight className="size-4" />
            </button>
            <button
              onClick={() => setMortgageOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-6 py-3 rounded-full transition-colors text-sm"
            >
              {get("offplan.about.button2", "Speak to a consultant")}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-6 py-12 lg:py-16">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-border/60 text-center">
            <div className="font-serif text-3xl font-semibold text-[#0A1F44]">{get("offplan.about.stat1Value", "73%")}</div>
            <div className="text-xs tracking-luxury uppercase text-muted-foreground mt-2">{get("offplan.about.stat1Label", "Off Plan share of residential sales (Q1 2026)")}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-border/60 text-center">
            <div className="font-serif text-3xl font-semibold text-[#0A1F44]">{get("offplan.about.stat2Value", "AED 139.1B")}</div>
            <div className="text-xs tracking-luxury uppercase text-muted-foreground mt-2">{get("offplan.about.stat2Label", "Total residential transactions (Q1 2026)")}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-border/60 text-center">
            <div className="font-serif text-3xl font-semibold text-[#0A1F44]">{get("offplan.about.stat3Value", "7-8%")}</div>
            <div className="text-xs tracking-luxury uppercase text-muted-foreground mt-2">{get("offplan.about.stat3Label", "Projected rental yield on completion")}</div>
          </div>
        </div>

        {/* Why invest in off-plan */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-border/60 mb-8">
          <h2 className="font-serif text-2xl font-medium text-[#0A1F44] mb-6">Why invest in Off Plan properties?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-xl bg-[#C9A961]/15 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="size-4 text-[#A68A3F]" />
              </div>
              <div>
                <h3 className="font-medium text-[#0A1F44] text-sm">Flexible Payment Plans</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Spread payments across construction milestones — typically 40-60% during construction, balance on handover.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-xl bg-[#C9A961]/15 flex items-center justify-center flex-shrink-0">
                <Building2 className="size-4 text-[#A68A3F]" />
              </div>
              <div>
                <h3 className="font-medium text-[#0A1F44] text-sm">Capital Appreciation</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Buy at pre-launch prices and benefit from capital growth during the construction period — often 15-30% before handover.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-xl bg-[#C9A961]/15 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="size-4 text-[#A68A3F]" />
              </div>
              <div>
                <h3 className="font-medium text-[#0A1F44] text-sm">Golden Visa Eligibility</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Off-plan purchases above AED 2M qualify for the 10-year UAE Golden Visa once 20% of the price is paid.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-xl bg-[#C9A961]/15 flex items-center justify-center flex-shrink-0">
                <Tag className="size-4 text-[#A68A3F]" />
              </div>
              <div>
                <h3 className="font-medium text-[#0A1F44] text-sm">Developer Incentives</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Post-handover payment plans, DLD fee waivers, free service charges, and furnished packages from leading developers.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-royal-gradient-diagonal rounded-2xl p-8 text-white text-center">
          <h2 className="font-serif text-2xl font-medium mb-3">{get("offplan.about.ctaTitle", "Ready to explore Off Plan opportunities?")}</h2>
          <p className="text-sm text-white/70 mb-6 max-w-xl mx-auto">{get("offplan.about.ctaSubtitle", "Get first-call access to pre-launch inventory from Emaar, DAMAC, Sobha, and more. Our RERA-certified advisors will guide you through every step.")}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setActiveView("off-plan")}
              className="inline-flex items-center justify-center gap-2 bg-[#C9A961] hover:bg-[#D4AF37] text-[#0A1F44] font-semibold px-6 py-3 rounded-full transition-colors text-sm"
            >
              Browse Off Plan projects <ArrowRight className="size-4" />
            </button>
            <button
              onClick={() => setActiveView("developers")}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-6 py-3 rounded-full transition-colors text-sm"
            >
              View Developers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
