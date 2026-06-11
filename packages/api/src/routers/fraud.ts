import { detectFraudFlagsForSchool, getStudentsForSchool } from "@kora/db";
import { createTRPCRouter, schoolAdminProcedure } from "../trpc";

export const fraudRouter = createTRPCRouter({
  listFlags: schoolAdminProcedure.query(async ({ ctx }) => {
    const [flags, students] = await Promise.all([
      detectFraudFlagsForSchool(ctx.schoolId),
      getStudentsForSchool(ctx.schoolId),
    ]);

    const studentMap = new Map(
      students.map((s) => [
        s.id,
        `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || s.email,
      ]),
    );

    return flags.map((flag) => ({
      ...flag,
      students: flag.studentIds.map((id) => ({
        id,
        name: studentMap.get(id) ?? id,
      })),
    }));
  }),
});
