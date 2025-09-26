import jwt from 'jsonwebtoken';

export type EmbedSession = {
  businessId: string;
  iat?: number;
  exp?: number;
};

// Whop signs and verifies embed tokens internally; app only decodes and validates payload
export function decodeEmbedToken(token: string): EmbedSession | null {
  try {
    const payload = jwt.decode(token) as EmbedSession | null;
    if (!payload || typeof payload.businessId !== 'string') return null;
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return { businessId: payload.businessId, iat: payload.iat, exp: payload.exp };
  } catch {
    return null;
  }
}
