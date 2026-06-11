import { getStudentsForSchool } from "@kora/db";
import { getVerifiedHoursFromDb } from "@kora/compliance";
import { createTRPCRouter, schoolAdminProcedure } from "../trpc";

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export const exportRouter = createTRPCRouter({
  powerSchool: schoolAdminProcedure.query(async ({ ctx }) => {
    const students = await getStudentsForSchool(ctx.schoolId);
    const header = "studentId,firstName,lastName,email,verifiedHours";
    const rows = students.map((student) => {
      const verifiedHours = getVerifiedHoursFromDb(student.shiftLogs);
      return [
        escapeCsvField(student.id),
        escapeCsvField(student.firstName ?? ""),
        escapeCsvField(student.lastName ?? ""),
        escapeCsvField(student.email),
        verifiedHours.toString(),
      ].join(",");
    });

    return [header, ...rows].join("\n");
  }),
});
