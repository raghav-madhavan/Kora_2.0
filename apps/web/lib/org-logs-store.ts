"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { OrgShiftLog } from "@/lib/types/moderator";

const STORAGE_KEY = "kora-org-logs-store-v1";

/** Decided logs overlay the server seed so approvals survive a restart. */
export function mergeOrgLogs(
  seed: OrgShiftLog[],
  overlays: OrgShiftLog[],
): OrgShiftLog[] {
  const overlayById = new Map(overlays.map((log) => [log.id, log]));
  return seed
    .map((log) => overlayById.get(log.id) ?? log)
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );
}

interface OrgLogsState {
  decidedLogs: OrgShiftLog[];
}

function getInitialState(): OrgLogsState {
  return { decidedLogs: [] };
}

function loadState(): OrgLogsState {
  if (typeof window === "undefined") {
    return getInitialState();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getInitialState();
    }
    const parsed = JSON.parse(raw) as Partial<OrgLogsState>;
    return {
      decidedLogs: Array.isArray(parsed.decidedLogs) ? parsed.decidedLogs : [],
    };
  } catch {
    return getInitialState();
  }
}

function saveState(state: OrgLogsState): void {
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

function ensureHydrated(): void {
  if (hydrated || typeof window === "undefined") {
    return;
  }
  state = loadState();
  hydrated = true;
}

function getSnapshot(): OrgLogsState {
  ensureHydrated();
  return state;
}

function getServerSnapshot(): OrgLogsState {
  return serverSnapshot;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function persist(next: OrgLogsState): void {
  state = next;
  saveState(next);
  emitChange();
}

export function useOrgLogsStore() {
  const logsState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const upsertDecidedLog = useCallback((log: OrgShiftLog) => {
    const current = getSnapshot();
    persist({
      decidedLogs: [
        log,
        ...current.decidedLogs.filter((l) => l.id !== log.id),
      ],
    });
  }, []);

  return {
    decidedLogs: logsState.decidedLogs,
    upsertDecidedLog,
  };
}
