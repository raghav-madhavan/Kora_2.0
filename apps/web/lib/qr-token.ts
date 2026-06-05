import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_TTL_MS = 15 * 60 * 1000;

function getSecret(): string {
  return process.env.QR_HMAC_SECRET ?? "dev-secret";
}

export function generateQrToken(
  shiftLogId: string,
  userId: string,
): { token: string; expiresAt: Date; issuedAt: number } {
  const issuedAt = Date.now();
  const payload = `${shiftLogId}:${userId}:${issuedAt}`;
  const sig = createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");

  return {
    token: `kora.v1.${sig}`,
    expiresAt: new Date(issuedAt + TOKEN_TTL_MS),
    issuedAt,
  };
}

export function verifyQrToken(
  token: string,
  shiftLogId: string,
  userId: string,
  issuedAt: number,
): boolean {
  if (!token.startsWith("kora.v1.")) {
    return false;
  }

  if (Date.now() > issuedAt + TOKEN_TTL_MS) {
    return false;
  }

  const payload = `${shiftLogId}:${userId}:${issuedAt}`;
  const expected = createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
  const actual = token.slice("kora.v1.".length);

  try {
    const expectedBuf = Buffer.from(expected);
    const actualBuf = Buffer.from(actual);
    if (expectedBuf.length !== actualBuf.length) {
      return false;
    }
    return timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
}
