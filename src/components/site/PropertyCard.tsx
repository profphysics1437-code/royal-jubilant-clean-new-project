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
  Mail,
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
 *
 * The Prisma schema defines `slug` as a unique field on the Property model,
 * but some legacy rows (and the static mock dataset used during preview/dev
 * runs) may not have one set. We therefore fall back through:
 *   1. property.slug          (canonical, set by admin)
 *   2. property.reference     (e.g. "RJ-78947492" → /properties/RJ-78947492)
 *   3. property.id            (cuid, always present)
 *
 * The detail page at `/properties/[slug]` tries `slug` lookup first, then
 * falls back to `id` lookup, so any of these will resolve correctly.
 */
function getPropertyHref(property: Property): string {
  const segment =
    property.slug || property.reference || property.id;
  return `/properties/${segment}`;
}

export function PropertyCard({ property, index = 0 }: Props) {
  const openAgent = useStore((s) => s.openAgent);
  const toggleSaved = useStore((s) => s.toggleSavedProperty);
  const isSaved = useStore((s) => s.isSaved(property.id));
  // Use the agent info included from the API (DB properties), or fall back to mock data lookup
  const agent = (property as any).agent || getAgentById(property.agentId);
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
      className="group relative bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] lift-on-hover shadow-luxury transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-[#C9A961]/40"
    >
      <Link
        href={href}
        className="block cursor-pointer"
        aria-label={`View details of ${property.title}`}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#F4F5F7]">
          <img
            src={property.images?.[0]}
            alt={property.title}
            loading="lazy"
            className="w-full h-full object-cover zoom-img transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44]/50 via-transparent to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge className="bg-[#C9A961] text-[#0A1F44] hover:bg-[#D4B875] font-medium tracking-wide shadow-sm">
              {statusLabels[property.status]}
            </Badge>
            {property.isLuxury && (
              <Badge className="bg-[#0A1F44]/90 text-white backdrop-blur-sm font-medium tracking-wide">
                Luxury Collection
              </Badge>
            )}
            {property.completionStatus === "Off-Plan" && (
              <Badge className="bg-white/95 text-[#0A1F44] font-medium backdrop-blur-sm border border-[#E5E7EB]">
                Off-Plan · {property.handoverYear}
              </Badge>
            )}
          </div>

          {/* Reference + RERA permit */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <span className="text-xs font-medium tracking-luxury uppercase glass-dark px-2.5 py-1 rounded-md">
              {property.reference}
            </span>
            {(property as any).reraNumber && (
              <span
                className="flex items-center gap-1 text-[10px] font-semibold glass-dark px-2 py-1 rounded-md text-[#C9A961]"
                title="RERA Permit Number"
              >
                <ShieldCheck className="size-3" /> RERA {(property as any).reraNumber}
              </span>
            )}
          </div>
        </div>

        {/* Body — Dubizzle style: price prominent, inline specs, Marketed By footer */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-2xl font-bold text-[#0A1F44] leading-none">
              {formatPrice(property.price, property.rentFrequency)}
            </span>
            {property.pricePerSqft && (
              <span className="text-[11px] text-[#9CA3AF] whitespace-nowrap">
                AED {property.pricePerSqft.toLocaleString()}/sqft
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-[#0A1F44] line-clamp-1 group-hover:text-[#A68A3F] transition-colors">
            {property.title}
          </h3>
          <p className="text-xs flex items-center gap-1 text-[#6B7280]">
            <MapPin className="size-3 text-[#9CA3AF] flex-shrink-0" />
            {/* Location tag — show community only. The subCommunity field has
                historically been used to store building/landmark names that
                don't always match the property's actual area, so we omit it
                here to avoid the "Bur Dubai title · Business Bay · jamera"
                mismatch reported in production. */}
            <span className="truncate">{property.community}</span>
          </p>
          <div className="flex items-center gap-3 pt-2 text-[#0A1F44] text-xs">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <BedDouble className="size-3.5 text-[#9CA3AF]" />
                <span className="font-medium">{property.bedrooms}</span>
                <span className="text-[#9CA3AF]">Beds</span>
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bath className="size-3.5 text-[#9CA3AF]" />
                <span className="font-medium">{property.bathrooms}</span>
                <span className="text-[#9CA3AF]">Baths</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Maximize className="size-3.5 text-[#9CA3AF]" />
              <span className="font-medium">{property.area.toLocaleString()}</span>
              <span className="text-[#9CA3AF]">sqft</span>
            </span>
            {property.parking > 0 && (
              <span className="flex items-center gap-1">
                <Car className="size-3.5 text-[#9CA3AF]" />
                <span className="font-medium">{property.parking}</span>
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Save (favorite) button — OUTSIDE the Link wrapper so clicks don't
          trigger navigation. stopPropagation is also kept as a defensive
          measure in case the button is ever moved back inside the link. */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          toggleSaved(property.id);
        }}
        aria-label={isSaved ? "Remove from saved" : "Save property"}
        className="absolute top-3 right-3 size-10 rounded-full glass flex items-center justify-center hover:bg-white/95 transition-colors z-10"
      >
        <Heart
          className={`size-4 transition-all ${
            isSaved ? "fill-[#C9A961] text-[#A68A3F]" : "text-[#0A1F44]"
          }`}
        />
      </button>

      {/* Agent footer — kept OUTSIDE the link so its child buttons (call,
          whatsapp, email, agent profile) work without navigating away. */}
      {agent && (
        <div className="px-4 pb-4 pt-0">
          <div className="pt-2.5 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                openAgent(agent.id);
              }}
              className="flex items-center gap-2 group/agent hover:opacity-80 transition-opacity text-left min-w-0"
            >
              <img
                src={agent.photo}
                alt={agent.name}
                className="size-7 rounded-full object-cover ring-1 ring-[#E5E7EB] flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wider leading-none">
                  Marketed By
                </p>
                <p className="text-[11px] font-medium text-[#0A1F44] truncate leading-tight mt-0.5">
                  {agent.name}
                </p>
              </div>
            </button>
            <div className="flex items-center gap-1 flex-shrink-0">
              {agent.phone && (
                <a
                  href={`tel:${agent.phone.replace(/\s/g, "")}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  className="size-7 flex items-center justify-center rounded-md bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white transition-colors"
                  title={`Call ${agent.name}`}
                >
                  <Phone className="size-3" />
                </a>
              )}
              {agent.whatsapp && (
                <a
                  href={`https://wa.me/${agent.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  className="size-7 flex items-center justify-center rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors"
                  title={`WhatsApp ${agent.name}`}
                >
                  <MessageCircle className="size-3" />
                </a>
              )}
              {agent.email && (
                <a
                  href={`mailto:${agent.email}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  className="size-7 flex items-center justify-center rounded-md bg-[#C9A961]/15 hover:bg-[#C9A961]/25 text-[#A68A3F] transition-colors"
                  title={`Email ${agent.name}`}
                >
                  <Mail className="size-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.article>
  );
}
