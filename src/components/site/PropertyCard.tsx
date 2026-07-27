"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Star,
  Crown,
  ArrowRight,
} from "lucide-react";
import { Property, formatPrice } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";

interface Props {
  property: Property;
  index?: number;
}

const statusLabels: Record<Property["status"], string> = {
  sale: "For Sale",
  rent: "For Rent",
  commercial: "Commercial",
  "off-plan": "Off-Plan",
};

/**
 * Resolves the URL segment used to navigate to a property detail page.
 * Mirrors the fallback chain used by the detail route: slug → reference → id.
 */
function getPropertyHref(property: Property): string {
  const segment = property.slug || property.reference || property.id;
  return `/properties/${segment}`;
}

export function PropertyCard({ property, index = 0 }: Props) {
  const toggleSaved = useStore((s) => s.toggleSavedProperty);
  const isSaved = useStore((s) => s.isSaved(property.id));
  const href = getPropertyHref(property);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.6,
        delay: Math.min(index * 0.06, 0.4),
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-[0_2px_12px_rgba(10,31,68,0.04)] transition-all duration-300 hover:shadow-[0_18px_50px_rgba(10,31,68,0.15)] hover:border-[#C9A961]/40 hover:-translate-y-1 flex flex-col"
    >
      {/* ───────────────────────────────────────────────────────────────
          IMAGE SECTION — visual focus, with essential overlay badges
         ─────────────────────────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F4F5F7]">
        <Link
          href={href}
          aria-label={`View details of ${property.title}`}
          className="block w-full h-full"
        >
          <img
            src={property.images?.[0] || "/placeholder-property.jpg"}
            alt={property.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44]/55 via-[#0A1F44]/5 to-transparent pointer-events-none" />
        </Link>

        {/* Top-left: status + featured/luxury badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none">
          <Badge className="bg-[#C9A961] text-[#0A1F44] hover:bg-[#C9A961] font-semibold tracking-wide shadow-md text-[11px] px-3 py-1">
            {statusLabels[property.status]}
          </Badge>
          {property.isLuxury && (
            <Badge className="bg-[#0A1F44]/95 text-[#C9A961] backdrop-blur-sm font-semibold tracking-wide shadow-md text-[11px] px-3 py-1 inline-flex items-center gap-1 w-fit">
              <Crown className="size-3" /> Luxury
            </Badge>
          )}
          {property.featured && !property.isLuxury && (
            <Badge className="bg-white/95 text-[#0A1F44] backdrop-blur-sm font-semibold shadow-md border border-[#C9A961]/30 text-[11px] px-3 py-1 inline-flex items-center gap-1 w-fit">
              <Star className="size-3 fill-[#C9A961] text-[#C9A961]" /> Featured
            </Badge>
          )}
        </div>

        {/* Top-right: favorite heart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleSaved(property.id);
          }}
          aria-label={isSaved ? "Remove from saved" : "Save property"}
          className="absolute top-3 right-3 size-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-md z-10"
        >
          <Heart
            className={`size-4 transition-all ${
              isSaved
                ? "fill-[#C9A961] text-[#A68A3F] scale-110"
                : "text-[#0A1F44]"
            }`}
          />
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────────
          BODY SECTION — essential property info only
         ─────────────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3">
        {/* Price + price/sqft */}
        <Link href={href} className="block">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[22px] sm:text-2xl font-bold text-[#0A1F44] leading-none font-serif">
              {formatPrice(property.price, property.rentFrequency)}
            </span>
            {property.pricePerSqft && (
              <span className="text-[11px] text-[#9CA3AF] whitespace-nowrap font-medium">
                AED {property.pricePerSqft.toLocaleString()}/sqft
              </span>
            )}
          </div>
        </Link>

        {/* Title */}
        <Link href={href} className="block">
          <h3 className="text-sm sm:text-base font-semibold text-[#0A1F44] line-clamp-1 group-hover:text-[#A68A3F] transition-colors leading-snug">
            {property.title}
          </h3>
        </Link>

        {/* Location — community only */}
        <Link href={href} className="block">
          <p className="text-xs flex items-center gap-1.5 text-[#6B7280]">
            <MapPin className="size-3.5 text-[#C9A961] flex-shrink-0" />
            <span className="truncate">{property.community}</span>
          </p>
        </Link>

        {/* Specs row */}
        <Link href={href} className="block">
          <div className="flex items-center gap-3 sm:gap-4 pt-3 text-[#0A1F44] text-xs border-t border-[#F4F5F7]">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1.5">
                <BedDouble className="size-4 text-[#9CA3AF]" />
                <span className="font-semibold">{property.bedrooms}</span>
                <span className="text-[#9CA3AF] text-[11px]">Beds</span>
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1.5">
                <Bath className="size-4 text-[#9CA3AF]" />
                <span className="font-semibold">{property.bathrooms}</span>
                <span className="text-[#9CA3AF] text-[11px]">Baths</span>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Maximize className="size-4 text-[#9CA3AF]" />
              <span className="font-semibold">{property.area.toLocaleString()}</span>
              <span className="text-[#9CA3AF] text-[11px]">sqft</span>
            </span>
          </div>
        </Link>

        {/* View Property button — full-width CTA */}
        <Link
          href={href}
          onClick={(e) => e.stopPropagation()}
          className="mt-auto inline-flex items-center justify-center gap-1.5 w-full h-10 sm:h-11 rounded-lg bg-[#0A1F44] hover:bg-[#1a3060] text-white text-xs sm:text-sm font-semibold transition-all hover:shadow-md"
        >
          View Property
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </motion.article>
  );
}
