"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Car,
  ShieldCheck,
  Phone,
  MessageCircle,
  Star,
  Crown,
  ArrowRight,
  User as UserIcon,
} from "lucide-react";
import { Property, formatPrice, getAgentById } from "@/lib/data";
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

/**
 * Build a WhatsApp deep-link from any common input format:
 *   "+971 52 494 2329"  → https://wa.me/971524942329
 *   "971524942329"      → https://wa.me/971524942329
 *   "+1 (415) 555-0142" → https://wa.me/14155550142
 *
 * Includes a pre-filled message referencing the property so the agent
 * immediately knows which listing the enquiry is about.
 *
 * Returns null if the input has no digits (so callers can hide the button).
 */
function buildWhatsAppUrl(
  whatsapp: string | null | undefined,
  agentName: string,
  propertyTitle: string,
  propertyRef: string
): string | null {
  if (!whatsapp) return null;
  const digits = whatsapp.replace(/\D/g, "");
  if (!digits) return null;
  const msg = `Hello ${agentName}, I'm interested in your property "${propertyTitle}" (Ref: ${propertyRef}) on Royal Jubilant. Could you share more details?`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

/**
 * Build a tel: link from a phone string.
 * Returns null if the input has no digits.
 */
function buildTelUrl(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^\d+]/g, "");
  if (!digits.replace(/\+/g, "").length) return null;
  return `tel:${phone.replace(/\s/g, "")}`;
}

