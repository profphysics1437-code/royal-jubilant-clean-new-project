"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ArrowRight, Clock, TrendingUp, Building2, Tag, Calculator, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { useApi } from "@/lib/useApi";

const advisorVideos = [
  {
    title: "River Side Investment Opportunity by Damac",
    advisor: "Muhammad Javed Zafar",
    role: "Managing Director",
    duration: "2:01",
    category: "Off-Plan",
    thumbnail: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80",
    description: "An exclusive look at DAMAC's latest riverside development — investment potential, payment plans, and projected ROI.",
    videoUrl: "/videos/river-side-investment-damac.mp4",
  },
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

const categoryIcons: Record<string, any> = {
  "Market Insights": TrendingUp,
  "Off-Plan": Building2,
  "Investor Guide": Clock,
};

export function VideoSection() {
  const [playingVideo, setPlayingVideo] = useState<any>(null);
  // mounted ensures createPortal only runs on client (SSR safety).
  // The video modal is portaled to document.body so it's independent
  // of this section's overflow-hidden and any Homepage ancestor
  // transforms that would break position:fixed positioning.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // Fetch videos from DB; fall back to hardcoded array while loading
  const { data } = useApi<{ videos: any[] }>("/api/public/videos", { videos: advisorVideos });
  const videos = data?.videos || advisorVideos;

  const handleVideoClick = (video: any) => {
    if (video.videoUrl) {
      setPlayingVideo(video);
    }
  };

  return (
    <section className="bg-[#0A1F44] py-10 lg:py-14 relative overflow-hidden">
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 1) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="container mx-auto px-4 lg:px-6 relative">
        {/* Section header */}
        <div className="max-w-2xl mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C9A961]/15 text-[#C9A961] text-xs tracking-luxury uppercase mb-5"
          >
            <Play className="size-3.5" /> Our Advice
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="h1 text-white mb-4"
          >
            Dubai through the eyes of<br />
            <span style={{
              background: "linear-gradient(135deg, #D4AF37 0%, #F0D077 50%, #B8860B 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              a Royal Jubilant advisor.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="body-text text-white/70"
          >
            Our advisors share first-hand insights on market opportunities, off-plan projects, and investment strategies — straight from the communities they specialize in. Watch their latest video updates to stay ahead of Dubai's dynamic property market.
          </motion.p>
        </div>

        {/* Video gallery — 9:16 portrait cards like a media gallery (max 6 on homepage) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 min-w-0">
          {videos.slice(0, 6).map((video, i) => {
            const Icon = categoryIcons[video.category] || TrendingUp;
            return (
              <motion.div
                key={video.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                onClick={() => handleVideoClick(video)}
                className="group relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer bg-[#1E3A6F]"
              >
                {/* Thumbnail */}
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover zoom-img"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44]/95 via-[#0A1F44]/20 to-[#0A1F44]/40" />

                {/* Category badge — top left */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-[#C9A961]">
                  <span className="text-[8px] text-[#0A1F44] font-bold tracking-wide flex items-center gap-0.5">
                    <Icon className="size-2.5" />
                    {video.category}
                  </span>
                </div>

                {/* Duration — top right */}
                <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded bg-[#0A1F44]/80 backdrop-blur-sm">
                  <span className="text-[8px] text-white font-medium">{video.duration}</span>
                </div>

                {/* Play button — center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-10 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:bg-[#C9A961] group-hover:border-[#C9A961] transition-all duration-300 group-hover:scale-110">
                    <Play className="size-4 text-white group-hover:text-[#0A1F44] ml-0.5 transition-colors" fill="currentColor" />
                  </div>
                </div>

                {/* Bottom content — title + advisor */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white text-xs font-semibold leading-tight line-clamp-2 mb-1.5">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <div className="size-4 rounded-full bg-[#C9A961] flex items-center justify-center text-[#0A1F44] text-[8px] font-bold flex-shrink-0">
                      {video.advisor.charAt(0)}
                    </div>
                    <span className="text-[9px] text-white/60 truncate">{video.advisor}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View all videos CTA */}
        <div className="flex justify-center mt-10">
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C9A961] hover:bg-[#D4B875] text-[#0A1F44] text-sm font-medium transition-all duration-300 shadow-sm">
            View All Videos
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Video player modal — portaled to document.body so it's independent
          of this section's overflow-hidden and any Homepage ancestor
          transforms that would break position:fixed positioning. */}
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
              {/* Close button */}
              <button
                onClick={() => setPlayingVideo(null)}
                className="absolute top-4 right-4 z-10 size-11 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center backdrop-blur-sm flex-shrink-0"
              >
                <X className="size-5 text-white" />
              </button>

              {/* Video container — 9:16 portrait on mobile, 16:9 on desktop.
                  max-h-[90vh] prevents the card from exceeding viewport height
                  on short screens. max-w-full + min-w-0 prevents horizontal
                  overflow. w-full max-w-sm constrains width on mobile. */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-[#0A1F44] rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm md:max-w-2xl max-h-[90vh] min-w-0 flex flex-col"
              >
                {/* Video — 9:16 on mobile, 16:9 on desktop.
                    max-h constrains the video area on short screens. */}
                <div className="relative w-full aspect-[9/16] md:aspect-video bg-black max-h-[80vh] flex-shrink-0">
                  <video
                    autoPlay
                    muted
                    controls
                    playsInline
                    className="absolute inset-0 w-full h-full object-contain"
                  >
                    <source src={playingVideo.videoUrl} type="video/mp4" />
                  </video>
                </div>
                {/* Title bar */}
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
    </section>
  );
}

export function InvestmentCTA() {
  const { setValuationOpen, setMortgageOpen, setActiveView } = useStore();

  return (
    <section className="py-20 lg:py-28 bg-[#F9FAFB]">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
          {/* Valuation card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-[#0A1F44] p-8 lg:p-12 text-white"
          >
            <div className="absolute -top-12 -right-12 size-48 rounded-full bg-[#C9A961]/15 blur-3xl" />
            <div className="relative">
              <div className="size-14 rounded-2xl bg-[#C9A961] flex items-center justify-center mb-6">
                <Tag className="size-6 text-[#0A1F44]" />
              </div>
              <h3 className="font-serif text-2xl lg:text-3xl font-medium mb-3">
                What's your Dubai property worth?
              </h3>
              <p className="text-white/75 leading-relaxed mb-6 max-w-md">
                Get a complimentary, no-obligation valuation from a senior advisor — typically delivered within 24 hours, with comparable sales data.
              </p>
              <button
                onClick={() => setValuationOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C9A961] hover:bg-[#D4B875] text-[#0A1F44] font-medium text-sm transition-colors"
              >
                Request Free Valuation <ArrowRight className="size-4" />
              </button>
            </div>
          </motion.div>

          {/* Mortgage card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl bg-white border border-[#E5E7EB] p-8 lg:p-12"
          >
            <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-[#C9A961]/10 blur-3xl" />
            <div className="relative">
              <div className="size-14 rounded-2xl bg-[#C9A961]/15 flex items-center justify-center mb-6">
                <Calculator className="size-6 text-[#A68A3F]" />
              </div>
              <h3 className="font-serif text-2xl lg:text-3xl font-medium text-[#0A1F44] mb-3">
                Plan your purchase
              </h3>
              <p className="text-[#6B7280] leading-relaxed mb-6 max-w-md">
                Calculate monthly repayments, compare mortgage products from 12 UAE banks, and pre-qualify in minutes with our in-house mortgage desk.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setMortgageOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white font-medium text-sm transition-colors"
                >
                  Open Calculator <ArrowRight className="size-4" />
                </button>
                <button
                  onClick={() => setActiveView("contact")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#E5E7EB] hover:border-[#A68A3F] text-[#0A1F44] font-medium text-sm transition-colors"
                >
                  Speak to an Advisor
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
