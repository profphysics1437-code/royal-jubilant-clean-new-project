"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { properties as fallbackProperties } from "@/lib/data";
import { useApi } from "@/lib/useApi";

// Fallback counts (from mock data)
const fbRent = fallbackProperties.filter((p) => p.status === "rent").length;
const fbBuy = fallbackProperties.filter((p) => p.status === "sale").length;
const fbCommercial = fallbackProperties.filter((p) => p.status === "commercial").length;
const fbOffPlan = fallbackProperties.filter((p) => p.status === "off-plan" || p.completionStatus === "Off-Plan").length;
const fbHoliday = fallbackProperties.filter((p) => p.status === "rent" && p.furnished).length;

const services = [
  {
    title: "Rent",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    view: "rent",
    countKey: "rent" as const,
  },
  {
    title: "Buy",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80",
    view: "buy",
    countKey: "sale" as const,
  },
  {
    title: "Commercial",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=600&q=80",
    view: "commercial",
    countKey: "commercial" as const,
  },
  {
    title: "Off Plan",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80",
    view: "off-plan",
    countKey: "offPlan" as const,
  },
  {
    title: "The Luxury Collection",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80",
    view: "luxury",
    countKey: "luxury" as const,
  },
  {
    title: "Office for Rent",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=600&q=80",
    view: "commercial-rent",
    countKey: "commercial" as const,
  },
];

const fallbackCounts = { rent: fbRent, sale: fbBuy, commercial: fbCommercial, offPlan: fbOffPlan, byEmirate: [] };

// Animated counter component
function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <span ref={ref} className="price-text text-2xl lg:text-3xl text-white whitespace-nowrap">
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}

// Stats config — numeric portion is animated, suffix stays static
const stats = [
  { num: 240, suffix: "+", label: "Active Listings" },
  { num: 10, suffix: "+", label: "Years Serving Dubai" },
  { num: 4.8, suffix: "/5", label: "Average Client Rating", decimals: 1 },
  { num: 18, suffix: "", label: "Property Categories" },
];

export function ExploreProperty() {
  const { setActiveView } = useStore();
  const { data } = useApi<{ counts: any }>("/api/public/listings", { counts: fallbackCounts });
  const counts = data?.counts || fallbackCounts;
  const getCount = (key: string | null) => key ? (counts[key] ?? 0) : 0;

  return (
    <section className="bg-white">
      {/* Top: heading + paragraph + cards */}
      <div className="container mx-auto px-4 lg:px-6 py-10 lg:py-12">
        {/* Heading + Description */}
        <div className="mb-8 lg:mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="h1 text-[#0A1F44] mb-4"
          >
            Explore Property in Dubai
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="body-text text-[#6B7280]"
          >
            Royal Jubilant helps buyers, sellers, tenants and investors navigate Dubai real estate with clarity and confidence. Our RERA-certified advisors combine deep local knowledge with professional systems and support — built to deliver smoother transactions and better outcomes, every step of the way.
          </motion.p>
        </div>

        {/* Image cards row — tight spacing, portrait cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3">
          {services.map((service, i) => (
            <motion.button
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              onClick={() => setActiveView(service.view)}
              className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-[#F4F5F7] cursor-pointer"
            >
              {/* Image */}
              <img
                src={service.image}
                alt={service.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover zoom-img"
              />

              {/* Dark navy overlay at bottom for label */}
              <div className="absolute bottom-0 left-0 right-0 bg-[#0A1F44]/85 backdrop-blur-sm py-2.5 px-3 group-hover:bg-[#C9A961] transition-colors duration-300">
                <span className="block text-white group-hover:text-[#0A1F44] text-xs font-semibold tracking-wide transition-colors duration-300 truncate">
                  {service.title}
                </span>
                {service.countKey && getCount(service.countKey) > 0 && (
                  <span className="block text-white/50 group-hover:text-[#0A1F44]/60 text-[9px] mt-0.5 transition-colors duration-300">
                    {getCount(service.countKey)} {getCount(service.countKey) === 1 ? "listing" : "listings"}
                  </span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bottom: stats bar — navy background, contained width, animated numbers */}
      <div className="bg-navy-gradient-diagonal py-7 lg:py-9">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 min-w-0">
          <div className="flex flex-wrap lg:flex-nowrap items-center justify-center gap-x-8 lg:gap-x-12 gap-y-3">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-baseline gap-2"
              >
                {stat.decimals ? (
                  <span className="price-text text-2xl lg:text-3xl text-white whitespace-nowrap">
                    <AnimatedDecimal value={stat.num} suffix={stat.suffix} />
                  </span>
                ) : (
                  <AnimatedCounter value={stat.num} suffix={stat.suffix} />
                )}
                <span className="text-[10px] lg:text-xs text-[#C9A961] tracking-luxury uppercase whitespace-nowrap">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Decimal counter for 4.8/5 rating
function AnimatedDecimal({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return <span ref={ref}>{display.toFixed(1)}{suffix}</span>;
}
