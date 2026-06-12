/**
 * Route policy — single source of truth for who may be where.
 *
 * Consumed by proxy.ts (redirects), nav components (filtering), and tests.
 * Deliberately coarse: per-resource ownership (does log X belong to your
 * shift?) is enforced at the data layer in lib/auth/scope.ts, never here.
 */

import type { ModeratorSession, Session } from "@/lib/auth/session";

const MODERATOR_PREFIX = "/moderator";

/** Macro-only surfaces. `exact` guards the dashboard without blocking children. */
const MACRO_ONLY: ReadonlyArray<{ path: string; exact?: boolean }> = [
  { path: "/moderator", exact: true },
  { path: "/moderator/search" },
  { path: "/moderator/messages" },
  { path: "/moderator/profile" },
];

function isModeratorPath(pathname: string): boolean {
  return (
    pathname === MODERATOR_PREFIX || pathname.startsWith(`${MODERATOR_PREFIX}/`)
  );
}

export function portalHome(session: Session): string {
  if (session.role === "STUDENT") return "/";
  if (session.access === "macro") return "/moderator";
  return session.shiftIds.length === 1
    ? `/moderator/shifts/${session.shiftIds[0]}`
    : "/moderator/shifts";
}

export function isModeratorPathAllowed(
  session: ModeratorSession,
  pathname: string,
): boolean {
  if (session.access === "macro") return true;
  return !MACRO_ONLY.some(({ path, exact }) =>
    exact ? pathname === path : pathname === path || pathname.startsWith(`${path}/`),
  );
}

/**
 * Returns where this request must be redirected, or null to pass through.
 * The only routing decision middleware makes.
 */
export function resolveRedirect(
  session: Session | null,
  pathname: string,
): string | null {
  if (pathname === "/login") {
    return session ? portalHome(session) : null;
  }
  if (!session) return "/login";

  if (session.role === "STUDENT") {
    return isModeratorPath(pathname) ? "/" : null;
  }

  // Moderators belong in the org portal.
  if (!isModeratorPath(pathname)) return portalHome(session);

  return isModeratorPathAllowed(session, pathname) ? null : portalHome(session);
}

/** Filter nav item lists (sidebar, mobile nav, more-sheet) by access level. */
export function filterModeratorNav<T extends { href: string }>(
  session: ModeratorSession,
  items: readonly T[],
): T[] {
  return items.filter((item) => isModeratorPathAllowed(session, item.href));
}
