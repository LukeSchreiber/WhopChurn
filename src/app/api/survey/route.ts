import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { memberId, businessId, reason, feedback } = await req.json();

    // Validate required fields
    if (!memberId || !businessId || !reason) {
      return NextResponse.json({ 
        error: "Missing required fields: memberId, businessId, and reason are required" 
      }, { status: 400 });
    }

    // Validate field formats
    if (typeof memberId !== 'string' || typeof businessId !== 'string' || typeof reason !== 'string') {
      return NextResponse.json({ 
        error: "Invalid field types: all fields must be strings" 
      }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(businessId)) {
      return NextResponse.json({ 
        error: "Invalid businessId format" 
      }, { status: 400 });
    }

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { whopUserId: memberId }
    });

    if (!existingMember) {
      return NextResponse.json({ 
        error: "Member not found" 
      }, { status: 404 });
    }

    if (existingMember.businessId !== businessId) {
      return NextResponse.json({ 
        error: "Member does not belong to this business" 
      }, { status: 403 });
    }

    // Update member with survey response
    await prisma.member.update({
      where: { whopUserId: memberId },
      data: {
        exitSurveyCompleted: true,
        exitSurveyReason: reason + (feedback ? ` - ${feedback}` : '')
      }
    });

    console.log(`📝 SURVEY COMPLETED: Member ${memberId} in business ${businessId} - Reason: ${reason}`);

    return NextResponse.json({ 
      success: true,
      message: "Survey submitted successfully"
    });

  } catch (error) {
    console.error('Survey API error:', error);
    return NextResponse.json({ 
      error: "Failed to submit survey" 
    }, { status: 500 });
  }
}
