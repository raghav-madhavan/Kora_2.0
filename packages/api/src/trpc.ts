import { initTRPC, TRPCError } from "@trpc/server";
import type { User } from "@kora/db";

export interface CreateContextOptions {
  user: User | null;
}

export function createTRPCContext(opts: CreateContextOptions) {
  const { user } = opts;
  return {
    user,
    schoolId: user?.schoolId ?? null,
    role: user?.role ?? null,
  };
}

export type Context = ReturnType<typeof createTRPCContext>;

const t = initTRPC.context<Context>().create();

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const schoolAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "SCHOOL_ADMIN" || !ctx.user.schoolId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "School admin access required",
    });
  }
  return next({
    ctx: {
      ...ctx,
      schoolId: ctx.user.schoolId,
    },
  });
});
