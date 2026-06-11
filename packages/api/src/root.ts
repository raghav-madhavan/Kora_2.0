import { createTRPCRouter } from "./trpc";
import { exportRouter } from "./routers/export";
import { fraudRouter } from "./routers/fraud";
import { schoolRouter } from "./routers/school";
import { userRouter } from "./routers/user";

export const appRouter = createTRPCRouter({
  user: userRouter,
  school: schoolRouter,
  fraud: fraudRouter,
  export: exportRouter,
});

export type AppRouter = typeof appRouter;
