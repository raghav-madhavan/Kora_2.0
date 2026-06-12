"use client";

import { useMemo } from "react";
import {
  getHighestUnlockedHat,
  isHatUnlocked,
  normalizeAvatarConfig,
} from "@/lib/avatar";
import { useProfileStore } from "@/lib/mock-profile-store";
import { useHoursOptional } from "@/components/student/hours-provider";
import type { AvatarConfig } from "@/lib/types/student";

export function useStudentAvatar(): AvatarConfig {
  const { avatar } = useProfileStore();
  const hoursCtx = useHoursOptional();
  const verifiedHours = hoursCtx?.progress.verifiedHours ?? 0;
  const normalized = normalizeAvatarConfig(avatar);

  return useMemo(() => {
    if (isHatUnlocked(normalized.hat, verifiedHours)) {
      return normalized;
    }
    return { ...normalized, hat: getHighestUnlockedHat(verifiedHours) };
  }, [normalized, verifiedHours]);
}
