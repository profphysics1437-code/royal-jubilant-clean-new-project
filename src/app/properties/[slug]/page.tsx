import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { LandingPageLeadForm } from "@/components/site/LandingPageLeadForm";
import { PropertyCard } from "@/components/site/PropertyCard";
import { PropertyGallery } from "@/components/site/PropertyGallery";
import { properties as fallbackProperties, formatPrice, getAgentById } from "@/lib/data";
import {
  ArrowLeft,
  BedDouble,
  Bath,
  Maximize,
  Car,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  ShieldCheck,
  Check,
  Building2,
  Calendar,
} from "lucide-react";

// Always render fresh — never cache at build time (DB data changes often)
export const dynamic = "force-dynamic";
// Allow 60s ISR-style revalidation at the edge
export const revalidate = 0;

// ---------- helpers --------------------------------------------------------

function parseJsonField<T>(field: string | null | undefined, fallback: T): T {
  if (!field) return fallback;
  try {
    return JSON.parse(field) as T;
  } catch {
    return fallback;
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "sale":
      return "For Sale";
    case "rent":
      return "For Rent";
    case "commercial":
      return "Commercial";
    case "off-plan":
      return "Off-Plan";
    default:
      return status;
  }
}

/**
 * Build a professional pre-filled WhatsApp enquiry message for a property.
 *
 * Includes (only when available — never shows undefined/null):
 *   - Agent name (greeting)
 *   - Property title
 *   - Property reference
 *   - Status (For Rent / For Sale / Off-Plan / Commercial)
 *   - Location (community + emirate if available)
 *   - Price (formatted with rent frequency)
 *   - Current property URL (canonical link)
 *   - Royal Jubilant branding + polite closing
 *
 * Used by BOTH WhatsApp buttons on the Property Detail Page:
 *   1. Sticky sidebar (desktop)
 *   2. Mobile sticky bottom contact bar
 *
 * The message is encoded with encodeURIComponent — emojis, spaces, line
 * breaks (\n), and special characters are all handled correctly for
 * wa.me deep links.
 */
