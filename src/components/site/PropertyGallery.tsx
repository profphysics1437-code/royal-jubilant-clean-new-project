"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Maximize2, Images } from "lucide-react";

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
 * Layout: 3-photo collage at top (1 large + 2 stacked). Click ANY image
 * to open the full-screen lightbox starting at that index.
 *
 * Adapts gracefully:
 *   • 1 image  → full-width single hero
 *   • 2 images → 50/50 split
 *   • 3 images → 1 large + 2 stacked
 *   • 4+ images → 1 large + 2 stacked + "+X Photos" overlay
 *
 * Lightbox features:
 *   • Opens at the clicked image's index (not always 0)
 *   • Smooth fade+scale transitions
 *   • Prev/Next chevrons (gold on hover)
 *   • Image counter "1 / N" (monospace)
 *   • Bottom thumbnail strip (desktop)
 *   • Mobile swipe (Framer Motion drag, 50px threshold)
 *   • Keyboard nav: ArrowLeft/Right + Escape
 *   • Body scroll lock while open
 *
 * Design: Royal Jubilant brand — Navy #0A1F44, Gold #C9A961, Silver #9CA3AF,
 * White. Mobile-first: no horizontal scroll, touch-friendly tap targets.
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

  const total = cleanImages.length;
  const hasMultiple = total > 1;

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
      const next = ((idx % visibleTotal) + visibleTotal) % visibleTotal;
      setActiveIndex(next);
    },
    [hasMultiple, visibleTotal]
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [goTo, activeIndex]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [goTo, activeIndex]);

  // Open lightbox at a specific index — used by the collage click handlers
  const openLightbox = useCallback((idx: number) => {
    setActiveIndex(idx);
    setLightboxOpen(true);
  }, []);

  // ── Keyboard navigation (only when lightbox is open) ────────────────────
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, goNext, goPrev]);

  // ── Broken-image handler ────────────────────────────────────────────────
  const handleImageError = (url: string) => {
    const cleanIdx = cleanImages.indexOf(url);
    if (cleanIdx >= 0) {
      setBrokenSet((prev) => {
        const next = new Set(prev);
        next.add(cleanIdx);
        return next;
      });
    }
  };

  // ── Empty state ─────────────────────────────────────────────────────────
  if (total === 0 || visibleTotal === 0) {
    return (
      <div className="aspect-[16/10] sm:aspect-[16/9] rounded-2xl bg-[#F4F5F7] flex items-center justify-center text-[#9CA3AF]">
        <div className="text-center px-6">
          <Images className="size-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No images available</p>
        </div>
      </div>
    );
  }

  // ── Helper: render a single image with error fallback ──────────────────
  const renderImage = (url: string, alt: string) => (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      className="w-full h-full object-cover"
      onError={() => handleImageError(url)}
      draggable={false}
    />
  );

  // ═══════════════════════════════════════════════════════════════════════
  // COLLAGE LAYOUT — adapts to image count
  // ═══════════════════════════════════════════════════════════════════════
  const renderCollage = () => {
    // ── 1 image: full-width single hero ──
    if (visibleTotal === 1) {
      return (
        <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-[#F4F5F7] group cursor-zoom-in">
          <button
            onClick={() => openLightbox(0)}
            aria-label="Open full-screen gallery"
            className="block w-full h-full"
          >
            {renderImage(visibleImages[0], `${title} — image 1 of 1`)}
          </button>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44]/30 via-transparent to-transparent pointer-events-none" />
          {statusLabel && (
            <span className="absolute top-4 left-4 inline-flex items-center gap-1 bg-[#C9A961] text-[#0A1F44] text-[11px] font-semibold px-3 py-1.5 rounded-full tracking-wide shadow-md pointer-events-none">
              {statusLabel}
            </span>
          )}
          <div className="absolute top-4 right-4 size-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-md pointer-events-none">
            <Maximize2 className="size-4 text-[#0A1F44]" />
          </div>
        </div>
      );
    }

    // ── 2 images: 50/50 split ──
    if (visibleTotal === 2) {
      return (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 rounded-2xl overflow-hidden">
          <button
            onClick={() => openLightbox(0)}
            aria-label="Open gallery — image 1"
            className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-[#F4F5F7] group cursor-zoom-in"
          >
            {renderImage(visibleImages[0], `${title} — image 1 of 2`)}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44]/30 via-transparent to-transparent pointer-events-none" />
            {statusLabel && (
              <span className="absolute top-4 left-4 inline-flex items-center gap-1 bg-[#C9A961] text-[#0A1F44] text-[11px] font-semibold px-3 py-1.5 rounded-full tracking-wide shadow-md pointer-events-none">
                {statusLabel}
              </span>
            )}
            <div className="absolute top-4 right-4 size-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-md pointer-events-none group-hover:scale-110 transition-transform">
              <Maximize2 className="size-4 text-[#0A1F44]" />
            </div>
          </button>
          <button
            onClick={() => openLightbox(1)}
            aria-label="Open gallery — image 2"
            className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-[#F4F5F7] group cursor-zoom-in"
          >
            {renderImage(visibleImages[1], `${title} — image 2 of 2`)}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44]/30 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-4 right-4 size-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-md pointer-events-none group-hover:scale-110 transition-transform">
              <Maximize2 className="size-4 text-[#0A1F44]" />
            </div>
          </button>
        </div>
      );
    }

    // ── 3+ images: 1 large left + 2 stacked right ──
    const hasMoreThanThree = visibleTotal > 3;
    const extraCount = visibleTotal - 3;

    return (
      <div className="grid grid-cols-4 grid-rows-2 gap-2 sm:gap-3 rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9]">
        {/* Main image (left, spans 2 rows) */}
        <button
          onClick={() => openLightbox(0)}
          aria-label="Open gallery — main image"
          className="relative col-span-4 sm:col-span-3 row-span-2 overflow-hidden bg-[#F4F5F7] group cursor-zoom-in"
        >
          {renderImage(visibleImages[0], `${title} — image 1 of ${visibleTotal}`)}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44]/35 via-transparent to-transparent pointer-events-none" />
          {statusLabel && (
            <span className="absolute top-4 left-4 inline-flex items-center gap-1 bg-[#C9A961] text-[#0A1F44] text-[11px] font-semibold px-3 py-1.5 rounded-full tracking-wide shadow-md pointer-events-none">
              {statusLabel}
            </span>
          )}
          <div className="absolute top-4 right-4 size-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-md pointer-events-none group-hover:scale-110 transition-transform">
            <Maximize2 className="size-4 text-[#0A1F44]" />
          </div>
          {/* Mobile counter badge */}
          <span className="sm:hidden absolute bottom-4 left-4 inline-flex items-center gap-1 bg-[#0A1F44]/85 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1.5 rounded-md tracking-wide font-mono pointer-events-none">
            <Images className="size-3" /> {visibleTotal} photos
          </span>
        </button>

        {/* Image 2 (top-right) — hidden on mobile to keep layout clean */}
        <button
          onClick={() => openLightbox(1)}
          aria-label="Open gallery — image 2"
          className="hidden sm:block relative col-span-1 row-span-1 overflow-hidden bg-[#F4F5F7] group cursor-zoom-in"
        >
          {renderImage(visibleImages[1], `${title} — image 2 of ${visibleTotal}`)}
          <div className="absolute inset-0 bg-[#0A1F44]/0 group-hover:bg-[#0A1F44]/15 transition-colors pointer-events-none" />
        </button>

        {/* Image 3 (bottom-right) with +X Photos overlay if 4+ images */}
        <button
          onClick={() => openLightbox(2)}
          aria-label={
            hasMoreThanThree
              ? `Open gallery — view all ${visibleTotal} photos`
              : "Open gallery — image 3"
          }
          className="hidden sm:block relative col-span-1 row-span-1 overflow-hidden bg-[#F4F5F7] group cursor-zoom-in"
        >
          {renderImage(visibleImages[2], `${title} — image 3 of ${visibleTotal}`)}
          {/* Dark overlay so the "+X Photos" text is legible */}
          <div className="absolute inset-0 bg-[#0A1F44]/20 group-hover:bg-[#0A1F44]/40 transition-colors pointer-events-none flex items-center justify-center">
            {hasMoreThanThree && (
              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-[#0A1F44] text-xs font-semibold px-3 py-1.5 rounded-md inline-flex items-center gap-1.5">
                <Images className="size-3.5 text-[#C9A961]" />
                View all {visibleTotal}
              </span>
            )}
          </div>
          {/* Persistent "+X Photos" badge (always visible, bottom-right) */}
          {hasMoreThanThree && (
            <span className="absolute bottom-2 right-2 bg-[#0A1F44]/85 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md inline-flex items-center gap-1 font-mono pointer-events-none">
              +{extraCount}
            </span>
          )}
        </button>
      </div>
    );
  };

  return (
    <>
      {renderCollage()}

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
              <div className="flex items-center gap-3 min-w-0">
                {hasMultiple && (
                  <span className="font-mono text-sm font-medium tracking-wide bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-md flex-shrink-0">
                    {activeIndex + 1} <span className="opacity-50">/</span>{" "}
                    {visibleTotal}
                  </span>
                )}
                <span className="text-xs text-white/70 truncate">
                  {title}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxOpen(false);
                }}
                aria-label="Close gallery"
                className="size-11 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
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

            {/* Prev / Next chevrons (gold on hover) */}
            {hasMultiple && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                  aria-label="Previous image"
                  className="absolute top-1/2 left-3 sm:left-6 -translate-y-1/2 size-12 sm:size-14 rounded-full bg-white/10 backdrop-blur-md hover:bg-[#C9A961] hover:text-[#0A1F44] flex items-center justify-center transition-all text-white z-10"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                  aria-label="Next image"
                  className="absolute top-1/2 right-3 sm:right-6 -translate-y-1/2 size-12 sm:size-14 rounded-full bg-white/10 backdrop-blur-md hover:bg-[#C9A961] hover:text-[#0A1F44] flex items-center justify-center transition-all text-white z-10"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}

            {/* Bottom thumbnail strip (desktop only) */}
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
