export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Helper: safely parse JSON string fields
function parseJsonField(field: string | null | undefined, fallback: any = []) {
  if (!field) return fallback;
  try {
    return JSON.parse(field);
  } catch {
    return fallback;
  }
}

// GET: Public property listings
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const limit = Number(searchParams.get("limit") || 20);
  const featured = searchParams.get("featured");
  const latest = searchParams.get("latest");

  const properties = await db.property.findMany({
    where: {
      published: true,
      ...(status ? { status } : {}),
      ...(featured === "true" || featured === "1" ? { featured: true } : {}),
      ...(latest === "true" || latest === "1" ? { isLatest: true } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  // Parse JSON string fields for frontend
  const parsedProperties = properties.map((p) => ({
    ...p,
    images: parseJsonField(p.images, []),
    amenities: parseJsonField(p.amenities, []),
    features: parseJsonField(p.features, []),
  }));

  return NextResponse.json({ properties: parsedProperties });
}
