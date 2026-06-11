import { upsertUserFromClerk } from "@kora/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  syncFromClerk: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await upsertUserFromClerk({
      clerkId: ctx.user.clerkId,
      email: ctx.user.email,
      firstName: ctx.user.firstName,
      lastName: ctx.user.lastName,
      role: ctx.user.role,
      schoolId: ctx.user.schoolId,
    });
    return user;
  }),

  me: protectedProcedure.query(({ ctx }) => ctx.user),
});
