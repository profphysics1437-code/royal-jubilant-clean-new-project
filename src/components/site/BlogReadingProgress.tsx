"use client";

import { useEffect, useState } from "react";

/**
 * Premium reading progress bar — fixed at top of viewport.
 * Gold gradient (3-stop) on transparent background. Smooth easing.
 * Hidden until user scrolls past 100px (avoids flash at top).
 */
export function BlogReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
          setProgress(Math.min((scrollTop / docHeight) * 100, 100));
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  if (progress < 1) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-transparent pointer-events-none">
      <div
        className="h-full transition-[width] duration-100 ease-out"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #B8860B 0%, #D4AF37 40%, #F9D777 50%, #D4AF37 60%, #B8860B 100%)",
          boxShadow: "0 0 8px rgba(212, 175, 55, 0.5)",
        }}
      />
    </div>
  );
}
