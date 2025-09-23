import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { memberId, businessId, reason, feedback } = await req.json();

    if (!memberId || !businessId || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update member with survey response
    await prisma.member.update({
      where: { whopUserId: memberId },
      data: {
        exitSurveyCompleted: true,
        exitSurveyReason: reason + (feedback ? ` - ${feedback}` : '')
      }
    });

    console.log(`📝 SURVEY COMPLETED: Member ${memberId} - Reason: ${reason}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Survey API error:', error);
    return NextResponse.json({ error: "Failed to submit survey" }, { status: 500 });
  }
}
