import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");

    console.log(`[Recent Cancels API] Request for businessId: ${businessId}`);

    if (!businessId) {
      return new Response(JSON.stringify({ error: "Missing businessId" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Validate businessId format
    if (!/^[a-zA-Z0-9_-]+$/.test(businessId)) {
      return new Response(JSON.stringify({ error: "Invalid businessId format" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const recentCancels = await prisma.member.findMany({
      where: { 
        businessId,
        status: "canceled_at_period_end" 
      },
      select: {
        whopUserId: true,
        email: true,
        name: true,
        updatedAt: true,
        exitSurveyReason: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    console.log(`[Recent Cancels API] Found ${recentCancels.length} recent cancellations for ${businessId}`);

    return new Response(
      JSON.stringify({ recentCancels }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('[Recent Cancels API] Error:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
