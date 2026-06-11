import {
  getBrightFuturesTiers,
  getGraduationRequirement,
  getPendingHoursFromDb,
  getVerifiedHoursFromDb,
} from "@kora/compliance";
import {
  countFraudFlagsForSchool,
  getOrgCountForSchool,
  getPendingHoursTotalForSchool,
  getSchoolById,
  getShiftLogsForStudent,
  getStudentByIdForSchool,
  getStudentCountForSchool,
  getStudentsForSchool,
  getVerifiedHoursTotalForSchool,
} from "@kora/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, schoolAdminProcedure } from "../trpc";

export const schoolRouter = createTRPCRouter({
  getOverview: schoolAdminProcedure.query(async ({ ctx }) => {
    const schoolId = ctx.schoolId;
    const [
      studentCount,
      orgCount,
      verifiedHours,
      pendingHours,
      openFraudFlags,
    ] = await Promise.all([
      getStudentCountForSchool(schoolId),
      getOrgCountForSchool(schoolId),
      getVerifiedHoursTotalForSchool(schoolId),
      getPendingHoursTotalForSchool(schoolId),
      countFraudFlagsForSchool(schoolId),
    ]);

    return {
      studentCount,
      orgCount,
      verifiedHours,
      pendingHours,
      openFraudFlags,
    };
  }),

  getComplianceMasterList: schoolAdminProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const schoolId = ctx.schoolId;
      const school = await getSchoolById(schoolId);
      if (!school) {
        throw new TRPCError({ code: "NOT_FOUND", message: "School not found" });
      }

      const students = await getStudentsForSchool(schoolId, input?.search);
      const graduationRequirement = getGraduationRequirement(school.state);
      const brightFutures = getBrightFuturesTiers(school.state);

      return students.map((student) => {
        const verifiedHours = getVerifiedHoursFromDb(student.shiftLogs);
        const pendingHours = getPendingHoursFromDb(student.shiftLogs);

        return {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          verifiedHours,
          pendingHours,
          graduationRequirement,
          graduationProgress: verifiedHours / graduationRequirement,
          brightFutures,
        };
      });
    }),

  getStudentHours: schoolAdminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const student = await getStudentByIdForSchool(input.userId, ctx.schoolId);
      if (!student) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
      }

      return getShiftLogsForStudent(input.userId, ctx.schoolId);
    }),
});
