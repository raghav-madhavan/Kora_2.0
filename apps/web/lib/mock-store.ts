"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
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

const serverSnapshot = getInitialState();
let state = getInitialState();
const listeners = new Set<() => void>();
let hydrated = false;

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

function hydrateFromStorage(): void {
  if (hydrated || typeof window === "undefined") {
    return;
  }
  hydrated = true;
  state = loadState();
  emitChange();
}

function getSnapshot(): MockStoreState {
  return state;
}

function getServerSnapshot(): MockStoreState {
  return serverSnapshot;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function persist(next: MockStoreState): void {
  state = next;
  saveState(next);
  emitChange();
}

export function useMockStore() {
  useEffect(() => {
    hydrateFromStorage();
  }, []);

  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const commitToShift = useCallback((shiftId: string): boolean => {
    const snapshot = getSnapshot();
    if (snapshot.committedShiftIds.includes(shiftId)) {
      return false;
    }

    const spotsLeft = snapshot.shiftSpotsLeft[shiftId] ?? 0;
    if (spotsLeft <= 0) {
      return false;
    }

    persist({
      ...snapshot,
      committedShiftIds: [...snapshot.committedShiftIds, shiftId],
      shiftSpotsLeft: {
        ...snapshot.shiftSpotsLeft,
        [shiftId]: spotsLeft - 1,
      },
    });
    void syncCommittedShift(shiftId);
    return true;
  }, []);

  const isCommitted = useCallback(
    (shiftId: string): boolean =>
      getSnapshot().committedShiftIds.includes(shiftId),
    [],
  );

  const toggleSavedShift = useCallback((shiftId: string): boolean => {
    const snapshot = getSnapshot();
    const isSaved = snapshot.savedShiftIds.includes(shiftId);
    const savedShiftIds = isSaved
      ? snapshot.savedShiftIds.filter((id) => id !== shiftId)
      : [...snapshot.savedShiftIds, shiftId];

    persist({ ...snapshot, savedShiftIds });
    return !isSaved;
  }, []);

  const isSaved = useCallback(
    (shiftId: string): boolean =>
      getSnapshot().savedShiftIds.includes(shiftId),
    [],
  );

  const toggleFollowOrg = useCallback((orgId: string): boolean => {
    const snapshot = getSnapshot();
    const isFollowing = snapshot.followingOrgIds.includes(orgId);
    const followingOrgIds = isFollowing
      ? snapshot.followingOrgIds.filter((id) => id !== orgId)
      : [...snapshot.followingOrgIds, orgId];

    persist({ ...snapshot, followingOrgIds });
    return !isFollowing;
  }, []);

  const isFollowing = useCallback(
    (orgId: string): boolean =>
      getSnapshot().followingOrgIds.includes(orgId),
    [],
  );

  const getShifts = useCallback((): Shift[] => {
    const snapshot = getSnapshot();
    return seedShifts.map((shift) => ({
      ...shift,
      spotsLeft: snapshot.shiftSpotsLeft[shift.id] ?? shift.spotsLeft,
      saved: snapshot.savedShiftIds.includes(shift.id),
      committed: snapshot.committedShiftIds.includes(shift.id),
    }));
  }, []);

  const getCommittedShifts = useCallback((): Shift[] => {
    return getShifts().filter((shift) => shift.committed);
  }, [getShifts]);

  const getOrganizations = useCallback((): Organization[] => {
    const snapshot = getSnapshot();
    return seedOrganizations.map((org) => ({
      ...org,
      following: snapshot.followingOrgIds.includes(org.id),
    }));
  }, []);

  return useMemo(
    () => ({
      // Ties store identity to snapshot so list memos refresh after mutations.
      revision: current,
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
      current,
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
