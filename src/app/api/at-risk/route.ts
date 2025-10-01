import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');
    const limit = Number(searchParams.get('limit') || '10');

    console.log(`[At-Risk API] Request for businessId: ${businessId}`);

    if (!businessId) {
      return new Response(JSON.stringify({ error: 'Missing businessId' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(businessId)) {
      return new Response(JSON.stringify({ error: 'Invalid businessId format' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const atRiskMembers = await prisma.member.findMany({
      where: {
        businessId,
        OR: [
          { status: 'canceled_at_period_end' },
          { status: 'invalid' }
        ],
      },
      select: {
        whopUserId: true,
        email: true,
        name: true,
        riskReason: true,
        lastActiveAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 50),
    });

    console.log(`[At-Risk API] Found ${atRiskMembers.length} at-risk members for ${businessId}`);

    return new Response(JSON.stringify({ atRiskMembers }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('[At-Risk API] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
