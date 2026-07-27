"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Maximize2, ZoomIn } from "lucide-react";

interface Props {
  /** Property title — used for alt text on all images. */
  title: string;
  /** Raw image URLs from the API/DB. Will be filtered + de-duplicated. */
  images: string[];
  /** Optional status badge text shown on top-left of main image. */
  statusLabel?: string;
}

/**
 * Premium property image gallery for Royal Jubilant Real Estate.
 *
 * Features:
 *   • Large main image, dynamic from Supabase
 *   • Smooth prev/next navigation (fade + slide transition)
 *   • Thumbnail strip below main image — click to jump
 *   • Full-screen lightbox (click main image or expand button)
 *   • Mobile swipe support (Framer Motion drag)
 *   • Keyboard navigation: ← → (prev/next), Esc (close lightbox)
 *   • Image counter (e.g. "1 / 12")
 *   • Auto-hide controls when only 1 image exists
 *   • Filters empty / null / duplicate URLs
 *   • Broken-image fallback (onError shows elegant placeholder)
 *
 * Design: Royal Jubilant brand — Navy #0A1F44, Gold #C9A961, Silver #9CA3AF,
 * White. No Dubizzle/Bayut imitation — uses generous whitespace, subtle gold
 * accents on hover, and dark navy overlays for the lightbox.
 */
