import { NextRequest, NextResponse } from 'next/server';
import { sendWhopMessage } from '@/lib/whop';

export async function POST(req: NextRequest) {
  try {
    const { memberId, businessId, message } = await req.json();
    if (!memberId || !businessId) {
      return NextResponse.json({ error: 'Missing memberId or businessId' }, { status: 400 });
    }

    const text = message || `Hey there! 👋\n\nWe noticed some changes on your account. If we can help or offer a better plan, just reply and we’ll take care of you. 💙`;
    const ok = await sendWhopMessage(memberId, text);

    const ts = new Date().toISOString();
    return NextResponse.json({ success: ok, memberId, businessId, timestamp: ts });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
