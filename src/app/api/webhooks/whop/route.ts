import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

function parseSig(h: string | null) {
  if (!h) return null;
  const parts = Object.fromEntries(
    h.split(",").map(kv => {
      const [k, v] = kv.split("=");
      return [k?.trim(), v?.trim()];
    })
  );
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return null;
  return { t, v1: v1.toLowerCase() };
}

function hmacHex(secret: string, msg: string) {
  return crypto.createHmac("sha256", secret).update(msg, "utf8").digest("hex");
}

function tSafeEqHex(a: string, b: string) {
  const A = Buffer.from(a, "hex");
  const B = Buffer.from(b, "hex");
  if (A.length !== B.length) return false;
  return crypto.timingSafeEqual(A, B);
}

async function verifyWhop(req: NextRequest, rawBody: string) {
  const secret = process.env.WEBHOOK_SECRET || "";
  if (!secret) return { ok: false, reason: "no-secret" };

  // header name from Whop logs
  const sigHeader = req.headers.get("x-whop-signature") ?? req.headers.get("X-Whop-Signature");
  const parsed = parseSig(sigHeader);
  if (!parsed) return { ok: false, reason: "no-header" };

  const candidateTs = hmacHex(secret, `${parsed.t}.${rawBody}`).toLowerCase();
  const candidateRaw = hmacHex(secret, rawBody).toLowerCase();
  const got = parsed.v1;

  const matchTs = tSafeEqHex(candidateTs, got);
  const matchRaw = tSafeEqHex(candidateRaw, got);

  if (matchTs || matchRaw) {
    console.log(`[whop] sig OK (${matchTs ? "ts" : "raw"}) v1=${got.slice(0,12)} exp=${(matchTs?candidateTs:candidateRaw).slice(0,12)}`);
    return { ok: true };
  }

  console.warn(`[whop] sig FAIL v1=${got.slice(0,12)} tsExp=${candidateTs.slice(0,12)} rawExp=${candidateRaw.slice(0,12)}`);
  return { ok: false, reason: "mismatch" };
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // 1) raw body
  const raw = await req.text();

  // 2) verify
  const v = await verifyWhop(req, raw);
  if (!v.ok) return NextResponse.json({ error: "invalid signature" }, { status: 401 });

  // 3) parse AFTER verify
  let payload: any;
  try { payload = JSON.parse(raw); }
  catch { return NextResponse.json({ error: "invalid json" }, { status: 400 }); }

  const action = payload?.action ?? null;
  const d = payload?.data ?? {};
  const whopId = String(d?.id ?? "");
  const status = d?.status ?? null;
  const plan   = d?.plan_id ?? null;

  if (whopId) {
    await prisma.member.upsert({
      where: { whopId },
      create: { whopId, status, plan },
      update: { status: status ?? undefined, plan: plan ?? undefined },
    });
    const lower = String(action ?? "").toLowerCase();
    if (lower.includes("invalid") || lower.includes("churn")) {
      await prisma.member.update({ where: { whopId }, data: { riskFlag: true } });
    }
  }

  return NextResponse.json({ ok: true });
}