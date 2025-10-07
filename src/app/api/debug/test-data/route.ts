import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId } = body;

    if (!businessId) {
      return NextResponse.json(
        { error: "Missing businessId in request body" },
        { status: 400 }
      );
    }

    // Create test members for this business
    const testMembers = [
      {
        whopUserId: `test_user_1_${Date.now()}`,
        businessId,
        email: `test1@example.com`,
        name: "Test User 1",
        status: "valid",
        isAtRisk: false,
      },
      {
        whopUserId: `test_user_2_${Date.now()}`,
        businessId,
        email: `test2@example.com`,
        name: "Test User 2",
        status: "canceled_at_period_end",
        isAtRisk: true,
        riskReason: "Scheduled cancellation",
      },
      {
        whopUserId: `test_user_3_${Date.now()}`,
        businessId,
        email: `test3@example.com`,
        name: "Test User 3",
        status: "invalid",
        isAtRisk: true,
        riskReason: "Membership expired",
      },
    ];

    const created = await prisma.member.createMany({
      data: testMembers,
    });

    return NextResponse.json({
      success: true,
      message: `Created ${created.count} test members for business ${businessId}`,
      created: created.count,
    });

  } catch (error) {
    console.error('[Debug Test Data] Error:', error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json(
        { error: "Missing businessId parameter" },
        { status: 400 }
      );
    }

    // Delete test members for this business (only ones that start with test_user_)
    const deleted = await prisma.member.deleteMany({
      where: {
        businessId,
        whopUserId: {
          startsWith: "test_user_"
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${deleted.count} test members for business ${businessId}`,
      deleted: deleted.count,
    });

  } catch (error) {
    console.error('[Debug Test Data DELETE] Error:', error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

