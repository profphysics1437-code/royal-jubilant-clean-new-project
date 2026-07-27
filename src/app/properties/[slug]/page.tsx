import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LandingPageLeadForm } from "@/components/site/LandingPageLeadForm";
import { PropertyCard } from "@/components/site/PropertyCard";
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

  // Look up by slug OR id (legacy fallback)
  const p =
    (await db.property.findUnique({ where: { slug } }).catch(() => null)) ??
    (await db.property.findUnique({ where: { id: slug } }).catch(() => null));

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

  // Agent — either embedded from API join, or fall back to mock data
  const agent = (property as any).agent ?? getAgentById(property.agentId);

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

  return (
    <div className="min-h-screen bg-white">
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

      {/* Gallery */}
      <section className="container mx-auto px-4 lg:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3">
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#F4F5F7]">
            {images[0] ? (
              <img
                src={images[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#9CA3AF]">
                No image
              </div>
            )}
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-[#C9A961] text-[#0A1F44] text-[11px] font-semibold px-3 py-1 rounded-full tracking-wide">
              {statusLabel(property.status)}
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {images.slice(1, 3).map((img, i) => (
              <div
                key={i}
                className="relative aspect-[4/3] lg:aspect-[16/10] rounded-2xl overflow-hidden bg-[#F4F5F7]"
              >
                <img
                  src={img}
                  alt={`${property.title} ${i + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {images.length <= 1 && (
              <>
                <div className="aspect-[4/3] lg:aspect-[16/10] rounded-2xl bg-[#F4F5F7]" />
                <div className="aspect-[4/3] lg:aspect-[16/10] rounded-2xl bg-[#F4F5F7]" />
              </>
            )}
          </div>
        </div>

        {images.length > 3 && (
          <p className="text-xs text-[#9CA3AF] mt-2">
            + {images.length - 3} more image{images.length - 3 > 1 ? "s" : ""}{" "}
            available
          </p>
        )}
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

        {/* Right column — sticky sidebar */}
        <aside className="lg:sticky lg:top-20 self-start space-y-4">
          {agent && (
            <div className="border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] mb-2">
                Marketed By
              </p>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={agent.photo}
                  alt={agent.name}
                  className="size-12 rounded-full object-cover ring-1 ring-[#E5E7EB]"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-[#0A1F44] truncate">
                    {agent.name}
                  </p>
                  <p className="text-xs text-[#6B7280] truncate">
                    {agent.title}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {agent.phone && (
                  <a
                    href={`tel:${agent.phone.replace(/\s/g, "")}`}
                    className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg bg-[#0A1F44] text-white hover:bg-[#0A1F44]/90 transition-colors"
                    title={`Call ${agent.name}`}
                  >
                    <Phone className="size-4" />
                    <span className="text-[10px]">Call</span>
                  </a>
                )}
                {agent.whatsapp && (
                  <a
                    href={`https://wa.me/${agent.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                    title={`WhatsApp ${agent.name}`}
                  >
                    <MessageCircle className="size-4" />
                    <span className="text-[10px]">WhatsApp</span>
                  </a>
                )}
                {agent.email && (
                  <a
                    href={`mailto:${agent.email}`}
                    className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg bg-[#C9A961]/15 hover:bg-[#C9A961]/25 text-[#A68A3F] transition-colors"
                    title={`Email ${agent.name}`}
                  >
                    <Mail className="size-4" />
                    <span className="text-[10px]">Email</span>
                  </a>
                )}
              </div>
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
            <LandingPageLeadForm
              slug={`property-${property.reference}`}
            />
          </div>
        </aside>
      </section>

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
