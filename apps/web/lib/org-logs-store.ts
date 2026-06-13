"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
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

/**
 * Server-wins overlay reconciliation. The server is the source of truth, but
 * an optimistic client decision must survive until the server catches up.
 *
 * Drop an overlay entry only when the server's copy carries a decision
 * (`decidedAt`) that is at least as new as the overlay's — i.e. the server has
 * caught up, or another moderator decided more recently. Overlay entries with
 * no server counterpart (e.g. a freshly scanned claim) are always kept.
 */
export function reconcileOverlay(
  serverLogs: OrgShiftLog[],
  overlays: OrgShiftLog[],
): OrgShiftLog[] {
  const serverById = new Map(serverLogs.map((log) => [log.id, log]));
  return overlays.filter((overlay) => {
    const server = serverById.get(overlay.id);
    if (!server) return true;
    if (!server.decidedAt) return true;
    if (!overlay.decidedAt) return false;
    return server.decidedAt < overlay.decidedAt;
  });
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

function hydrateFromStorage(): void {
  if (hydrated || typeof window === "undefined") {
    return;
  }
  hydrated = true;
  state = loadState();
  emitChange();
}

function getSnapshot(): OrgLogsState {
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
  useEffect(() => {
    hydrateFromStorage();
  }, []);

  const logsState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const upsertDecidedLogs = useCallback((incoming: OrgShiftLog[]) => {
    if (incoming.length === 0) return;
    const current = getSnapshot();
    const incomingIds = new Set(incoming.map((log) => log.id));
    persist({
      decidedLogs: [
        ...incoming,
        ...current.decidedLogs.filter((l) => !incomingIds.has(l.id)),
      ],
    });
  }, []);

  const upsertDecidedLog = useCallback(
    (log: OrgShiftLog) => upsertDecidedLogs([log]),
    [upsertDecidedLogs],
  );

  /** Prune overlay entries the server has caught up on (server wins). */
  const reconcileWithServer = useCallback((serverLogs: OrgShiftLog[]) => {
    const current = getSnapshot();
    const next = reconcileOverlay(serverLogs, current.decidedLogs);
    if (next.length !== current.decidedLogs.length) {
      persist({ decidedLogs: next });
    }
  }, []);

  return {
    decidedLogs: logsState.decidedLogs,
    upsertDecidedLog,
    upsertDecidedLogs,
    reconcileWithServer,
  };
}