export function PropertyGallery({ title, images, statusLabel }: Props) {
  // ── Sanitize input: filter empties, dedupe, trim ─────────────────────────
  const cleanImages = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of images ?? []) {
      if (!raw) continue;
      const url = String(raw).trim();
      if (!url) continue;
      if (seen.has(url)) continue;
      seen.add(url);
      out.push(url);
    }
    return out;
  }, [images]);

  const hasMultiple = cleanImages.length > 1;
  const total = cleanImages.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [brokenSet, setBrokenSet] = useState<Set<number>>(new Set());

  // Filter visible images = cleanImages minus broken ones
  const visibleImages = useMemo(
    () => cleanImages.filter((_, i) => !brokenSet.has(i)),
    [cleanImages, brokenSet]
  );
  const visibleTotal = visibleImages.length;

  // Re-clamp activeIndex if broken images removed it
  useEffect(() => {
    if (activeIndex >= visibleTotal && visibleTotal > 0) {
      setActiveIndex(visibleTotal - 1);
    }
  }, [visibleTotal, activeIndex]);

  // ── Navigation handlers ─────────────────────────────────────────────────
  const goTo = useCallback(
    (idx: number) => {
      if (!hasMultiple || visibleTotal === 0) return;
      // Normalize within [0, visibleTotal)
      const next = ((idx % visibleTotal) + visibleTotal) % visibleTotal;
      setActiveIndex(next);
    },
    [hasMultiple, visibleTotal]
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [goTo, activeIndex]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [goTo, activeIndex]);

  // ── Keyboard navigation ─────────────────────────────────────────────────
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll while lightbox is open
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, goNext, goPrev]);

  // ── Broken-image handler ────────────────────────────────────────────────
  const handleImageError = (idx: number) => {
    setBrokenSet((prev) => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  };

  // ── Empty state ─────────────────────────────────────────────────────────
  if (total === 0 || visibleTotal === 0) {
    return (
      <div className="aspect-[16/10] rounded-2xl bg-[#F4F5F7] flex items-center justify-center text-[#9CA3AF]">
        <div className="text-center">
          <Maximize2 className="size-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────────
          MAIN GALLERY
         ───────────────────────────────────────────────────────────────── */}
      <div className="relative">
        {/* Main image — clickable to open lightbox */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-[#F4F5F7] group">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeIndex}
              src={visibleImages[activeIndex]}
              alt={`${title} — image ${activeIndex + 1} of ${visibleTotal}`}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full object-cover cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
              onError={() => {
                // Map visibleImages index back to cleanImages index
                const brokenUrl = visibleImages[activeIndex];
                const cleanIdx = cleanImages.indexOf(brokenUrl);
                if (cleanIdx >= 0) handleImageError(cleanIdx);
              }}
              draggable={false}
            />
          </AnimatePresence>

          {/* Subtle navy gradient overlay at the bottom for badge legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44]/35 via-transparent to-transparent pointer-events-none" />

          {/* Top-left: status badge (gold) — only when statusLabel provided */}
          {statusLabel && (
            <span className="absolute top-4 left-4 inline-flex items-center gap-1 bg-[#C9A961] text-[#0A1F44] text-[11px] font-semibold px-3 py-1.5 rounded-full tracking-wide shadow-md">
              {statusLabel}
            </span>
          )}

          {/* Top-right: expand-to-lightbox button */}
          <button
            onClick={() => setLightboxOpen(true)}
            aria-label="Open full-screen gallery"
            title="View full screen"
            className="absolute top-4 right-4 size-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-md"
          >
            <Maximize2 className="size-4 text-[#0A1F44]" />
          </button>

          {/* Bottom-left: image counter (e.g. "1 / 12") */}
          {hasMultiple && (
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 bg-[#0A1F44]/85 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1.5 rounded-md tracking-wide font-mono">
              {activeIndex + 1} <span className="opacity-50">/</span>{" "}
              {visibleTotal}
            </span>
          )}

          {/* Bottom-right: "Click to expand" hint (premium touch) */}
          {hasMultiple && (
            <span className="hidden sm:inline-flex absolute bottom-4 right-4 items-center gap-1.5 bg-white/95 backdrop-blur-md text-[#0A1F44] text-[10px] font-medium px-2.5 py-1.5 rounded-md tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="size-3 text-[#C9A961]" /> Click to expand
            </span>
          )}

          {/* Prev / Next arrows — only when multiple images */}
          {hasMultiple && (
            <>
              <button
                onClick={goPrev}
                aria-label="Previous image"
                className="absolute top-1/2 left-3 -translate-y-1/2 size-11 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-md"
              >
                <ChevronLeft className="size-5 text-[#0A1F44]" />
              </button>
              <button
                onClick={goNext}
                aria-label="Next image"
                className="absolute top-1/2 right-3 -translate-y-1/2 size-11 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-md"
              >
                <ChevronRight className="size-5 text-[#0A1F44]" />
              </button>
            </>
          )}
        </div>

        {/* ───────────────────────────────────────────────────────────────
            THUMBNAIL STRIP — horizontal scroll, click to jump
           ─────────────────────────────────────────────────────────────── */}
        {hasMultiple && (
          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-thin pb-1">
            {visibleImages.map((img, idx) => (
              <button
                key={`${img}-${idx}`}
                onClick={() => goTo(idx)}
                aria-label={`View image ${idx + 1}`}
                aria-current={idx === activeIndex}
                className={`relative flex-shrink-0 w-20 h-16 sm:w-24 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  idx === activeIndex
                    ? "border-[#C9A961] shadow-md ring-2 ring-[#C9A961]/20"
                    : "border-transparent opacity-70 hover:opacity-100 hover:border-[#E5E7EB]"
                }`}
              >
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
                {/* Subtle navy tint on inactive thumbnails */}
                {idx !== activeIndex && (
                  <div className="absolute inset-0 bg-[#0A1F44]/10 pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          FULL-SCREEN LIGHTBOX
         ───────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-[#0A1F44]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Top bar: counter + close button */}
            <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between text-white z-10">
              <div className="flex items-center gap-3">
                {hasMultiple && (
                  <span className="font-mono text-sm font-medium tracking-wide bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-md">
                    {activeIndex + 1} <span className="opacity-50">/</span>{" "}
                    {visibleTotal}
                  </span>
                )}
                <span className="text-xs text-white/70 truncate max-w-[60vw]">
                  {title}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxOpen(false);
                }}
                aria-label="Close gallery"
                className="size-11 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="size-5 text-white" />
              </button>
            </div>

            {/* Center: large image with swipe support */}
            <motion.div
              className="relative max-w-[90vw] max-h-[80vh] flex items-center justify-center"
              drag={hasMultiple ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (!hasMultiple) return;
                // Stop click propagation so the close-on-backdrop doesn't fire
                e.stopPropagation?.();
                const threshold = 50;
                if (info.offset.x < -threshold) goNext();
                else if (info.offset.x > threshold) goPrev();
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeIndex}
                  src={visibleImages[activeIndex]}
                  alt={`${title} — image ${activeIndex + 1} of ${visibleTotal}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="max-w-[90vw] max-h-[80vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                  draggable={false}
                />
              </AnimatePresence>
            </motion.div>

            {/* Prev / Next — lightbox version (gold accent for premium feel) */}
            {hasMultiple && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                  aria-label="Previous image"
                  className="absolute top-1/2 left-3 sm:left-6 -translate-y-1/2 size-12 sm:size-14 rounded-full bg-white/10 backdrop-blur-md hover:bg-[#C9A961] hover:text-[#0A1F44] flex items-center justify-center transition-all text-white"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                  aria-label="Next image"
                  className="absolute top-1/2 right-3 sm:right-6 -translate-y-1/2 size-12 sm:size-14 rounded-full bg-white/10 backdrop-blur-md hover:bg-[#C9A961] hover:text-[#0A1F44] flex items-center justify-center transition-all text-white"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}

            {/* Bottom: thumbnail strip in lightbox (only on sm+ for thumb-friendly UX) */}
            {hasMultiple && (
              <div className="hidden sm:flex absolute bottom-0 inset-x-0 p-6 gap-2 overflow-x-auto justify-start max-w-full">
                {visibleImages.map((img, idx) => (
                  <button
                    key={`lb-${img}-${idx}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      goTo(idx);
                    }}
                    aria-label={`Jump to image ${idx + 1}`}
                    className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all ${
                      idx === activeIndex
                        ? "border-[#C9A961]"
                        : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Mobile swipe hint */}
            {hasMultiple && (
              <span className="sm:hidden absolute bottom-4 inset-x-0 text-center text-xs text-white/60 pointer-events-none">
                ← Swipe to navigate →
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
