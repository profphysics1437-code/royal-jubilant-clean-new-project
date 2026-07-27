"use client";

import { Phone, Mail, MapPin, MessageCircle, Facebook, Instagram, Linkedin, Youtube, ArrowUp, Clock, Award, Shield, ShieldCheck, User as UserIcon } from "lucide-react";

// TikTok icon (lucide-react doesn't have one) — simple inline SVG component
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z"/>
    </svg>
  );
}

// X (formerly Twitter) logo — official X logo SVG
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}
import { useStore } from "@/lib/store";
import { useSiteSettings } from "@/lib/useSiteSettings";

export function Footer() {
  const { setActiveView, openCommunity, openDeveloper, setValuationOpen, setMortgageOpen } = useStore();
  const { get } = useSiteSettings();

  const phone = get("company.phone", "+971 4 327 8401");
  const email = get("company.email", "info@royaljubilant.ae");
  const whatsapp = get("company.whatsapp", "971524942329");
  const address = get("company.address", "13th Floor, Office #54, Burjuman Business Tower, Dubai, UAE");
  const hours = get("company.hours", "Mon – Sat, 9am – 6pm");
  const tagline = get("footer.tagline", "Dubai's premier luxury property advisory. Discreet, relationship-led counsel for the world's most discerning property owners.");
  const facebook = get("social.facebook", "https://www.facebook.com/profile.php?id=100077096168331");

  // Parse the 4 footer link columns from site settings (with hardcoded fallbacks)
  const parseCol = (key: string, fallbackTitle: string, fallbackLinks: { label: string; view: string }[]) => {
    const raw = get(key, "");
    if (!raw) return { title: fallbackTitle, links: fallbackLinks };
    try {
      const parsed = JSON.parse(raw);
      return { title: parsed.title || fallbackTitle, links: parsed.links || fallbackLinks };
    } catch {
      return { title: fallbackTitle, links: fallbackLinks };
    }
  };

  const col1 = parseCol("footer.col1", "Buy & Rent", [
    { label: "Properties for Rent", view: "rent" },
    { label: "Properties for Sale", view: "buy" },
    { label: "Commercial Real Estate", view: "commercial" },
    { label: "Off-Plan Projects", view: "off-plan" },
    { label: "Luxury Collection", view: "luxury" },
    { label: "Latest Listings", view: "buy" },
  ]);
  const col2 = parseCol("footer.col2", "Communities", [
    { label: "Palm Jumeirah", view: "communities" },
    { label: "Downtown Dubai", view: "communities" },
    { label: "Dubai Marina", view: "communities" },
    { label: "Creek Harbour", view: "communities" },
    { label: "Dubai Hills", view: "communities" },
    { label: "Business Bay", view: "communities" },
  ]);
  const col3 = parseCol("footer.col3", "Services", [
    { label: "Property Valuation", view: "contact" },
    { label: "Mortgage Advisory", view: "contact" },
    { label: "Meet the Agents", view: "agents" },
    { label: "Market Insights", view: "blog" },
    { label: "Careers", view: "careers" },
    { label: "Rental Yield Calculator", view: "calc-yield" },
  ]);
  const col4 = parseCol("footer.col4", "Company", [
    { label: "About Us", view: "about" },
    { label: "Our Story", view: "about" },
    { label: "Our Advice", view: "advice" },
    { label: "Client Reviews", view: "testimonials" },
    { label: "FAQs", view: "faqs" },
    { label: "Contact Us", view: "contact" },
  ]);
  const instagram = get("social.instagram", "https://www.instagram.com/royal_jubilant?igsh=ZGFnd3IzejljM3Fs");
  const linkedin = get("social.linkedin", "#");
  const twitter = get("social.twitter", "#");
  const tiktok = get("social.tiktok", "#");
  const youtube = get("social.youtube", "https://youtube.com/@royaljubilant");
  const copyright = get("footer.copyright", "© 2026 Royal Jubilant Real Estate LLC. All rights reserved.");

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-royal-gradient-vertical text-white">
      {/* Trust bar */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 lg:px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-[#C9A961]/15 flex items-center justify-center">
              <Award className="size-5 text-[#C9A961]" />
            </div>
            <div>
              <div className="text-sm font-medium">RERA Certified · License #28839</div>
              <div className="text-xs text-white/60">Registered with Dubai Land Department</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-[#C9A961]/15 flex items-center justify-center">
              <Shield className="size-5 text-[#C9A961]" />
            </div>
            <div>
              <div className="text-sm font-medium">{address.split(",")[1]?.trim() || "Burjuman Business Tower"}</div>
              <div className="text-xs text-white/60">{address.split(",")[0]?.trim() || "13th Floor, Office #54"} · Dubai</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-[#C9A961]/15 flex items-center justify-center">
              <Clock className="size-5 text-[#C9A961]" />
            </div>
            <div>
              <div className="text-sm font-medium">{hours}</div>
              <div className="text-xs text-white/60">{phone} · {email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="container mx-auto px-4 lg:px-6 py-14 lg:py-20">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <img
                src="/logo.png"
                alt="Royal Jubilant Real Estate LLC"
                className="size-12 object-contain"
              />
              <div className="flex flex-col text-left">
                <div
                  className="font-serif text-xl font-semibold leading-none tracking-normal text-left block"
                  style={{
                    background: "linear-gradient(135deg, #B8860B 0%, #D4AF37 35%, #F9D777 50%, #D4AF37 65%, #B8860B 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))",
                  }}
                >
                  Royal Jubilant
                </div>
                <div className="text-[10px] tracking-[0.15em] uppercase text-[#9CA3AF] mt-1 text-left block w-full">Real Estate LLC</div>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-5">
              {tagline}
            </p>

            <div className="space-y-2 text-sm">
              <a href={`tel:${whatsapp}`} className="flex items-center gap-2.5 text-white/70 hover:text-[#C9A961] transition-colors">
                <Phone className="size-4" /> {phone}
              </a>
              <a href={`https://wa.me/${whatsapp}`} className="flex items-center gap-2.5 text-white/70 hover:text-[#C9A961] transition-colors">
                <MessageCircle className="size-4" /> {phone} (WhatsApp)
              </a>
              <a href={`mailto:${email}`} className="flex items-center gap-2.5 text-white/70 hover:text-[#C9A961] transition-colors">
                <Mail className="size-4" /> {email}
              </a>
              <div className="flex items-start gap-2.5 text-white/70">
                <MapPin className="size-4 mt-0.5 flex-shrink-0" />
                <span>{address.split(", ").map((line, i, arr) => i === arr.length - 1 ? <span key={i}>{line}</span> : <span key={i}>{line}<br /></span>)}</span>
              </div>
            </div>
          </div>

          {/* Buy / Rent */}
          <div>
            <h4 className="eyebrow text-[#C9A961] mb-5">{col1.title}</h4>
            <ul className="space-y-3 text-sm">
              {col1.links.map((l, i) => (
                <li key={i}>
                  <button onClick={() => setActiveView(l.view)} className="text-white/65 hover:text-[#C9A961] transition-colors text-left">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Communities */}
          <div>
            <h4 className="eyebrow text-[#C9A961] mb-5">{col2.title}</h4>
            <ul className="space-y-3 text-sm">
              {col2.links.map((l, i) => (
                <li key={i}>
                  <button onClick={() => setActiveView(l.view)} className="text-white/65 hover:text-[#C9A961] transition-colors text-left">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="eyebrow text-[#C9A961] mb-5">{col3.title}</h4>
            <ul className="space-y-3 text-sm">
              {col3.links.map((l, i) => (
                <li key={i}>
                  <button onClick={() => setActiveView(l.view)} className="text-white/65 hover:text-[#C9A961] transition-colors text-left">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="eyebrow text-[#C9A961] mb-5">{col4.title}</h4>
            <ul className="space-y-3 text-sm">
              {col4.links.map((l, i) => (
                <li key={i}>
                  <button onClick={() => setActiveView(l.view)} className="text-white/65 hover:text-[#C9A961] transition-colors text-left">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, label: "Instagram", href: instagram },
                { icon: Facebook, label: "Facebook", href: facebook },
                { icon: TikTokIcon, label: "TikTok", href: tiktok },
                { icon: Linkedin, label: "LinkedIn", href: linkedin },
                { icon: XIcon, label: "X", href: twitter },
                { icon: Youtube, label: "YouTube", href: youtube },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href !== "#" ? "_blank" : undefined}
                  rel={s.href !== "#" ? "noopener noreferrer" : undefined}
                  aria-label={s.label}
                  className="size-10 rounded-full bg-white/8 hover:bg-[#C9A961] flex items-center justify-center transition-colors group"
                >
                  <s.icon className="size-4 text-white group-hover:text-[#0A1F44] transition-colors" />
                </a>
              ))}
            </div>

            {/* Divider */}
            <div className="hidden sm:block h-8 w-px bg-white/15" />

            {/* Portal logins */}
            <div className="flex items-center gap-3">
              <a
                href="/admin/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 hover:border-[#C9A961] hover:text-[#C9A961] text-white/70 text-xs font-medium tracking-wide transition-colors"
              >
                <ShieldCheck className="size-3.5" />
                Admin Login
              </a>
              <a
                href="/agent/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 hover:border-[#C9A961] hover:text-[#C9A961] text-white/70 text-xs font-medium tracking-wide transition-colors"
              >
                <UserIcon className="size-3.5" />
                Agent Login
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* DLD QR Code — Premium styled frame */}
            <a
              href="https://dubailand.gov.ae/r/S5Oh64Ihyb"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group"
              title="Scan to verify our RERA License on Dubai Land Department"
            >
              <div className="relative">
                <div className="bg-white p-2 rounded-xl border-2 border-[#C9A961]/50 shadow-lg group-hover:border-[#C9A961] transition-colors">
                  <img src="/dld-qr.png" alt="DLD QR Code" className="w-20 h-20 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#C9A961] rounded-tl" />
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#C9A961] rounded-tr" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#C9A961] rounded-bl" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#C9A961] rounded-br" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#C9A961] uppercase tracking-luxury font-semibold">RERA Licensed</span>
                <span className="text-sm text-white font-serif font-medium">License #28839</span>
                <span className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">Scan to Verify ↗</span>
              </div>
            </a>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-xs tracking-luxury uppercase text-white/60 hover:text-[#C9A961] transition-colors"
            >
              Back to top <ArrowUp className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 lg:px-6 py-5 flex flex-col lg:flex-row items-center justify-between gap-3 text-xs text-white/45">
          <p>{copyright}</p>
          <p className="flex items-center gap-1.5">
            <Shield className="size-3" />
            {address}
          </p>
        </div>
      </div>
    </footer>
  );
}
