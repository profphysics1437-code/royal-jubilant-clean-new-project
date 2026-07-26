export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    // Fetch counts safely - if a table doesn't exist, default to 0
    const safeCount = async (model: any) => {
      try {
        return await model.count();
      } catch {
        return 0;
      }
    };

    const safeAggregate = async (model: any, field: string) => {
      try {
        const result = await model.aggregate({ _sum: { [field]: true } });
        return (result as any)._sum?.[field] ?? 0;
      } catch {
        return 0;
      }
    };

    const [
      properties,
      agents,
      communities,
      developers,
      leads,
      valuations,
      mortgages,
      subscribers,
      blogPosts,
      testimonials,
      awards,
      newLeads,
      featuredProps,
      totalViews,
    ] = await Promise.all([
      safeCount(db.property),
      safeCount(db.agent),
      safeCount(db.community),
      safeCount(db.developer),
      safeCount(db.lead),
      safeCount(db.valuationRequest),
      safeCount(db.mortgageEnquiry),
      safeCount(db.newsletterSubscriber),
      safeCount(db.blogPost),
      safeCount(db.testimonial),
      safeCount(db.award),
      safeCount(db.lead).then(() => db.lead.count({ where: { status: "new" } }).catch(() => 0)),
      db.property.count({ where: { featured: true } }).catch(() => 0),
      safeAggregate(db.property, "views"),
    ]);

    return NextResponse.json({
      properties,
      agents,
      communities,
      developers,
      leads,
      valuations,
      mortgages,
      subscribers,
      blogPosts,
      testimonials,
      awards,
      newLeads,
      featuredProps,
      totalViews,
    });
  } catch (error: any) {
    console.error("[Admin Stats] Error:", error);
    return NextResponse.json({
      properties: 0,
      agents: 0,
      communities: 0,
      developers: 0,
      leads: 0,
      valuations: 0,
      mortgages: 0,
      subscribers: 0,
      blogPosts: 0,
      testimonials: 0,
      awards: 0,
      newLeads: 0,
      featuredProps: 0,
      totalViews: 0,
      error: error.message,
    }, { status: 200 }); // Return 200 with zeros so dashboard doesn't crash
  }
}
