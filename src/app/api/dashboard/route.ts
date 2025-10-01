import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");

    console.log(`[Dashboard API] Request received for businessId: ${businessId}`);

    if (!businessId) {
      console.warn('[Dashboard API] Missing businessId parameter');
      return new Response(JSON.stringify({ error: "Missing businessId" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Validate businessId format
    if (!/^[a-zA-Z0-9_-]+$/.test(businessId)) {
      console.warn(`[Dashboard API] Invalid businessId format: ${businessId}`);
      return new Response(JSON.stringify({ error: "Invalid businessId format" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const where = { businessId };

    const [total, active, canceled, churned] = await Promise.all([
      prisma.member.count({ where }),
      prisma.member.count({ where: { ...where, status: "valid" } }),
      prisma.member.count({ where: { ...where, status: "canceled_at_period_end" } }),
      prisma.member.count({ where: { ...where, status: "invalid" } }),
    ]);

    console.log(`[Dashboard API] Stats for ${businessId}:`, { total, active, canceled, churned });

    // If no data found, log it for debugging
    if (total === 0) {
      console.warn(`[Dashboard API] No members found for businessId: ${businessId}. Check if webhooks are configured and firing.`);
    }

    return new Response(
      JSON.stringify({ total, active, canceled, churned }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('[Dashboard API] Error:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}