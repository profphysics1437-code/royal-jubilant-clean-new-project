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

/**
 * Pattern matchers used to filter out dummy / test / seed records from
 * production public endpoints. Records are filtered if EITHER:
 *   - their `title` matches a known test-property pattern
 *   - their `reraNumber` matches a known test RERA pattern
 *
 * This keeps admin able to see every record (admin endpoints do NOT filter),
 * while public visitors never see test data.
 */
const TEST_TITLE_PATTERNS: RegExp[] = [
  /^test\s+property/i,
  /^test\s+-/i,
  /fixed\s+submission/i,
  /\bdummy\b/i,
  /\bseed\b/i,
  /^sample\s+/i,
];

const TEST_RERA_PATTERNS: RegExp[] = [
  /^RENT-TEST-/i,
  /^SALE-TEST-/i,
  /^TEST-/i,
  /^DUMMY-/i,
];

function isTestProperty(p: {
  title: string | null;
  reraNumber: string | null | undefined;
}): boolean {
  const title = p.title ?? "";
  if (TEST_TITLE_PATTERNS.some((re) => re.test(title))) return true;
  const rera = p.reraNumber ?? "";
  if (rera && TEST_RERA_PATTERNS.some((re) => re.test(rera))) return true;
  return false;
}

// GET: Public property listings
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const limit = Number(searchParams.get("limit") || 20);
  const featured = searchParams.get("featured");
  const latest = searchParams.get("latest");
  const luxury = searchParams.get("luxury");

  // `limit=0` means "no limit" — fetch everything (used by the homepage list
  // views that paginate client-side). Prisma interprets `take: undefined` as
  // no limit, so coerce 0 → undefined.
  const take = limit > 0 ? limit : undefined;

  const properties = await db.property.findMany({
    where: {
      published: true,
      ...(status ? { status } : {}),
      ...(featured === "true" || featured === "1" ? { featured: true } : {}),
      ...(latest === "true" || latest === "1" ? { isLatest: true } : {}),
      ...(luxury === "true" || luxury === "1" ? { isLuxury: true } : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
  });

  // Filter out test/dummy records (defence in depth — admin may have left
  // some seed data in the DB; we never want it to leak to the public site).
  const publicProperties = properties.filter((p) => !isTestProperty(p));

  // Parse JSON string fields for frontend
  const parsedProperties = publicProperties.map((p) => ({
    ...p,
    images: parseJsonField(p.images, []),
    amenities: parseJsonField(p.amenities, []),
    features: parseJsonField(p.features, []),
  }));

  return NextResponse.json({ properties: parsedProperties });
}
