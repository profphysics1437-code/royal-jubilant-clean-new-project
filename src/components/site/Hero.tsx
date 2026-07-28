"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useStore } from "@/lib/store";
import { useApi } from "@/lib/useApi";

const fallbackSlides = [
  { heading1: "Discover Dubai's", heading2: "most extraordinary", heading3: "addresses.", subtitle: "From apartments and villas in family-friendly communities to commercial offices, off-plan launches and industrial units — Royal Jubilant's RERA-certified advisors deliver personal, research-led counsel across every Dubai property category." },
  { heading1: "Your Dream Property", heading2: "Awaits in Dubai", heading3: null, subtitle: "Discover exceptional homes and investment opportunities with Royal Jubilant Real Estate. Your journey to finding the perfect property starts here." },
  { heading1: "Premium Real Estate", heading2: "Services in Dubai", heading3: null, subtitle: "Buy, sell, rent or invest in Off Plan properties with Dubai's trusted real estate broker. RERA-certified advisors, deep local knowledge, and a commitment to smoother transactions." },
  { heading1: "Invest in Dubai's", heading2: "Most Exciting", heading3: "Off-Plan Projects.", subtitle: "Get first-call access to Dubai's most anticipated off-plan launches from Emaar, Nakheel, Omniyat, and more. Royal Jubilant secures the best units at the best prices before they hit the market." },
  { heading1: "Dubai's Premier", heading2: "Luxury Property", heading3: "Destination.", subtitle: "From branded penthouses on Palm Jumeirah to signature villas in Emirates Hills — Royal Jubilant represents Dubai's most extraordinary trophy assets with discretion and expertise." },
];

