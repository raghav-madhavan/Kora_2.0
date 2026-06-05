"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { syncCommittedShift } from "@/app/(student)/scan/actions";
import {
  committedShifts as seedCommittedShifts,
  organizations as seedOrganizations,
  shifts as seedShifts,
} from "@/lib/mock-data";
import type { Organization, Shift } from "@/lib/types/student";

const STORAGE_KEY = "kora-mock-store-v1";

interface MockStoreState {
  committedShiftIds: string[];
  savedShiftIds: string[];
  followingOrgIds: string[];
  shiftSpotsLeft: Record<string, number>;
}

function getInitialState(): MockStoreState {
  const savedShiftIds = seedShifts.filter((s) => s.saved).map((s) => s.id);
  const followingOrgIds = seedOrganizations
    .filter((o) => o.following)
    .map((o) => o.id);
  const shiftSpotsLeft = Object.fromEntries(
    seedShifts.map((s) => [s.id, s.spotsLeft]),
  );

  return {
    committedShiftIds: [...seedCommittedShifts],
    savedShiftIds,
    followingOrgIds,
    shiftSpotsLeft,
  };
}

function loadState(): MockStoreState {
  if (typeof window === "undefined") {
    return getInitialState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getInitialState();
    }
    return JSON.parse(raw) as MockStoreState;
  } catch {
    return getInitialState();
  }
}

function saveState(state: MockStoreState): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useMockStore() {
  const [state, setState] = useState<MockStoreState>(getInitialState);

  useEffect(() => {
    setState(loadState());
  }, []);

  const persist = useCallback((next: MockStoreState) => {
    setState(next);
    saveState(next);
  }, []);

  const commitToShift = useCallback(
    (shiftId: string): boolean => {
      if (state.committedShiftIds.includes(shiftId)) {
        return false;
      }

      const spotsLeft = state.shiftSpotsLeft[shiftId] ?? 0;
      if (spotsLeft <= 0) {
        return false;
      }

      persist({
        ...state,
        committedShiftIds: [...state.committedShiftIds, shiftId],
        shiftSpotsLeft: {
          ...state.shiftSpotsLeft,
          [shiftId]: spotsLeft - 1,
        },
      });
      void syncCommittedShift(shiftId);
      return true;
    },
    [persist, state],
  );

  const isCommitted = useCallback(
    (shiftId: string): boolean => state.committedShiftIds.includes(shiftId),
    [state.committedShiftIds],
  );

  const toggleSavedShift = useCallback(
    (shiftId: string): boolean => {
      const isSaved = state.savedShiftIds.includes(shiftId);
      const savedShiftIds = isSaved
        ? state.savedShiftIds.filter((id) => id !== shiftId)
        : [...state.savedShiftIds, shiftId];

      persist({ ...state, savedShiftIds });
      return !isSaved;
    },
    [persist, state],
  );

  const isSaved = useCallback(
    (shiftId: string): boolean => state.savedShiftIds.includes(shiftId),
    [state.savedShiftIds],
  );

  const toggleFollowOrg = useCallback(
    (orgId: string): boolean => {
      const isFollowing = state.followingOrgIds.includes(orgId);
      const followingOrgIds = isFollowing
        ? state.followingOrgIds.filter((id) => id !== orgId)
        : [...state.followingOrgIds, orgId];

      persist({ ...state, followingOrgIds });
      return !isFollowing;
    },
    [persist, state],
  );

  const isFollowing = useCallback(
    (orgId: string): boolean => state.followingOrgIds.includes(orgId),
    [state.followingOrgIds],
  );

  const getShifts = useCallback((): Shift[] => {
    return seedShifts.map((shift) => ({
      ...shift,
      spotsLeft: state.shiftSpotsLeft[shift.id] ?? shift.spotsLeft,
      saved: state.savedShiftIds.includes(shift.id),
      committed: state.committedShiftIds.includes(shift.id),
    }));
  }, [state]);

  const getCommittedShifts = useCallback((): Shift[] => {
    return getShifts().filter((shift) => shift.committed);
  }, [getShifts]);

  const getOrganizations = useCallback((): Organization[] => {
    return seedOrganizations.map((org) => ({
      ...org,
      following: state.followingOrgIds.includes(org.id),
    }));
  }, [state.followingOrgIds]);

  return useMemo(
    () => ({
      commitToShift,
      isCommitted,
      toggleSavedShift,
      isSaved,
      toggleFollowOrg,
      isFollowing,
      getShifts,
      getCommittedShifts,
      getOrganizations,
    }),
    [
      commitToShift,
      isCommitted,
      toggleSavedShift,
      isSaved,
      toggleFollowOrg,
      isFollowing,
      getShifts,
      getCommittedShifts,
      getOrganizations,
    ],
  );
}
