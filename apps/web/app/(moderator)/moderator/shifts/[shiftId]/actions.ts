"use server";

import { refreshModeratorQrSession } from "@/lib/mock-store-server-moderator";

export async function refreshQr(shiftId: string): Promise<{
  token: string;
  expiresAt: string;
}> {
  const session = refreshModeratorQrSession(shiftId);
  return {
    token: session.token,
    expiresAt: session.expiresAt,
  };
}
