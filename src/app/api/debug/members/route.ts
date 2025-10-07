import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Get all members grouped by businessId
    const allMembers = await prisma.member.findMany({
      select: {
        id: true,
        whopUserId: true,
        businessId: true,
        email: true,
        name: true,
        status: true,
        isAtRisk: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Group by businessId
    const grouped = allMembers.reduce((acc, member) => {
      if (!acc[member.businessId]) {
        acc[member.businessId] = [];
      }
      acc[member.businessId].push(member);
      return acc;
    }, {} as Record<string, typeof allMembers>);

    const summary = Object.entries(grouped).map(([businessId, members]) => ({
      businessId,
      count: members.length,
      active: members.filter(m => m.status === 'valid').length,
      canceled: members.filter(m => m.status === 'canceled_at_period_end').length,
      invalid: members.filter(m => m.status === 'invalid').length,
      atRisk: members.filter(m => m.isAtRisk).length,
    }));

    return NextResponse.json({
      totalMembers: allMembers.length,
      businessCount: Object.keys(grouped).length,
      summary,
      recentMembers: allMembers.slice(0, 10),
    });

  } catch (error) {
    console.error('[Debug Members] Error:', error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

