import { auth, currentUser } from "@clerk/nextjs/server";
import { upsertUserFromClerk } from "@kora/db";
import { appRouter } from "./root";
import { createCallerFactory, createTRPCContext } from "./trpc";

export async function createAppContext() {
  const { userId } = await auth();
  if (!userId) {
    return createTRPCContext({ user: null });
  }

  const clerkUser = await currentUser();
  if (!clerkUser?.primaryEmailAddress?.emailAddress) {
    return createTRPCContext({ user: null });
  }

  const user = await upsertUserFromClerk({
    clerkId: userId,
    email: clerkUser.primaryEmailAddress.emailAddress,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
  });

  return createTRPCContext({ user });
}

export const createCaller = createCallerFactory(appRouter);

export async function createServerCaller() {
  const ctx = await createAppContext();
  return createCaller(ctx);
}

export { appRouter };
