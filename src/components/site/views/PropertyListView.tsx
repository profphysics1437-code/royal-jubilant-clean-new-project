"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, X, Search, Sliders, MapPin, Building2, BedDouble,
  Bath, Grid3x3, List, ArrowUpDown, Check, Maximize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  COUNTRIES, EMIRATES,
  RESIDENTIAL_TYPES, COMMERCIAL_TYPES,
} from "@/lib/property-options";
import { properties as fallbackProperties, Property } from "@/lib/data";
import { PropertyCard } from "@/components/site/PropertyCard";
import { useStore } from "@/lib/store";
import { useApi } from "@/lib/useApi";
import { useLocations } from "@/lib/useLocations";

interface Props {
  /** sale | rent | rent-rooms | rent-holiday | rent-monthly | rent-daily | commercial | commercial-rent | commercial-sale | off-plan | all | luxury */
  filter: "sale" | "rent" | "rent-rooms" | "rent-holiday" | "rent-monthly" | "rent-daily" | "commercial" | "commercial-rent" | "commercial-sale" | "off-plan" | "all" | "luxury";
  title?: string;
  subtitle?: string;
}

const PRICE_OPTIONS = [
  { value: "", label: "Any Price" },
  { value: "0-20000", label: "Up to AED 20K" },
  { value: "20000-50000", label: "AED 20K – 50K" },
  { value: "50000-100000", label: "AED 50K – 100K" },
  { value: "100000-200000", label: "AED 100K – 200K" },
  { value: "200000-500000", label: "AED 200K – 500K" },
  { value: "500000-1000000", label: "AED 500K – 1M" },
  { value: "1000000-2000000", label: "AED 1M – 2M" },
  { value: "2000000-5000000", label: "AED 2M – 5M" },
  { value: "5000000-10000000", label: "AED 5M – 10M" },
  { value: "10000000-20000000", label: "AED 10M – 20M" },
  { value: "20000000-50000000", label: "AED 20M – 50M" },
  { value: "50000000-0", label: "AED 50M+" },
];

