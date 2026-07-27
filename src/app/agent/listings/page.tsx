"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, X, Save, Loader2, Star, Clock, CheckCircle2 } from "lucide-react";
import { AdminPageHeader, AdminTable, EmptyRow } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatPrice } from "@/lib/data";
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

const parseArr = (v: string | null | undefined) => {
  if (!v) return [];
  try { return JSON.parse(v); } catch { return []; }
};

export default function AgentListings() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/agent/listings").then((r) => r.json()).then((d) => { setItems(d.properties || []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this property?")) return;
    const res = await fetch(`/api/agent/listings/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Property deleted"); load(); }
    else toast.error("Failed to delete");
  };

  return (
    <div>
      <AdminPageHeader
        title="My Listings"
        subtitle="Properties assigned to you. New properties you add are submitted for admin approval before going live."
        action={
          <Link href="/agent/listings/new">
            <Button className="bg-royal-gradient-diagonal text-white rounded-full">
              <Plus className="size-4 mr-1.5" /> Add Property
            </Button>
          </Link>
        }
      />

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-[#A68A3F]" /></div>
      ) : (
        <AdminTable headers={["Ref", "Title", "Status", "Price", "Community", "Beds", "Published", "Actions"]}>
          {items.length === 0 ? (
            <EmptyRow colSpan={8} label="No listings yet. Click 'Add Property' to create your first listing." />
          ) : (
            items.map((p) => (
              <tr key={p.id} className="hover:bg-[#F9FAFB]/50">
                <td className="px-4 py-3"><span className="text-xs font-mono text-[#A68A3F]">{p.reference}</span></td>
                <td className="px-4 py-3"><div className="font-medium text-[#0A1F44] line-clamp-1">{p.title}</div></td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-[#F9FAFB] capitalize">{p.status}</span></td>
                <td className="px-4 py-3 font-medium text-[#0A1F44]">{formatPrice(p.price)}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{p.community}</td>
                <td className="px-4 py-3 text-center">{p.bedrooms}</td>
                <td className="px-4 py-3">
                  {p.published ? (
                    <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-700">
                      <CheckCircle2 className="size-3" /> Live
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                      <Clock className="size-3" /> Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditing(p)} className="size-8 rounded-lg hover:bg-[#C9A961]/15 flex items-center justify-center" title="Edit">
                      <Pencil className="size-3.5 text-[#A68A3F]" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="size-8 rounded-lg hover:bg-red-50 flex items-center justify-center" title="Delete">
                      <Trash2 className="size-3.5 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </AdminTable>
      )}

      {editing && <EditListing property={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function EditListing({ property, onClose, onSaved }: { property: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<any>({
    ...property,
    images: parseArr(property.images),
    indoorFeatures: parseArr(property.indoorFeatures),
    outdoorFeatures: parseArr(property.outdoorFeatures),
    buildingAmenities: parseArr(property.buildingAmenities),
    nearbyLandmarks: parseArr(property.nearbyLandmarks),
    viewFeatures: parseArr(property.viewFeatures),
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  const propertyTypes = form.category === "Residential" ? RESIDENTIAL_TYPES : COMMERCIAL_TYPES;
  const isRent = form.status === "rent";
  const isOffPlan = form.completionStatus === "Off-Plan";

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/agent/listings/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Property updated — submitted for re-approval");
      onSaved();
    } catch { toast.error("Failed to save"); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-royal-gradient-diagonal text-white p-6 flex items-center justify-between sticky top-0 z-10">
          <h2 className="font-serif text-xl font-medium">Edit Listing — {property.reference}</h2>
          <button onClick={onClose} className="size-9 rounded-full hover:bg-white/15 flex items-center justify-center"><X className="size-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          {property.published && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              ⚠️ Editing a published property will mark it as <strong>pending re-approval</strong>.
            </div>
          )}

          {/* Section 1 — Type & Purpose */}
          <SectionTitle num="01" title="Listing Type & Purpose" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Purpose">
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full h-10 px-3 bg-[#F9FAFB] rounded-lg border border-border text-sm">
                <option value="sale">For Sale</option><option value="rent">For Rent</option>
              </select>
            </Field>
            <Field label="Category">
              <select value={form.category || "Residential"} onChange={(e) => set("category", e.target.value)} className="w-full h-10 px-3 bg-[#F9FAFB] rounded-lg border border-border text-sm">
                <option>Residential</option><option>Commercial</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className="w-full h-10 px-3 bg-[#F9FAFB] rounded-lg border border-border text-sm">
                {propertyTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Reference">
              <Input value={form.reference} onChange={(e) => set("reference", e.target.value)} className="bg-[#F9FAFB] font-mono text-xs" />
            </Field>
          </div>
          <Field label="Title"><Input value={form.title} onChange={(e) => set("title", e.target.value)} className="bg-[#F9FAFB]" /></Field>

          {/* Section 2 — Location */}
          <SectionTitle num="02" title="Location" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Country">
              <select value={form.country || "UAE"} onChange={(e) => set("country", e.target.value)} className="w-full h-10 px-3 bg-[#F9FAFB] rounded-lg border border-border text-sm">
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Emirate">
              <select value={form.emirate || "Dubai"} onChange={(e) => set("emirate", e.target.value)} className="w-full h-10 px-3 bg-[#F9FAFB] rounded-lg border border-border text-sm">
                {EMIRATES.map((e) => <option key={e}>{e}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Community">
            <select value={form.community} onChange={(e) => set("community", e.target.value)} className="w-full h-10 px-3 bg-[#F9FAFB] rounded-lg border border-border text-sm">
              <option value="">Select…</option>
              {DUBAI_COMMUNITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Sub-Community"><Input value={form.subCommunity || ""} onChange={(e) => set("subCommunity", e.target.value)} className="bg-[#F9FAFB]" /></Field>
          <Field label="Address"><Input value={form.locationAddress || ""} onChange={(e) => set("locationAddress", e.target.value)} className="bg-[#F9FAFB]" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude"><Input value={form.locationLat ?? ""} onChange={(e) => set("locationLat", e.target.value)} className="bg-[#F9FAFB]" /></Field>
            <Field label="Longitude"><Input value={form.locationLng ?? ""} onChange={(e) => set("locationLng", e.target.value)} className="bg-[#F9FAFB]" /></Field>
          </div>

          {/* Section 3 — Details */}
          <SectionTitle num="03" title="Property Details" />
          <div className="grid grid-cols-4 gap-3">
            <Field label="Bedrooms"><Input type="number" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} className="bg-[#F9FAFB]" /></Field>
            <Field label="Bathrooms"><Input type="number" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} className="bg-[#F9FAFB]" /></Field>
            <Field label="Area"><Input type="number" value={form.area} onChange={(e) => set("area", e.target.value)} className="bg-[#F9FAFB]" /></Field>
            <Field label="Unit">
              <select value={form.areaUnit || "sqft"} onChange={(e) => set("areaUnit", e.target.value)} className="w-full h-10 px-3 bg-[#F9FAFB] rounded-lg border border-border text-sm">
                <option>sqft</option><option>sqm</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Plot Size"><Input type="number" value={form.plotSize ?? ""} onChange={(e) => set("plotSize", e.target.value)} className="bg-[#F9FAFB]" /></Field>
            <Field label="Parking"><Input type="number" value={form.parking} onChange={(e) => set("parking", e.target.value)} className="bg-[#F9FAFB]" /></Field>
            <Field label="Floor"><Input type="number" value={form.floorNumber ?? ""} onChange={(e) => set("floorNumber", e.target.value)} className="bg-[#F9FAFB]" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Completion Status">
              <select value={form.completionStatus || "Ready"} onChange={(e) => set("completionStatus", e.target.value)} className="w-full h-10 px-3 bg-[#F9FAFB] rounded-lg border border-border text-sm">
                {COMPLETION_STATUSES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            {isOffPlan && (
              <Field label="Completion Date"><Input value={form.completionDate || ""} onChange={(e) => set("completionDate", e.target.value)} className="bg-[#F9FAFB]" placeholder="2027-Q1" /></Field>
            )}
          </div>
          <Field label="Furnishing Status">
            <div className="grid grid-cols-3 gap-2">
              {FURNISHING_STATUSES.map((f) => (
                <button key={f} type="button" onClick={() => set("furnishingStatus", f)}
                  className={`p-2.5 rounded-lg border text-xs font-medium transition-all ${
                    form.furnishingStatus === f ? "bg-royal-gradient-diagonal text-white border-transparent" : "bg-[#F9FAFB] text-[#0A1F44] border-border hover:border-[#C9A961]"
                  }`}>{f}</button>
              ))}
            </div>
          </Field>

          {/* Section 4 — Pricing */}
          <SectionTitle num="04" title="Pricing & Payment" />
          <Field label="Price (AED)"><Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} className="bg-[#F9FAFB]" /></Field>
          {isRent && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rental Frequency">
                <select value={form.rentFrequency || "Yearly"} onChange={(e) => set("rentFrequency", e.target.value)} className="w-full h-10 px-3 bg-[#F9FAFB] rounded-lg border border-border text-sm">
                  {RENT_FREQUENCIES.map((f) => <option key={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="No. of Cheques">
                <select value={form.noOfCheques ?? ""} onChange={(e) => set("noOfCheques", e.target.value)} className="w-full h-10 px-3 bg-[#F9FAFB] rounded-lg border border-border text-sm">
                  <option value="">Select…</option>
                  {CHEQUE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
          )}
          <Field label="Service Charge (AED/yr)"><Input type="number" value={form.serviceCharge ?? ""} onChange={(e) => set("serviceCharge", e.target.value)} className="bg-[#F9FAFB]" /></Field>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-[#F9FAFB]">
            <input type="checkbox" checked={form.priceNegotiable || false} onChange={(e) => set("priceNegotiable", e.target.checked)} className="size-4 accent-[#C9A961]" />
            <span className="text-sm">Price is negotiable</span>
          </label>

          {/* Section 5 — Amenities */}
          <SectionTitle num="05" title="Amenities & Features" />
          <Field label="Indoor Features"><CheckboxGrid options={INDOOR_FEATURES} selected={form.indoorFeatures} onChange={(v) => set("indoorFeatures", v)} columns={3} /></Field>
          <Field label="Outdoor Features"><CheckboxGrid options={OUTDOOR_FEATURES} selected={form.outdoorFeatures} onChange={(v) => set("outdoorFeatures", v)} columns={3} /></Field>
          <Field label="Building Amenities"><CheckboxGrid options={BUILDING_AMENITIES} selected={form.buildingAmenities} onChange={(v) => set("buildingAmenities", v)} columns={3} /></Field>
          <Field label="Nearby Landmarks"><CheckboxGrid options={NEARBY_LANDMARKS} selected={form.nearbyLandmarks} onChange={(v) => set("nearbyLandmarks", v)} columns={4} /></Field>
          <Field label="View"><CheckboxGrid options={VIEW_OPTIONS} selected={form.viewFeatures} onChange={(v) => set("viewFeatures", v)} columns={3} /></Field>

          {/* Section 6 — Media */}
          <SectionTitle num="06" title="Media" />
          <Field label="Property Photos">
            <PhotoUploader
              value={form.images}
              onChange={(urls) => set("images", urls)}
              folder="properties"
              min={1}
              max={50}
              endpoint="/api/agent/upload"
              propertyId={property.id}
            />
          </Field>
          <Field label="Floor Plan URL"><Input value={form.floorPlanUrl || ""} onChange={(e) => set("floorPlanUrl", e.target.value)} className="bg-[#F9FAFB]" /></Field>
          <Field label="Video Tour URL"><Input value={form.videoUrl || ""} onChange={(e) => set("videoUrl", e.target.value)} className="bg-[#F9FAFB]" /></Field>
          <Field label="360° Virtual Tour URL"><Input value={form.virtualTourUrl || ""} onChange={(e) => set("virtualTourUrl", e.target.value)} className="bg-[#F9FAFB]" /></Field>

          {/* Section 7 — Description */}
          <SectionTitle num="07" title="Description & Reference" />
          <Field label="Description"><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={5} className="bg-[#F9FAFB] resize-none" /></Field>
          <Field label="RERA / Permit Number"><Input value={form.reraNumber || ""} onChange={(e) => set("reraNumber", e.target.value)} className="bg-[#F9FAFB]" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-[#F9FAFB]">
              <input type="checkbox" checked={form.exclusiveListing || false} onChange={(e) => set("exclusiveListing", e.target.checked)} className="size-4 accent-[#C9A961]" />
              <span className="text-sm">Exclusive Listing</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-[#F9FAFB]">
              <input type="checkbox" checked={form.isLuxury || false} onChange={(e) => set("isLuxury", e.target.checked)} className="size-4 accent-[#C9A961]" />
              <span className="text-sm">Luxury Collection</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button onClick={handleSave} disabled={saving} className="bg-royal-gradient-diagonal text-white rounded-full flex-1">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <><Save className="size-4 mr-1.5" /> Save & Submit for Re-Approval</>}
            </Button>
            <Button onClick={onClose} variant="outline" className="rounded-full">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-center gap-3 pt-4 border-t border-border/60 first:border-0 first:pt-0">
      <div className="size-8 rounded-lg bg-royal-gradient-diagonal text-white text-xs font-bold flex items-center justify-center">{num}</div>
      <h3 className="font-serif text-base font-medium text-[#0A1F44]">{title}</h3>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="text-[10px] tracking-luxury uppercase text-[#A68A3F] font-medium mb-1.5 block">{label}</Label>{children}</div>;
}
