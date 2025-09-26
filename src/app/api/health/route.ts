import { withCors } from '@/lib/cors';

async function handler() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Allow whop.com origins
export const GET = withCors(handler);
