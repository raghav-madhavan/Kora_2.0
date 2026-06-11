import { prisma } from "../client";

export async function getSchoolById(schoolId: string) {
  return prisma.school.findUnique({
    where: { id: schoolId },
  });
}

export async function getStudentCountForSchool(schoolId: string) {
  return prisma.user.count({
    where: { schoolId, role: "STUDENT" },
  });
}

export async function getOrgCountForSchool(schoolId: string) {
  return prisma.organization.count({
    where: { schoolId },
  });
}

export async function getStudentsForSchool(schoolId: string, search?: string) {
  return prisma.user.findMany({
    where: {
      schoolId,
      role: "STUDENT",
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      shiftLogs: true,
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
}

export async function getFirstSchool() {
  return prisma.school.findFirst({
    orderBy: { createdAt: "asc" },
  });
}
