"use client";

import { ReactNode } from "react";

// ═══════════════════════════════════════════════════════════════════════
// Premium blog content blocks — used inside custom blog post files.
// These give full design control beyond what the admin rich-text editor
// can produce.
// ═══════════════════════════════════════════════════════════════════════

/** Gold-bordered callout box for key insights. */
export function Callout({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="my-10 p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-[#C9A961]/8 to-[#C9A961]/3 border border-[#C9A961]/25">
      {title && (
        <p className="text-[10px] uppercase tracking-luxury text-[#A68A3F] font-bold mb-3">
          {title}
        </p>
      )}
      <div className="text-[17px] text-[#0A1F44] leading-relaxed font-serif italic">
        {children}
      </div>
    </div>
  );
}

/** Large numbered statistic block — up to 4 stats in a row. */
export function StatBlock({ stats }: { stats: { value: string; label: string; sublabel?: string }[] }) {
  return (
    <div className="my-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div key={i} className="p-5 rounded-xl bg-[#0A1F44] text-center">
          <div className="font-serif text-2xl lg:text-3xl font-bold text-[#C9A961]">
            {s.value}
          </div>
          <div className="text-xs text-white/80 mt-1.5 font-medium">{s.label}</div>
          {s.sublabel && <div className="text-[10px] text-white/40 mt-0.5">{s.sublabel}</div>}
        </div>
      ))}
    </div>
  );
}

/** Pull quote — large serif text with gold accent. */
export function PullQuote({ children, author }: { children: ReactNode; author?: string }) {
  return (
    <blockquote className="my-12 pl-8 border-l-4 border-[#C9A961] py-2">
      <p className="font-serif text-xl lg:text-2xl italic text-[#0A1F44] leading-relaxed">
        {children}
      </p>
      {author && (
        <footer className="mt-3 text-sm text-[#A68A3F] font-medium">
          — {author}
        </footer>
      )}
    </blockquote>
  );
}

/** Section divider with gold accent. */
export function Divider() {
  return (
    <div className="my-12 flex items-center justify-center gap-3">
      <div className="h-px w-16 bg-[#C9A961]/40" />
      <div className="size-1.5 rounded-full bg-[#C9A961]" />
      <div className="h-px w-16 bg-[#C9A961]/40" />
    </div>
  );
}

/** Highlight box for important data points. */
export function HighlightBox({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="my-8 p-6 rounded-xl bg-[#0A1F44] text-white">
      {label && (
        <p className="text-[10px] uppercase tracking-luxury text-[#C9A961] font-bold mb-3">
          {label}
        </p>
      )}
      <div className="text-[16px] leading-relaxed text-white/90">
        {children}
      </div>
    </div>
  );
}

/** Section heading with number badge. */
export function SectionHeading({ number, children }: { number?: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 mt-14 mb-5">
      {number && (
        <div className="size-10 rounded-xl bg-gradient-to-br from-[#C9A961] to-[#A68A3F] flex items-center justify-center text-[#0A1F44] font-bold text-lg flex-shrink-0">
          {number}
        </div>
      )}
      <h2 className="font-serif text-2xl lg:text-3xl font-medium text-[#0A1F44] tracking-tight">
        {children}
      </h2>
    </div>
  );
}

/** Image with caption. */
export function Figure({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="my-10">
      <img src={src} alt={alt} className="w-full rounded-2xl shadow-lg" loading="lazy" />
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-[#9CA3AF] italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** Checklist with gold checkmarks. */
export function Checklist({ items }: { items: string[] }) {
  return (
    <div className="my-8 space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="size-5 rounded-full bg-[#C9A961]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="size-3 text-[#A68A3F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <span className="text-[17px] text-[#374151] leading-relaxed">{item}</span>
        </div>
      ))}
    </div>
  );
}
