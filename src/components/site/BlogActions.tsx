"use client";

import { Printer, ArrowUp, ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * Small client-side action buttons used in the blog detail page
 * (which is a server component). These need client JS for onClick handlers.
 */
export function BlogActions() {
  return (
    <div className="space-y-2">
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
  );
}

export function BackToTopButton() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#A68A3F] transition-colors"
    >
      <ArrowUp className="size-3.5" /> Back to top
    </button>
  );
}
