export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const agents = await db.agent.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
  return NextResponse.json({ agents });
}
