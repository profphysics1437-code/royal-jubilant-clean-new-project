"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  Share2,
  Download,
  Flag,
  BedDouble,
  Bath,
  Maximize,
  Maximize2,
  Car,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Building2,
  Calculator,
  School,
  Cross,
  Bus,
  ShoppingBag,
  Printer,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { properties as fallbackProperties, formatPrice, getAgentById, getCommunityByName } from "@/lib/data";
import { useStore } from "@/lib/store";
import { useApi } from "@/lib/useApi";
import { generatePropertyPDF } from "@/lib/generatePropertyPDF";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyCard } from "@/components/site/PropertyCard";

export function PropertyDetailModal() {
  const { activePropertyId, closeProperty, openAgent, openCommunity, toggleSavedProperty, isSaved, setMortgageOpen, openLeadForm } = useStore();
  // Fetch DB properties; fall back to mock data while loading
  const { data } = useApi<{ properties: any[] }>("/api/public/properties?limit=0", { properties: [] });
  const properties: any[] = data?.properties || [];
  const property = properties.find((p) => p.id === activePropertyId);
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportEmail, setReportEmail] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  if (!property) return null;

  // Use agent info from API (DB properties), fall back to mock data lookup
  const agent = (property as any).agent || getAgentById(property.agentId);
  const community = getCommunityByName(property.community);
  const similar = properties
    .filter((p) => p.community === property.community && p.id !== property.id)
    .slice(0, 3);

  const monthlyMortgage = (() => {
    const principal = property.price * 0.7; // 30% down
    const annualRate = 0.0475;
    const monthlyRate = annualRate / 12;
    const months = 25 * 12;
    return Math.round((principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months)));
  })();

  const nextImg = () => setActiveImg((i) => (i + 1) % property.images.length);
  const prevImg = () => setActiveImg((i) => (i - 1 + property.images.length) % property.images.length);

  return (
    <AnimatePresence>
      {property && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={closeProperty}
        >
          <div className="min-h-screen p-0 lg:p-6 flex items-start lg:items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-none lg:rounded-3xl w-full max-w-7xl my-0 lg:my-6 overflow-hidden shadow-2xl"
            >
              {/* Header bar */}
              <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-border px-4 lg:px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Badge className="bg-[#C9A961] text-[#0A1F44] hover:bg-[#A68A3F] flex-shrink-0">
                    {property.reference}
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden sm:block">{property.community}</span>
                </div>
                <div className="flex items-center gap-1 relative">
                  {/* Save — ❤️ already functional */}
                  <ActionBtn onClick={() => toggleSavedProperty(property.id)} active={isSaved(property.id)} icon={<Heart className={`size-4 ${isSaved(property.id) ? "fill-current" : ""}`} />} label="Save" />

                  {/* Share — functional dropdown */}
                  <ActionBtn onClick={() => setShowShare(!showShare)} icon={<Share2 className="size-4" />} label="Share" active={showShare} />
                  {showShare && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-border p-2 z-30 min-w-[200px]">
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/?property=${property.id}`;
                          navigator.clipboard.writeText(url);
                          toast.success("Link copied to clipboard!");
                          setShowShare(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F9FAFB] text-sm text-[#0A1F44] text-left"
                      >
                        <Share2 className="size-4 text-[#A68A3F]" /> Copy Link
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Check out this property: ${property.title} — AED ${property.price.toLocaleString()} | ${window.location.origin}/?property=${property.id}`)}`}
                        target="_blank"
                        onClick={() => setShowShare(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F9FAFB] text-sm text-[#0A1F44] text-left"
                      >
                        <MessageCircle className="size-4 text-green-600" /> Share on WhatsApp
                      </a>
                      <a
                        href={`mailto:?subject=${encodeURIComponent(`Property: ${property.title}`)}&body=${encodeURIComponent(`I found this property on Royal Jubilant:\n\n${property.title}\nPrice: AED ${property.price.toLocaleString()}\nReference: ${property.reference}\n\nView: ${window.location.origin}/?property=${property.id}`)}`}
                        onClick={() => setShowShare(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F9FAFB] text-sm text-[#0A1F44] text-left"
                      >
                        <Mail className="size-4 text-[#A68A3F]" /> Share via Email
                      </a>
                    </div>
                  )}

                  {/* Download PDF — generates and downloads actual PDF brochure */}
                  <ActionBtn
                    onClick={async () => {
                      setGeneratingPDF(true);
                      toast.info("Generating PDF brochure...");
                      try {
                        await generatePropertyPDF({
                          reference: property.reference,
                          title: property.title,
                          price: property.price,
                          status: property.status,
                          rentFrequency: property.rentFrequency,
                          type: property.type,
                          community: property.community,
                          subCommunity: property.subCommunity,
                          bedrooms: property.bedrooms,
                          bathrooms: property.bathrooms,
                          area: property.area,
                          areaUnit: property.areaUnit,
                          parking: property.parking,
                          description: property.description,
                          reraNumber: property.reraNumber,
                          images: property.images,
                          agent: agent ? {
                            name: agent.name,
                            title: agent.title,
                            phone: agent.phone,
                            whatsapp: agent.whatsapp,
                            email: agent.email,
                            photo: agent.photo,
                          } : undefined,
                          location: property.location,
                        });
                        toast.success("PDF brochure downloaded!");
                      } catch (e: any) {
                        toast.error("Failed to generate PDF: " + (e.message || "Unknown error"));
                      } finally {
                        setGeneratingPDF(false);
                      }
                    }}
                    icon={generatingPDF ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                    label={generatingPDF ? "..." : "PDF"}
                  />

                  {/* Report — functional form */}
                  <ActionBtn onClick={() => setShowReport(!showReport)} icon={<Flag className="size-4" />} label="Report" active={showReport} />
                  {showReport && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-border p-4 z-30 min-w-[300px]">
                      <h4 className="font-serif text-sm font-medium text-[#0A1F44] mb-3">Report this listing</h4>
                      <select
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="w-full h-9 rounded-lg border border-border bg-[#F9FAFB] px-3 text-xs mb-2"
                      >
                        <option value="">Select reason...</option>
                        <option value="Incorrect information">Incorrect information</option>
                        <option value="Property no longer available">Property no longer available</option>
                        <option value="Suspicious listing">Suspicious listing</option>
                        <option value="Duplicate listing">Duplicate listing</option>
                        <option value="Other">Other</option>
                      </select>
                      <input
                        type="email"
                        value={reportEmail}
                        onChange={(e) => setReportEmail(e.target.value)}
                        placeholder="Your email (optional)"
                        className="w-full h-9 rounded-lg border border-border bg-[#F9FAFB] px-3 text-xs mb-2"
                      />
                      <textarea
                        value={reportDetails}
                        onChange={(e) => setReportDetails(e.target.value)}
                        placeholder="Additional details..."
                        rows={3}
                        className="w-full rounded-lg border border-border bg-[#F9FAFB] px-3 py-2 text-xs mb-3 resize-none"
                      />
                      <button
                        onClick={async () => {
                          if (!reportReason) { toast.error("Please select a reason"); return; }
                          setSubmittingReport(true);
                          try {
                            await fetch("/api/public/reports", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                name: "Reporter",
                                email: reportEmail || undefined,
                                reason: reportReason,
                                details: reportDetails,
                                propertyRef: property.reference,
                                community: property.community,
                              }),
                            });
                            toast.success("Report submitted. Our team will review it.");
                            setShowReport(false);
                            setReportReason("");
                            setReportDetails("");
                            setReportEmail("");
                          } catch {
                            toast.error("Failed to submit report");
                          } finally {
                            setSubmittingReport(false);
                          }
                        }}
                        disabled={submittingReport}
                        className="w-full py-2 rounded-lg bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white text-xs font-medium"
                      >
                        {submittingReport ? "Submitting..." : "Submit Report"}
                      </button>
                    </div>
                  )}

                  <button onClick={closeProperty} className="size-9 rounded-full hover:bg-muted flex items-center justify-center ml-1">
                    <X className="size-5" />
                  </button>
                </div>
              </div>

              {/* Gallery — main image + thumbnails below */}
              <div className="bg-muted">
                <div className="relative aspect-[16/10] lg:aspect-[16/8] overflow-hidden cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
                  <img src={property.images[activeImg]} alt={property.title} className="w-full h-full object-cover" />
                  {property.images.length > 1 && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); prevImg(); }} className="absolute left-4 top-1/2 -translate-y-1/2 size-11 rounded-full glass flex items-center justify-center hover:bg-white/95 transition-colors"><ChevronLeft className="size-5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); nextImg(); }} className="absolute right-4 top-1/2 -translate-y-1/2 size-11 rounded-full glass flex items-center justify-center hover:bg-white/95 transition-colors"><ChevronRight className="size-5" /></button>
                    </>
                  )}
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    <Badge className="bg-[#C9A961] text-[#0A1F44] hover:bg-[#A68A3F] font-medium w-fit">
                      {property.status === "sale" ? "For Sale" : property.status === "rent" ? "For Rent" : property.status === "off-plan" ? "Off-Plan" : "Commercial"}
                    </Badge>
                    {property.isLuxury && <Badge className="bg-[#0A1F44] text-white backdrop-blur-sm w-fit">Luxury Collection</Badge>}
                  </div>
                  <div className="absolute bottom-4 right-4 glass px-2.5 py-1 rounded-md text-xs text-white flex items-center gap-1"><Maximize2 className="size-3" /> Click to zoom</div>
                </div>
                {property.images.length > 1 && (
                  <div className="flex items-center gap-2 p-3 overflow-x-auto bg-[#0A1F44]/5">
                    {property.images.map((img, i) => (
                      <button key={i} onClick={() => setActiveImg(i)} className={`flex-shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 transition-all ${i === activeImg ? "border-[#C9A961] scale-105" : "border-transparent opacity-60 hover:opacity-100"}`}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Lightbox */}
              {lightboxOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
                  <button className="absolute top-4 right-4 size-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20" onClick={() => setLightboxOpen(false)}><X className="size-5" /></button>
                  <button onClick={(e) => { e.stopPropagation(); prevImg(); }} className="absolute left-4 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"><ChevronLeft className="size-6" /></button>
                  <img src={property.images[activeImg]} alt={property.title} className="max-w-[90vw] max-h-[85vh] object-contain" onClick={(e) => e.stopPropagation()} />
                  <button onClick={(e) => { e.stopPropagation(); nextImg(); }} className="absolute right-4 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"><ChevronRight className="size-6" /></button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">{activeImg + 1} / {property.images.length}</div>
                </div>
              )}

              {/* Body */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Main content */}
                <div className="lg:col-span-2 p-5 lg:p-8 lg:border-r border-border">
                  <div className="flex items-center gap-1.5 text-xs text-[#A68A3F] font-medium tracking-luxury uppercase mb-3">
                    <MapPin className="size-3.5" />
                    {property.community}{property.subCommunity ? ` · ${property.subCommunity}` : ""} · Dubai
                  </div>

                  <h1 className="font-serif text-2xl lg:text-4xl font-medium text-[#0A1F44] leading-tight">
                    {property.title}
                  </h1>

                  {/* Price + key specs */}
                  <div className="mt-5 flex flex-wrap items-baseline gap-4 pb-6 border-b border-border">
                    <span className="font-serif text-3xl lg:text-4xl font-semibold text-[#0A1F44]">
                      {formatPrice(property.price, property.rentFrequency)}
                    </span>
                    {property.pricePerSqft && (
                      <span className="text-sm text-muted-foreground">
                        AED {property.pricePerSqft.toLocaleString()}/sqft
                      </span>
                    )}
                    {property.completionStatus && (
                      <Badge variant="outline" className="border-[#C9A961]/40 text-[#A68A3F]">
                        {property.completionStatus}{property.handoverYear ? ` · ${property.handoverYear}` : ""}
                      </Badge>
                    )}
                  </div>

                  {/* Quick specs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-border">
                    {property.bedrooms > 0 && <QuickSpec icon={<BedDouble />} value={property.bedrooms} label="Bedrooms" />}
                    {property.bathrooms > 0 && <QuickSpec icon={<Bath />} value={property.bathrooms} label="Bathrooms" />}
                    <QuickSpec icon={<Maximize />} value={property.area.toLocaleString()} label="Area (sqft)" />
                    {property.parking > 0 && <QuickSpec icon={<Car />} value={property.parking} label="Parking" />}
                  </div>

                  {/* Tabs */}
                  <Tabs defaultValue="overview" className="mt-6">
                    <TabsList className="w-full justify-start bg-[#F9FAFB] h-auto p-1.5 rounded-xl gap-1 overflow-x-auto no-scrollbar">
                      <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#0A1F44] text-xs whitespace-nowrap">Overview</TabsTrigger>
                      <TabsTrigger value="features" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#0A1F44] text-xs whitespace-nowrap">Features</TabsTrigger>
                      <TabsTrigger value="amenities" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#0A1F44] text-xs whitespace-nowrap">Amenities</TabsTrigger>
                      <TabsTrigger value="payment" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#0A1F44] text-xs whitespace-nowrap">Payment Plan</TabsTrigger>
                      <TabsTrigger value="location" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#0A1F44] text-xs whitespace-nowrap">Location</TabsTrigger>
                      <TabsTrigger value="community" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#0A1F44] text-xs whitespace-nowrap">Community</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-5">
                      <p className="text-base text-muted-foreground leading-relaxed">{property.description}</p>

                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <DetailRow label="Property Type" value={property.type} />
                        <DetailRow label="Status" value={property.completionStatus || "Ready"} />
                        <DetailRow label="Community" value={property.community} />
                        {property.subCommunity && <DetailRow label="Sub-community" value={property.subCommunity} />}
                        {property.developer && <DetailRow label="Developer" value={property.developer} />}
                        <DetailRow label="Furnished" value={property.furnished ? "Yes" : "No"} />
                        <DetailRow label="Reference" value={property.reference} />
                        {property.reraNumber && <DetailRow label="RERA Permit No." value={property.reraNumber} />}
                      </div>

                      {/* RERA trust badge */}
                      {property.reraNumber && (
                        <div className="mt-4 flex items-center gap-2.5 p-3 rounded-xl bg-green-50 border border-green-200">
                          <ShieldCheck className="size-5 text-green-600 flex-shrink-0" />
                          <div className="text-xs">
                            <span className="font-semibold text-green-800">RERA-Verified Listing</span>
                            <span className="text-green-700 block">Permit No. {property.reraNumber} · Government-verified property</span>
                          </div>
                        </div>
                      )}

                      {/* Mortgage snapshot — only for sale properties, not rent */}
                      {property.status !== "rent" && (
                      <div className="mt-6 p-5 rounded-2xl bg-[#F9FAFB] border border-border/60">
                        <div className="flex items-center gap-2 mb-3">
                          <Calculator className="size-4 text-[#A68A3F]" />
                          <span className="text-sm font-medium text-[#0A1F44]">Mortgage estimate</span>
                        </div>
                        <div className="flex items-end gap-4">
                          <div>
                            <div className="text-[10px] tracking-luxury uppercase text-muted-foreground">Monthly from</div>
                            <div className="font-serif text-2xl font-semibold text-[#0A1F44]">AED {monthlyMortgage.toLocaleString()}</div>
                          </div>
                          <div className="text-xs text-muted-foreground pb-1">
                            70% LTV · 25yr · 4.75%
                          </div>
                        </div>
                        <Button
                          onClick={() => setMortgageOpen(true)}
                          variant="outline"
                          size="sm"
                          className="mt-3 rounded-full border-[#C9A961] text-[#A68A3F]"
                        >
                          Calculate full mortgage
                        </Button>
                      </div>
                      )}
                    </TabsContent>

                    <TabsContent value="features" className="mt-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {property.features.map((f) => (
                          <div key={f} className="flex items-start gap-2 p-3 rounded-xl bg-[#F9FAFB]">
                            <Check className="size-4 text-[#A68A3F] mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-[#0A1F44]">{f}</span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="amenities" className="mt-5">
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.map((a) => (
                          <span key={a} className="px-3 py-1.5 rounded-full bg-[#F9FAFB] border border-border/60 text-xs font-medium text-[#0A1F44]">
                            {a}
                          </span>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="payment" className="mt-5">
                      {property.paymentPlan ? (
                        <div className="space-y-3">
                          <div className="flex items-center h-4 rounded-full overflow-hidden bg-muted">
                            {property.paymentPlan.map((step, i) => (
                              <div
                                key={i}
                                className="h-full bg-gradient-to-r from-[#C9A961] to-[#A68A3F] flex items-center justify-center text-[10px] text-white font-medium"
                                style={{ width: `${step.percentage}%` }}
                              >
                                {step.percentage >= 15 && `${step.percentage}%`}
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {property.paymentPlan.map((step, i) => (
                              <div key={i} className="p-4 rounded-xl bg-[#F9FAFB] border border-border/60">
                                <div className="text-[10px] tracking-luxury uppercase text-muted-foreground">{step.milestone}</div>
                                <div className="font-serif text-2xl font-semibold text-[#0A1F44] mt-1">{step.percentage}%</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  AED {((property.price * step.percentage) / 100 / 1000000).toFixed(2)}M
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No payment plan — this is a ready property with full payment on transfer.</p>
                      )}
                    </TabsContent>

                    <TabsContent value="location" className="mt-5">
                      <div className="rounded-2xl overflow-hidden border border-border/60">
                        <div className="aspect-[16/9] bg-[#F9FAFB] flex items-center justify-center relative">
                          <iframe
                            title="Location map"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${property.location.lng - 0.01},${property.location.lat - 0.008},${property.location.lng + 0.01},${property.location.lat + 0.008}&layer=mapnik&marker=${property.location.lat},${property.location.lng}`}
                            className="w-full h-full"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-4 bg-white border-t border-border/60">
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="size-4 text-[#A68A3F] mt-0.5" />
                            <span className="text-[#0A1F44]">{property.location.address}</span>
                          </div>
                        </div>
                      </div>

                      {/* Nearby */}
                      {community && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                          <NearbyCard icon={<School className="size-4" />} title="Schools" items={community.schools.map((s) => s.name)} />
                          <NearbyCard icon={<Cross className="size-4" />} title="Hospitals" items={community.hospitals.map((h) => h.name)} />
                          <NearbyCard icon={<Bus className="size-4" />} title="Transport" items={community.transport.map((t) => t.name)} />
                          <NearbyCard icon={<ShoppingBag className="size-4" />} title="Shopping" items={community.shopping.map((s) => s.name)} />
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="community" className="mt-5">
                      {community ? (
                        <div className="space-y-4">
                          <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-muted">
                            <img src={community.hero} alt={community.name} className="w-full h-full object-cover" />
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{community.overview}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {community.stats.map((s) => (
                              <div key={s.label} className="p-3 rounded-xl bg-[#F9FAFB] text-center">
                                <div className="font-serif text-lg font-semibold text-[#0A1F44]">{s.value}</div>
                                <div className="text-[10px] tracking-luxury uppercase text-muted-foreground mt-1">{s.label}</div>
                              </div>
                            ))}
                          </div>
                          <Button
                            onClick={() => openCommunity(community.id)}
                            variant="outline"
                            className="rounded-full border-[#C9A961] text-[#A68A3F]"
                          >
                            View {community.name} Community Page <ChevronRight className="size-4 ml-1" />
                          </Button>
                        </div>
                      ) : null}
                    </TabsContent>
                  </Tabs>

                  {/* Similar properties */}
                  {similar.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-border">
                      <h3 className="font-serif text-2xl font-medium text-[#0A1F44] mb-5">
                        Similar properties in {property.community}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {similar.map((p, i) => (
                          <PropertyCard key={p.id} property={p} index={i} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 p-5 lg:p-8 bg-[#F9FAFB] space-y-5">
                  {/* Agent card — prominent, with photo + direct contact buttons */}
                  {agent && (
                    <div className="bg-white rounded-2xl p-5 border border-border/60">
                      {/* Agent header — photo + name + title */}
                      <button
                        onClick={() => openAgent(agent.id)}
                        className="w-full flex items-center gap-3 mb-4 group/agent text-left"
                      >
                        <img
                          src={agent.photo}
                          alt={agent.name}
                          className="size-16 rounded-full object-cover border-2 border-[#C9A961]/30 group-hover/agent:border-[#C9A961] transition-colors"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[#0A1F44] truncate text-sm">{agent.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{agent.title}</div>
                          <div className="flex items-center gap-1 text-[10px] text-[#A68A3F] mt-0.5">
                            ★ {agent.rating} · {agent.reviewsCount} reviews
                          </div>
                        </div>
                      </button>

                      {/* Direct contact buttons — prominent, full-width */}
                      <div className="space-y-2 mb-3">
                        {agent.phone && (
                          <a
                            href={`tel:${agent.phone.replace(/\s/g, "")}`}
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white text-sm font-medium transition-colors"
                          >
                            <Phone className="size-4" /> Call {agent.phone}
                          </a>
                        )}
                        {agent.whatsapp && (
                          <a
                            href={`https://wa.me/${agent.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1faa50] text-white text-sm font-medium transition-colors"
                          >
                            <MessageCircle className="size-4" /> WhatsApp
                          </a>
                        )}
                        {agent.email && (
                          <a
                            href={`mailto:${agent.email}`}
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white border border-[#C9A961]/40 hover:bg-[#C9A961]/10 text-[#0A1F44] text-sm font-medium transition-colors"
                          >
                            <Mail className="size-4" /> Email Agent
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => openAgent(agent.id)}
                        className="text-[10px] tracking-luxury uppercase text-[#A68A3F] hover:underline w-full text-center"
                      >
                        View Full Profile →
                      </button>
                    </div>
                  )}

                  {/* Lead form — Book a Viewing */}
                  <div className="bg-white rounded-2xl p-5 border border-border/60">
                    <h3 className="font-serif text-lg font-medium text-[#0A1F44] mb-1">
                      Book a Viewing
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Schedule a private appointment for {property.reference}.
                    </p>
                    <LeadForm
                      source="viewing"
                      propertyRef={property.reference}
                      agentId={agent?.email}
                      contextLabel={`Viewing · ${property.title}`}
                    />
                  </div>

                  {/* Trust badges */}
                  <div className="bg-white rounded-2xl p-5 border border-border/60">
                    <div className="space-y-2.5 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <Building2 className="size-3.5 text-[#A68A3F] mt-0.5 flex-shrink-0" />
                        <span>RERA-verified listing · {property.developer || "Independent"}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="size-3.5 text-[#A68A3F] mt-0.5 flex-shrink-0" />
                        <span>Title deed available on request</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="size-3.5 text-[#A68A3F] mt-0.5 flex-shrink-0" />
                        <span>Typical response time: under 2 hours</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ActionBtn({ icon, label, onClick, active }: { icon: React.ReactNode; label: string; onClick?: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="size-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors group relative"
      aria-label={label}
    >
      <span className={`text-muted-foreground group-hover:text-[#0A1F44] ${active ? "text-[#A68A3F]" : ""}`}>
        {icon}
      </span>
    </button>
  );
}

function QuickSpec({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="size-11 rounded-xl bg-[#F9FAFB] flex items-center justify-center text-[#A68A3F]">
        {icon}
      </div>
      <div>
        <div className="font-serif text-lg font-semibold text-[#0A1F44] leading-none">{value}</div>
        <div className="text-[10px] tracking-luxury uppercase text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/40">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-[#0A1F44]">{value}</span>
    </div>
  );
}

function NearbyCard({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="p-3 rounded-xl bg-[#F9FAFB] border border-border/60">
      <div className="flex items-center gap-1.5 mb-2 text-[#A68A3F]">
        {icon}
        <span className="text-[10px] tracking-luxury uppercase font-medium">{title}</span>
      </div>
      <ul className="space-y-1">
        {items.slice(0, 3).map((i) => (
          <li key={i} className="text-xs text-[#0A1F44] line-clamp-1">{i}</li>
        ))}
      </ul>
    </div>
  );
}

import { LeadForm } from "@/components/site/widgets/LeadForm";
