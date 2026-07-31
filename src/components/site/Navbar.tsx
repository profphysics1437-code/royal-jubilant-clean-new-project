"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  Phone,
  Heart,
  User,
  Calculator,
  Search,
  Building2,
  Home,
  Building,
  HardHat,
  MapPin,
  Users,
  FileText,
  TrendingUp,
  Briefcase,
  HelpCircle,
  Mail,
  MessageCircle,
  Calendar,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── Icon resolver — maps icon string from DB to actual lucide-react component ───
const ICONS: Record<string, any> = {
  Menu, X, ChevronDown, Phone, Heart, User, Calculator, Search,
  Building2, Home, Building, HardHat, MapPin, Users, FileText,
  TrendingUp, Briefcase, HelpCircle, Mail, MessageCircle, Calendar,
};

function resolveIcon(name?: string | null) {
  if (!name) return null;
  return ICONS[name] || null;
}

// ─── Fallback menu used before API data loads (or if API fails) ───
const FALLBACK_NAV = [
  {
    label: "Rent",
    view: null,
    url: "",
    children: [
      { label: "All Properties for Rent", desc: "Browse 800+ active rentals", view: "rent", url: "" },
      { label: "Villas for Rent", desc: "5+ bedrooms across prime communities", view: "rent", url: "" },
      { label: "Penthouses for Rent", desc: "Top-floor branded residences", view: "rent", url: "" },
      { label: "Apartments for Rent", desc: "Studios to 4-bedrooms", view: "rent", url: "" },
      { label: "Townhouses for Rent", desc: "Family-friendly gated communities", view: "rent", url: "" },
      { label: "Luxury Rentals", desc: "Curated trophy assets AED 200K+/yr", view: "rent", url: "", badge: "Premium" },
    ],
  },
  {
    label: "Buy",
    view: null,
    url: "",
    children: [
      { label: "All Properties for Sale", desc: "Browse 1,200+ active listings", view: "buy", url: "" },
      { label: "Villas & Mansions", desc: "5+ bedrooms across prime communities", view: "buy", url: "" },
      { label: "Penthouses", desc: "Top-floor branded residences", view: "buy", url: "" },
      { label: "Apartments", desc: "Studios to 4-bedrooms", view: "buy", url: "" },
      { label: "Townhouses", desc: "Family-friendly gated communities", view: "buy", url: "" },
      { label: "Luxury Collection", desc: "Curated trophy assets AED 15M+", view: "luxury", url: "", badge: "Premium" },
    ],
  },
  {
    label: "Commercial",
    view: "commercial",
    url: "",
    children: [
      { label: "Commercial Property for Rent", desc: "Offices, retail & bulk leases", view: "commercial-rent", url: "" },
      { label: "Commercial Property for Sale", desc: "Investment-grade commercial real estate", view: "commercial-sale", url: "" },
    ],
  },
  {
    label: "Off Plan",
    view: null,
    url: "",
    children: [
      { label: "About Off Plan", desc: "Market insights & investment guide", view: "about-offplan", url: "" },
      { label: "Off Plan Properties", desc: "Browse all off-plan projects", view: "off-plan", url: "" },
      { label: "Developers", desc: "Dubai's leading master developers", view: "developers", url: "" },
    ],
  },
  {
    label: "About Us",
    view: null,
    url: "",
    children: [
      { label: "Our Story", desc: "Our story, leadership & ethos", view: "story", url: "" },
      { label: "Why Choose Us", desc: "What sets Royal Jubilant apart", view: "about", url: "" },
      { label: "Our Team", desc: "Meet our RERA-certified advisors", view: "agents", url: "" },
      { label: "Our Advice", desc: "Advisor video insights & market updates", view: "advice", url: "" },
      { label: "Client Reviews", desc: "What our clients say about us", view: "testimonials", url: "" },
      { label: "Careers", desc: "Join our advisory team", view: "careers", url: "" },
      { label: "Contact Us", desc: "Get in touch with our team", view: "contact", url: "" },
    ],
  },
  {
    label: "More",
    view: null,
    url: "",
    children: [
      { label: "AI Powered Real Estate", desc: "Meet RJ AI — your 24/7 concierge", view: "ai-powered", url: "" },
      { label: "Communities", desc: "Browse Dubai neighbourhoods", view: "communities", url: "" },
      { label: "Rental Yield Calculator", desc: "Calculate your rental ROI", view: "calc-yield", url: "" },
      { label: "Buy vs Rent Calculator", desc: "Should you buy or rent?", view: "calc-buyrent", url: "" },
      { label: "Market Insights", desc: "Quarterly indices & research notes", view: "blog", url: "" },
      { label: "FAQs", desc: "Common questions answered", view: "faqs", url: "" },
    ],
  },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [navItems, setNavItems] = useState<any[]>(FALLBACK_NAV);
  // mounted ensures createPortal only runs on client (avoids SSR hydration
  // mismatch). The mobile drawer is portaled to document.body so it's
  // independent of any Homepage-specific ancestor CSS context (transforms,
  // filters, backdrop-filters, will-change, etc. that create containing
  // blocks for position:fixed elements).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { get } = useSiteSettings();
  const phone = get("company.phone", "+971 4 327 8401");
  const email = get("company.email", "info@royaljubilant.ae");
  const whatsapp = get("company.whatsapp", "971524942329");
  const {
    mobileMenuOpen,
    setMobileMenuOpen,
    setActiveView,
    activeView,
    openCommunity,
    openDeveloper,
    setValuationOpen,
    setMortgageOpen,
    setDashboardOpen,
    savedProperties,
  } = useStore();

  // Fetch menu from API
  useEffect(() => {
    fetch("/api/public/menu?menu=main")
      .then((r) => r.json())
      .then((d) => {
        if (d.items && d.items.length > 0) {
          setNavItems(d.items);
        }
      })
      .catch(() => {
        // Keep fallback on error
      });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Mobile drawer: lock body scroll + ESC key to close ────────────────
  // When the drawer is open, prevent the underlying page from scrolling
  // horizontally OR vertically. ESC key closes the drawer (accessibility).
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileMenuOpen, setMobileMenuOpen]);

  const handleNavClick = (item: any) => {
    setMobileMenuOpen(false);
    // External URL takes precedence if no view
    if (item.url && !item.view) {
      if (item.url.startsWith("http")) {
        window.open(item.url, "_blank");
      } else if (item.url.startsWith("#")) {
        // Hash URL — could be an anchor
        const el = document.getElementById(item.url.slice(1));
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = item.url;
      }
      return;
    }
    // Migrated routes — redirect to clean URLs instead of hash-based views
    if (item.view === "rent") {
      window.location.href = "/rent";
      return;
    }
    if (item.view === "buy") {
      window.location.href = "/sale";
      return;
    }
    if (item.view === "community" && item.id) {
      openCommunity(item.id);
    } else if (item.view === "developer" && item.id) {
      openDeveloper(item.id);
    } else if (item.view === "valuation") {
      setValuationOpen(true);
    } else if (item.view === "mortgage") {
      setMortgageOpen(true);
    } else if (item.view === "testimonials") {
      setActiveView("home");
      setTimeout(() => {
        document.getElementById("testimonials")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } else if (item.view) {
      setActiveView(item.view);
    }
  };

  return (
    <>
      {/* ─── Main nav — transparent over video on homepage only, navy on all other pages ─── */}
      <header
        className={`transition-all duration-500 z-50 ${
          scrolled || activeView !== "home"
            ? "sticky top-0 bg-[#0A1F44] shadow-luxury border-b border-[#C9A961]/20"
            : "absolute top-0 left-0 right-0 bg-[#0A1F44]/80 backdrop-blur-sm md:bg-transparent border-b-0"
        }`}
        onMouseLeave={() => setOpenMenu(null)}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-500 ${
            scrolled || activeView !== "home" ? "h-16 lg:h-20" : "h-16 lg:h-24"
          }`}>
            {/* ─── Branding block — logo + company name with luxury hover animation ─── */}
            <button
              onClick={() => setActiveView("home")}
              className="luxury-logo flex items-center gap-2 lg:gap-3 flex-shrink-0 min-w-0"
              aria-label="Royal Jubilant Real Estate LLC — Home"
            >
              <img
                src="/logo.png"
                alt="Royal Jubilant Real Estate LLC"
                className="size-9 sm:size-11 lg:size-14 object-contain flex-shrink-0"
              />
              <div className="flex flex-col justify-center leading-none min-w-0 text-left">
                <span
                  className="luxury-gold-text font-serif text-sm sm:text-lg lg:text-2xl font-semibold tracking-normal text-left block"
                  style={{
                    background: "linear-gradient(135deg, #B8860B 0%, #D4AF37 35%, #F9D777 50%, #D4AF37 65%, #B8860B 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))",
                  }}
                >
                  Royal Jubilant
                </span>
                <span className="text-[8px] sm:text-[10px] lg:text-[11px] tracking-[0.15em] uppercase text-white/60 font-medium mt-1 text-left block w-full">
                  Real Estate LLC
                </span>
              </div>
              <span className="luxury-sparkle" />
              <span className="luxury-sparkle" />
              <span className="luxury-sparkle" />
              <span className="luxury-sparkle" />
              <span className="luxury-sparkle" />
            </button>

            {/* ─── Desktop navigation — centered, premium spacing ─── */}
            <nav className="hidden xl:flex items-center gap-1" aria-label="Main navigation">
              {navItems.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                return (
                  <div key={item.label} className="relative">
                    <button
                      onMouseEnter={() => setOpenMenu(hasChildren ? item.label : null)}
                      onClick={() => {
                        if (hasChildren) {
                          setOpenMenu(openMenu === item.label ? null : item.label);
                        } else {
                          handleNavClick(item);
                        }
                      }}
                      className={`nav-text flex items-center gap-1 px-3 py-2 transition-colors rounded-md gold-underline ${
                        openMenu === item.label
                          ? "text-[#C9A961]"
                          : "text-white hover:text-[#C9A961]"
                      }`}
                      aria-expanded={openMenu === item.label}
                    >
                      {item.label}
                      {hasChildren && (
                        <ChevronDown
                          className={`size-3.5 transition-transform duration-300 ${openMenu === item.label ? "rotate-180" : ""}`}
                        />
                      )}
                    </button>

                    <AnimatePresence>
                      {openMenu === item.label && hasChildren && (
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute top-full left-1/2 -translate-x-1/2 pt-4"
                          style={{ width: item.children.length <= 2 ? '300px' : '480px' }}
                        >
                          <div className="bg-white rounded-2xl p-3 shadow-luxury-xl border border-[#E5E7EB]">
                            <div
                              className="grid gap-1"
                              style={{ gridTemplateColumns: item.children.length <= 2 ? '1fr' : '1fr 1fr' }}
                            >
                              {item.children.map((child: any) => (
                                <button
                                  key={child.label}
                                  onClick={() => {
                                    setOpenMenu(null);
                                    handleNavClick(child);
                                  }}
                                  className="text-left px-3 py-2.5 rounded-lg hover:bg-[#F9FAFB] transition-colors group/item"
                                >
                                  <div className="text-sm font-medium text-[#0A1F44] group-hover/item:text-[#C9A961] transition-colors flex items-center gap-2">
                                    {child.label}
                                    {child.badge && (
                                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#C9A961] text-[#0A1F44] font-bold uppercase">
                                        {child.badge}
                                      </span>
                                    )}
                                  </div>
                                  {child.desc && (
                                    <div className="text-[11px] text-[#9CA3AF] mt-0.5 line-clamp-1">
                                      {child.desc}
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            {/* ─── Right section — contact actions + CTA ─── */}
            <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
              <div className="hidden 2xl:flex items-center gap-3 pr-4 border-r border-white/15">
                <a
                  href={`tel:${whatsapp}`}
                  className="flex items-center gap-1.5 text-white/80 hover:text-[#C9A961] transition-colors"
                  aria-label="Call us"
                  title={phone}
                >
                  <Phone className="size-3.5" />
                  <span className="text-xs font-medium tracking-wide">{phone}</span>
                </a>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                  aria-label="WhatsApp"
                  title="WhatsApp"
                >
                  <MessageCircle className="size-4 text-white/80 hover:text-[#C9A961]" />
                </a>
                <a
                  href={`mailto:${email}`}
                  className="size-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                  aria-label="Email"
                  title={email}
                >
                  <Mail className="size-4 text-white/80 hover:text-[#C9A961]" />
                </a>
              </div>

              <button
                onClick={() => setActiveView("saved")}
                className="relative size-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                aria-label="Saved properties"
              >
                <Heart className="size-4 text-white" />
                {savedProperties.length > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 size-4 p-0 flex items-center justify-center bg-[#C9A961] text-[#0A1F44] text-[9px] font-bold">
                    {savedProperties.length}
                  </Badge>
                )}
              </button>

              <button
                onClick={() => setDashboardOpen(true)}
                className="size-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                aria-label="Client portal"
              >
                <User className="size-4 text-white" />
              </button>

              <Button
                onClick={() => setValuationOpen(true)}
                className="hidden md:inline-flex bg-[#C9A961] hover:bg-[#D4B875] text-[#0A1F44] rounded-full px-5 py-2.5 text-sm font-medium shadow-sm transition-all duration-300 items-center gap-2"
              >
                <Calendar className="size-4" />
                Book Consultation
              </Button>
            </div>

            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMobileMenuOpen(true); }}
              className="xl:hidden relative z-[80] size-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0 touch-manipulation"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Menu className="size-6 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Mobile navigation drawer ───
          Proper viewport-level overlay drawer:
          - position: fixed, inset: 0 → covers full viewport
          - backdrop: semi-transparent + blur, click to close
          - drawer: width = min(85vw, 380px) → always visible portion of
            backdrop so user understands menu is open
          - slides in from right (x: 100% → 0)
          - high z-index so it covers everything including AI widget
          - body scroll lock + ESC key handled in useEffect above
          - aria-label on close button for accessibility */}
      {/* ─── Mobile navigation drawer ───
          Rendered via React Portal at document.body level so it's
          independent of any Homepage-specific ancestor CSS context.
          On Homepage, the Hero section and header use transforms,
          filters, and backdrop-filters that create containing blocks
          for position:fixed descendants — breaking the drawer's
          viewport-relative positioning. Portaling to body bypasses
          all ancestor contexts, making the drawer work identically
          on Homepage and all internal pages. */}
      {mounted && createPortal(
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop — click anywhere to close */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80]"
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
              />
              {/* Drawer — viewport-relative width, slides in from right */}
              <motion.div
                id="mobile-nav-drawer"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="fixed top-0 right-0 bottom-0 bg-[#0A1F44] z-[90] overflow-y-auto shadow-2xl"
                style={{
                  width: "min(85vw, 380px)",
                  WebkitOverflowScrolling: "touch",
                }}
              >
              {/* Sticky header inside drawer — logo + close button */}
              <div className="sticky top-0 bg-[#0A1F44] z-10 flex items-center justify-between p-5 border-b border-white/10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src="/logo.png" alt="Royal Jubilant" className="size-10 object-contain flex-shrink-0" />
                  <div className="flex flex-col leading-none text-left min-w-0">
                    <span
                      className="font-serif text-base font-semibold tracking-normal text-left block truncate"
                      style={{
                        background: "linear-gradient(135deg, #B8860B 0%, #D4AF37 35%, #F9D777 50%, #D4AF37 65%, #B8860B 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))",
                      }}
                    >Royal Jubilant</span>
                    <span className="text-[9px] tracking-[0.15em] uppercase text-white/60 mt-1 text-left block w-full">Real Estate LLC</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="size-10 rounded-full hover:bg-white/10 flex items-center justify-center flex-shrink-0 transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X className="size-5 text-white" />
                </button>
              </div>

              <div className="p-5 space-y-1">
                {navItems.map((item) => (
                  <MobileNavGroup key={item.label} item={item} onNavigate={handleNavClick} />
                ))}
              </div>

              <div className="p-5 mt-4 border-t border-white/10 space-y-3">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <a href={`tel:${whatsapp}`} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <Phone className="size-4 text-[#C9A961]" />
                    <span className="text-[10px] text-white/70">Call</span>
                  </a>
                  <a href={`https://wa.me/${whatsapp}`} target="_blank" className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <MessageCircle className="size-4 text-[#C9A961]" />
                    <span className="text-[10px] text-white/70">WhatsApp</span>
                  </a>
                  <a href={`mailto:${email}`} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <Mail className="size-4 text-[#C9A961]" />
                    <span className="text-[10px] text-white/70">Email</span>
                  </a>
                </div>

                <Button
                  onClick={() => { setMobileMenuOpen(false); setValuationOpen(true); }}
                  className="w-full bg-[#C9A961] hover:bg-[#D4B875] text-[#0A1F44] rounded-full"
                >
                  <Calendar className="size-4 mr-2" /> Book Consultation
                </Button>
                <Button
                  onClick={() => { setMobileMenuOpen(false); setMortgageOpen(true); }}
                  variant="outline"
                  className="w-full rounded-full border-[#C9A961]/40 text-white hover:bg-white/10"
                >
                  <Calculator className="size-4 mr-2" /> Mortgage Calculator
                </Button>
                <Button
                  onClick={() => { setMobileMenuOpen(false); setDashboardOpen(true); }}
                  variant="ghost"
                  className="w-full rounded-full text-white hover:bg-white/10"
                >
                  <User className="size-4 mr-2" /> Client Portal
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
        document.body
      )}
    </>
  );
}

function MobileNavGroup({ item, onNavigate }: { item: any; onNavigate: (c: any) => void }) {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  if (!hasChildren) {
    return (
      <button
        onClick={() => onNavigate(item)}
        className="w-full flex items-center justify-between py-3 text-left border-b border-white/5"
      >
        <span className="font-serif text-lg text-white">{item.label}</span>
      </button>
    );
  }

  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="font-serif text-lg text-white">{item.label}</span>
        <ChevronDown className={`size-4 text-white/50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-3 space-y-1">
              {item.children.map((child: any) => (
                <button
                  key={child.label}
                  onClick={() => onNavigate(child)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <div>
                    <div className="text-sm font-medium text-white flex items-center gap-2">
                      {child.label}
                      {child.badge && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#C9A961] text-[#0A1F44] font-bold uppercase">
                          {child.badge}
                        </span>
                      )}
                    </div>
                    {child.desc && <div className="text-xs text-white/40 mt-0.5">{child.desc}</div>}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
