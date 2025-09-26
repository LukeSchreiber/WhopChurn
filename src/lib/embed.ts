import jwt from 'jsonwebtoken';

export type EmbedSession = {
  businessId?: string;
  companyId?: string;
  iat?: number;
  exp?: number;
};

// Whop signs and verifies embed tokens internally; app only decodes and validates payload
export function decodeEmbedToken(token: string): { businessId: string; iat?: number; exp?: number } | null {
  try {
    const payload = jwt.decode(token) as EmbedSession | null;
    if (!payload) return null;
    const resolvedBusinessId = payload.businessId || payload.companyId;
    if (!resolvedBusinessId || typeof resolvedBusinessId !== 'string') return null;
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return { businessId: resolvedBusinessId, iat: payload.iat, exp: payload.exp };
  } catch {
    return null;
  }
}
