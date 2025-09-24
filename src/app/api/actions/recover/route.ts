import { NextRequest, NextResponse } from 'next/server';
import { sendWhopMessage } from '@/lib/whop';

export async function POST(req: NextRequest) {
  try {
    const { memberId, businessId } = await req.json();
    if (!memberId || !businessId) {
      return NextResponse.json({ error: 'Missing memberId or businessId' }, { status: 400 });
    }

    const text = `Hey there! 💳\n\nLooks like a payment didn’t go through. You can update your billing to keep access active:\n\n🔗 https://whop.com/billing`;
    const ok = await sendWhopMessage(memberId, text);

    const ts = new Date().toISOString();
    return NextResponse.json({ success: ok, memberId, businessId, timestamp: ts });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to send recovery message' }, { status: 500 });
  }
}
