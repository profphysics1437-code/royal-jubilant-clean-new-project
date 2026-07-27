"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { generatePropertyPDF } from "@/lib/generatePropertyPDF";
import { toast } from "sonner";

interface PdfPropertyData {
  reference: string;
  title: string;
  price: number;
  status: string;
  rentFrequency?: string;
  type: string;
  community: string;
  subCommunity?: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit?: string;
  parking: number;
  description: string;
  reraNumber?: string;
  images?: string[];
  agent?: {
    name: string;
    title: string;
    phone: string;
    whatsapp?: string;
    email: string;
    photo?: string;
  };
  location?: {
    address?: string;
  };
}

interface Props {
  property: PdfPropertyData;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Download PDF button — generates a premium property brochure PDF
 * dynamically from real Supabase property data and triggers a download.
 *
 * Uses the existing /lib/generatePropertyPDF library which produces a
 * branded PDF with: Royal Jubilant header, property image, price/specs,
 * description, amenities, and agent contact card.
 */
export function DownloadPDFButton({ property, className = "", size = "md" }: Props) {
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    setGenerating(true);
    try {
      await generatePropertyPDF(property);
      toast.success("Property brochure downloaded");
    } catch (err: any) {
      console.error("[DownloadPDFButton]", err);
      toast.error(err?.message || "Failed to generate PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const sizeClass = size === "sm" ? "h-9 px-3 text-xs" : "h-11 px-4 text-sm";

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      className={`inline-flex items-center justify-center gap-1.5 ${sizeClass} rounded-lg bg-white border border-[#0A1F44]/20 hover:border-[#C9A961] hover:bg-[#C9A961]/5 text-[#0A1F44] font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      aria-label="Download property brochure as PDF"
    >
      {generating ? (
        <Loader2 className={size === "sm" ? "size-3.5 animate-spin" : "size-4 animate-spin"} />
      ) : (
        <Download className={size === "sm" ? "size-3.5" : "size-4"} />
      )}
      <span>{generating ? "Generating..." : "PDF"}</span>
    </button>
  );
}
