import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const STUDENTS = [
  { firstName: "Maya", lastName: "Chen", email: "maya.chen@student.lincoln.edu" },
  { firstName: "Jordan", lastName: "Rivera", email: "jordan.rivera@student.lincoln.edu" },
  { firstName: "Aisha", lastName: "Patel", email: "aisha.patel@student.lincoln.edu" },
  { firstName: "Ethan", lastName: "Brooks", email: "ethan.brooks@student.lincoln.edu" },
  { firstName: "Sofia", lastName: "Martinez", email: "sofia.martinez@student.lincoln.edu" },
  { firstName: "Liam", lastName: "Nguyen", email: "liam.nguyen@student.lincoln.edu" },
  { firstName: "Zoe", lastName: "Williams", email: "zoe.williams@student.lincoln.edu" },
  { firstName: "Noah", lastName: "Kim", email: "noah.kim@student.lincoln.edu" },
  { firstName: "Emma", lastName: "Johnson", email: "emma.johnson@student.lincoln.edu" },
  { firstName: "Marcus", lastName: "Davis", email: "marcus.davis@student.lincoln.edu" },
  { firstName: "Priya", lastName: "Sharma", email: "priya.sharma@student.lincoln.edu" },
  { firstName: "Alex", lastName: "Thompson", email: "alex.thompson@student.lincoln.edu" },
];

const ORGANIZATIONS = [
  { name: "City Parks & Recreation", website: "https://cityparks.example.org" },
  { name: "Hope Community Kitchen", website: "https://hopekitchen.example.org" },
  { name: "Lincoln Public Library", website: "https://lincolnlibrary.example.org" },
  { name: "Maplewood Animal Shelter", website: "https://maplewood.example.org" },
  { name: "Habitat for Humanity", website: "https://habitat.example.org" },
];

async function main() {
  console.log("Seeding database...");

  await prisma.shiftLog.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.school.deleteMany();

  const school = await prisma.school.create({
    data: {
      name: "Lincoln High School",
      state: "FL",
      district: "Lincoln County School District",
    },
  });

  const orgs = await Promise.all(
    ORGANIZATIONS.map((org) =>
      prisma.organization.create({
        data: { ...org, schoolId: school.id },
      }),
    ),
  );

  const students = await Promise.all(
    STUDENTS.map((student, index) =>
      prisma.user.create({
        data: {
          ...student,
          clerkId: `seed_student_${index + 1}`,
          role: Role.STUDENT,
          schoolId: school.id,
        },
      }),
    ),
  );

  const now = new Date();
  const shifts = await Promise.all([
    prisma.shift.create({
      data: {
        title: "Park Cleanup Day",
        description: "Help clean and maintain local park trails.",
        orgId: orgs[0]!.id,
        slots: 20,
        scheduledAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        durationHrs: 4,
        skills: ["outdoor", "organization"],
      },
    }),
    prisma.shift.create({
      data: {
        title: "Food Pantry Sorting",
        description: "Sort and pack food donations for families in need.",
        orgId: orgs[1]!.id,
        slots: 15,
        scheduledAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        durationHrs: 3,
        skills: ["organization", "communication"],
      },
    }),
    prisma.shift.create({
      data: {
        title: "Youth Reading Program",
        description: "Read aloud to elementary students.",
        orgId: orgs[2]!.id,
        slots: 10,
        scheduledAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        durationHrs: 2,
        skills: ["tutoring", "communication"],
      },
    }),
    prisma.shift.create({
      data: {
        title: "Animal Shelter Care",
        description: "Assist with animal care and facility maintenance.",
        orgId: orgs[3]!.id,
        slots: 12,
        scheduledAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        durationHrs: 4,
        skills: ["outdoor", "communication"],
      },
    }),
    prisma.shift.create({
      data: {
        title: "Habitat Build Day",
        description: "Construction support for affordable housing.",
        orgId: orgs[4]!.id,
        slots: 25,
        scheduledAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        durationHrs: 6,
        skills: ["outdoor", "organization"],
      },
    }),
    prisma.shift.create({
      data: {
        title: "Community Garden Weeding",
        description: "Weed and maintain community garden beds.",
        orgId: orgs[0]!.id,
        slots: 10,
        scheduledAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        durationHrs: 3,
        skills: ["outdoor"],
      },
    }),
  ]);

  const verifiedAt = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < 8; i++) {
    const student = students[i];
    const shift = shifts[i % shifts.length];
    if (!student || !shift) continue;

    await prisma.shiftLog.create({
      data: {
        userId: student.id,
        shiftId: shift.id,
        hours: shift.durationHrs,
        verifiedAt,
        verifiedBy: "seed_moderator",
      },
    });
  }

  for (let i = 8; i < students.length; i++) {
    const student = students[i];
    const shift = shifts[i % shifts.length];
    if (!student || !shift) continue;

    await prisma.shiftLog.create({
      data: {
        userId: student.id,
        shiftId: shift.id,
        hours: shift.durationHrs,
      },
    });
  }

  const fraudBaseTime = new Date(now.getTime() - 60 * 60 * 1000);
  const fraudHours = 3;
  const fraudShift = shifts[5]!;

  for (let i = 0; i < 4; i++) {
    const student = students[i];
    if (!student) continue;

    await prisma.shiftLog.create({
      data: {
        userId: student.id,
        shiftId: fraudShift.id,
        hours: fraudHours,
        createdAt: new Date(fraudBaseTime.getTime() + i * 2 * 60 * 1000),
      },
    });
  }

  console.log(`Seeded school: ${school.name} (${school.id})`);
  console.log(`  ${orgs.length} organizations`);
  console.log(`  ${students.length} students`);
  console.log(`  ${shifts.length} shifts`);
  console.log(
    "Admin: sign in with Clerk using SEED_ADMIN_EMAIL to get SCHOOL_ADMIN role.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
