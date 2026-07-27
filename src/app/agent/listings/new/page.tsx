"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Save, Loader2, ArrowLeft, ArrowRight, Check, AlertCircle,
  Tag, MapPin, Home, DollarSign, Sparkles, Camera, FileText, User,
  Eye, X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  COUNTRIES, EMIRATES, DUBAI_COMMUNITIES,
  RESIDENTIAL_TYPES, COMMERCIAL_TYPES,
  COMPLETION_STATUSES, FURNISHING_STATUSES, RENT_FREQUENCIES, CHEQUE_OPTIONS,
  BEDROOM_OPTIONS, BATHROOM_OPTIONS,
} from "@/lib/property-options";
import {
  CheckboxGrid,
  INDOOR_FEATURES, OUTDOOR_FEATURES, BUILDING_AMENITIES,
  NEARBY_LANDMARKS, VIEW_OPTIONS,
} from "@/components/admin/CheckboxGrid";
import { PhotoUploader } from "@/components/admin/PhotoUploader";

const SECTIONS = [
  { num: "01", title: "Listing Type", icon: Tag },
  { num: "02", title: "Location", icon: MapPin },
  { num: "03", title: "Property Details", icon: Home },
  { num: "04", title: "Pricing", icon: DollarSign },
  { num: "05", title: "Amenities", icon: Sparkles },
  { num: "06", title: "Media", icon: Camera },
  { num: "07", title: "Description", icon: FileText },
  { num: "08", title: "Agent Details", icon: User },
];

