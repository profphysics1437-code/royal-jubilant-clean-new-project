export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Allow lookup by id, slug, or reference (admin UIs and old links may use
  // any of these as the URL segment).
  const p =
    (await db.property.findUnique({ where: { id } }).catch(() => null)) ??
    (await db.property
      .findUnique({ where: { slug: id } })
      .catch(() => null)) ??
    (await db.property
      .findUnique({ where: { reference: id } })
      .catch(() => null));

  if (!p) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Block test/dummy records from being viewed on the public site even if
  // someone has a direct link.
  const isTest =
    /^test\s+property/i.test(p.title ?? "") ||
    /fixed\s+submission/i.test(p.title ?? "") ||
    /^RENT-TEST-/i.test(p.reraNumber ?? "") ||
    /^SALE-TEST-/i.test(p.reraNumber ?? "");
  if (isTest) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Increment views (fire-and-forget)
  db.property
    .update({ where: { id: p.id }, data: { views: { increment: 1 } } })
    .catch(() => {});

  return NextResponse.json({
    property: {
      id: p.id,
      slug: p.slug ?? p.reference,
      reference: p.reference,
      title: p.title,
      status: p.status,
      type: p.type,
      price: p.price,
      pricePerSqft: p.pricePerSqft ?? undefined,
      rentFrequency: p.rentFrequency ?? undefined,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      area: p.area,
      areaUnit: p.areaUnit ?? "sqft",
      plotSize: p.plotSize ?? undefined,
      parking: p.parking,
      community: p.community,
      subCommunity: p.subCommunity ?? undefined,
      developer: p.developer ?? undefined,
      country: p.country ?? undefined,
      emirate: p.emirate ?? undefined,
      furnishingStatus: p.furnishingStatus ?? undefined,
      completionStatus: p.completionStatus ?? undefined,
      handoverYear: p.completionDate ?? undefined,
      floorNumber: p.floorNumber ?? undefined,
      totalFloors: p.totalFloors ?? undefined,
      reraNumber: p.reraNumber ?? undefined,
      amenities: p.amenities ? JSON.parse(p.amenities) : [],
      indoorFeatures: p.indoorFeatures ? JSON.parse(p.indoorFeatures) : [],
      outdoorFeatures: p.outdoorFeatures ? JSON.parse(p.outdoorFeatures) : [],
      buildingAmenities: p.buildingAmenities
        ? JSON.parse(p.buildingAmenities)
        : [],
      nearbyLandmarks: p.nearbyLandmarks
        ? JSON.parse(p.nearbyLandmarks)
        : [],
      viewFeatures: p.viewFeatures ? JSON.parse(p.viewFeatures) : [],
      features: p.features ? JSON.parse(p.features) : [],
      images: p.images ? JSON.parse(p.images) : [],
      floorPlanUrl: p.floorPlanUrl ?? undefined,
      videoUrl: p.videoUrl ?? undefined,
      virtualTourUrl: p.virtualTourUrl ?? undefined,
      description: p.description,
      paymentPlan: p.paymentPlan ? JSON.parse(p.paymentPlan) : undefined,
      location: {
        lat: p.locationLat ?? 25.2048,
        lng: p.locationLng ?? 55.2708,
        address: p.locationAddress ?? p.community,
      },
      agentId: p.agentId ?? undefined,
      developer_id: p.developer ?? undefined,
      featured: p.featured,
      isLatest: p.isLatest,
      isLuxury: p.isLuxury,
      exclusiveListing: p.exclusiveListing,
      views: p.views,
      createdAt: p.createdAt.toISOString(),
    },
  });
}
