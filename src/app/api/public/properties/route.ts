export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
      ...(featured === "true" ? { featured: true } : {}),
      ...(latest === "true" ? { isLatest: true } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ properties });
}
