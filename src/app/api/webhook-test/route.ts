import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Test endpoint to verify webhook connectivity and database access
 * GET /api/webhook-test - Returns webhook status and recent webhook activity
 */
export async function GET(req: NextRequest) {
  try {
    // Check database connectivity
    const memberCount = await prisma.member.count();
    const recentMembers = await prisma.member.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        whopUserId: true,
        businessId: true,
        status: true,
        createdAt: true,
      }
    });

    // Get business breakdown
    const businesses = await prisma.member.groupBy({
      by: ['businessId'],
      _count: {
        businessId: true
      }
    });

    return NextResponse.json({
      status: "healthy",
      database: {
        connected: true,
        totalMembers: memberCount,
        businesses: businesses.map(b => ({
          businessId: b.businessId,
          memberCount: b._count.businessId
        })),
        recentMembers
      },
      webhook: {
        url: `${process.env.VERCEL_URL || 'localhost:3000'}/api/webhooks/whop`,
        secretConfigured: !!process.env.WEBHOOK_SECRET,
      },
      message: memberCount === 0 
        ? "No members in database yet. Make sure webhooks are configured in Whop dashboard."
        : `Database has ${memberCount} members across ${businesses.length} business(es).`
    });

  } catch (error) {
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : 'Unknown error',
      message: "Database connection failed or other error occurred"
    }, { status: 500 });
  }
}

/**
 * POST /api/webhook-test - Create test member data for a business
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, action } = body;

    if (!businessId) {
      return NextResponse.json(
        { error: "Missing businessId in request body" },
        { status: 400 }
      );
    }

    if (action === "clear") {
      // Clear test data
      const deleted = await prisma.member.deleteMany({
        where: {
          businessId,
          whopUserId: { startsWith: "test_" }
        }
      });
      return NextResponse.json({
        success: true,
        message: `Cleared ${deleted.count} test members`,
        deleted: deleted.count
      });
    }

    // Create test members
    const timestamp = Date.now();
    const testMembers = [
      {
        whopUserId: `test_active_${timestamp}`,
        businessId,
        email: `active${timestamp}@test.local`,
        name: "Test Active User",
        status: "valid",
        isAtRisk: false,
        lastActiveAt: new Date(),
      },
      {
        whopUserId: `test_canceled_${timestamp}`,
        businessId,
        email: `canceled${timestamp}@test.local`,
        name: "Test Canceled User",
        status: "canceled_at_period_end",
        isAtRisk: true,
        riskReason: "Scheduled cancellation",
      },
      {
        whopUserId: `test_expired_${timestamp}`,
        businessId,
        email: `expired${timestamp}@test.local`,
        name: "Test Expired User",
        status: "invalid",
        isAtRisk: true,
        riskReason: "Membership expired",
      },
    ];

    await prisma.member.createMany({
      data: testMembers,
    });

    return NextResponse.json({
      success: true,
      message: `Created 3 test members for business ${businessId}`,
      testMembers: testMembers.map(m => ({
        whopUserId: m.whopUserId,
        status: m.status,
        isAtRisk: m.isAtRisk
      }))
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: "Failed to create test data", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

