import { NextRequest, NextResponse } from 'next/server';
import { verifyEmbedToken } from '@/lib/embed';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    const session = verifyEmbedToken(token);
    if (!session) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    return NextResponse.json({ ok: true, businessId: session.businessId });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to verify session' }, { status: 500 });
  }
}
