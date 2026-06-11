import { prisma } from "../client";

export async function getShiftLogsForSchool(schoolId: string) {
  return prisma.shiftLog.findMany({
    where: { user: { schoolId } },
    include: {
      user: true,
      shift: { include: { org: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getShiftLogsForStudent(userId: string, schoolId: string) {
  return prisma.shiftLog.findMany({
    where: {
      userId,
      user: { schoolId },
    },
    include: {
      user: true,
      shift: { include: { org: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getVerifiedHoursTotalForSchool(schoolId: string) {
  const result = await prisma.shiftLog.aggregate({
    where: {
      user: { schoolId },
      verifiedAt: { not: null },
    },
    _sum: { hours: true },
  });
  return result._sum.hours ?? 0;
}

export async function getPendingHoursTotalForSchool(schoolId: string) {
  const result = await prisma.shiftLog.aggregate({
    where: {
      user: { schoolId },
      verifiedAt: null,
    },
    _sum: { hours: true },
  });
  return result._sum.hours ?? 0;
}