function buildWhatsAppEnquiryMessage(opts: {
  agentName?: string | null;
  propertyTitle: string;
  propertyReference: string;
  status: string;            // raw status: sale | rent | commercial | off-plan
  community?: string | null;
  emirate?: string | null;
  price: number;
  rentFrequency?: string | null;
  propertyUrl: string;       // canonical URL of the property detail page
}): string {
  const greeting = opts.agentName
    ? `Hello ${opts.agentName},`
    : `Hello,`;

  const lines: string[] = [
    greeting,
    ``,
    `I am interested in your property listed on Royal Jubilant.`,
  ];

  // 🏡 Property (title) — always present (required field in schema)
  if (opts.propertyTitle) {
    lines.push(``, `🏡 Property`, opts.propertyTitle);
  }

  // 🆔 Reference (always present — schema requires it)
  if (opts.propertyReference) {
    lines.push(``, `🆔 Reference`, opts.propertyReference);
  }

  // 🏷 Category (status label)
  const cat = statusLabel(opts.status);
  if (cat) {
    lines.push(``, `🏷 Category`, cat);
  }

  // 📍 Location (community + emirate, both optional)
  const locationParts: string[] = [];
  if (opts.community) locationParts.push(opts.community);
  if (opts.emirate && opts.emirate !== opts.community) {
    locationParts.push(opts.emirate);
  }
  if (locationParts.length > 0) {
    lines.push(``, `📍 Location`, locationParts.join(`, `));
  }

  // 💰 Price (formatted with rent frequency suffix)
  if (opts.price != null && !Number.isNaN(Number(opts.price))) {
    const formatted = new Intl.NumberFormat("en-AE", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(Number(opts.price));
    let priceStr = `AED ${formatted}`;
    if (opts.rentFrequency === "year") priceStr += ` / Year`;
    else if (opts.rentFrequency === "month") priceStr += ` / Month`;
    lines.push(``, `💰 Price`, priceStr);
  }

  // 🔗 Property Link (canonical URL of this detail page)
  if (opts.propertyUrl) {
    lines.push(``, `🔗 Property Link`, opts.propertyUrl);
  }

  // Closing
  lines.push(
    ``,
    `Could you please share more details about this property?`,
    ``,
    `Thank you.`
  );

  return lines.join(`\n`);
}

/**
 * Build the full WhatsApp deep-link URL for a property enquiry.
 * Returns null if the agent has no valid WhatsApp number (so callers
 * can hide the button instead of rendering a broken link).
 *
 * Phone normalization: strips all non-digit characters from the agent's
 * whatsapp field (handles "+971 52 494 2329", "971524942329", etc.).
 */
function buildWhatsAppEnquiryUrl(opts: {
  whatsapp?: string | null;
  agentName?: string | null;
  propertyTitle: string;
  propertyReference: string;
  status: string;
  community?: string | null;
  emirate?: string | null;
  price: number;
  rentFrequency?: string | null;
  propertyUrl: string;
}): string | null {
  if (!opts.whatsapp) return null;
  const digits = opts.whatsapp.replace(/\D/g, "");
  if (!digits) return null;
  const message = buildWhatsAppEnquiryMessage({
    agentName: opts.agentName,
    propertyTitle: opts.propertyTitle,
    propertyReference: opts.propertyReference,
    status: opts.status,
    community: opts.community,
    emirate: opts.emirate,
    price: opts.price,
    rentFrequency: opts.rentFrequency,
    propertyUrl: opts.propertyUrl,
  });
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

// ---------- metadata -------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Try by slug first, then fall back to id (some legacy URLs may use id)
  const p =
    (await db.property.findUnique({ where: { slug } }).catch(() => null)) ??
    (await db.property.findUnique({ where: { id: slug } }).catch(() => null));

  if (!p) return { title: "Property Not Found · Royal Jubilant" };

  return {
    title: `${p.title} · Royal Jubilant Real Estate`,
    description:
      p.description?.slice(0, 160) ??
      `${p.community} — AED ${p.price.toLocaleString()}`,
    openGraph: {
      title: p.title,
      description: p.description?.slice(0, 160) ?? "",
      images: (() => {
        const imgs = parseJsonField<string[]>(p.images, []);
        return imgs.length ? [{ url: imgs[0] }] : [];
      })(),
    },
  };
}

// ---------- page -----------------------------------------------------------

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Look up by slug OR id (legacy fallback) — include User relation (auth record)
  // so we can match the rich Agent profile by email.
  const p = (await db.property
    .findUnique({
      where: { slug },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    })
    .catch(() => null)) ??
    (await db.property
      .findUnique({
        where: { id: slug },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatarUrl: true,
            },
          },
        },
      })
      .catch(() => null));

  // If not in DB, try the fallback mock data (for dev/preview environments)
  let property: any = p;
  if (!property) {
    const mock = fallbackProperties.find(
      (m) => m.slug === slug || m.id === slug
    );
    if (mock) property = mock;
  }

  if (!property) {
    notFound();
  }

  // Normalise fields for rendering (DB rows have stringified JSON)
  const isDbRow = !!p;
  const images: string[] = isDbRow
    ? parseJsonField<string[]>(property.images, [])
    : property.images ?? [];
  const amenities: string[] = isDbRow
    ? parseJsonField<string[]>(property.amenities, [])
    : property.amenities ?? [];
  const features: string[] = isDbRow
    ? parseJsonField<string[]>(property.features, [])
    : property.features ?? [];

  // Resolve agent — for DB rows, look up the rich Agent profile by matching
  // the assigned User's email. Fall back to User fields, then mock data.
  let agent: any = null;
  if (isDbRow && (property as any).agent?.email) {
    const agentProfile = await db.agent
      .findUnique({
        where: { email: (property as any).agent.email },
      })
      .catch(() => null);
    if (agentProfile) {
      agent = {
        id: agentProfile.id,
        name: agentProfile.name,
        title: agentProfile.title,
        photo: agentProfile.photo,
        phone: agentProfile.phone,
        whatsapp: agentProfile.whatsapp,
        email: agentProfile.email,
      };
    } else {
      // No Agent profile row — use User fields
      const u = (property as any).agent;
      agent = {
        id: u.id,
        name: u.name || "Royal Jubilant Advisor",
        title: "Property Consultant",
        photo: u.avatarUrl || "",
        phone: u.phone || "",
        whatsapp: "",
        email: u.email,
      };
    }
  } else {
    // Mock data fallback
    agent = (property as any).agent ?? getAgentById(property.agentId);
  }

  // Similar properties in same community (limit 3)
  let similar: any[] = [];
  if (isDbRow) {
    try {
      similar = await db.property.findMany({
        where: {
          published: true,
          community: property.community,
          id: { not: property.id },
        },
        take: 3,
        orderBy: { createdAt: "desc" },
      });
    } catch {
      similar = [];
    }
  } else {
    similar = fallbackProperties
      .filter((m) => m.community === property.community && m.id !== property.id)
      .slice(0, 3);
  }

  // Canonical property URL — used in the WhatsApp enquiry message so the
  // receiving agent has a one-tap link back to the exact listing.
  // Built from request headers since this is a server component.
  const headersList = await headers();
  const host = headersList.get("host") || "www.royaljubilant.com";
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const propertyUrl = `${protocol}://${host}/properties/${encodeURIComponent(
    property.slug || property.reference || property.id
  )}`;

  // Pre-compute the WhatsApp enquiry URL once — shared by the sidebar
  // button (desktop) and the mobile sticky bottom bar button. Returns
  // null if the agent has no valid WhatsApp number; callers hide the
  // button in that case so no broken link is ever rendered.
  const whatsappEnquiryUrl = agent
    ? buildWhatsAppEnquiryUrl({
        whatsapp: agent.whatsapp,
        agentName: agent.name,
        propertyTitle: property.title,
        propertyReference: property.reference,
        status: property.status,
        community: property.community,
        emirate: (property as any).emirate,
        price: property.price,
        rentFrequency: property.rentFrequency,
        propertyUrl,
      })
    : null;

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
      {/* Top bar */}
      <header className="border-b border-[#E5E7EB] bg-white/95 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#0A1F44] hover:text-[#A68A3F] transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to listings
          </Link>
          <div className="flex items-center gap-3 text-xs text-[#6B7280]">
            <span className="hidden sm:inline">{property.reference}</span>
            {property.reraNumber && (
              <span className="inline-flex items-center gap-1 text-[#A68A3F]">
                <ShieldCheck className="size-3" /> RERA {property.reraNumber}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Gallery — dynamic, premium Royal Jubilant design with thumbnails,
          lightbox, swipe, keyboard nav. Handles empty/broken/duplicate
          images gracefully. Hides controls when only 1 image exists. */}
      <section className="container mx-auto px-4 lg:px-6 pt-6">
        <PropertyGallery
          title={property.title}
          images={images}
          statusLabel={statusLabel(property.status)}
        />
      </section>

      {/* Main content */}
      <section className="container mx-auto px-4 lg:px-6 py-8 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
        {/* Left column — title, specs, description */}
        <div className="space-y-8">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-medium text-[#0A1F44] leading-tight">
              {property.title}
            </h1>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#6B7280]">
              <MapPin className="size-4 text-[#9CA3AF]" />
              {property.community}
              {property.subCommunity ? ` · ${property.subCommunity}` : ""}
            </p>
            <p className="mt-4 text-3xl font-bold text-[#0A1F44]">
              {formatPrice(property.price, property.rentFrequency)}
              {property.pricePerSqft && (
                <span className="ml-2 text-xs font-normal text-[#9CA3AF]">
                  · AED {property.pricePerSqft.toLocaleString()}/sqft
                </span>
              )}
            </p>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-[#E5E7EB]">
            <Spec
              icon={<BedDouble className="size-5 text-[#A68A3F]" />}
              value={property.bedrooms || 0}
              label="Bedrooms"
            />
            <Spec
              icon={<Bath className="size-5 text-[#A68A3F]" />}
              value={property.bathrooms || 0}
              label="Bathrooms"
            />
            <Spec
              icon={<Maximize className="size-5 text-[#A68A3F]" />}
              value={`${property.area.toLocaleString()} ${property.areaUnit ?? "sqft"}`}
              label="Built-up Area"
            />
            <Spec
              icon={<Car className="size-5 text-[#A68A3F]" />}
              value={property.parking || 0}
              label="Parking"
            />
          </div>

          {/* Description */}
          <div>
            <h2 className="font-serif text-xl text-[#0A1F44] mb-3">
              About this property
            </h2>
            <div className="prose prose-sm max-w-none text-[#374151] whitespace-pre-line">
              {property.description}
            </div>
          </div>

          {/* Features & amenities */}
          {(features.length > 0 || amenities.length > 0) && (
            <div>
              <h2 className="font-serif text-xl text-[#0A1F44] mb-3">
                Features &amp; Amenities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[...features, ...amenities].map((f, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-2 text-sm text-[#374151]"
                  >
                    <Check className="size-4 text-[#A68A3F]" /> {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Property facts */}
          <div>
            <h2 className="font-serif text-xl text-[#0A1F44] mb-3">
              Property Facts
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <Fact label="Reference" value={property.reference} />
              <Fact
                label="Type"
                value={property.type ?? "—"}
              />
              <Fact
                label="Status"
                value={statusLabel(property.status)}
              />
              <Fact
                label="Community"
                value={property.community ?? "—"}
              />
              {property.subCommunity && (
                <Fact
                  label="Sub-community"
                  value={property.subCommunity}
                />
              )}
              {property.developer && (
                <Fact label="Developer" value={property.developer} />
              )}
              {property.completionStatus && (
                <Fact
                  label="Completion"
                  value={property.completionStatus}
                />
              )}
              {property.furnishingStatus && (
                <Fact
                  label="Furnishing"
                  value={property.furnishingStatus}
                />
              )}
              {property.reraNumber && (
                <Fact
                  label="RERA Permit"
                  value={property.reraNumber}
                />
              )}
              {property.handoverYear && (
                <Fact
                  label="Handover Year"
                  value={String(property.handoverYear)}
                />
              )}
              {property.floorNumber != null && (
                <Fact
                  label="Floor"
                  value={`${property.floorNumber}${
                    property.totalFloors ? ` / ${property.totalFloors}` : ""
                  }`}
                />
              )}
            </dl>
          </div>
        </div>

        {/* Right column — sticky sidebar with prominent agent contact panel */}
        <aside className="lg:sticky lg:top-20 self-start space-y-4">
          {agent && (
            <div className="border border-[#E5E7EB] rounded-2xl p-5 shadow-[0_4px_20px_rgba(10,31,68,0.06)] bg-white">
              <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] mb-3 font-medium">
                Marketed By
              </p>

              {/* Agent identity — photo + name + designation */}
              <div className="flex items-center gap-3.5 mb-4">
                {agent.photo ? (
                  <img
                    src={agent.photo}
                    alt={agent.name}
                    className="size-16 rounded-full object-cover ring-2 ring-[#C9A961]/30 flex-shrink-0"
                  />
                ) : (
                  <div className="size-16 rounded-full bg-gradient-to-br from-[#0A1F44] to-[#1a3060] text-[#C9A961] flex items-center justify-center font-semibold text-lg ring-2 ring-[#C9A961]/30 flex-shrink-0">
                    {(agent.name || "RJ")
                      .split(" ")
                      .slice(0, 2)
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#0A1F44] truncate text-base">
                    {agent.name}
                  </p>
                  <p className="text-xs text-[#6B7280] truncate mt-0.5">
                    {agent.title || "Property Consultant"}
                  </p>
                  {agent.phone && (
                    <a
                      href={`tel:${agent.phone.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-1.5 text-xs text-[#0A1F44] hover:text-[#A68A3F] transition-colors mt-1.5 font-medium"
                      title={`Call ${agent.name} at ${agent.phone}`}
                    >
                      <Phone className="size-3 text-[#C9A961]" />
                      {agent.phone}
                    </a>
                  )}
                </div>
              </div>

              {/* Contact buttons — premium split layout, thumb-friendly.
                  Uses the pre-computed whatsappEnquiryUrl (built once at
                  page top) so the same professional pre-filled message is
                  shared by both this sidebar button and the mobile sticky
                  bottom bar button below. */}
              {(() => {
                const telUrl = agent.phone
                  ? `tel:${agent.phone.replace(/\s/g, "")}`
                  : null;
                const waUrl = whatsappEnquiryUrl;
                const mailUrl = agent.email
                  ? `mailto:${agent.email}?subject=${encodeURIComponent(
                      `Enquiry: ${property.title} (Ref: ${property.reference})`
                    )}`
                  : null;
                const anyContact = telUrl || waUrl || mailUrl;
                if (!anyContact) return null;
                return (
                  <div className="space-y-2">
                    {/* Primary: WhatsApp + Call (two-column on mobile too) */}
                    <div
                      className={`grid gap-2 ${
                        waUrl && telUrl ? "grid-cols-2" : "grid-cols-1"
                      }`}
                    >
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-[#25D366] hover:bg-[#1FB855] text-white text-sm font-semibold transition-all hover:shadow-md"
                          title={`WhatsApp ${agent.name}`}
                        >
                          <MessageCircle className="size-4" />
                          WhatsApp
                        </a>
                      )}
                      {telUrl && (
                        <a
                          href={telUrl}
                          className="inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-[#0A1F44] hover:bg-[#1a3060] text-white text-sm font-semibold transition-all hover:shadow-md"
                          title={`Call ${agent.name} at ${agent.phone}`}
                        >
                          <Phone className="size-4" />
                          Call
                        </a>
                      )}
                    </div>
                    {/* Secondary: Email (full-width) */}
                    {mailUrl && (
                      <a
                        href={mailUrl}
                        className="inline-flex items-center justify-center gap-2 h-11 w-full rounded-lg bg-white border border-[#0A1F44]/20 hover:border-[#C9A961] hover:bg-[#C9A961]/5 text-[#0A1F44] text-sm font-semibold transition-all"
                        title={`Email ${agent.name}`}
                      >
                        <Mail className="size-4" />
                        Email
                      </a>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Reference card */}
          <div className="border border-[#E5E7EB] rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6B7280]">Reference</span>
              <span className="font-mono font-semibold text-[#0A1F44]">
                {property.reference}
              </span>
            </div>
            {property.reraNumber && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B7280]">RERA Permit</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#A68A3F]">
                  <ShieldCheck className="size-3" />
                  {property.reraNumber}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6B7280]">Listed</span>
              <span className="text-[#0A1F44]">
                {new Date(property.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Lead form */}
          <div className="border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
            <h3 className="font-serif text-lg text-[#0A1F44] mb-1">
              Enquire about this property
            </h3>
            <p className="text-xs text-[#6B7280] mb-4">
              A senior advisor will reach out within 24 hours.
            </p>
            <LandingPageLeadForm slug={`property-${property.reference}`} />
          </div>
        </aside>
      </section>

      {/* Floor plan / video / virtual tour */}
      {(property.floorPlanUrl || property.videoUrl || property.virtualTourUrl) && (
        <section className="container mx-auto px-4 lg:px-6 pb-12 space-y-6 min-w-0">
          {property.floorPlanUrl && (
            <div>
              <h2 className="font-serif text-xl text-[#0A1F44] mb-3">
                Floor Plan
              </h2>
              <div className="rounded-2xl overflow-hidden border border-[#E5E7EB] bg-[#F9FAFB]">
                <img
                  src={property.floorPlanUrl}
                  alt={`${property.title} floor plan`}
                  className="w-full h-auto object-contain max-h-[600px]"
                />
              </div>
            </div>
          )}
          {property.videoUrl && (
            <div className="min-w-0">
              <h2 className="font-serif text-xl text-[#0A1F44] mb-3">
                Property Video
              </h2>
              {/* Responsive video wrapper.
                  - max-w-full + w-full ensures it never exceeds parent width
                  - aspect-video gives 16:9 ratio; overflow-hidden clips any
                    native video controls that might overflow on iOS Safari
                  - min-w-0 lets the wrapper shrink inside flex/grid parents
                  - video element uses block + w-full + h-full + object-contain
                    so it always fits inside the wrapper regardless of the
                    video's intrinsic dimensions */}
              <div
                className="relative w-full max-w-full rounded-2xl overflow-hidden border border-[#E5E7EB] bg-black min-w-0"
                style={{ aspectRatio: "16 / 9" }}
              >
                <video
                  src={property.videoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 block w-full h-full max-w-full object-contain"
                />
              </div>
            </div>
          )}
          {property.virtualTourUrl && (
            <div>
              <h2 className="font-serif text-xl text-[#0A1F44] mb-3">
                Virtual Tour
              </h2>
              <a
                href={property.virtualTourUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#0A1F44] hover:bg-[#1a3060] text-white text-sm font-semibold transition-colors"
              >
                Open Virtual Tour →
              </a>
            </div>
          )}
        </section>
      )}

      {/* Similar properties */}
      {similar.length > 0 && (
        <section className="bg-[#F9FAFB] py-12">
          <div className="container mx-auto px-4 lg:px-6">
            <h2 className="font-serif text-2xl text-[#0A1F44] mb-6">
              More in {property.community}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {similar.map((s, i) => {
                // Normalise DB row → Property shape expected by card
                const card = {
                  ...s,
                  images: parseJsonField<string[]>(s.images, []),
                  amenities: parseJsonField<string[]>(s.amenities, []),
                  features: parseJsonField<string[]>(s.features, []),
                };
                return <PropertyCard key={s.id} property={card} index={i} />;
              })}
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-[#E5E7EB] py-6 mt-12">
        <div className="container mx-auto px-4 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
          <span>© {new Date().getFullYear()} Royal Jubilant Real Estate LLC</span>
          <Link
            href="/"
            className="text-[#A68A3F] hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="size-3" /> Back to home
          </Link>
        </div>
      </footer>

      {/* Mobile sticky bottom contact bar — keeps agent contact one tap
          away without scrolling back up to the sidebar. Hidden on desktop
          (lg:hidden) where the sticky sidebar already does the job. */}
      {agent && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] shadow-[0_-4px_20px_rgba(10,31,68,0.08)]">
          <div className="container mx-auto px-4 py-2.5 flex items-center gap-2.5">
            {/* Compact agent identity (avatar + name) */}
            <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
              {agent.photo ? (
                <img
                  src={agent.photo}
                  alt={agent.name}
                  className="size-9 rounded-full object-cover ring-1 ring-[#C9A961]/30"
                />
              ) : (
                <div className="size-9 rounded-full bg-[#0A1F44] text-[#C9A961] flex items-center justify-center text-xs font-semibold ring-1 ring-[#C9A961]/30">
                  {(agent.name || "RJ")
                    .split(" ")
                    .slice(0, 2)
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block min-w-0">
                <p className="text-xs font-semibold text-[#0A1F44] truncate leading-tight">
                  {agent.name}
                </p>
                <p className="text-[10px] text-[#6B7280] truncate leading-tight">
                  {agent.title || "Property Consultant"}
                </p>
              </div>
            </div>

            {/* Compact contact buttons */}
            <div className="flex items-center gap-1.5 flex-1 justify-end">
              {agent.phone && (
                <a
                  href={`tel:${agent.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center justify-center gap-1 h-10 px-3 rounded-lg bg-[#0A1F44] text-white text-xs font-semibold transition-colors hover:bg-[#1a3060]"
                  title={`Call ${agent.name}`}
                >
                  <Phone className="size-3.5" />
                  <span className="hidden sm:inline">Call</span>
                </a>
              )}
              {whatsappEnquiryUrl && (
                <a
                  href={whatsappEnquiryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1 h-10 px-3 rounded-lg bg-[#25D366] hover:bg-[#1FB855] text-white text-xs font-semibold transition-colors"
                  title={`WhatsApp ${agent.name}`}
                >
                  <MessageCircle className="size-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              )}
              {agent.email && (
                <a
                  href={`mailto:${agent.email}`}
                  className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-white border border-[#0A1F44]/20 hover:border-[#C9A961] hover:bg-[#C9A961]/5 text-[#0A1F44] transition-colors"
                  title={`Email ${agent.name}`}
                >
                  <Mail className="size-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- small presentational helpers ----------------------------------

function Spec({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      {icon}
      <span className="text-base font-semibold text-[#0A1F44] leading-none">
        {value}
      </span>
      <span className="text-[11px] text-[#9CA3AF] uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#F4F5F7]">
      <dt className="text-[#6B7280]">{label}</dt>
      <dd className="font-medium text-[#0A1F44] text-right">{value}</dd>
    </div>
  );
}
