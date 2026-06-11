import { detectFraudFlagsForSchool } from "@kora/db";
import { createTRPCRouter, schoolAdminProcedure } from "../trpc";

export const fraudRouter = createTRPCRouter({
  listFlags: schoolAdminProcedure.query(async ({ ctx }) => {
    return detectFraudFlagsForSchool(ctx.schoolId);
  }),
});
