import { createRemoteJWKSet, jwtVerify } from 'jose';

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

export function extractBearerToken(headers: Record<string, string | undefined> = {}): string | null {
  const authorization = headers.authorization || headers.Authorization;
  if (!authorization) return null;
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function verifyFirebaseUser(headers: Record<string, string | undefined>): Promise<string> {
  const token = extractBearerToken(headers);
  if (!token) throw new Error('AUTH_REQUIRED');
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error('AUTH_NOT_CONFIGURED');
  try {
    const { payload } = await jwtVerify(token, FIREBASE_JWKS, {
      algorithms: ['RS256'],
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId
    });
    if (!payload.sub) throw new Error('AUTH_INVALID_TOKEN');
    return payload.sub;
  } catch {
    throw new Error('AUTH_INVALID_TOKEN');
  }
}
