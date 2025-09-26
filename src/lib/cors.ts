export function withCors(handler: Function) {
  return async (req: Request) => {
    const res = await handler(req);
    const origin = (req.headers.get('origin') || '').toLowerCase();
    const allowed = origin.endsWith('.whop.com') || origin === 'https://whop.com';
    const headers = new Headers(res.headers);
    if (allowed) {
      headers.set('Access-Control-Allow-Origin', origin);
      headers.set('Vary', 'Origin');
    }
    return new Response(await res.text(), { status: res.status, headers });
  };
}
