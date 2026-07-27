"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ArrowRight, Clock, TrendingUp, Building2, Tag, Calculator, X, Volume2, VolumeX } from "lucide-react";
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Fetch videos from DB; fall back to hardcoded array while loading
  const { data } = useApi<{ videos: any[] }>("/api/public/videos", { videos: advisorVideos });
  const videos = data?.videos || advisorVideos;

  const handleVideoClick = (video: any) => {
    // If the video has an actual video URL, open the full-screen modal.
    // Otherwise, no-op (the card already shows the thumbnail + metadata).
    if (video.videoUrl) {
      setPlayingVideo(video);
    }
  };

  return (
    <section className="bg-[#0A1F44] py-10 lg:py-14 relative overflow-hidden">
      {/* Subtle dot pattern (decorative — kept from previous design) */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 1) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="container mx-auto px-4 lg:px-6 relative">
        {/* Section header */}
        <div className="max-w-2xl mb-8 lg:mb-12">
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
            Our advisors share first-hand insights on market opportunities, off-plan projects, and investment strategies — straight from the communities they specialize in. Swipe through the latest video updates to stay ahead of Dubai's dynamic property market.
          </motion.p>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            Video grid — STRICTLY matches "Latest Listings" card layout.
            Same grid columns, gap, border-radius, border, shadow, hover
            behavior, body padding, and card frame as Latest Listings
            (FeaturedProperties.tsx → PropertyCard.tsx):
              grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6
            Exactly 4 cards in a single row on desktop (no second row).
            The video frame inside each card keeps the 9:16 vertical
            aspect ratio. Title + agent name live in a clean bottom body
            section (same pattern as PropertyCard body).
            ════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 mt-12 min-w-0">
          {videos.slice(0, 4).map((video, i) => (
            <ReelsCard
              key={`v-${video.title}-${i}`}
              video={video}
              index={i}
              onClick={() => handleVideoClick(video)}
            />
          ))}
        </div>

        {/* View all videos CTA */}
        <div className="flex justify-center mt-10">
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C9A961] hover:bg-[#D4B875] text-[#0A1F44] text-sm font-medium transition-all duration-300 shadow-sm">
            View All Videos
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          Full-screen video modal — portaled to document.body so it's
          independent of this section's overflow-hidden and any Homepage
          ancestor transforms that would break position:fixed positioning.
          Opens when a user taps a card (mobile) or clicks (desktop).
         ════════════════════════════════════════════════════════════════ */}
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
                aria-label="Close video"
              >
                <X className="size-5 text-white" />
              </button>

              {/* Video container — 9:16 portrait on mobile, 16:9 on desktop */}
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
                    muted
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
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ReelsCard — video card with edge-to-edge video filling entire card.
//
// Card frame is IDENTICAL to PropertyCard.tsx (same width, border,
// radius, shadow, hover lift) — card size unchanged.
//
// The video fills the ENTIRE card from edge to edge (flex-1 + absolute
// inset-0 video with object-cover). No white empty space. The video
// thumbnail/play area is the only content of the card.
//
// Title + agent name are positioned as a BOTTOM OVERLAY on the video
// itself with a subtle dark gradient for readability.
//
// The 9:16 video source uses object-cover to fill the card dimensions
// (which match the Latest Listings card width + the natural height
// determined by the grid row).
// ═══════════════════════════════════════════════════════════════════════

interface ReelsCardProps {
  video: any;
  index: number;
  onClick: () => void;
}

function ReelsCard({ video, index, onClick }: ReelsCardProps) {
  const Icon = categoryIcons[video.category] || TrendingUp;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !video.videoUrl) return;
    if (isHovered) {
      v.play().then(() => setIsPlaying(true)).catch(() => {
        setIsPlaying(false);
      });
    } else {
      v.pause();
      setIsPlaying(false);
    }
  }, [isHovered, video.videoUrl]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.6,
        delay: Math.min(index * 0.06, 0.4),
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      // Card frame — IDENTICAL to PropertyCard.tsx (card size unchanged).
      // flex flex-col so the video area can grow to fill the card.
      className="group relative bg-[#0A1F44] rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-[0_2px_12px_rgba(10,31,68,0.04)] transition-all duration-300 hover:shadow-[0_18px_50px_rgba(10,31,68,0.15)] hover:border-[#C9A961]/40 hover:-translate-y-1 flex flex-col cursor-pointer min-w-0"
    >
      {/* ═══════════════════════════════════════════════════════════════
          VIDEO AREA — fills the ENTIRE card edge to edge.
          Uses aspect-[4/3] (same as PropertyCard image area) to define
          a fixed height for the card. Video + thumbnail both use
          absolute inset-0 + w-full h-full object-cover so they
          completely fill the card with no white space.
          ═══════════════════════════════════════════════════════════════ */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#0A1F44]">
        {/* Thumbnail — fills entire card, fades out when video plays */}
        <img
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isPlaying ? "opacity-0" : "opacity-100 group-hover:scale-[1.04]"
          }`}
        />

        {/* Video element — 9:16 source, object-cover fills entire card */}
        {video.videoUrl && (
          <video
            ref={videoRef}
            src={video.videoUrl}
            muted
            loop
            playsInline
            preload="metadata"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isPlaying ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Subtle dark gradient at bottom for title readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44]/90 via-[#0A1F44]/10 to-[#0A1F44]/15 pointer-events-none" />

        {/* Top-left: category badge (gold) */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#C9A961] shadow-md z-10">
          <span className="text-[9px] sm:text-[10px] text-[#0A1F44] font-bold tracking-wide flex items-center gap-1">
            <Icon className="size-2.5 sm:size-3" />
            {video.category}
          </span>
        </div>

        {/* Top-right: duration pill + (hover) mute toggle */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <div className="px-2 py-1 rounded-md bg-[#0A1F44]/80 backdrop-blur-sm">
            <span className="text-[9px] sm:text-[10px] text-white font-medium">{video.duration}</span>
          </div>
          {video.videoUrl && isPlaying && (
            <button
              onClick={toggleMute}
              className="size-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-[#C9A961] hover:text-[#0A1F44] text-white transition-colors"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
            </button>
          )}
        </div>

        {/* Center: play button overlay (when not playing) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="size-12 sm:size-14 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:bg-[#C9A961] group-hover:border-[#C9A961] transition-all duration-300 group-hover:scale-110">
              <Play className="size-5 sm:size-6 text-white group-hover:text-[#0A1F44] ml-0.5 transition-colors" fill="currentColor" />
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            BOTTOM OVERLAY — title + agent name ON the video itself.
            Positioned at the bottom of the card with the dark gradient
            above for readability.
            ═══════════════════════════════════════════════════════════════ */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-10">
          {/* Title — elegant, 2-line clamp, white with drop shadow */}
          <h3 className="text-white text-xs sm:text-sm font-semibold leading-snug line-clamp-2 mb-1.5 drop-shadow-md">
            {video.title}
          </h3>
          {/* Agent row — avatar (initials on gold disc) + name */}
          <div className="flex items-center gap-1.5">
            <div className="size-5 sm:size-6 rounded-full bg-gradient-to-br from-[#C9A961] to-[#A68A3F] flex items-center justify-center text-[#0A1F44] text-[9px] sm:text-[10px] font-bold flex-shrink-0 ring-1 ring-white/30">
              {video.advisor?.charAt(0) || "R"}
            </div>
            <span className="text-[10px] sm:text-[11px] text-white/90 font-medium truncate drop-shadow-sm">
              {video.advisor}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
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
