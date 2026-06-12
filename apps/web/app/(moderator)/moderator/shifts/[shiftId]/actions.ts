"use server";

import { requireModerator } from "@/lib/auth/guards";
import { refreshModeratorQrSession } from "@/lib/mock-store-server-moderator";

export async function refreshQr(shiftId: string): Promise<{
  token: string;
  expiresAt: string;
}> {
  const moderator = await requireModerator();
  const session = refreshModeratorQrSession(moderator, shiftId);
  return {
    token: session.token,
    expiresAt: session.expiresAt,
  };
}
