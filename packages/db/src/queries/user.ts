import type { Role } from "@prisma/client";
import { prisma } from "../client";

export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: { clerkId },
    include: { school: true },
  });
}

export async function upsertUserFromClerk(input: {
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: Role;
  schoolId?: string | null;
}) {
  const seedAdminEmail = process.env.SEED_ADMIN_EMAIL;
  const isSeedAdmin =
    seedAdminEmail &&
    input.email.toLowerCase() === seedAdminEmail.toLowerCase();

  let schoolId = input.schoolId ?? null;
  let role = input.role;

  if (isSeedAdmin) {
    const school = await prisma.school.findFirst({
      orderBy: { createdAt: "asc" },
    });
    if (school) {
      schoolId = school.id;
      role = "SCHOOL_ADMIN";
    }
  }

  return prisma.user.upsert({
    where: { clerkId: input.clerkId },
    create: {
      clerkId: input.clerkId,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      role: role ?? "STUDENT",
      schoolId,
    },
    update: {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      ...(isSeedAdmin ? { role: "SCHOOL_ADMIN", schoolId } : {}),
    },
    include: { school: true },
  });
}

export async function getStudentByIdForSchool(userId: string, schoolId: string) {
  return prisma.user.findFirst({
    where: {
      id: userId,
      schoolId,
      role: "STUDENT",
    },
  });
}
