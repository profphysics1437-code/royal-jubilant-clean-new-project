"use client";

import { motion } from "framer-motion";
import { ArrowRight, HardHat, Calendar, Building2, MapPin, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { useApi } from "@/lib/useApi";
import { SectionHeader } from "./FeaturedProperties";

export function OffPlanProjects() {
  const { openProperty } = useStore();
  const { data } = useApi<{ properties: any[] }>("/api/public/properties?status=off-plan&limit=4", { properties: [] });
  const offPlan = data?.properties || [];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 lg:px-6">
        <SectionHeader
          eyebrow="Pre-Launch & Under Construction"
          title="Off-Plan Projects"
          subtitle="First-call allocations from Emaar, DAMAC, Omniyat and Sobha — typically 12-24 months ahead of public release, with flexible payment plans."
          icon={<HardHat className="size-4" />}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 mt-12">
          {offPlan.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              onClick={() => openProperty(p.id)}
              className="group relative rounded-3xl overflow-hidden cursor-pointer lift-on-hover bg-[#F9FAFB]"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
                {/* Image */}
                <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden bg-muted min-h-[280px]">
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="absolute inset-0 w-full h-full object-cover zoom-img"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    <span className="px-2.5 py-1 rounded-md bg-[#C9A961] text-[#0A1F44] text-[10px] tracking-luxury uppercase font-bold w-fit">
                      Off-Plan
                    </span>
                    <span className="px-2.5 py-1 rounded-md glass-dark text-white text-[10px] flex items-center gap-1 w-fit">
                      <Calendar className="size-3" />
                      Handover {p.handoverYear}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 lg:p-7 flex flex-col">
                  <div className="flex items-center gap-1.5 text-[10px] tracking-luxury uppercase text-[#A68A3F] font-medium mb-2">
                    <Building2 className="size-3" />
                    {p.developer} · {p.community}
                  </div>

                  <h3 className="font-serif text-xl font-medium text-[#0A1F44] group-hover:text-[#A68A3F] transition-colors leading-tight">
                    {p.title}
                  </h3>

                  <p className="text-xs text-muted-foreground mt-3 line-clamp-3 leading-relaxed">
                    {p.description}
                  </p>

                  {/* Payment plan preview */}
                  {p.paymentPlan && (
                    <div className="mt-4 p-3 rounded-xl bg-white border border-border/60">
                      <div className="text-[10px] tracking-luxury uppercase text-muted-foreground font-medium mb-2">
                        Payment Plan
                      </div>
                      <div className="flex items-center gap-1 h-2 rounded-full overflow-hidden bg-muted">
                        {p.paymentPlan.map((step, idx) => (
                          <div
                            key={idx}
                            className="h-full bg-gradient-to-r from-[#C9A961] to-[#A68A3F]"
                            style={{ width: `${step.percentage}%` }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                        <span>Booking {p.paymentPlan[0].percentage}%</span>
                        <span>Handover {p.paymentPlan[p.paymentPlan.length-1].percentage}%</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-4 flex items-end justify-between">
                    <div>
                      <div className="text-[10px] tracking-luxury uppercase text-muted-foreground">From</div>
                      <div className="font-serif text-2xl font-semibold text-[#0A1F44]">
                        AED {(p.price / 1000000).toFixed(2)}M
                      </div>
                    </div>
                    <span className="text-[10px] tracking-luxury uppercase text-[#A68A3F] flex items-center gap-1 font-medium">
                      Details <ArrowRight className="size-3" />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Newsletter() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email");
    if (email) {
      fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).then(() => {
        // Use sonner toast
        import("sonner").then(({ toast }) => toast.success("Subscribed!", {
          description: "You'll receive our monthly market insights.",
        }));
        form.reset();
      }).catch(() => {
        import("sonner").then(({ toast }) => toast.error("Something went wrong. Please try again."));
      });
    }
  };

  return (
    <section className="py-20 lg:py-24 bg-royal-gradient text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(191,160,106,1) 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }} />
      <div className="container mx-auto px-4 lg:px-6 relative">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C9A961]/15 text-[#A68A3F] text-xs tracking-luxury uppercase mb-5"
          >
            <Check className="size-3.5" /> Monthly Market Brief
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-serif text-3xl lg:text-5xl font-medium leading-[1.1]"
          >
            The most important Dubai property<br />
            <span className="text-gradient-gold italic">data in your inbox.</span>
          </motion.h2>
          <p className="mt-5 text-white/70 leading-relaxed max-w-xl mx-auto">
            Join 12,000+ subscribers — fund managers, family offices and UHNW buyers — who receive our monthly index, off-plan launches and prime pricing data.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="email"
              name="email"
              required
              placeholder="your@email.com"
              className="flex-1 h-14 px-5 rounded-full glass-dark text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A961]/50"
            />
            <button
              type="submit"
              className="h-14 px-7 rounded-full bg-[#C9A961] hover:bg-[#D4B875] text-[#0A1F44] font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              Subscribe <ArrowRight className="size-4" />
            </button>
          </form>

          <p className="mt-4 text-xs text-white/40">
            No spam · Unsubscribe anytime · Read our last issue →
          </p>
        </div>
      </div>
    </section>
  );
}
