"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { ShiftLog } from "@/lib/types/student";

const STORAGE_KEY = "kora-hours-store-v1";

export function mergeHoursLogs(seed: ShiftLog[], overlays: ShiftLog[]): ShiftLog[] {
  const overlayIds = new Set(overlays.map((log) => log.id));
  const merged = [
    ...overlays,
    ...seed.filter((log) => !overlayIds.has(log.id)),
  ];
  return merged.sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
}

interface HoursState {
  clientLogs: ShiftLog[];
}

function getInitialState(): HoursState {
  return { clientLogs: [] };
}

function loadState(): HoursState {
  if (typeof window === "undefined") {
    return getInitialState();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getInitialState();
    }
    const parsed = JSON.parse(raw) as Partial<HoursState>;
    return {
      clientLogs: Array.isArray(parsed.clientLogs) ? parsed.clientLogs : [],
    };
  } catch {
    return getInitialState();
  }
}

function saveState(state: HoursState): void {
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

function getSnapshot(): HoursState {
  ensureHydrated();
  return state;
}

function getServerSnapshot(): HoursState {
  return serverSnapshot;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function persist(next: HoursState): void {
  state = next;
  saveState(next);
  emitChange();
}

export function useHoursStore() {
  const hoursState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const appendLog = useCallback((log: ShiftLog) => {
    const current = getSnapshot();
    if (current.clientLogs.some((l) => l.id === log.id)) {
      return;
    }
    persist({ ...current, clientLogs: [log, ...current.clientLogs] });
  }, []);

  const upsertLog = useCallback((log: ShiftLog) => {
    const current = getSnapshot();
    persist({
      ...current,
      clientLogs: [
        log,
        ...current.clientLogs.filter((item) => item.id !== log.id),
      ],
    });
  }, []);

  const replaceClientLogs = useCallback((logs: ShiftLog[]) => {
    persist({ ...getSnapshot(), clientLogs: logs });
  }, []);

  return {
    clientLogs: hoursState.clientLogs,
    appendLog,
    upsertLog,
    replaceClientLogs,
  };
}
