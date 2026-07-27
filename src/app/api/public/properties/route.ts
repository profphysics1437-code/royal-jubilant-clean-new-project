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

/**
 * Normalize agent data into a single, predictable shape for the frontend.
 *
 * The DB has two agent concepts:
 *   1. `User` (auth record, linked via Property.agentId) — has email,
 *      name, phone, avatarUrl.
 *   2. `Agent` (public profile record) — has the rich fields: title,
 *      photo, whatsapp, languages, specializations, etc.
 *
 * They are linked by email. If both exist, prefer the rich `Agent` record.
 * If only the User exists, use User fields with sensible defaults.
 * If neither exists, return null (the card handles this gracefully).
 */
function buildAgentPayload(
  userProfile: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
  } | null,
  agentProfile: {
    id: string;
    name: string;
    title: string;
    photo: string;
    phone: string;
    whatsapp: string;
    email: string;
  } | null
) {
  if (agentProfile) {
    return {
      id: agentProfile.id,
      name: agentProfile.name,
      title: agentProfile.title,
      photo: agentProfile.photo,
      phone: agentProfile.phone,
      whatsapp: agentProfile.whatsapp,
      email: agentProfile.email,
      source: "agent-profile" as const,
    };
  }
  if (userProfile) {
    return {
      id: userProfile.id,
      name: userProfile.name || "Royal Jubilant Advisor",
      title: "Property Consultant",
      photo: userProfile.avatarUrl || "",
      phone: userProfile.phone || "",
      whatsapp: "",
      email: userProfile.email,
      source: "user" as const,
    };
  }
  return null;
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

  // 1. Fetch properties + their assigned User (auth record)
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
  });

  // Filter out test/dummy records BEFORE enriching (saves a DB call for them)
  const publicProperties = properties.filter((p) => !isTestProperty(p));

  // 2. Look up rich Agent profiles by matching emails (single batched query)
  const agentEmails = Array.from(
    new Set(
      publicProperties
        .map((p) => p.agent?.email)
        .filter((e): e is string => !!e)
    )
  );

  const agentProfiles = agentEmails.length
    ? await db.agent.findMany({
        where: { email: { in: agentEmails }, published: true },
      })
    : [];

  const agentProfileMap = new Map(agentProfiles.map((a) => [a.email, a]));

  // 3. Enrich each property with normalized agent payload
  const parsedProperties = publicProperties.map((p) => {
    const userProfile = p.agent;
    const agentProfile = userProfile?.email
      ? agentProfileMap.get(userProfile.email) ?? null
      : null;

    return {
      ...p,
      // Detach the raw User relation — frontend should use the normalized
      // `agent` payload below to avoid touching inconsistent fields.
      agent: buildAgentPayload(userProfile, agentProfile),
      images: parseJsonField(p.images, []),
      amenities: parseJsonField(p.amenities, []),
      features: parseJsonField(p.features, []),
    };
  });

  return NextResponse.json({ properties: parsedProperties });
}
