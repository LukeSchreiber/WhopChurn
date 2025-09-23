import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { sendWhopMessage } from "@/lib/whop";

const prisma = new PrismaClient();

type WhopEvent =
  | "membership_went_valid"
  | "membership_went_invalid"
  | "membership_cancel_at_period_end_changed"
  | "payment_failed";

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
  // signature verification happens before this code (already implemented)
  const raw = await req.text();
  const v = await verifyWhop(req, raw);
  if (!v.ok) return new Response("invalid signature", { status: 401 });

  const payload = JSON.parse(raw);
  const event: WhopEvent = payload?.type;
  const eventId: string | undefined = payload?.id ?? payload?.event_id;

  // Optional dedupe (keep if schema has lastEventId)
  if (eventId) {
    const dupe = await prisma.member.findFirst({ where: { lastEventId: eventId } });
    if (dupe) return new Response("ok (duplicate)", { status: 200 });
  }

  // Required identifiers
  const whopUserId = String(
    payload?.data?.membership?.id ??
    payload?.data?.user?.id ??
    payload?.data?.id
  );
  if (!whopUserId) return new Response("missing whopUserId", { status: 400 });

  // BUSINESS-CENTRIC: Treat product/plan id as businessId for MVP
  const businessId =
    payload?.data?.product?.id ??
    payload?.data?.plan?.id ??
    "unknown_business";

  // Other optional fields
  const email = payload?.data?.user?.email ?? payload?.data?.customer?.email ?? null;
  const name = payload?.data?.user?.name ?? null;
  const productId = payload?.data?.product?.id ?? payload?.data?.plan?.id ?? null;
  const planName = payload?.data?.product?.name ?? payload?.data?.plan?.name ?? null;

  let status = "invalid";
  if (event === "membership_went_valid") status = "valid";
  if (event === "membership_went_invalid") status = "invalid";
  if (event === "membership_cancel_at_period_end_changed") status = "canceled_at_period_end";

  // CHURN DETECTION LOGIC
  const now = new Date();
  const isActive = status === "valid";
  const isAtRisk = status === "canceled_at_period_end" || status === "invalid";
  const riskReason = status === "canceled_at_period_end" ? "Scheduled cancellation" : 
                     status === "invalid" ? "Membership expired" : null;

  const member = await prisma.member.upsert({
    where: { whopUserId },
    create: {
      whopUserId,
      businessId,     // attach to the business
      email,
      name,
      status,
      productId,
      planName,
      lastEventId: eventId ?? undefined,
      lastActiveAt: isActive ? now : undefined,
      isAtRisk,
      riskReason,
    },
    update: {
      businessId,     // keep it in sync
      email,
      name,
      status,
      productId,
      planName,
      lastEventId: eventId ?? undefined,
      lastActiveAt: isActive ? now : undefined,
      isAtRisk,
      riskReason,
    },
  });

  // CHURN REDUCTION FEATURES
  
  // 1. CANCEL RESCUE: Send message when member schedules cancellation
  if (event === "membership_cancel_at_period_end_changed" && !member.cancelRescueSent) {
    const rescueMessage = `Hey ${name || 'there'}! 👋

We noticed you've scheduled to cancel your subscription. We'd hate to see you go! 

Is there anything we can do to keep you? We're here to help make this work for you.

💡 Need a discount? Have questions? Just reply to this message!

We'd love to keep you as part of our community. ❤️`;

    const messageSent = await sendWhopMessage(whopUserId, rescueMessage);
    if (messageSent) {
      await prisma.member.update({
        where: { whopUserId },
        data: { cancelRescueSent: true }
      });
      console.log(`🎯 CANCEL RESCUE: Sent rescue message to ${whopUserId}`);
    }
  }

  // 2. PAYMENT RECOVERY: Send message when payment fails
  if (event === "payment_failed" && !member.paymentRecoverySent) {
    const recoveryMessage = `Hey ${name || 'there'}! 💳

Your recent payment didn't go through, but don't worry - we've got you covered!

To keep your access active, please update your payment method:
🔗 Update Payment: https://whop.com/billing

Need help? Just reply to this message and we'll sort it out together!`;

    const messageSent = await sendWhopMessage(whopUserId, recoveryMessage);
    if (messageSent) {
      await prisma.member.update({
        where: { whopUserId },
        data: { paymentRecoverySent: true }
      });
      console.log(`💳 PAYMENT RECOVERY: Sent recovery message to ${whopUserId}`);
    }
  }

  // 3. EXIT SURVEY: Send survey link when member actually cancels
  if (event === "membership_went_invalid" && !member.exitSurveyCompleted) {
    const surveyUrl = `https://${process.env.VERCEL_URL || 'localhost:3000'}/survey?memberId=${whopUserId}&businessId=${businessId}`;
    const surveyMessage = `Hey ${name || 'there'}! 📝

We're sorry to see you go. Your feedback would mean the world to us!

Could you take 30 seconds to tell us why you're leaving? This helps us improve for everyone:

🔗 Quick Survey: ${surveyUrl}

Thank you for being part of our community! 🙏`;

    const messageSent = await sendWhopMessage(whopUserId, surveyMessage);
    if (messageSent) {
      console.log(`📝 EXIT SURVEY: Sent survey link to ${whopUserId}`);
    }
  }

  // TRIGGER RETENTION EMAIL FOR AT-RISK MEMBERS
  if (isAtRisk && email && riskReason) {
    console.log(`🚨 CHURN ALERT: Member ${whopUserId} is at risk - ${riskReason}`);
  }

  return new Response("ok", { status: 200 });
}