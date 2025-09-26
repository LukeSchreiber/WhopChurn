import { NextRequest, NextResponse } from 'next/server';
import { decodeEmbedToken } from '@/lib/embed';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    // Whop signs and verifies embed tokens internally; app only decodes and validates payload
    const session = decodeEmbedToken(token);
    if (!session || !session.businessId) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    return NextResponse.json({ ok: true, businessId: session.businessId });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to verify session' }, { status: 500 });
  }
}
