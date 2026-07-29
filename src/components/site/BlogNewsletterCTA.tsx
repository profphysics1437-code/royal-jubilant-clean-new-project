"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

/**
 * Newsletter subscription CTA for blog detail pages.
 * Premium navy gradient card with email input + subscribe button.
 * Posts to /api/newsletter (same endpoint as homepage Newsletter section).
 */
export function BlogNewsletterCTA() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        setDone(true);
        toast.success("Subscribed!", {
          description: "You'll receive our monthly market insights.",
        });
      })
      .catch(() => {
        toast.error("Something went wrong. Please try again.");
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <section className="py-12 lg:py-16 bg-white border-t border-[#E5E7EB]">
      <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
        <div className="bg-royal-gradient-diagonal text-white rounded-3xl p-8 lg:p-12 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 1) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative">
            <h2 className="font-serif text-2xl lg:text-3xl font-medium mb-3">
              Stay ahead of Dubai's property market
            </h2>
            <p className="text-white/70 text-sm mb-6 max-w-xl mx-auto">
              Join 12,000+ subscribers — fund managers, family offices and UHNW buyers — who receive our monthly index, off-plan launches and prime pricing data.
            </p>
            {done ? (
              <div className="flex items-center justify-center gap-2 text-[#C9A961] font-medium">
                <Check className="size-5" /> You're subscribed! Watch your inbox.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="flex-1 h-12 px-5 rounded-full glass-dark text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A961]/50"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-12 px-6 rounded-full bg-[#C9A961] hover:bg-[#D4B875] text-[#0A1F44] font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? "..." : "Subscribe"}
                  {!submitting && <ArrowRight className="size-4" />}
                </button>
              </form>
            )}
            <p className="mt-4 text-xs text-white/40">
              No spam · Unsubscribe anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
