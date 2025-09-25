import jwt from 'jsonwebtoken';

export type EmbedSession = {
  businessId: string;
  iat?: number;
  exp?: number;
};

export function verifyEmbedToken(token: string): EmbedSession | null {
  const secret = process.env.APP_EMBED_SECRET;
  if (!secret) return null;
  try {
    const payload = jwt.verify(token, secret) as EmbedSession;
    if (!payload || typeof payload.businessId !== 'string') return null;
    return { businessId: payload.businessId };
  } catch {
    return null;
  }
}
