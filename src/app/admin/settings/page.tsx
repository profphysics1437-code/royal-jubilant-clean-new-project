"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Save, Loader2, Settings as SettingsIcon, Plus, Trash2 } from "lucide-react";
import { AdminPageHeader, AdminCard } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Setting { id: string; key: string; value: string; category: string; }

const CATEGORIES = [
  { key: "hero", label: "Homepage Hero", desc: "Title, subtitle and badge text on the homepage hero section." },
  { key: "contact", label: "Contact Information", desc: "Phone, email, address, hours, WhatsApp number." },
  { key: "stats", label: "Hero Stats", desc: "The 4 quick stats shown below the hero search box." },
  { key: "social", label: "Social Media Links", desc: "URLs for your social media profiles." },
  { key: "reviews", label: "Google Reviews", desc: "Your Google review link, rating, and review count shown on the homepage." },
  { key: "offplan", label: "About Off Plan Page", desc: "Edit the About Off Plan page content — title, subtitle, market stats, and CTA text." },
  { key: "footer", label: "Footer Link Columns", desc: "Edit the 4 columns of links shown in the website footer." },
  { key: "footerText", label: "Footer Text", desc: "Tagline and copyright shown at the bottom of the footer." },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => {
      setSettings(d.settings || []);
      setLoading(false);
    });
  }, []);

  const getValue = (key: string) => settings.find((s) => s.key === key)?.value || "";
  const setValue = (key: string, value: string, category: string) => {
    const exists = settings.find((s) => s.key === key);
    if (exists) {
      setSettings(settings.map((s) => (s.key === key ? { ...s, value } : s)));
    } else {
      setSettings([...settings, { id: key, key, value, category }]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: settings.map((s) => ({ key: s.key, value: s.value, category: s.category })),
        }),
      });
      if (!res.ok) throw new Error();
      // Bust the site settings localStorage cache so all components
      // (Footer, Navbar, FloatingActions, ContactView, etc.) re-fetch
      // fresh data on next page load — including updated WhatsApp number.
      try {
        const cur = parseInt(localStorage.getItem("siteSettingsVersion") || "0", 10);
        localStorage.setItem("siteSettingsVersion", String(cur + 1));
        localStorage.removeItem("siteSettingsCache");
      } catch {}
      toast.success("Settings saved — changes apply instantly on the website.");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-[#A68A3F]" /></div>;

  return (
    <div>
      <AdminPageHeader
        title="Site Settings"
        subtitle="Customize homepage hero text, contact information, hero stats and social media links. All changes apply instantly to the live website."
        action={
          <Button onClick={handleSave} disabled={saving} className="bg-royal-gradient-diagonal text-white rounded-full">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <><Save className="size-4 mr-1.5" /> Save All Changes</>}
          </Button>
        }
      />

      <div className="space-y-6">
        {CATEGORIES.map((cat) => (
          <AdminCard key={cat.key} className="p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="size-10 rounded-xl bg-royal-gradient-diagonal text-white flex items-center justify-center flex-shrink-0">
                <SettingsIcon className="size-4" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-medium text-[#0A1F44]">{cat.label}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{cat.desc}</p>
              </div>
            </div>

            <div className="space-y-4">
              {cat.key === "hero" && (
                <>
                  <Field label="Hero Title"><Textarea value={getValue("hero.title")} onChange={(e) => setValue("hero.title", e.target.value, "hero")} rows={2} className="bg-[#F9FAFB] resize-none" /></Field>
                  <Field label="Hero Subtitle"><Textarea value={getValue("hero.subtitle")} onChange={(e) => setValue("hero.subtitle", e.target.value, "hero")} rows={3} className="bg-[#F9FAFB] resize-none" /></Field>
                  <Field label="Hero Badge Text"><Input value={getValue("hero.badge")} onChange={(e) => setValue("hero.badge", e.target.value, "hero")} className="bg-[#F9FAFB]" /></Field>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                    <Field label="Video Playback Speed (0.25 to 2.0)"><Input type="number" step="0.25" min="0.25" max="2" value={getValue("hero.videoSpeed")} onChange={(e) => setValue("hero.videoSpeed", e.target.value, "hero")} className="bg-[#F9FAFB]" placeholder="1" /></Field>
                    <Field label="Slide Interval (milliseconds)"><Input type="number" step="500" min="2000" value={getValue("hero.slideInterval")} onChange={(e) => setValue("hero.slideInterval", e.target.value, "hero")} className="bg-[#F9FAFB]" placeholder="5500" /></Field>
                  </div>
                  <p className="text-xs text-muted-foreground">Video Speed: 1 = normal, 0.5 = half speed, 0.25 = quarter speed, 2 = double speed. Slide Interval: 5000 = 5 seconds, 11000 = 11 seconds.</p>
                </>
              )}
              {cat.key === "contact" && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Phone"><Input value={getValue("company.phone")} onChange={(e) => setValue("company.phone", e.target.value, "contact")} className="bg-[#F9FAFB]" /></Field>
                  <Field label="Email"><Input value={getValue("company.email")} onChange={(e) => setValue("company.email", e.target.value, "contact")} className="bg-[#F9FAFB]" /></Field>
                  <Field label="WhatsApp (digits)"><Input value={getValue("company.whatsapp")} onChange={(e) => setValue("company.whatsapp", e.target.value, "contact")} className="bg-[#F9FAFB]" /></Field>
                  <Field label="Office Hours"><Input value={getValue("company.hours")} onChange={(e) => setValue("company.hours", e.target.value, "contact")} className="bg-[#F9FAFB]" /></Field>
                  <div className="col-span-2">
                    <Field label="Address"><Textarea value={getValue("company.address")} onChange={(e) => setValue("company.address", e.target.value, "contact")} rows={2} className="bg-[#F9FAFB] resize-none" /></Field>
                  </div>
                </div>
              )}
              {cat.key === "stats" && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Active Listings"><Input value={getValue("stats.activeListings")} onChange={(e) => setValue("stats.activeListings", e.target.value, "stats")} className="bg-[#F9FAFB]" /></Field>
                  <Field label="Property Categories"><Input value={getValue("stats.categories")} onChange={(e) => setValue("stats.categories", e.target.value, "stats")} className="bg-[#F9FAFB]" /></Field>
                  <Field label="Number of Advisors"><Input value={getValue("stats.advisors")} onChange={(e) => setValue("stats.advisors", e.target.value, "stats")} className="bg-[#F9FAFB]" /></Field>
                  <Field label="Years Serving Dubai"><Input value={getValue("stats.years")} onChange={(e) => setValue("stats.years", e.target.value, "stats")} className="bg-[#F9FAFB]" /></Field>
                </div>
              )}
              {cat.key === "social" && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Facebook URL"><Input value={getValue("social.facebook")} onChange={(e) => setValue("social.facebook", e.target.value, "social")} className="bg-[#F9FAFB]" /></Field>
                  <Field label="Instagram URL"><Input value={getValue("social.instagram")} onChange={(e) => setValue("social.instagram", e.target.value, "social")} className="bg-[#F9FAFB]" /></Field>
                  <Field label="TikTok URL"><Input value={getValue("social.tiktok")} onChange={(e) => setValue("social.tiktok", e.target.value, "social")} className="bg-[#F9FAFB]" /></Field>
                  <Field label="LinkedIn URL"><Input value={getValue("social.linkedin")} onChange={(e) => setValue("social.linkedin", e.target.value, "social")} className="bg-[#F9FAFB]" /></Field>
                  <Field label="X (Twitter) URL"><Input value={getValue("social.twitter")} onChange={(e) => setValue("social.twitter", e.target.value, "social")} className="bg-[#F9FAFB]" /></Field>
                  <Field label="YouTube URL"><Input value={getValue("social.youtube")} onChange={(e) => setValue("social.youtube", e.target.value, "social")} className="bg-[#F9FAFB]" /></Field>
                </div>
              )}
              {cat.key === "reviews" && (
                <div className="space-y-3">
                  <Field label="Google Reviews URL"><Input value={getValue("reviews.google")} onChange={(e) => setValue("reviews.google", e.target.value, "reviews")} className="bg-[#F9FAFB]" placeholder="https://www.google.com/search?q=Royal+Jubilant+Real+Estate+L.L.C+Reviews" /></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Google Rating (e.g. 4.7)"><Input value={getValue("reviews.googleRating")} onChange={(e) => setValue("reviews.googleRating", e.target.value, "reviews")} className="bg-[#F9FAFB]" placeholder="4.7" /></Field>
                    <Field label="Review Count (e.g. 49)"><Input value={getValue("reviews.googleCount")} onChange={(e) => setValue("reviews.googleCount", e.target.value, "reviews")} className="bg-[#F9FAFB]" placeholder="49" /></Field>
                  </div>
                  <p className="text-xs text-muted-foreground">These values appear in the "What Our Clients Say" section on the homepage. Update them when your Google rating changes.</p>
                </div>
              )}
              {cat.key === "footer" && <FooterLinkEditor getValue={getValue} setValue={setValue} />}
              {cat.key === "offplan" && (
                <div className="space-y-3">
                  <Field label="Eyebrow Text"><Input value={getValue("offplan.about.eyebrow")} onChange={(e) => setValue("offplan.about.eyebrow", e.target.value, "offplan")} className="bg-[#F9FAFB]" /></Field>
                  <Field label="Page Title"><Input value={getValue("offplan.about.title")} onChange={(e) => setValue("offplan.about.title", e.target.value, "offplan")} className="bg-[#F9FAFB]" /></Field>
                  <Field label="Subtitle / Description"><Textarea value={getValue("offplan.about.subtitle")} onChange={(e) => setValue("offplan.about.subtitle", e.target.value, "offplan")} rows={4} className="bg-[#F9FAFB] resize-none" /></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Button 1 Text"><Input value={getValue("offplan.about.button1")} onChange={(e) => setValue("offplan.about.button1", e.target.value, "offplan")} className="bg-[#F9FAFB]" /></Field>
                    <Field label="Button 2 Text"><Input value={getValue("offplan.about.button2")} onChange={(e) => setValue("offplan.about.button2", e.target.value, "offplan")} className="bg-[#F9FAFB]" /></Field>
                  </div>
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="text-[10px] tracking-luxury uppercase text-[#A68A3F] font-semibold mb-2">Market Statistics (3 cards)</div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Stat 1 Value"><Input value={getValue("offplan.about.stat1Value")} onChange={(e) => setValue("offplan.about.stat1Value", e.target.value, "offplan")} className="bg-[#F9FAFB]" /></Field>
                      <Field label="Stat 1 Label"><Input value={getValue("offplan.about.stat1Label")} onChange={(e) => setValue("offplan.about.stat1Label", e.target.value, "offplan")} className="bg-[#F9FAFB]" /></Field>
                      <Field label="Stat 2 Value"><Input value={getValue("offplan.about.stat2Value")} onChange={(e) => setValue("offplan.about.stat2Value", e.target.value, "offplan")} className="bg-[#F9FAFB]" /></Field>
                      <Field label="Stat 2 Label"><Input value={getValue("offplan.about.stat2Label")} onChange={(e) => setValue("offplan.about.stat2Label", e.target.value, "offplan")} className="bg-[#F9FAFB]" /></Field>
                      <Field label="Stat 3 Value"><Input value={getValue("offplan.about.stat3Value")} onChange={(e) => setValue("offplan.about.stat3Value", e.target.value, "offplan")} className="bg-[#F9FAFB]" /></Field>
                      <Field label="Stat 3 Label"><Input value={getValue("offplan.about.stat3Label")} onChange={(e) => setValue("offplan.about.stat3Label", e.target.value, "offplan")} className="bg-[#F9FAFB]" /></Field>
                    </div>
                  </div>
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="text-[10px] tracking-luxury uppercase text-[#A68A3F] font-semibold mb-2">Call-to-Action Section</div>
                    <Field label="CTA Title"><Input value={getValue("offplan.about.ctaTitle")} onChange={(e) => setValue("offplan.about.ctaTitle", e.target.value, "offplan")} className="bg-[#F9FAFB]" /></Field>
                    <Field label="CTA Subtitle"><Textarea value={getValue("offplan.about.ctaSubtitle")} onChange={(e) => setValue("offplan.about.ctaSubtitle", e.target.value, "offplan")} rows={2} className="bg-[#F9FAFB] resize-none" /></Field>
                  </div>
                </div>
              )}
              {cat.key === "footerText" && (
                <div className="space-y-3">
                  <Field label="Footer Tagline (under logo)"><Textarea value={getValue("footer.tagline")} onChange={(e) => setValue("footer.tagline", e.target.value, "footer")} rows={2} className="bg-[#F9FAFB] resize-none" /></Field>
                  <Field label="Copyright Text"><Input value={getValue("footer.copyright")} onChange={(e) => setValue("footer.copyright", e.target.value, "footer")} className="bg-[#F9FAFB]" /></Field>
                </div>
              )}
            </div>
          </AdminCard>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} disabled={saving} className="bg-royal-gradient-diagonal text-white rounded-full">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <><Save className="size-4 mr-1.5" /> Save All Changes</>}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="text-[10px] tracking-luxury uppercase text-[#A68A3F] font-medium mb-1.5 block">{label}</Label>{children}</div>;
}

// ─── Footer Link Editor ──────────────────────────────────────────────
// Manages 4 columns of links. Each column is stored as JSON in site_settings:
//   footer.col1 = {"title":"Buy & Rent","links":[{"label":"Properties for Rent","view":"rent"}, ...]}
//   footer.col2 = Communities, footer.col3 = Services, footer.col4 = Company
const FOOTER_COLUMNS = [
  { key: "footer.col1", defaultTitle: "Buy & Rent" },
  { key: "footer.col2", defaultTitle: "Communities" },
  { key: "footer.col3", defaultTitle: "Services" },
  { key: "footer.col4", defaultTitle: "Company" },
];

// Valid view names the footer can navigate to
const VIEWS = ["rent", "buy", "commercial", "off-plan", "luxury", "agents", "blog", "about", "contact", "careers", "faqs", "communities", "developers", "testimonials", "advice"];

function FooterLinkEditor({ getValue, setValue }: { getValue: (k: string) => string; setValue: (k: string, v: string, c: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {FOOTER_COLUMNS.map((col) => {
        const raw = getValue(col.key);
        let data: { title: string; links: { label: string; view: string }[] };
        try {
          data = JSON.parse(raw);
          if (!data.links) data.links = [];
        } catch {
          data = { title: col.defaultTitle, links: [] };
        }

        const update = (newData: typeof data) => setValue(col.key, JSON.stringify(newData), "footer");

        return (
          <div key={col.key} className="border border-border rounded-xl p-4 bg-[#F9FAFB]">
            <Input
              value={data.title}
              onChange={(e) => update({ ...data, title: e.target.value })}
              className="bg-white font-medium text-[#0A1F44] mb-3"
              placeholder="Column title"
            />
            <div className="space-y-2">
              {data.links.map((link, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Input
                    value={link.label}
                    onChange={(e) => {
                      const links = [...data.links];
                      links[i] = { ...links[i], label: e.target.value };
                      update({ ...data, links });
                    }}
                    className="bg-white text-xs h-8"
                    placeholder="Link label"
                  />
                  <select
                    value={link.view}
                    onChange={(e) => {
                      const links = [...data.links];
                      links[i] = { ...links[i], view: e.target.value };
                      update({ ...data, links });
                    }}
                    className="h-8 rounded-md border border-input bg-white px-2 text-xs flex-shrink-0"
                  >
                    {VIEWS.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <button
                    onClick={() => update({ ...data, links: data.links.filter((_, idx) => idx !== i) })}
                    className="size-8 rounded hover:bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0"
                    title="Remove link"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => update({ ...data, links: [...data.links, { label: "New Link", view: "about" }] })}
              className="mt-3 inline-flex items-center gap-1 text-xs text-[#A68A3F] hover:text-[#0A1F44] font-medium"
            >
              <Plus className="size-3.5" /> Add Link
            </button>
          </div>
        );
      })}
    </div>
  );
}
