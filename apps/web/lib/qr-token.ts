import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_TTL_MS = 15 * 60 * 1000;

function getSecret(): string {
  return process.env.QR_HMAC_SECRET ?? "dev-secret";
}

/** Moderator-issued token bound to a shift session (not a student). */
export function generateShiftQrToken(
  shiftId: string,
  issuedAt: number = Date.now(),
): { token: string; expiresAt: Date; issuedAt: number } {
  const payload = `${shiftId}:${issuedAt}`;
  const sig = createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");

  return {
    token: `kora.v1.${sig}`,
    expiresAt: new Date(issuedAt + TOKEN_TTL_MS),
    issuedAt,
  };
}

export function verifyShiftQrToken(
  token: string,
  shiftId: string,
  issuedAt: number,
): boolean {
  if (!token.startsWith("kora.v1.")) {
    return false;
  }

  if (Date.now() > issuedAt + TOKEN_TTL_MS) {
    return false;
  }

  const payload = `${shiftId}:${issuedAt}`;
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