/**
 * Get initials for the fallback avatar (when no photo is available).
 * "Muhammad Javed Zafar" → "MZ"
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "RJ";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase() || "RJ";
}

export function PropertyCard({ property, index = 0 }: Props) {
  const openAgent = useStore((s) => s.openAgent);
  const toggleSaved = useStore((s) => s.toggleSavedProperty);
  const isSaved = useStore((s) => s.isSaved(property.id));

  // Resolve agent: prefer the joined agent from API (DB), fall back to mock lookup
  const agent = (property as any).agent || getAgentById(property.agentId);
  const href = getPropertyHref(property);

  // Contact links (precomputed for clarity + null-safety)
  const telUrl = agent ? buildTelUrl(agent.phone) : null;
  const whatsappUrl = agent
    ? buildWhatsAppUrl(
        agent.whatsapp,
        agent.name || "Royal Jubilant",
        property.title,
        property.reference
      )
    : null;

  const hasAnyContact = !!(telUrl || whatsappUrl);

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
          IMAGE SECTION — visual focus, with all overlay badges
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
          {property.completionStatus === "Off-Plan" && (
            <Badge className="bg-white/95 text-[#0A1F44] backdrop-blur-sm font-semibold border border-[#E5E7EB] text-[11px] px-3 py-1 w-fit">
              Off-Plan · {property.handoverYear}
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

        {/* Bottom: reference + RERA permit */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white pointer-events-none">
          <span className="text-[10px] font-mono font-semibold tracking-luxury uppercase bg-[#0A1F44]/85 backdrop-blur-sm px-2.5 py-1 rounded-md">
            {property.reference}
          </span>
          {(property as any).reraNumber && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#0A1F44]/85 backdrop-blur-sm px-2 py-1 rounded-md text-[#C9A961]"
              title="RERA Permit Number"
            >
              <ShieldCheck className="size-3" /> RERA {(property as any).reraNumber}
            </span>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────
          BODY SECTION — price, title, location, specs
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

        {/* Location — community only (subCommunity was causing mismatches) */}
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
            {property.parking > 0 && (
              <span className="flex items-center gap-1.5">
                <Car className="size-4 text-[#9CA3AF]" />
                <span className="font-semibold">{property.parking}</span>
              </span>
            )}
          </div>
        </Link>

        {/* ─────────────────────────────────────────────────────────────
            AGENT + CONTACT SECTION — conversion-focused footer
           ───────────────────────────────────────────────────────────── */}
        <div className="mt-auto pt-3 border-t border-[#F4F5F7]">
          {agent ? (
            <>
              {/* Agent identity row */}
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (agent.id) openAgent(agent.id);
                  }}
                  className="flex-shrink-0 hover:opacity-90 transition-opacity"
                  aria-label={`View ${agent.name}'s profile`}
                >
                  {agent.photo ? (
                    <img
                      src={agent.photo}
                      alt={agent.name}
                      className="size-11 sm:size-12 rounded-full object-cover ring-2 ring-[#C9A961]/30"
                    />
                  ) : (
                    <div className="size-11 sm:size-12 rounded-full bg-gradient-to-br from-[#0A1F44] to-[#1a3060] text-[#C9A961] flex items-center justify-center font-semibold text-sm ring-2 ring-[#C9A961]/30">
                      {getInitials(agent.name || "RJ")}
                    </div>
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (agent.id) openAgent(agent.id);
                  }}
                  className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                >
                  <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-medium leading-none mb-1">
                    Marketed By
                  </p>
                  <p className="text-sm font-semibold text-[#0A1F44] truncate leading-tight">
                    {agent.name}
                  </p>
                  <p className="text-[11px] text-[#6B7280] truncate leading-tight">
                    {agent.title || "Property Consultant"}
                  </p>
                </button>
              </div>

              {/* Contact buttons — premium split layout.
                  Both buttons get equal width when both present.
                  Single-button case spans full width (no awkward gap). */}
              {hasAnyContact && (
                <div
                  className={`grid gap-2 ${
                    telUrl && whatsappUrl ? "grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {telUrl && (
                    <a
                      href={telUrl}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center justify-center gap-1.5 h-10 sm:h-11 rounded-lg bg-[#0A1F44] hover:bg-[#1a3060] text-white text-xs sm:text-sm font-semibold transition-all hover:shadow-md"
                      title={`Call ${agent.name} at ${agent.phone}`}
                    >
                      <Phone className="size-3.5 sm:size-4" />
                      <span>Call</span>
                    </a>
                  )}
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center justify-center gap-1.5 h-10 sm:h-11 rounded-lg bg-[#25D366] hover:bg-[#1FB855] text-white text-xs sm:text-sm font-semibold transition-all hover:shadow-md"
                      title={`WhatsApp ${agent.name}`}
                    >
                      <MessageCircle className="size-3.5 sm:size-4" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              )}

              {/* View Property button — full-width, always present */}
              <Link
                href={href}
                onClick={(e) => e.stopPropagation()}
                className="mt-2 inline-flex items-center justify-center gap-1.5 w-full h-10 sm:h-11 rounded-lg bg-white border border-[#0A1F44]/20 hover:border-[#C9A961] hover:bg-[#C9A961]/5 text-[#0A1F44] text-xs sm:text-sm font-semibold transition-all"
              >
                View Property
                <ArrowRight className="size-3.5" />
              </Link>
            </>
          ) : (
            // No agent assigned — show generic CTA
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="size-11 sm:size-12 rounded-full bg-gradient-to-br from-[#0A1F44] to-[#1a3060] text-[#C9A961] flex items-center justify-center ring-2 ring-[#C9A961]/30">
                  <UserIcon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-medium leading-none mb-1">
                    Speak to an Advisor
                  </p>
                  <p className="text-sm font-semibold text-[#0A1F44] truncate leading-tight">
                    Royal Jubilant Team
                  </p>
                  <p className="text-[11px] text-[#6B7280] truncate leading-tight">
                    Property Consultant
                  </p>
                </div>
              </div>
              <Link
                href={href}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center gap-1.5 w-full h-10 sm:h-11 rounded-lg bg-[#0A1F44] hover:bg-[#1a3060] text-white text-xs sm:text-sm font-semibold transition-all hover:shadow-md"
              >
                View Property
                <ArrowRight className="size-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
}
