export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const settings = await db.siteSetting.findMany();
  const result: Record<string, string> = {};
  settings.forEach((s) => { result[s.key] = s.value; });
  return NextResponse.json(
    { settings: result },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}
