import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return new Response(JSON.stringify({ error: "Missing businessId" }), { status: 400 });
  }

  const total = await prisma.member.count({ where: { businessId } });
  const active = await prisma.member.count({ where: { businessId, status: "valid" } });
  const canceled = await prisma.member.count({ where: { businessId, status: "canceled_at_period_end" } });
  const churned = await prisma.member.count({ where: { businessId, status: "invalid" } });

  return new Response(
    JSON.stringify({ total, active, canceled, churned }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
