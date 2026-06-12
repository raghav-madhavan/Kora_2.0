import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { portalHome } from "@/lib/auth/policy";
import {
  parseSession,
  SESSION_COOKIE,
  type MacroSession,
  type ModeratorSession,
  type Session,
} from "@/lib/auth/session";

/**
 * The only server function that knows where sessions come from.
 * Clerk swap: replace the body with `auth()` + claims→Session mapping.
 */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return parseSession(store.get(SESSION_COOKIE)?.value);
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireModerator(): Promise<ModeratorSession> {
  const session = await requireSession();
  if (session.role !== "ORG_MODERATOR") redirect(portalHome(session));
  return session;
}

/** Page-level defense behind middleware: micro users bounce to their home. */
export async function requireMacro(): Promise<MacroSession> {
  const session = await requireModerator();
  if (session.access !== "macro") redirect(portalHome(session));
  return session;
}