const BED_OPTIONS = [
  { value: "0", label: "Studio" },
  { value: "all", label: "All" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
  { value: "7", label: "7+" },
];

const BATH_OPTIONS = ["All", "1", "2", "3", "4", "5", "6+"];

const AREA_OPTIONS = [
  { value: "", label: "Any Area" },
  { value: "0-500", label: "Up to 500 sqft" },
  { value: "500-1000", label: "500 – 1,000 sqft" },
  { value: "1000-2000", label: "1,000 – 2,000 sqft" },
  { value: "2000-5000", label: "2,000 – 5,000 sqft" },
  { value: "5000-10000", label: "5,000 – 10,000 sqft" },
  { value: "10000-20000", label: "10,000 – 20,000 sqft" },
  { value: "20000-0", label: "20,000+ sqft" },
];

const FEATURE_OPTIONS = [
  "Private Pool", "Upgraded", "Large Plot", "Close to Park",
  "Brand New", "Furnished", "Vacant on Transfer", "Waterviews",
  "Golf Course View", "Balcony", "Garden", "Maid Room",
  "Beach Access", "Gym", "Sea View", "Burj Khalifa View",
  "City View", "Central A/C", "Concierge", "Security",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Most Recent" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "area-high", label: "Largest Area" },
];

const titles: Record<Props["filter"], { title: string; subtitle: string }> = {
  rent: {
    title: "Properties for Rent",
    subtitle: "Dubai's rental market is as dynamic as the city itself, offering everything from stylish apartments in the heart of the action to spacious villas in peaceful family communities. Many homes feature contemporary interiors, excellent on-site amenities and prime locations near business districts, schools and leisure hotspots. Whether you're after a short term stay or a long term lease, Dubai offers flexible rental options to suit every lifestyle. Explore the full range of listings or get in touch with Royal Jubilant to find the ideal home to rent in Dubai.",
  },
  "rent-rooms": {
    title: "Rooms for Rent",
    subtitle: "Affordable shared rooms and bed spaces across Dubai. Ideal for professionals, students, and budget-conscious tenants looking for flexible living arrangements in prime locations.",
  },
  "rent-holiday": {
    title: "Holiday Homes",
    subtitle: "Fully furnished vacation rentals for short stays in Dubai's most sought-after communities. Enjoy hotel-quality amenities with the comfort of a private home.",
  },
  "rent-monthly": {
    title: "Monthly Short Term Rentals",
    subtitle: "Flexible 1-3 month stays in fully furnished apartments and villas. Perfect for business travellers, relocating professionals, and those between permanent homes.",
  },
  "rent-daily": {
    title: "Daily Short Term Rentals",
    subtitle: "Daily and weekly stays in premium furnished properties. Ideal for tourists, business trips, and short visits to Dubai with all the comforts of home.",
  },
  sale: {
    title: "Properties for Sale",
    subtitle: "From beachfront Signature Villas on Palm Jumeirah to branded penthouses in Downtown Dubai — browse our active sale inventory across Dubai's most prestigious communities. Our RERA-certified advisors provide personal, research-led counsel to help you find the perfect property investment.",
  },
  commercial: {
    title: "Commercial Properties",
    subtitle: "Grade-A offices, retail spaces, and whole buildings across Business Bay, DIFC, JLT and Sheikh Zayed Road. Whether you're a startup seeking your first office or a corporate headquarters looking to expand, we have the right commercial space for your business.",
  },
  "commercial-rent": {
    title: "Commercial Property for Rent",
    subtitle: "Lease Grade-A offices, retail spaces, and industrial units across Dubai's principal business districts. Flexible lease terms, competitive rates, and RERA-certified advisory from Royal Jubilant.",
  },
  "commercial-sale": {
    title: "Commercial Property for Sale",
    subtitle: "Buy offices, retail units, whole buildings, and industrial properties across Dubai. Investment-grade commercial real estate with strong rental yields and capital appreciation potential.",
  },
  "off-plan": {
    title: "Off-Plan Projects",
    subtitle: "Pre-launch allocations from Emaar, DAMAC, Omniyat and Sobha with flexible payment plans. Invest in Dubai's most exciting upcoming developments before they hit the public market — with projected rental yields of 7-8% on completion.",
  },
  all: {
    title: "All Properties",
    subtitle: "The full Royal Jubilant portfolio — browse every property listing across Dubai, from studios to mansions, across every community and price range.",
  },
  luxury: {
    title: "The Luxury Collection",
    subtitle: "A discreet portfolio of trophy assets above AED 15M — Signature Villas, branded penthouses and one-off architectural masterpieces. Available to qualified clients by private appointment.",
  },
};

export function PropertyListView({ filter, title, subtitle }: Props) {
  const meta = titles[filter];

  // Fetch published locations from DB (single source of truth) — same data
  // the admin portal uses. Replaces the hardcoded DUBAI_COMMUNITIES array.
  const { locationNames: communityOptions } = useLocations();

  // Fetch properties from DB (falls back to mock data while loading or on error)
  const { data } = useApi<{ properties: Property[] }>("/api/public/properties?limit=0", { properties: fallbackProperties });
  const properties: Property[] = data?.properties || fallbackProperties;

  // Filters — default to "rent" since Rent is our trademark
  const [department, setDepartment] = useState<"sale" | "rent">(
    filter === "sale" ? "sale" : "rent"
  );
  const [propertyType, setPropertyType] = useState<string>("");
  const [category, setCategory] = useState<"Residential" | "Commercial">(
    filter === "commercial" ? "Commercial" : "Residential"
  );
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [beds, setBeds] = useState<string>("all"); // "all" shows all, "0" = Studio
  const [baths, setBaths] = useState<string>("All");
  const [minArea, setMinArea] = useState<string>("");
  const [maxArea, setMaxArea] = useState<string>("");
  const [community, setCommunity] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");

  // More filters (modal)
  const [moreOpen, setMoreOpen] = useState(false);
  const [offPlanOnly, setOffPlanOnly] = useState(false);
  const [letOnly, setLetOnly] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);

  // View settings
  const [sort, setSort] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Sync department if filter prop changes
  useEffect(() => {
    if (filter === "rent") setDepartment("rent");
    else if (filter === "sale") setDepartment("sale");
    if (filter === "commercial" || filter === "commercial-rent" || filter === "commercial-sale") {
      setCategory("Commercial");
      if (filter === "commercial-rent") setDepartment("rent");
      if (filter === "commercial-sale") setDepartment("sale");
    } else {
      setCategory("Residential");
    }
  }, [filter]);

  const propertyTypes = category === "Residential" ? RESIDENTIAL_TYPES : COMMERCIAL_TYPES;

  const filtered = useMemo(() => {
    let list: Property[] = properties;

    // Base filter from prop
    if (filter === "luxury") {
      list = list.filter((p) => p.isLuxury);
    } else if (filter === "all") {
      // no restriction
    } else if (filter === "off-plan") {
      list = list.filter((p) => p.completionStatus === "Off-Plan" || p.status === "off-plan");
    } else if (filter === "commercial") {
      list = list.filter((p) => p.status === "commercial" || (p as any).category === "Commercial");
    } else if (filter === "commercial-rent") {
      list = list.filter((p) => ((p as any).category === "Commercial") && p.status === "rent");
    } else if (filter === "commercial-sale") {
      list = list.filter((p) => ((p as any).category === "Commercial") && p.status === "sale");
    } else if (filter === "rent-rooms") {
      // Rooms for Rent — Private Room or Bed Space types only
      list = list.filter((p) => p.status === "rent" && ((p as any).type === "Private Room" || (p as any).type === "Bed Space"));
    } else if (filter === "rent-holiday") {
      // Holiday Homes — furnished properties with short-term rental frequency (Weekly/Daily) OR furnished + any rent
      list = list.filter((p) => p.status === "rent" && p.furnished === true &&
        ((p as any).rentFrequency === "Weekly" || (p as any).rentFrequency === "Daily" || (p as any).rentFrequency === "year" || !p.rentFrequency));
    } else if (filter === "rent-monthly") {
      // Monthly Short Term — rentFrequency = Monthly
      list = list.filter((p) => p.status === "rent" &&
        ((p as any).rentFrequency === "Monthly" || (p as any).rentFrequency === "month"));
    } else if (filter === "rent-daily") {
      // Daily Short Term — rentFrequency = Daily or Weekly
      list = list.filter((p) => p.status === "rent" &&
        ((p as any).rentFrequency === "Daily" || (p as any).rentFrequency === "Weekly" || (p as any).rentFrequency === "daily" || (p as any).rentFrequency === "weekly"));
    } else if (filter === "rent") {
      // Residential — annual long-term rentals (Yearly), excluding rooms/bed spaces
      list = list.filter((p) => p.status === "rent" && (p as any).type !== "Private Room" && (p as any).type !== "Bed Space");
    } else {
      // sale / rent — use department toggle
      list = list.filter((p) => p.status === department);
    }

    // Property type
    if (propertyType) list = list.filter((p) => p.type === propertyType);
    // Community
    if (community) list = list.filter((p) => p.community === community);
    // Beds
    if (beds !== "all") {
      const min = Number(beds);
      if (min === 7) list = list.filter((p) => p.bedrooms >= 7);
      else list = list.filter((p) => p.bedrooms === min || p.bedrooms >= min);
    }
    // Baths
    if (baths !== "All") {
      if (baths === "6+") list = list.filter((p) => p.bathrooms >= 6);
      else list = list.filter((p) => p.bathrooms >= Number(baths));
    }
    // Price range
    if (minPrice || maxPrice) {
      const [min, max] = [minPrice ? Number(minPrice.split("-")[0]) : 0, maxPrice ? Number(maxPrice.split("-")[1]) : 0];
      list = list.filter((p) => p.price >= min && (max === 0 || p.price <= max));
    }
    // Area range (commercial)
    if (minArea || maxArea) {
      const [min, max] = [minArea ? Number(minArea.split("-")[0]) : 0, maxArea ? Number(maxArea.split("-")[1]) : 0];
      list = list.filter((p) => p.area >= min && (max === 0 || p.area <= max));
    }
    // Off-plan only
    if (offPlanOnly) list = list.filter((p) => p.completionStatus === "Off-Plan" || p.completionStatus === "Under Construction");
    // Keyword
    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      list = list.filter((p) =>
        p.title.toLowerCase().includes(kw) ||
        p.community.toLowerCase().includes(kw) ||
        p.description.toLowerCase().includes(kw)
      );
    }
    // Features — match against amenities array
    if (features.length > 0) {
      list = list.filter((p) => features.every((f) => p.amenities.includes(f)));
    }
    // Sort
    if (sort === "newest") list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sort === "price-low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "area-high") list = [...list].sort((a, b) => b.area - a.area);
    return list;
  }, [filter, department, propertyType, category, minPrice, maxPrice, beds, baths, minArea, maxArea, community, keyword, offPlanOnly, letOnly, features, sort, properties]);

  const toggleFeature = (f: string) => {
    setFeatures(features.includes(f) ? features.filter((x) => x !== f) : [...features, f]);
  };

  const resetAll = () => {
    setPropertyType(""); setMinPrice(""); setMaxPrice(""); setBeds("all");
    setBaths("All"); setMinArea(""); setMaxArea(""); setCommunity(""); setKeyword("");
    setOffPlanOnly(false); setLetOnly(false); setFeatures([]);
  };

  const activeFilterCount = [
    propertyType, community, beds !== "all" ? beds : "", baths !== "All" ? baths : "",
    minPrice, maxPrice, keyword, offPlanOnly ? "offplan" : "", ...features,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Hero header */}
      <div className="bg-royal-gradient-diagonal text-white py-14 lg:py-16">
        <div className="container mx-auto px-4 lg:px-6">
          <h1 className="h1 text-white">{title || meta.title}</h1>
          <p className="mt-4 body-text text-white/70 leading-relaxed">{subtitle || meta.subtitle}</p>
        </div>
      </div>

      {/* Sticky search bar — top-0 sticks below navbar when scrolled */}
      <div className="sticky top-0 z-30 bg-white shadow-md border-b border-[#E5E7EB]">
        <div className="container mx-auto px-4 lg:px-6 py-3">
          <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
            {/* Department toggle — only show on 'all' page where users can switch */}
            {filter === "all" && (
              <div className="flex bg-[#F9FAFB] rounded-lg p-1 flex-shrink-0">
                {(["rent", "sale"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDepartment(d)}
                    className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                      department === d ? "bg-royal-gradient-diagonal text-white shadow-sm" : "text-[#0A1F44] hover:bg-white"
                    }`}
                  >
                    {d === "sale" ? "Buy" : "Rent"}
                  </button>
                ))}
              </div>
            )}

            {/* Static badge for rent/buy pages — no toggle */}
            {(filter === "rent" || filter === "sale") && (
              <div className="flex bg-royal-gradient-diagonal rounded-lg p-1 flex-shrink-0">
                <span className="px-4 py-2 rounded-md text-xs font-medium text-white">
                  {filter === "rent" ? "Rent" : "Buy"}
                </span>
              </div>
            )}

            {/* Property Type dropdown */}
            <DropdownSelect
              label="Property Type"
              icon={<Building2 className="size-3.5" />}
              value={propertyType}
              options={["", ...propertyTypes]}
              optionLabels={["All Types", ...propertyTypes]}
              onChange={setPropertyType}
            />

            {/* Min Price */}
            <DropdownSelect
              label="Min Price"
              value={minPrice}
              options={PRICE_OPTIONS.map((p) => p.value)}
              optionLabels={PRICE_OPTIONS.map((p) => p.label)}
              onChange={setMinPrice}
            />

            {/* Max Price */}
            <DropdownSelect
              label="Max Price"
              value={maxPrice}
              options={PRICE_OPTIONS.map((p) => p.value)}
              optionLabels={PRICE_OPTIONS.map((p) => p.label)}
              onChange={setMaxPrice}
            />

            {/* Beds dropdown (only for residential) */}
            {(category === "Residential") && (
            <DropdownSelect
              label="Beds"
              icon={<BedDouble className="size-3.5" />}
              value={beds}
              options={BED_OPTIONS.map((b) => b.value)}
              optionLabels={BED_OPTIONS.map((b) => b.label)}
              onChange={setBeds}
            />
            )}

            {/* Baths dropdown (only for residential) */}
            {(category === "Residential") && (
            <DropdownSelect
              label="Baths"
              icon={<Bath className="size-3.5" />}
              value={baths}
              options={BATH_OPTIONS}
              optionLabels={BATH_OPTIONS}
              onChange={setBaths}
            />
            )}

            {/* Min Area dropdown (only for commercial) */}
            {(category === "Commercial") && (
            <DropdownSelect
              label="Min Area"
              icon={<Maximize className="size-3.5" />}
              value={minArea}
              options={AREA_OPTIONS.map((a) => a.value)}
              optionLabels={AREA_OPTIONS.map((a) => a.label)}
              onChange={setMinArea}
            />
            )}

            {/* Max Area dropdown (only for commercial) */}
            {(category === "Commercial") && (
            <DropdownSelect
              label="Max Area"
              icon={<Maximize className="size-3.5" />}
              value={maxArea}
              options={AREA_OPTIONS.map((a) => a.value)}
              optionLabels={AREA_OPTIONS.map((a) => a.label)}
              onChange={setMaxArea}
            />
            )}

            {/* Community dropdown — uses DB-backed locations (single source of truth) */}
            <DropdownSelect
              label="Location"
              icon={<MapPin className="size-3.5" />}
              value={community}
              options={["", ...communityOptions]}
              optionLabels={["All Locations", ...communityOptions]}
              onChange={setCommunity}
            />

            {/* More Filters button */}
            <button
              onClick={() => setMoreOpen(true)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
                activeFilterCount > 0 || features.length > 0 || offPlanOnly
                  ? "bg-[#C9A961] text-[#0A1F44]"
                  : "bg-[#F9FAFB] text-[#0A1F44] hover:bg-[#C9A961]/15"
              }`}
            >
              <Sliders className="size-3.5" />
              More Filters
              {(activeFilterCount > 0 || features.length > 0) && (
                <span className="ml-1 size-4 rounded-full bg-[#0A1F44] text-white text-[9px] flex items-center justify-center font-bold">
                  {activeFilterCount + features.length}
                </span>
              )}
            </button>

            {/* Search input (grows to fill) */}
            <div className="relative flex-1 min-w-[140px] hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search by keyword, community, or feature…"
                className="w-full h-10 pl-9 pr-3 text-xs bg-[#F9FAFB] rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-[#C9A961]/40 text-[#0A1F44] placeholder:text-muted-foreground/70"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results toolbar */}
      <div className="container mx-auto px-4 lg:px-6 pt-6 pb-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">
              <strong className="text-[#0A1F44]">{filtered.length}</strong> {filtered.length === 1 ? "property" : "properties"} found
              {activeFilterCount > 0 && (
                <button onClick={resetAll} className="ml-3 text-xs text-[#A68A3F] hover:underline">
                  Clear all filters
                </button>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none h-9 pl-9 pr-8 text-xs bg-white border border-border rounded-lg text-[#0A1F44] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C9A961]/40"
              >
                {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            </div>

            {/* View toggle */}
            <div className="flex bg-white border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`size-7 rounded flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-royal-gradient-diagonal text-white" : "text-muted-foreground hover:text-[#0A1F44]"}`}
                aria-label="Grid view"
              >
                <Grid3x3 className="size-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`size-7 rounded flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-royal-gradient-diagonal text-white" : "text-muted-foreground hover:text-[#0A1F44]"}`}
                aria-label="List view"
              >
                <List className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results grid */}
      <div className="container mx-auto px-4 lg:px-6 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="size-16 rounded-full bg-[#F9FAFB] flex items-center justify-center mx-auto mb-4">
              <Search className="size-7 text-muted-foreground/40" />
            </div>
            <h3 className="font-serif text-xl text-[#0A1F44] mb-2">No properties match your filters</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">Try widening your search criteria — adjust price range, beds, or clear all filters.</p>
            <Button onClick={resetAll} className="bg-royal-gradient-diagonal text-white rounded-full">
              Reset Filters
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
            {filtered.map((p, i) => <PropertyCard key={p.id} property={p} index={i} />)}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((p, i) => <PropertyListRow key={p.id} property={p} index={i} />)}
          </div>
        )}
      </div>

      {/* More Filters modal */}
      <AnimatePresence>
        {moreOpen && (
          <MoreFiltersModal
            offPlanOnly={offPlanOnly}
            setOffPlanOnly={setOffPlanOnly}
            letOnly={letOnly}
            setLetOnly={setLetOnly}
            features={features}
            toggleFeature={toggleFeature}
            category={category}
            setCategory={setCategory}
            onClose={() => setMoreOpen(false)}
            onApply={() => setMoreOpen(false)}
            onReset={() => {
              setOffPlanOnly(false); setLetOnly(false); setFeatures([]);
            }}
            activeCount={features.length + (offPlanOnly ? 1 : 0) + (letOnly ? 1 : 0)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- Dropdown Select Component ----------
function DropdownSelect({
  label, icon, value, options, optionLabels, onChange,
}: {
  label: string;
  icon?: React.ReactNode;
  value: string;
  options: string[];
  optionLabels: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  // Show field label when default/empty, show selected option label when a real filter is applied
  const isDefault = !value || value === "all" || value === "All";
  const selectedLabel = isDefault ? label : (optionLabels[options.indexOf(value)] || label);

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
          isDefault ? "bg-[#F9FAFB] text-[#0A1F44] hover:bg-[#C9A961]/15" : "bg-royal-gradient-diagonal text-white"
        }`}
      >
        {icon}
        <span className="max-w-[100px] truncate">{selectedLabel}</span>
        <ChevronDown className={`size-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-1 min-w-[180px] max-h-72 overflow-y-auto bg-white rounded-xl shadow-luxury-xl border border-[#E5E7EB] z-[60] py-1.5"
            >
              {options.map((opt, i) => (
                <button
                  key={opt + i}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[#F9FAFB] transition-colors flex items-center justify-between ${
                    value === opt ? "text-[#A68A3F] font-medium bg-[#F9FAFB]" : "text-[#0A1F44]"
                  }`}
                >
                  <span>{optionLabels[i]}</span>
                  {value === opt && <Check className="size-3.5" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- More Filters Modal ----------
function MoreFiltersModal({
  offPlanOnly, setOffPlanOnly, letOnly, setLetOnly,
  features, toggleFeature, category, setCategory,
  onClose, onApply, onReset, activeCount,
}: {
  offPlanOnly: boolean;
  setOffPlanOnly: (v: boolean) => void;
  letOnly: boolean;
  setLetOnly: (v: boolean) => void;
  features: string[];
  toggleFeature: (f: string) => void;
  category: string;
  setCategory: (c: "Residential" | "Commercial") => void;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
  activeCount: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-royal-gradient-diagonal text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sliders className="size-5 text-[#A68A3F]" />
            <h2 className="font-serif text-xl font-medium">More Filters</h2>
            {activeCount > 0 && (
              <span className="text-[10px] px-2 py-1 rounded-full bg-[#C9A961] text-[#0A1F44] font-bold">{activeCount} active</span>
            )}
          </div>
          <button onClick={onClose} className="size-9 rounded-full hover:bg-white/15 flex items-center justify-center">
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Toggles */}
          <div className="space-y-3">
            <ToggleRow label="Off Plan Only" desc="Show only off-plan and under-construction properties" checked={offPlanOnly} onChange={setOffPlanOnly} />
            <ToggleRow label="Let Only" desc="Show only available-to-rent properties (no sold)" checked={letOnly} onChange={setLetOnly} />
          </div>

          {/* Category toggle */}
          <div>
            <h3 className="text-xs tracking-luxury uppercase text-[#A68A3F] font-semibold mb-3">Property Category</h3>
            <div className="grid grid-cols-2 gap-2">
              {(["Residential", "Commercial"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                    category === c ? "bg-royal-gradient-diagonal text-white border-transparent" : "bg-[#F9FAFB] text-[#0A1F44] border-border hover:border-[#C9A961]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-xs tracking-luxury uppercase text-[#A68A3F] font-semibold mb-3">Features</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FEATURE_OPTIONS.map((f) => {
                const isSelected = features.includes(f);
                return (
                  <button
                    key={f}
                    onClick={() => toggleFeature(f)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all text-left ${
                      isSelected ? "bg-royal-gradient-diagonal text-white border-transparent" : "bg-[#F9FAFB] text-[#0A1F44] border-border hover:border-[#C9A961]"
                    }`}
                  >
                    <span className={`size-4 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-white border-white" : "border-muted-foreground/40"}`}>
                      {isSelected && <Check className="size-3 text-[#0A1F44]" />}
                    </span>
                    <span className="leading-tight">{f}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border bg-[#F9FAFB] flex items-center justify-between gap-3">
          <button onClick={onReset} className="text-xs text-muted-foreground hover:text-[#A68A3F] hover:underline">
            Reset all
          </button>
          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline" className="rounded-full">Cancel</Button>
            <Button onClick={onApply} className="bg-royal-gradient-diagonal text-white rounded-full">
              Apply Filters {activeCount > 0 && `(${activeCount})`}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-xl bg-[#F9FAFB] cursor-pointer hover:bg-[#C9A961]/8 transition-colors">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 mt-0.5 ${checked ? "bg-[#C9A961]" : "bg-muted-foreground/30"}`}
      >
        <span className={`absolute top-0.5 size-4 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
      <div className="flex-1">
        <div className="text-sm font-medium text-[#0A1F44]">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
    </label>
  );
}

// ---------- List Row (for list view) ----------
function PropertyListRow({ property, index }: { property: Property; index: number }) {
  const openProperty = useStore((s) => s.openProperty);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
      onClick={() => openProperty(property.id)}
      className="group bg-white rounded-2xl border border-border/60 overflow-hidden lift-on-hover cursor-pointer flex flex-col sm:flex-row"
    >
      <div className="sm:w-64 aspect-[4/3] sm:aspect-auto overflow-hidden bg-muted flex-shrink-0 relative">
        <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover zoom-img" />
        <span className="absolute top-2 left-2 text-[9px] px-2 py-0.5 rounded bg-[#C9A961] text-[#0A1F44] font-bold uppercase tracking-wide">{property.status}</span>
      </div>
      <div className="flex-1 p-5 flex flex-col">
        <div className="text-[10px] tracking-luxury uppercase text-[#A68A3F] mb-1">{property.community}{property.subCommunity ? ` · ${property.subCommunity}` : ""}</div>
        <h3 className="font-serif text-lg font-medium text-[#0A1F44] group-hover:text-[#A68A3F] transition-colors line-clamp-1">{property.title}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{property.description}</p>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          {property.bedrooms > 0 && <span className="flex items-center gap-1"><BedDouble className="size-3" /> {property.bedrooms} beds</span>}
          {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="size-3" /> {property.bathrooms} baths</span>}
          <span>{property.area.toLocaleString()} sqft</span>
        </div>
        <div className="mt-auto pt-3 flex items-end justify-between">
          <div>
            <div className="text-[10px] tracking-luxury uppercase text-muted-foreground">Price</div>
            <div className="font-serif text-xl font-semibold text-[#0A1F44]">
              AED {property.price.toLocaleString()}{property.rentFrequency === "year" ? "/yr" : property.rentFrequency === "month" ? "/mo" : ""}
            </div>
          </div>
          <span className="text-[10px] tracking-luxury uppercase text-[#A68A3F] font-medium">View Details →</span>
        </div>
      </div>
    </motion.div>
  );
}