export function Hero() {
  const { searchFilters, setSearchFilters, setActiveView } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<any[]>(fallbackSlides);
  const [videoUrl, setVideoUrl] = useState("/dubai-skyline.mp4");
  const [videoSpeed, setVideoSpeed] = useState(1);
  const [slideInterval, setSlideInterval] = useState(5500);
  const [purpose, setPurpose] = useState<"rent" | "buy">("rent");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { data: commData } = useApi<{ communities: any[] }>("/api/public/communities", { communities: [] });
  const communities = commData?.communities || [];

  useEffect(() => {
    fetch("/api/public/hero-slides").then((r) => r.json()).then((d) => { if (d.slides && d.slides.length > 0) setSlides(d.slides); }).catch(() => {});
    fetch("/api/public/site-settings").then((r) => r.json()).then((d) => {
      const s = d.settings || {};
      if (s["hero.videoUrl"]) setVideoUrl(s["hero.videoUrl"]);
      if (s["hero.videoSpeed"]) setVideoSpeed(parseFloat(s["hero.videoSpeed"]));
      if (s["hero.slideInterval"]) setSlideInterval(parseInt(s["hero.slideInterval"]));
    }).catch(() => {});
  }, []);

  useEffect(() => { if (videoRef.current) videoRef.current.playbackRate = videoSpeed; }, [videoSpeed, videoUrl]);
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), slideInterval);
    return () => clearInterval(timer);
  }, [slides.length, slideInterval]);

  const handleSearch = () => {
    if (purpose === "rent") setActiveView("rent");
    else setActiveView("buy");
  };

  const communityOptions = [
    "Dubai Marina", "Downtown Dubai", "Palm Jumeirah", "Dubai Hills Estate",
    "Business Bay", "JVC", "JLT", "DIFC", "Bluewaters Island", "Dubai Creek Harbour",
  ];

  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video ref={videoRef} autoPlay muted loop playsInline preload="auto" poster="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=2400&q=85" className="w-full h-full object-cover" aria-hidden="true">
          <source src={videoUrl} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 h-full flex flex-col min-w-0">
        <div className="flex-1 flex items-center pt-24 lg:pt-32">
          <div className="container mx-auto px-4 lg:px-6 w-full">
            <div className="max-w-4xl min-w-0">
              <div className="flex items-center gap-2 mb-6">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => setCurrentSlide(i)} className={`h-0.5 rounded-full transition-all duration-700 ${i === currentSlide ? "w-12 bg-[#C9A961]" : "w-6 bg-white/30 hover:bg-white/50"}`} aria-label={`Slide ${i + 1}`} />
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={currentSlide} initial={{ opacity: 0, y: 40, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -40, filter: "blur(10px)" }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
                  <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl xl:text-8xl leading-[1.05] font-medium tracking-tight text-white" style={{ textShadow: "0 4px 30px rgba(0,0,0,0.6)" }}>
                    {slides[currentSlide].heading1}<br />
                    <span className="text-[#D4B875]">{slides[currentSlide].heading2}</span>
                    {slides[currentSlide].heading3 && (<><br />{slides[currentSlide].heading3}</>)}
                  </h1>
                  <p className="mt-6 text-base lg:text-xl text-white/85 max-w-2xl leading-relaxed font-light" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.7)" }}>{slides[currentSlide].subtitle}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* SEARCH BAR — Solid white bar, 3 sections: RENT | Community | SEARCH */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} className="pb-6 lg:pb-8">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-3xl mx-auto min-w-0">
              {/* Main search bar — single solid white row */}
              <div className="flex flex-col md:flex-row items-stretch bg-white rounded-xl shadow-2xl overflow-hidden">
                {/* Section 1: RENT/BUY dropdown (navy) */}
                <button
                  onClick={() => setPurpose(purpose === "rent" ? "buy" : "rent")}
                  className="flex items-center justify-between gap-2 px-4 bg-[#0A1F44] text-white text-sm font-bold uppercase tracking-wide hover:bg-[#0A1F44]/90 transition-colors min-h-[48px]"
                >
                  {purpose}
                  <ChevronDown className="size-4" />
                </button>

                {/* Section 2: Community input (white) */}
                <div className="relative flex-1 min-h-[48px]">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none z-10" />
                  <select
                    value={searchFilters.location}
                    onChange={(e) => setSearchFilters({ location: e.target.value })}
                    className="w-full h-full min-h-[48px] pl-11 pr-10 text-sm font-medium bg-white text-gray-700 appearance-none cursor-pointer focus:outline-none [&>option]:text-[#0A1F44]"
                  >
                    <option value="">Community or Building</option>
                    {communityOptions.map((c) => (<option key={c} value={c}>{c}</option>))}
                    {communities.filter(c => !communityOptions.includes(c.name)).map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Section 3: SEARCH button (gold) */}
                <button
                  onClick={handleSearch}
                  className="flex items-center justify-center gap-2 px-6 bg-[#C9A961] hover:bg-[#A68A3F] text-white text-sm font-bold uppercase tracking-wide transition-colors min-h-[48px]"
                >
                  <Search className="size-4" />
                  Search
                </button>
              </div>

              {/* Below the bar: RESIDENTIAL (gold) | COMMERCIAL (white) | OFF PLAN (white) | ADVANCED SEARCH (link) */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => setActiveView("buy")} className="px-5 py-2 bg-[#C9A961] text-white text-xs font-bold rounded-lg uppercase tracking-wide hover:bg-[#A68A3F] transition-colors">Residential</button>
                  <button onClick={() => setActiveView("commercial")} className="px-5 py-2 bg-white text-[#0A1F44] text-xs font-bold rounded-lg uppercase tracking-wide hover:bg-gray-100 transition-colors">Commercial</button>
                  <button onClick={() => setActiveView("off-plan")} className="px-5 py-2 bg-white text-[#0A1F44] text-xs font-bold rounded-lg uppercase tracking-wide hover:bg-gray-100 transition-colors">Off Plan</button>
                </div>
                <button onClick={() => setAdvancedOpen(!advancedOpen)} className="flex items-center gap-1.5 px-3 py-2 text-white text-xs font-bold uppercase tracking-wide hover:text-[#C9A961] transition-colors">
                  <SlidersHorizontal className="size-3.5" />Advanced Search<ChevronDown className={`size-3 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
                </button>
              </div>

              {/* Advanced Search expansion panel */}
              <AnimatePresence>
                {advancedOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="bg-white/95 backdrop-blur-md rounded-lg p-4 mt-3 border border-gray-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div><label className="block text-xs text-gray-600 mb-1">Min Price</label><select value={searchFilters.minPrice || ""} onChange={(e) => setSearchFilters({ minPrice: e.target.value })} className="w-full h-10 px-3 text-sm bg-gray-50 text-[#0A1F44] rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C9A961]"><option value="">No Min</option><option value="500000">500K</option><option value="1000000">1M</option><option value="2000000">2M</option><option value="5000000">5M</option><option value="10000000">10M+</option></select></div>
                        <div><label className="block text-xs text-gray-600 mb-1">Max Price</label><select value={searchFilters.maxPrice || ""} onChange={(e) => setSearchFilters({ maxPrice: e.target.value })} className="w-full h-10 px-3 text-sm bg-gray-50 text-[#0A1F44] rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C9A961]"><option value="">No Max</option><option value="1000000">1M</option><option value="2000000">2M</option><option value="5000000">5M</option><option value="10000000">10M</option><option value="20000000">20M+</option></select></div>
                        <div><label className="block text-xs text-gray-600 mb-1">No. of Beds</label><select value={searchFilters.bedrooms || ""} onChange={(e) => setSearchFilters({ bedrooms: e.target.value })} className="w-full h-10 px-3 text-sm bg-gray-50 text-[#0A1F44] rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C9A961]"><option value="">Any</option><option value="0">Studio</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option><option value="5">5+</option></select></div>
                        <div><label className="block text-xs text-gray-600 mb-1">No. of Baths</label><select value={searchFilters.bathrooms || ""} onChange={(e) => setSearchFilters({ bathrooms: e.target.value })} className="w-full h-10 px-3 text-sm bg-gray-50 text-[#0A1F44] rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C9A961]"><option value="">Any</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option><option value="5">5+</option></select></div>
                      </div>
                      <div className="flex justify-end mt-3"><button onClick={() => { setAdvancedOpen(false); handleSearch(); }} className="px-4 py-2 bg-[#0A1F44] text-white text-xs font-semibold rounded-lg hover:bg-[#0A1F44]/90 transition-colors">Apply & Search</button></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
