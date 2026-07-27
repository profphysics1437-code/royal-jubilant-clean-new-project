export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/public/locations
 *
 * Public endpoint that returns ALL published locations from the database.
 * This is the SINGLE SOURCE OF TRUTH for the location/community dropdown
 * used by:
 *   - Agent Portal → New Listing form
 *   - Agent Portal → Edit Listing form
 *   - Public site  → Property list view location filter
 *
 * Admin Portal uses /api/admin/locations (admin-guarded) which returns
 * the same DB rows plus unpublished ones (for admin management). Both
 * routes hit the same `Location` table — no hardcoded arrays, no separate
 * datasets, no stale seed data.
 *
 * Query params:
 *   - emirate=<name>  → filter by emirate (e.g. ?emirate=Dubai)
 *   - published=true  → explicitly published only (default behaviour)
 *
 * Response shape:
 *   { locations: [{ id, name, emirate, country, published }, ...] }
 *
 * The `name` field is what frontend dropdowns use as both the value and
 * the label (matches the legacy `DUBAI_COMMUNITIES` array shape).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const emirate = searchParams.get("emirate");

  const where: any = { published: true };
  if (emirate) where.emirate = emirate;

  const items = await db.location.findMany({
    where,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      emirate: true,
      country: true,
      published: true,
    },
  });

  return NextResponse.json({ locations: items });
}
