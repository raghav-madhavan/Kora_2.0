import type { ShiftLog, User } from "@prisma/client";
import { prisma } from "../client";

type UnverifiedLog = ShiftLog & { user: User };

export interface FraudFlagGroup {
  hours: number;
  studentCount: number;
  studentIds: string[];
  shiftLogIds: string[];
  windowStart: Date;
  windowEnd: Date;
}

const FRAUD_WINDOW_MS = 10 * 60 * 1000;
const FRAUD_MIN_STUDENTS = 3;

export async function detectFraudFlagsForSchool(
  schoolId: string,
): Promise<FraudFlagGroup[]> {
  const unverifiedLogs = await prisma.shiftLog.findMany({
    where: {
      verifiedAt: null,
      user: { schoolId },
    },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  const flags: FraudFlagGroup[] = [];
  const processedLogIds = new Set<string>();

  for (let i = 0; i < unverifiedLogs.length; i++) {
    const anchor = unverifiedLogs[i];
    if (!anchor || processedLogIds.has(anchor.id)) continue;

    const windowEnd = new Date(anchor.createdAt.getTime() + FRAUD_WINDOW_MS);
    const cluster = unverifiedLogs.filter(
      (log: UnverifiedLog) =>
        log.hours === anchor.hours &&
        log.createdAt >= anchor.createdAt &&
        log.createdAt <= windowEnd,
    );

    const studentIds = [...new Set(cluster.map((log: UnverifiedLog) => log.userId))];
    if (studentIds.length >= FRAUD_MIN_STUDENTS) {
      const shiftLogIds = cluster.map((log: UnverifiedLog) => log.id);
      for (const id of shiftLogIds) {
        processedLogIds.add(id);
      }
      flags.push({
        hours: anchor.hours,
        studentCount: studentIds.length,
        studentIds,
        shiftLogIds,
        windowStart: anchor.createdAt,
        windowEnd: cluster[cluster.length - 1]?.createdAt ?? anchor.createdAt,
      });
    }
  }

  return flags;
}

export async function countFraudFlagsForSchool(schoolId: string) {
  const flags = await detectFraudFlagsForSchool(schoolId);
  return flags.length;
}
