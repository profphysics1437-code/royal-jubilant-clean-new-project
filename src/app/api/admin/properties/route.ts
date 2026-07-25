export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

// GET: List all properties for admin
export async function GET(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const properties = await db.property.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ properties });
}

// POST: Create new property
export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  
  if (!body.reference || !body.title || !body.status || !body.type || !body.price || !body.community) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const property = await db.property.create({
    data: {
      reference: body.reference,
      title: body.title,
      slug: body.slug || body.reference.toLowerCase(),
      status: body.status,
      type: body.type,
      category: body.category || null,
      community: body.community,
      subCommunity: body.subCommunity || null,
      price: Number(body.price),
      pricePerSqft: body.pricePerSqft ? Number(body.pricePerSqft) : null,
      rentFrequency: body.rentFrequency || null,
      bedrooms: Number(body.bedrooms) || 0,
      bathrooms: Number(body.bathrooms) || 0,
      area: Number(body.area) || 0,
      parking: Number(body.parking) || 0,
      furnished: Boolean(body.furnished),
      description: body.description || "",
      images: JSON.stringify(body.images || []),
      amenities: JSON.stringify(body.amenities || []),
      features: JSON.stringify(body.features || []),
      reraNumber: body.reraNumber || null,
      developer: body.developer || null,
      completionStatus: body.completionStatus || null,
      locationAddress: body.locationAddress || null,
      locationLat: body.locationLat ? Number(body.locationLat) : null,
      locationLng: body.locationLng ? Number(body.locationLng) : null,
      featured: Boolean(body.featured),
      isLatest: Boolean(body.isLatest),
      isLuxury: Boolean(body.isLuxury),
      published: body.published !== false,
      agentId: body.agentId || null,
    },
  });

  return NextResponse.json({ property });
}
