"use client";

import { createContext, useContext, useMemo } from "react";
import { mergeHoursLogs, useHoursStore } from "@/lib/hours-store";
import {
  getCategoryGaps,
  getProgressSnapshot,
  type ProgressSnapshot,
} from "@/lib/progress";
import type { CategoryKey, ShiftLog } from "@/lib/types/student";

interface HoursContextValue {
  logs: ShiftLog[];
  progress: ProgressSnapshot;
  categoryGaps: Partial<Record<CategoryKey, number>>;
  appendLog: (log: ShiftLog) => void;
  upsertLog: (log: ShiftLog) => void;
}

const HoursContext = createContext<HoursContextValue | null>(null);

export { HoursContext };

export function HoursProvider({
  initialLogs,
  children,
}: {
  initialLogs: ShiftLog[];
  children: React.ReactNode;
}) {
  const { clientLogs, appendLog, upsertLog } = useHoursStore();

  const logs = useMemo(
    () => mergeHoursLogs(initialLogs, clientLogs),
    [initialLogs, clientLogs],
  );

  const progress = useMemo(() => getProgressSnapshot(logs), [logs]);
  const categoryGaps = useMemo(() => getCategoryGaps(progress), [progress]);

  return (
    <HoursContext.Provider value={{ logs, progress, categoryGaps, appendLog, upsertLog }}>
      {children}
    </HoursContext.Provider>
  );
}

export function useHours(): HoursContextValue {
  const ctx = useContext(HoursContext);
  if (!ctx) {
    throw new Error("useHours must be used inside HoursProvider");
  }
  return ctx;
}

export function useHoursOptional(): HoursContextValue | null {
  return useContext(HoursContext);
}
