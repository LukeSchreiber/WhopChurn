import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return new Response(JSON.stringify({ error: "Missing businessId" }), { status: 400 });
  }

  const where = { businessId };

  const [total, active, canceled, churned] = await Promise.all([
    prisma.member.count({ where }),
    prisma.member.count({ where: { ...where, status: "valid" } }),
    prisma.member.count({ where: { ...where, status: "canceled_at_period_end" } }),
    prisma.member.count({ where: { ...where, status: "invalid" } }),
  ]);

  return new Response(
    JSON.stringify({ total, active, canceled, churned }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}