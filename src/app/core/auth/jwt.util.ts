interface JwtPayload {
  sub?: string;
  scope?: string;
  exp?: number;
  iat?: number;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

export function readUserIdFromAccessToken(token: string | null): string | null {
  if (!token) {
    return null;
  }

  return decodeJwtPayload(token)?.sub ?? null;
}