export default function AddProperty() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    reference: `RJ-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100).toString().padStart(2, "0")}`,
    // Section 1
    status: "sale", category: "Residential", type: "Apartment", title: "",
    // Section 2
    country: "UAE", emirate: "Dubai", community: "", subCommunity: "",
    locationLat: "", locationLng: "", locationAddress: "",
    // Section 3
    bedrooms: "1", bathrooms: "1", area: "", areaUnit: "sqft",
    plotSize: "", plotSizeUnit: "sqft",
    completionStatus: "Ready", completionDate: "",
    furnishingStatus: "Unfurnished", floorNumber: "", totalFloors: "", parking: "1",
    // Section 4
    price: "", rentFrequency: "Yearly", noOfCheques: "",
    serviceCharge: "", priceNegotiable: false,
    // Section 5
    indoorFeatures: [], outdoorFeatures: [], buildingAmenities: [],
    nearbyLandmarks: [], viewFeatures: [],
    // Section 6
    images: [], floorPlanUrl: "", videoUrl: "", virtualTourUrl: "",
    // Section 7
    description: "", reraNumber: "", exclusiveListing: false,
    // Flags
    isLuxury: false, isLatest: true,
  });

  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  // Auto-calc price per sqft
  const pricePerSqft = useMemo(() => {
    const p = Number(form.price);
    const a = Number(form.area);
    if (p > 0 && a > 0) return Math.round(p / a);
    return null;
  }, [form.price, form.area]);

  // Listing quality score
  const qualityScore = useMemo(() => {
    let score = 0;
    const checks = [
      form.title, form.community, form.area, form.price, form.description,
      form.description && form.description.length >= 50,
      form.reraNumber,
      form.images && form.images.length >= 3,
      form.indoorFeatures.length > 0 || form.outdoorFeatures.length > 0,
      form.buildingAmenities.length > 0,
      form.furnishingStatus,
      form.completionStatus,
      form.images && form.images.length >= 5,
      form.videoUrl,
      form.viewFeatures.length > 0,
      form.nearbyLandmarks.length > 0,
    ];
    checks.forEach((c) => { if (c) score += 100 / checks.length; });
    return Math.round(score);
  }, [form]);

  const propertyTypes = form.category === "Residential" ? RESIDENTIAL_TYPES : COMMERCIAL_TYPES;
  const isRent = form.status === "rent";
  const isOffPlan = form.completionStatus === "Off-Plan";

  const handleSave = async () => {
    // Required field validation
    if (!form.title) { toast.error("Listing Title is required", { description: "Section 1 — please enter a title" }); setStep(0); return; }
    if (!form.community) { toast.error("Community is required", { description: "Section 2 — please select a community" }); setStep(1); return; }
    if (!form.area) { toast.error("Property Size is required", { description: "Section 3 — please enter the area" }); setStep(2); return; }
    if (!form.price) { toast.error("Price is required", { description: "Section 4 — please enter the price" }); setStep(3); return; }
    if (!form.description || form.description.length < 50) { toast.error("Description must be at least 50 characters", { description: `Section 7 — currently ${form.description.length} characters` }); setStep(6); return; }

    setSaving(true);
    const payload = { ...form };
    try {
      const res = await fetch("/api/agent/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const errMsg = err.error || `Server error (${res.status})`;

        // User-friendly error messages
        if (errMsg.includes("Unique constraint") || errMsg.includes("reference")) {
          throw new Error(`Reference "${form.reference}" already exists. The system will generate a new one — please try again.`);
        }
        if (errMsg.includes("Missing required")) {
          throw new Error(errMsg);
        }
        throw new Error(errMsg);
      }
      toast.success("Property submitted for admin approval", {
        description: `Reference: ${form.reference} • Estimated approval: 24 hours`,
      });
      router.push("/agent/listings");
    } catch (e: any) {
      toast.error("Failed to create property", {
        description: e.message || "Unknown error — please try again",
        duration: 6000,
      });
      console.error("[AddProperty] Submission error:", e);
    } finally {
      setSaving(false);
    }
  };

  const canGoNext = () => {
    if (step === 0) return form.title && form.status && form.type;
    if (step === 1) return form.community;
    if (step === 2) return form.area && form.bedrooms !== "" && form.bathrooms !== "";
    if (step === 3) return form.price;
    if (step === 4) return true;
    if (step === 5) return form.images.length >= 3;
    if (step === 6) return form.description && form.description.length >= 50;
    return true;
  };

  // Returns the human-readable reason the Next button is disabled, or null if enabled
  const nextBlockedReason = (): string | null => {
    if (step === 0) {
      if (!form.status) return "Please select For Sale or For Rent";
      if (!form.type) return "Please select a property type";
      if (!form.title) return "Please enter a listing title";
    }
    if (step === 1 && !form.community) return "Please select a community";
    if (step === 2) {
      if (!form.area) return "Please enter the property size (area)";
      if (form.bedrooms === "") return "Please select number of bedrooms";
      if (form.bathrooms === "") return "Please select number of bathrooms";
    }
    if (step === 3 && !form.price) return "Please enter the price";
    if (step === 5 && form.images.length < 3) return `Please upload at least 3 photos (you have ${form.images.length})`;
    if (step === 6) {
      if (!form.description) return "Please enter a description";
      if (form.description.length < 50) return `Description needs ${50 - form.description.length} more characters`;
    }
    return null;
  };

  const handleNext = () => {
    const reason = nextBlockedReason();
    if (reason) {
      toast.error("Cannot proceed", { description: reason });
      return;
    }
    setStep(Math.min(7, step + 1));
  };

  return (
    <div>
      <Link href="/agent/listings" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#A68A3F] mb-4">
        <ArrowLeft className="size-3.5" /> Back to My Listings
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#0A1F44]">Add New Property</h1>
        <p className="text-sm text-muted-foreground mt-1.5">8-section form · PropertyFinder-style structure · submitted for admin approval</p>
      </div>

      {/* Pending approval notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 flex items-start gap-3">
        <AlertCircle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          Properties you add are saved as <strong>pending</strong> and won&apos;t appear on the public website until an admin approves them.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar — section navigator + quality score */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-border/60 p-4 sticky top-4">
            <div className="text-xs tracking-luxury uppercase text-muted-foreground font-semibold mb-3">Form Sections</div>
            <div className="space-y-1">
              {SECTIONS.map((s, i) => {
                const active = step === i;
                const Icon = s.icon;
                return (
                  <button
                    key={s.num}
                    onClick={() => setStep(i)}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-xs transition-colors ${
                      active ? "bg-royal-gradient-diagonal text-white font-medium" : "text-[#0A1F44] hover:bg-[#F9FAFB]"
                    }`}
                  >
                    <Icon className="size-3.5 flex-shrink-0" />
                    <span className="flex-1 text-left">{s.title}</span>
                    {i < step && <Check className="size-3.5 opacity-70" />}
                  </button>
                );
              })}
            </div>

            {/* Quality score */}
            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] tracking-luxury uppercase text-muted-foreground font-semibold">Listing Quality</span>
                <span className={`text-sm font-bold ${qualityScore >= 70 ? "text-green-600" : qualityScore >= 40 ? "text-amber-600" : "text-red-600"}`}>{qualityScore}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${qualityScore >= 70 ? "bg-green-500" : qualityScore >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${qualityScore}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Higher quality = faster approval and better visibility</p>
            </div>
          </div>
        </aside>

        {/* Main form area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-border/60 overflow-hidden">
            {/* Section header */}
            <div className="bg-royal-gradient-diagonal text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-white/15 flex items-center justify-center">
                  {(() => {
                    const Icon = SECTIONS[step].icon;
                    return <Icon className="size-5" />;
                  })()}
                </div>
                <div>
                  <div className="text-[10px] tracking-luxury uppercase text-white/60">Section {SECTIONS[step].num} of 08</div>
                  <h2 className="font-serif text-lg font-medium">{SECTIONS[step].title}</h2>
                </div>
              </div>
              <div className="text-xs text-white/60">Step {step + 1}/8</div>
            </div>

            {/* Inline hint showing what's still required on this step */}
            {nextBlockedReason() && (
              <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-xs text-amber-800">
                <AlertCircle className="size-3.5 flex-shrink-0" />
                <span><strong>Required to continue:</strong> {nextBlockedReason()}</span>
              </div>
            )}

            <div className="p-6">
              {/* SECTION 1 — Listing Type & Purpose */}
              {step === 0 && (
                <div className="space-y-5">
                  <Field label="Listing Purpose *">
                    <div className="grid grid-cols-2 gap-2">
                      {["sale", "rent"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => set("status", s)}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                            form.status === s ? "bg-royal-gradient-diagonal text-white border-transparent" : "bg-[#F9FAFB] text-[#0A1F44] border-border hover:border-[#C9A961]"
                          }`}
                        >
                          {s === "sale" ? "For Sale" : "For Rent"}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <Field label="Property Category *">
                    <div className="grid grid-cols-2 gap-2">
                      {["Residential", "Commercial"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => set("category", c)}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                            form.category === c ? "bg-royal-gradient-diagonal text-white border-transparent" : "bg-[#F9FAFB] text-[#0A1F44] border-border hover:border-[#C9A961]"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <Field label="Property Type *">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {propertyTypes.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => set("type", t)}
                          className={`p-2.5 rounded-lg border text-xs font-medium transition-all ${
                            form.type === t ? "bg-royal-gradient-diagonal text-white border-transparent" : "bg-[#F9FAFB] text-[#0A1F44] border-border hover:border-[#C9A961]"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <Field label="Listing Title *">
                    <Input value={form.title} onChange={(e) => set("title", e.target.value)} className="bg-[#F9FAFB]" placeholder="e.g. 2BR Apartment with Marina View in JBR" />
                    <p className="text-[10px] text-muted-foreground mt-1">{form.title.length}/100 characters</p>
                  </Field>

                  <Field label="Reference Number">
                    <Input value={form.reference} onChange={(e) => set("reference", e.target.value)} className="bg-[#F9FAFB] font-mono text-xs" />
                    <p className="text-[10px] text-muted-foreground mt-1">Auto-generated if left unchanged</p>
                  </Field>
                </div>
              )}

              {/* SECTION 2 — Location */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Country *">
                      <select value={form.country} onChange={(e) => set("country", e.target.value)} className="w-full h-10 px-3 bg-[#F9FAFB] rounded-lg border border-border text-sm">
                        {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="Emirate / City *">
                      <select value={form.emirate} onChange={(e) => set("emirate", e.target.value)} className="w-full h-10 px-3 bg-[#F9FAFB] rounded-lg border border-border text-sm">
                        {EMIRATES.map((e) => <option key={e}>{e}</option>)}
                      </select>
                    </Field>
                  </div>
                  <Field label="Community / Area *">
                    <select value={form.community} onChange={(e) => set("community", e.target.value)} className="w-full h-10 px-3 bg-[#F9FAFB] rounded-lg border border-border text-sm">
                      <option value="">Select a community…</option>
                      {DUBAI_COMMUNITIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Sub-Community (optional)">
                    <Input value={form.subCommunity} onChange={(e) => set("subCommunity", e.target.value)} className="bg-[#F9FAFB]" placeholder="e.g. Tower or building name" />
                  </Field>
                  <Field label="Location Address (optional)">
                    <Input value={form.locationAddress} onChange={(e) => set("locationAddress", e.target.value)} className="bg-[#F9FAFB]" placeholder="Full street address" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Latitude (optional)"><Input value={form.locationLat} onChange={(e) => set("locationLat", e.target.value)} className="bg-[#F9FAFB]" placeholder="25.1972" /></Field>
                    <Field label="Longitude (optional)"><Input value={form.locationLng} onChange={(e) => set("locationLng", e.target.value)} className="bg-[#F9FAFB]" placeholder="55.2744" /></Field>
                  </div>
                </div>
              )}

              {/* SECTION 3 — Property Details */}
              {step === 2 && (
                <div className="space-y-5">
                  {form.category === "Residential" && (
                    <Field label="Bedrooms *">
                      <div className="flex flex-wrap gap-2">
                        {BEDROOM_OPTIONS.map((b) => (
                          <button key={b.value} type="button" onClick={() => set("bedrooms", b.value)}
                            className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                              form.bedrooms === b.value ? "bg-royal-gradient-diagonal text-white border-transparent" : "bg-[#F9FAFB] text-[#0A1F44] border-border hover:border-[#C9A961]"
                            }`}>{b.label}</button>
                        ))}
                      </div>
                    </Field>
                  )}

                  <Field label="Bathrooms *">
                    <div className="flex flex-wrap gap-2">
                      {BATHROOM_OPTIONS.map((b) => (
                        <button key={b} type="button" onClick={() => set("bathrooms", b)}
                          className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                            form.bathrooms === b ? "bg-royal-gradient-diagonal text-white border-transparent" : "bg-[#F9FAFB] text-[#0A1F44] border-border hover:border-[#C9A961]"
                          }`}>{b}</button>
                      ))}
                    </div>
                  </Field>

                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Property Size *">
                      <Input type="number" value={form.area} onChange={(e) => set("area", e.target.value)} className="bg-[#F9FAFB]" placeholder="1200" />
                    </Field>
                    <Field label="Unit">
                      <div className="grid grid-cols-2 gap-1">
                        {["sqft", "sqm"].map((u) => (
                          <button key={u} type="button" onClick={() => set("areaUnit", u)}
                            className={`h-10 rounded-lg border text-xs font-medium transition-all ${
                              form.areaUnit === u ? "bg-royal-gradient-diagonal text-white border-transparent" : "bg-[#F9FAFB] text-[#0A1F44] border-border"
                            }`}>{u}</button>
                        ))}
                      </div>
                    </Field>
                    <Field label="Parking">
                      <Input type="number" value={form.parking} onChange={(e) => set("parking", e.target.value)} className="bg-[#F9FAFB]" />
                    </Field>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Plot Size (optional)">
                      <Input type="number" value={form.plotSize} onChange={(e) => set("plotSize", e.target.value)} className="bg-[#F9FAFB]" />
                    </Field>
                    <Field label="Unit">
                      <div className="grid grid-cols-2 gap-1">
                        {["sqft", "sqm"].map((u) => (
                          <button key={u} type="button" onClick={() => set("plotSizeUnit", u)}
                            className={`h-10 rounded-lg border text-xs font-medium transition-all ${
                              form.plotSizeUnit === u ? "bg-royal-gradient-diagonal text-white border-transparent" : "bg-[#F9FAFB] text-[#0A1F44] border-border"
                            }`}>{u}</button>
                        ))}
                      </div>
                    </Field>
                    <Field label="Floor Number (optional)">
                      <Input type="number" value={form.floorNumber} onChange={(e) => set("floorNumber", e.target.value)} className="bg-[#F9FAFB]" />
                    </Field>
                  </div>

                  <Field label="Total Floors in Building (optional)">
                    <Input type="number" value={form.totalFloors} onChange={(e) => set("totalFloors", e.target.value)} className="bg-[#F9FAFB]" />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Completion Status *">
                      <div className="grid grid-cols-2 gap-1">
                        {COMPLETION_STATUSES.map((c) => (
                          <button key={c} type="button" onClick={() => set("completionStatus", c)}
                            className={`h-10 rounded-lg border text-xs font-medium transition-all ${
                              form.completionStatus === c ? "bg-royal-gradient-diagonal text-white border-transparent" : "bg-[#F9FAFB] text-[#0A1F44] border-border"
                            }`}>{c}</button>
                        ))}
                      </div>
                    </Field>
                    {isOffPlan && (
                      <Field label="Completion Date *">
                        <Input type="text" value={form.completionDate} onChange={(e) => set("completionDate", e.target.value)} className="bg-[#F9FAFB]" placeholder="2027-Q1" />
                      </Field>
                    )}
                  </div>

                  <Field label="Furnishing Status *">
                    <div className="grid grid-cols-3 gap-2">
                      {FURNISHING_STATUSES.map((f) => (
                        <button key={f} type="button" onClick={() => set("furnishingStatus", f)}
                          className={`p-2.5 rounded-lg border text-xs font-medium transition-all ${
                            form.furnishingStatus === f ? "bg-royal-gradient-diagonal text-white border-transparent" : "bg-[#F9FAFB] text-[#0A1F44] border-border hover:border-[#C9A961]"
                          }`}>{f}</button>
                      ))}
                    </div>
                  </Field>
                </div>
              )}

              {/* SECTION 4 — Pricing */}
              {step === 3 && (
                <div className="space-y-5">
                  <Field label="Price * (AED)">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">AED</span>
                      <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} className="bg-[#F9FAFB] pl-12" placeholder="1,200,000" />
                    </div>
                  </Field>

                  {pricePerSqft && (
                    <div className="bg-[#F9FAFB] rounded-xl p-3 text-xs text-muted-foreground">
                      <strong className="text-[#A68A3F]">Auto-calculated:</strong> AED {pricePerSqft.toLocaleString()} per sqft (Price ÷ Area)
                    </div>
                  )}

                  {isRent && (
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Rental Frequency *">
                        <select value={form.rentFrequency} onChange={(e) => set("rentFrequency", e.target.value)} className="w-full h-10 px-3 bg-[#F9FAFB] rounded-lg border border-border text-sm">
                          {RENT_FREQUENCIES.map((f) => <option key={f}>{f}</option>)}
                        </select>
                      </Field>
                      <Field label="No. of Cheques (optional)">
                        <select value={form.noOfCheques} onChange={(e) => set("noOfCheques", e.target.value)} className="w-full h-10 px-3 bg-[#F9FAFB] rounded-lg border border-border text-sm">
                          <option value="">Select…</option>
                          {CHEQUE_OPTIONS.map((c) => <option key={c} value={c}>{c} cheque{c > 1 ? "s" : ""}</option>)}
                        </select>
                      </Field>
                    </div>
                  )}

                  <Field label="Service Charge (AED/year, optional)">
                    <Input type="number" value={form.serviceCharge} onChange={(e) => set("serviceCharge", e.target.value)} className="bg-[#F9FAFB]" placeholder="15000" />
                  </Field>

                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-[#F9FAFB]">
                    <input type="checkbox" checked={form.priceNegotiable} onChange={(e) => set("priceNegotiable", e.target.checked)} className="size-4 accent-[#C9A961]" />
                    <span className="text-sm">Price is negotiable</span>
                  </label>
                </div>
              )}

              {/* SECTION 5 — Amenities */}
              {step === 4 && (
                <div className="space-y-5">
                  <Field label="Indoor Features">
                    <CheckboxGrid options={INDOOR_FEATURES} selected={form.indoorFeatures} onChange={(v) => set("indoorFeatures", v)} columns={3} />
                  </Field>
                  <Field label="Outdoor Features">
                    <CheckboxGrid options={OUTDOOR_FEATURES} selected={form.outdoorFeatures} onChange={(v) => set("outdoorFeatures", v)} columns={3} />
                  </Field>
                  <Field label="Building / Community Amenities">
                    <CheckboxGrid options={BUILDING_AMENITIES} selected={form.buildingAmenities} onChange={(v) => set("buildingAmenities", v)} columns={3} />
                  </Field>
                  <Field label="Nearby Landmarks">
                    <CheckboxGrid options={NEARBY_LANDMARKS} selected={form.nearbyLandmarks} onChange={(v) => set("nearbyLandmarks", v)} columns={4} />
                  </Field>
                  <Field label="View">
                    <CheckboxGrid options={VIEW_OPTIONS} selected={form.viewFeatures} onChange={(v) => set("viewFeatures", v)} columns={3} />
                  </Field>
                </div>
              )}

              {/* SECTION 6 — Media */}
              {step === 5 && (
                <div className="space-y-5">
                  <Field label="Property Photos *">
                    <PhotoUploader
                      value={form.images}
                      onChange={(urls) => set("images", urls)}
                      folder="properties"
                      min={3}
                      max={50}
                      endpoint="/api/agent/upload"
                    />
                  </Field>

                  <Field label="Floor Plan URL (optional)">
                    <Input value={form.floorPlanUrl} onChange={(e) => set("floorPlanUrl", e.target.value)} className="bg-[#F9FAFB]" placeholder="https://...floorplan.jpg or .pdf" />
                  </Field>

                  <Field label="Video Tour URL (optional)">
                    <Input value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} className="bg-[#F9FAFB]" placeholder="YouTube or Vimeo link" />
                  </Field>

                  <Field label="360° Virtual Tour URL (optional)">
                    <Input value={form.virtualTourUrl} onChange={(e) => set("virtualTourUrl", e.target.value)} className="bg-[#F9FAFB]" placeholder="Matterport or similar link" />
                  </Field>
                </div>
              )}

              {/* SECTION 7 — Description */}
              {step === 6 && (
                <div className="space-y-5">
                  <Field label="Property Description *">
                    <Textarea
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      rows={8}
                      className="bg-[#F9FAFB] resize-none"
                      placeholder="Describe the property in detail — location benefits, layout, finishes, view, nearby attractions, investment potential..."
                    />
                    <div className="flex justify-between text-[10px] mt-1">
                      <span className={form.description.length < 50 ? "text-red-600" : "text-green-600"}>
                        {form.description.length < 50 ? `${50 - form.description.length} more chars needed (min 50)` : "✓ Minimum length met"}
                      </span>
                      <span className="text-muted-foreground">{form.description.length}/5000</span>
                    </div>
                  </Field>

                  <Field label="RERA / Permit Number * (UAE mandatory)">
                    <Input value={form.reraNumber} onChange={(e) => set("reraNumber", e.target.value)} className="bg-[#F9FAFB]" placeholder="e.g. RENT-123456" />
                    <p className="text-[10px] text-amber-700 mt-1">⚠️ Mandatory for UAE regulatory compliance (DLD / RERA)</p>
                  </Field>

                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-[#F9FAFB]">
                    <input type="checkbox" checked={form.exclusiveListing} onChange={(e) => set("exclusiveListing", e.target.checked)} className="size-4 accent-[#C9A961]" />
                    <span className="text-sm">Mark as Exclusive Listing (shows &quot;Exclusive&quot; badge)</span>
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-[#F9FAFB]">
                      <input type="checkbox" checked={form.isLuxury} onChange={(e) => set("isLuxury", e.target.checked)} className="size-4 accent-[#C9A961]" />
                      <span className="text-sm">Luxury Collection</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-[#F9FAFB]">
                      <input type="checkbox" checked={form.isLatest} onChange={(e) => set("isLatest", e.target.checked)} className="size-4 accent-[#C9A961]" />
                      <span className="text-sm">Show as Latest</span>
                    </label>
                  </div>
                </div>
              )}

              {/* SECTION 8 — Agent Details (auto-filled, read-only) */}
              {step === 7 && (
                <div className="space-y-5">
                  <div className="bg-[#F9FAFB] rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-3">Agent details are auto-filled from your profile. To change them, update your agent profile via the admin portal.</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-[10px] tracking-luxury uppercase text-muted-foreground">Agent Name</div>
                        <div className="font-medium text-[#0A1F44]">Auto-filled from your profile</div>
                      </div>
                      <div>
                        <div className="text-[10px] tracking-luxury uppercase text-muted-foreground">Phone</div>
                        <div className="font-medium text-[#0A1F44]">Auto-filled</div>
                      </div>
                      <div>
                        <div className="text-[10px] tracking-luxury uppercase text-muted-foreground">WhatsApp</div>
                        <div className="font-medium text-[#0A1F44]">Auto-filled</div>
                      </div>
                      <div>
                        <div className="text-[10px] tracking-luxury uppercase text-muted-foreground">Email</div>
                        <div className="font-medium text-[#0A1F44]">Auto-filled</div>
                      </div>
                      <div>
                        <div className="text-[10px] tracking-luxury uppercase text-muted-foreground">Agency</div>
                        <div className="font-medium text-[#0A1F44]">Royal Jubilant Real Estate LLC</div>
                      </div>
                    </div>
                  </div>

                  {/* Summary preview */}
                  <div className="bg-white rounded-xl border border-border p-4">
                    <h3 className="font-serif text-base font-medium text-[#0A1F44] mb-3">Listing Summary</h3>
                    <div className="space-y-2 text-sm">
                      <Row label="Reference" value={form.reference} />
                      <Row label="Title" value={form.title || "—"} />
                      <Row label="Purpose" value={form.status === "sale" ? "For Sale" : "For Rent"} />
                      <Row label="Type" value={`${form.category} · ${form.type}`} />
                      <Row label="Location" value={`${form.community || "—"}${form.subCommunity ? `, ${form.subCommunity}` : ""}`} />
                      <Row label="Bedrooms" value={form.bedrooms} />
                      <Row label="Bathrooms" value={form.bathrooms} />
                      <Row label="Area" value={form.area ? `${form.area} ${form.areaUnit}` : "—"} />
                      <Row label="Price" value={form.price ? `AED ${Number(form.price).toLocaleString()}` : "—"} />
                      {pricePerSqft && <Row label="Price/sqft" value={`AED ${pricePerSqft.toLocaleString()}`} />}
                      <Row label="Photos" value={`${form.images.length} image(s)`} />
                      <Row label="RERA #" value={form.reraNumber || "—"} />
                      <Row label="Quality Score" value={`${qualityScore}%`} />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
                <Button
                  type="button"
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  variant="outline"
                  className="rounded-full"
                >
                  <ArrowLeft className="size-4 mr-1.5" /> Previous
                </Button>

                {step < 7 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-royal-gradient-diagonal text-white rounded-full"
                  >
                    Next <ArrowRight className="size-4 ml-1.5" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-royal-gradient-diagonal text-white rounded-full"
                  >
                    {saving ? <Loader2 className="size-4 animate-spin" /> : <><Save className="size-4 mr-1.5" /> Submit for Approval</>}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Live preview hint */}
          <div className="mt-4 bg-white rounded-2xl border border-border/60 p-4 flex items-center gap-3">
            <Eye className="size-5 text-[#A68A3F] flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <strong className="text-[#0A1F44]">Live preview:</strong> Once submitted, you can preview how this listing will appear to buyers from the My Listings page after admin approval.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[10px] tracking-luxury uppercase text-[#A68A3F] font-medium mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-1 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-[#0A1F44] text-right max-w-[60%]">{value}</span>
    </div>
  );
}
