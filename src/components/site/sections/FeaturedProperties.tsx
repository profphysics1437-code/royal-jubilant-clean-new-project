"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Clock, Star, Crown, Loader2 } from "lucide-react";
import { properties as fallbackProperties } from "@/lib/data";
import { PropertyCard } from "@/components/site/PropertyCard";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/useApi";

/**
 * Resolves the URL segment used to navigate to a property detail page.
 * Mirrors the fallback chain in PropertyCard: slug → reference → id.
 */
function getPropertyHref(p: any): string {
  const segment = p.slug || p.reference || p.id;
  return `/properties/${segment}`;
}

export function FeaturedProperties() {
  const { setActiveView } = useStore();
  const { data, loading } = useApi<{ properties: any[] }>("/api/public/properties?featured=1&limit=8", { properties: [] });
  const featured = data?.properties || [];

  return (
    <section id="featured" className="py-20 lg:py-28 bg-[#F9FAFB]">
      <div className="container mx-auto px-4 lg:px-6">
        <SectionHeader
          eyebrow="Curated Selection"
          title="Featured Properties"
          subtitle="Hand-selected listings from across Dubai's most prestigious addresses — each one personally vetted by a senior Royal Jubilant advisor."
          icon={<Star className="size-4" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6 mt-12">
          {featured.map((p, i) => (
            <PropertyCard key={p.id} property={p} index={i} />
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Button
            onClick={() => setActiveView("buy")}
            size="lg"
            variant="outline"
            className="rounded-full border-[#C9A961] text-[#0A1F44] hover:bg-[#C9A961]/10 px-8"
          >
            View All Properties <ArrowRight className="size-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}

export function LatestProperties() {
  const { setActiveView } = useStore();
  const { data } = useApi<{ properties: any[] }>("/api/public/properties?latest=1&limit=4&sort=newest", { properties: [] });
  const latest = data?.properties || [];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 lg:px-6">
        <SectionHeader
          eyebrow="Fresh to Market"
          title="Latest Listings"
          subtitle="The newest additions to our portfolio, often before they appear on any portal."
          icon={<Clock className="size-4" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 mt-12">
          {latest.map((p, i) => (
            <PropertyCard key={p.id} property={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function LuxuryCollection() {
  const { setActiveView } = useStore();
  const { data } = useApi<{ properties: any[] }>("/api/public/properties?luxury=1&limit=3", { properties: [] });
  const luxury = data?.properties || [];

  return (
    <section className="py-20 lg:py-28 bg-royal-gradient text-white relative overflow-hidden">
      {/* Decorative pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(191,160,106,1) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="container mx-auto px-4 lg:px-6 relative">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="eyebrow inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C9A961]/15 text-[#A68A3F] mb-5"
            >
              <Crown className="size-3.5" /> By Invitation Only
            </motion.div>
            <h2 className="h1 text-white">
              The Luxury Collection
            </h2>
            <p className="mt-4 body-lg text-white/70 max-w-2xl">
              A discreet portfolio of trophy assets above AED 15M — Signature Villas, branded penthouses and one-off architectural masterpieces. Available to qualified clients by private appointment.
            </p>
          </div>
          <Button
            onClick={() => setActiveView("luxury")}
            className="bg-[#C9A961] hover:bg-[#A68A3F] text-[#0A1F44] rounded-full px-6"
          >
            Explore the Collection <ArrowRight className="size-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {luxury.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Link
                href={getPropertyHref(p)}
                className="group block cursor-pointer"
                aria-label={`View details of ${p.title}`}
              >
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4 transition-transform duration-500 group-hover:scale-[1.02]">
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-full h-full object-cover zoom-img"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-[#C9A961] text-[#0A1F44] text-[10px] font-bold tracking-luxury uppercase">
                      {p.type}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <p className="text-[10px] tracking-luxury uppercase text-[#A68A3F] mb-2">
                      {p.community}
                    </p>
                    <h3 className="font-serif text-xl font-medium leading-tight mb-2 line-clamp-2 group-hover:text-[#D4B875] transition-colors">
                      {p.title}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-2xl font-semibold text-gradient-gold">
                        AED {(p.price / 1000000).toFixed(1)}M
                      </span>
                      {p.pricePerSqft && (
                        <span className="text-xs text-white/60">
                          · AED {p.pricePerSqft.toLocaleString()}/sqft
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  icon,
  light = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  light?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="max-w-5xl"
    >
      <div
        className={`eyebrow inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-2 ${
          light ? "bg-white/10 text-[#A68A3F]" : "bg-[#C9A961]/10 text-[#A68A3F]"
        }`}
      >
        {icon}
        {eyebrow}
      </div>
      <h2
        className={`h2 ${light ? "text-white" : "text-[#0A1F44]"}`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-2 body-lg whitespace-nowrap overflow-hidden text-ellipsis ${light ? "text-white/70" : "text-[#6B7280]"}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
