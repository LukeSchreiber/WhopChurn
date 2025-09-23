import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return new Response(JSON.stringify({ error: "Missing businessId" }), { status: 400 });
  }

  const where = { businessId };

  const [total, active, canceled, churned, atRisk] = await Promise.all([
    prisma.member.count({ where }),
    prisma.member.count({ where: { ...where, status: "valid" } }),
    prisma.member.count({ where: { ...where, status: "canceled_at_period_end" } }),
    prisma.member.count({ where: { ...where, status: "invalid" } }),
    prisma.member.count({ where: { ...where, isAtRisk: true } }),
  ]);

  // Get at-risk members for alerts
  const atRiskMembers = await prisma.member.findMany({
    where: { ...where, isAtRisk: true },
    select: {
      whopUserId: true,
      email: true,
      name: true,
      riskReason: true,
      lastActiveAt: true,
    },
    take: 10,
  });

  // Get recent cancellations
  const recentCancellations = await prisma.member.findMany({
    where: { ...where, status: "canceled_at_period_end" },
    select: {
      whopUserId: true,
      email: true,
      name: true,
      exitSurveyReason: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  });

  // Get survey reason breakdown
  const surveyReasons = await prisma.member.groupBy({
    by: ['exitSurveyReason'],
    where: { 
      ...where, 
      exitSurveyCompleted: true,
      exitSurveyReason: { not: null }
    },
    _count: true,
  });

  return new Response(
    JSON.stringify({ 
      total, 
      active, 
      canceled, 
      churned, 
      atRisk,
      atRiskMembers,
      recentCancellations,
      surveyReasons
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}