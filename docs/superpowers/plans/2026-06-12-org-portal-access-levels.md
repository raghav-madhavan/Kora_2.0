# Org Portal Macro/Micro Access Levels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a production-shaped mock auth system (login page → session cookie → middleware routing → data-layer authorization) so macro (lead) moderators get the full org portal and micro (shift) moderators are physically restricted to their assigned shifts.

**Architecture:** Middleware (Next 16 `proxy.ts`) does coarse role→portal routing from a session cookie; the real security boundary is guard/scope functions enforced inside `mock-store-server-moderator.ts` and every server action. `getSession()` + `parseSession()` in `lib/auth/` are the only code that knows sessions live in a cookie — the future Clerk swap touches only that. Pure logic (session parsing, route policy, scoping) is unit-tested with Vitest; UI wiring is verified via lint, typecheck, and a manual persona matrix.

**Tech Stack:** Next.js 16.2 App Router (note: `cookies()` is async; middleware file convention is `proxy.ts`), React 19, TypeScript strict (no `any`), Tailwind v4 tokens already defined in `apps/web/app/globals.css`, Vitest (added by this plan).

**Spec:** `docs/superpowers/specs/2026-06-12-org-portal-access-levels-design.md`

**Conventions for every task:**
- All paths are relative to `apps/web/` unless they start with `docs/` or say otherwise.
- Run all commands from the repo root `/Users/raghavmadhavan/Kora_2.0` unless stated.
- After each task: code must pass `npm run lint --workspace=web` and `npm run check-types --workspace=web` (the final task runs them; run earlier if unsure).
- Never use `any`. Never import Prisma (this is all mock-store).

**Two intentional refinements vs the spec** (documented here so you don't "fix" them):
1. The spec said `middleware.ts`. Next 16 renamed the convention to `proxy.ts` (`PROXY_FILENAME = 'proxy'` in `next/dist/lib/constants.js`). Use `apps/web/proxy.ts` with a default-exported `proxy` function. If the dev server ever fails to pick it up, renaming the file to `middleware.ts` and the function to `middleware` is the only change needed.
2. The spec said `requireMacro()` throws. For **pages** it redirects to the session's portal home (same defense, better UX, mirrors middleware); the throwing variant for **mutations** is `assertMacro()` in `lib/auth/scope.ts`. No current mutation is macro-only (micro may verify own-shift logs), so `assertMacro` exists for future event-creation/org-profile actions.

---

### Task 1: Vitest test infrastructure

The web app has no test runner. Add Vitest scoped to pure-logic tests under `lib/`.

**Files:**
- Modify: `apps/web/package.json` (add devDep + script)
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/lib/auth/__tests__/smoke.test.ts` (deleted in Task 2)

- [ ] **Step 1: Install vitest**

```bash
npm install -D vitest --workspace=web
```

- [ ] **Step 2: Add the test script**

In `apps/web/package.json` `"scripts"`, add:

```json
"test": "vitest run"
```

- [ ] **Step 3: Create `apps/web/vitest.config.ts`**

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["lib/**/__tests__/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Create a smoke test `apps/web/lib/auth/__tests__/smoke.test.ts`**

```ts
import { describe, expect, it } from "vitest";

describe("vitest wiring", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run it**

Run: `npm run test --workspace=web`
Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add apps/web/package.json apps/web/vitest.config.ts apps/web/lib/auth/__tests__/smoke.test.ts package-lock.json
git commit -m "test: add vitest for web lib unit tests"
```

---

### Task 2: Session module (`lib/auth/session.ts`)

Pure, dependency-free: types + cookie name + parse/serialize. Importable from middleware, server, and client (it touches no cookies itself).

**Files:**
- Create: `apps/web/lib/auth/session.ts`
- Create: `apps/web/lib/auth/__tests__/session.test.ts`
- Delete: `apps/web/lib/auth/__tests__/smoke.test.ts`

- [ ] **Step 1: Write the failing test `apps/web/lib/auth/__tests__/session.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import {
  parseSession,
  serializeSession,
  type Session,
} from "@/lib/auth/session";

const macro: Session = {
  role: "ORG_MODERATOR",
  access: "macro",
  userId: "mod_parks",
  orgId: "org_city_parks",
};

const micro: Session = {
  role: "ORG_MODERATOR",
  access: "micro",
  userId: "mod_parks_riverside",
  orgId: "org_city_parks",
  shiftIds: ["shift_riverside_cleanup"],
};

const student: Session = { role: "STUDENT", userId: "user_maya_chen" };

describe("parseSession", () => {
  it("round-trips macro, micro, and student sessions", () => {
    expect(parseSession(serializeSession(macro))).toEqual(macro);
    expect(parseSession(serializeSession(micro))).toEqual(micro);
    expect(parseSession(serializeSession(student))).toEqual(student);
  });

  it("returns null for missing or garbage input", () => {
    expect(parseSession(undefined)).toBeNull();
    expect(parseSession("")).toBeNull();
    expect(parseSession("not-json")).toBeNull();
    expect(parseSession("42")).toBeNull();
    expect(parseSession("null")).toBeNull();
  });

  it("returns null for structurally invalid sessions", () => {
    expect(parseSession(JSON.stringify({ role: "ADMIN", userId: "x" }))).toBeNull();
    expect(parseSession(JSON.stringify({ role: "STUDENT" }))).toBeNull();
    expect(
      parseSession(
        JSON.stringify({ role: "ORG_MODERATOR", access: "macro", userId: "x" }),
      ),
    ).toBeNull(); // missing orgId
    expect(
      parseSession(
        JSON.stringify({
          role: "ORG_MODERATOR",
          access: "micro",
          userId: "x",
          orgId: "y",
        }),
      ),
    ).toBeNull(); // missing shiftIds
    expect(
      parseSession(
        JSON.stringify({
          role: "ORG_MODERATOR",
          access: "micro",
          userId: "x",
          orgId: "y",
          shiftIds: [1, 2],
        }),
      ),
    ).toBeNull(); // non-string shiftIds
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm run test --workspace=web`
Expected: FAIL — cannot resolve `@/lib/auth/session`.

- [ ] **Step 3: Create `apps/web/lib/auth/session.ts`**

```ts
/**
 * Session model — the single swap seam for real auth.
 *
 * Mock auth stores this object as JSON in the `kora_session` cookie. The
 * future Clerk swap maps session claims into the same `Session` type; nothing
 * downstream (middleware policy, guards, stores, nav) changes.
 */

export interface StudentSession {
  role: "STUDENT";
  userId: string;
}

export interface MacroSession {
  role: "ORG_MODERATOR";
  access: "macro";
  userId: string;
  orgId: string;
}

export interface MicroSession {
  role: "ORG_MODERATOR";
  access: "micro";
  userId: string;
  orgId: string;
  /** Travels in the session (like a JWT claim) so middleware needs no DB. */
  shiftIds: string[];
}

export type ModeratorSession = MacroSession | MicroSession;
export type Session = StudentSession | ModeratorSession;

export const SESSION_COOKIE = "kora_session";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function serializeSession(session: Session): string {
  return JSON.stringify(session);
}

/** Strict parse: anything malformed is treated as logged-out. */
export function parseSession(raw: string | undefined): Session | null {
  if (!raw) return null;

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;

  const record = data as Record<string, unknown>;
  if (typeof record.userId !== "string") return null;

  if (record.role === "STUDENT") {
    return { role: "STUDENT", userId: record.userId };
  }

  if (record.role !== "ORG_MODERATOR" || typeof record.orgId !== "string") {
    return null;
  }

  if (record.access === "macro") {
    return {
      role: "ORG_MODERATOR",
      access: "macro",
      userId: record.userId,
      orgId: record.orgId,
    };
  }

  if (record.access === "micro" && isStringArray(record.shiftIds)) {
    return {
      role: "ORG_MODERATOR",
      access: "micro",
      userId: record.userId,
      orgId: record.orgId,
      shiftIds: record.shiftIds,
    };
  }

  return null;
}
```

- [ ] **Step 4: Run tests, delete the smoke test**

Run: `npm run test --workspace=web`
Expected: all session tests PASS.

```bash
rm apps/web/lib/auth/__tests__/smoke.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/auth
git commit -m "feat: session model with strict cookie parsing (auth swap seam)"
```

---

### Task 3: Route policy (`lib/auth/policy.ts`)

Single source of truth for "who may be where", shared by middleware, nav filtering, and tests. Pure — imports only session types.

**Files:**
- Create: `apps/web/lib/auth/policy.ts`
- Create: `apps/web/lib/auth/__tests__/policy.test.ts`

- [ ] **Step 1: Write the failing test `apps/web/lib/auth/__tests__/policy.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import {
  filterModeratorNav,
  isModeratorPathAllowed,
  portalHome,
  resolveRedirect,
} from "@/lib/auth/policy";
import type { Session } from "@/lib/auth/session";

const macro: Session = {
  role: "ORG_MODERATOR",
  access: "macro",
  userId: "mod_parks",
  orgId: "org_city_parks",
};

const micro: Session = {
  role: "ORG_MODERATOR",
  access: "micro",
  userId: "mod_parks_riverside",
  orgId: "org_city_parks",
  shiftIds: ["shift_riverside_cleanup"],
};

const microMulti: Session = {
  ...micro,
  shiftIds: ["shift_riverside_cleanup", "shift_parks_native_garden"],
} as Session;

const student: Session = { role: "STUDENT", userId: "user_maya_chen" };

describe("portalHome", () => {
  it("routes each session type to its home", () => {
    expect(portalHome(student)).toBe("/");
    expect(portalHome(macro)).toBe("/moderator");
    expect(portalHome(micro)).toBe("/moderator/shifts/shift_riverside_cleanup");
    expect(portalHome(microMulti)).toBe("/moderator/shifts");
  });
});

describe("isModeratorPathAllowed", () => {
  it("allows macro everywhere in the portal", () => {
    expect(isModeratorPathAllowed(macro, "/moderator")).toBe(true);
    expect(isModeratorPathAllowed(macro, "/moderator/search")).toBe(true);
  });

  it("blocks micro from macro-only prefixes", () => {
    expect(isModeratorPathAllowed(micro, "/moderator")).toBe(false);
    expect(isModeratorPathAllowed(micro, "/moderator/search")).toBe(false);
    expect(isModeratorPathAllowed(micro, "/moderator/messages")).toBe(false);
    expect(isModeratorPathAllowed(micro, "/moderator/profile")).toBe(false);
  });

  it("allows micro on shifts and verifications", () => {
    expect(isModeratorPathAllowed(micro, "/moderator/shifts")).toBe(true);
    expect(isModeratorPathAllowed(micro, "/moderator/shifts/anything")).toBe(true);
    expect(isModeratorPathAllowed(micro, "/moderator/verifications")).toBe(true);
    expect(isModeratorPathAllowed(micro, "/moderator/verifications/x")).toBe(true);
  });
});

describe("resolveRedirect", () => {
  it("sends logged-out users to /login and leaves /login alone", () => {
    expect(resolveRedirect(null, "/")).toBe("/login");
    expect(resolveRedirect(null, "/moderator")).toBe("/login");
    expect(resolveRedirect(null, "/login")).toBeNull();
  });

  it("sends logged-in users away from /login to their home", () => {
    expect(resolveRedirect(student, "/login")).toBe("/");
    expect(resolveRedirect(macro, "/login")).toBe("/moderator");
    expect(resolveRedirect(micro, "/login")).toBe(
      "/moderator/shifts/shift_riverside_cleanup",
    );
  });

  it("keeps students out of the org portal", () => {
    expect(resolveRedirect(student, "/")).toBeNull();
    expect(resolveRedirect(student, "/hours")).toBeNull();
    expect(resolveRedirect(student, "/moderator")).toBe("/");
    expect(resolveRedirect(student, "/moderator/shifts/x")).toBe("/");
  });

  it("keeps moderators out of the student portal", () => {
    expect(resolveRedirect(macro, "/")).toBe("/moderator");
    expect(resolveRedirect(micro, "/hours")).toBe(
      "/moderator/shifts/shift_riverside_cleanup",
    );
  });

  it("redirects micro off macro-only routes to their home", () => {
    expect(resolveRedirect(micro, "/moderator")).toBe(
      "/moderator/shifts/shift_riverside_cleanup",
    );
    expect(resolveRedirect(micro, "/moderator/messages")).toBe(
      "/moderator/shifts/shift_riverside_cleanup",
    );
    expect(resolveRedirect(micro, "/moderator/shifts")).toBeNull();
    expect(resolveRedirect(micro, "/moderator/verifications/log_x")).toBeNull();
    expect(resolveRedirect(macro, "/moderator/search")).toBeNull();
  });
});

describe("filterModeratorNav", () => {
  const items = [
    { label: "Dashboard", href: "/moderator" },
    { label: "Verifications", href: "/moderator/verifications" },
    { label: "Shifts", href: "/moderator/shifts" },
    { label: "Messages", href: "/moderator/messages" },
  ];

  it("keeps everything for macro", () => {
    expect(filterModeratorNav(macro, items)).toHaveLength(4);
  });

  it("drops macro-only entries for micro", () => {
    expect(filterModeratorNav(micro, items).map((i) => i.label)).toEqual([
      "Verifications",
      "Shifts",
    ]);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm run test --workspace=web`
Expected: FAIL — cannot resolve `@/lib/auth/policy`.

- [ ] **Step 3: Create `apps/web/lib/auth/policy.ts`**

```ts
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
```

- [ ] **Step 4: Run tests**

Run: `npm run test --workspace=web`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/auth
git commit -m "feat: route policy map for macro/micro portal access"
```

---

### Task 4: Data scoping + AuthorizationError (`lib/auth/scope.ts`)

Pure helpers the store and pages use to enforce per-shift ownership — the actual security boundary.

**Files:**
- Create: `apps/web/lib/auth/scope.ts`
- Create: `apps/web/lib/auth/__tests__/scope.test.ts`

- [ ] **Step 1: Write the failing test `apps/web/lib/auth/__tests__/scope.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import {
  AuthorizationError,
  assertMacro,
  assertShiftAccess,
  canAccessShift,
  scopeLogs,
  scopeShifts,
} from "@/lib/auth/scope";
import type { ModeratorSession } from "@/lib/auth/session";

const macro: ModeratorSession = {
  role: "ORG_MODERATOR",
  access: "macro",
  userId: "mod_parks",
  orgId: "org_city_parks",
};

const micro: ModeratorSession = {
  role: "ORG_MODERATOR",
  access: "micro",
  userId: "mod_parks_riverside",
  orgId: "org_city_parks",
  shiftIds: ["shift_riverside_cleanup"],
};

describe("canAccessShift / assertShiftAccess", () => {
  it("macro can access any org shift", () => {
    expect(canAccessShift(macro, "shift_parks_trail_may")).toBe(true);
    expect(() => assertShiftAccess(macro, "shift_parks_trail_may")).not.toThrow();
  });

  it("micro can access only assigned shifts", () => {
    expect(canAccessShift(micro, "shift_riverside_cleanup")).toBe(true);
    expect(canAccessShift(micro, "shift_parks_trail_may")).toBe(false);
    expect(() => assertShiftAccess(micro, "shift_parks_trail_may")).toThrow(
      AuthorizationError,
    );
  });
});

describe("scopeShifts / scopeLogs", () => {
  const shifts = [
    { id: "shift_riverside_cleanup" },
    { id: "shift_parks_trail_may" },
  ];
  const logs = [
    { id: "a", shiftId: "shift_riverside_cleanup" },
    { id: "b", shiftId: "shift_parks_trail_may" },
  ];

  it("returns everything for macro", () => {
    expect(scopeShifts(macro, shifts)).toHaveLength(2);
    expect(scopeLogs(macro, logs)).toHaveLength(2);
  });

  it("filters to assigned shifts for micro", () => {
    expect(scopeShifts(micro, shifts).map((s) => s.id)).toEqual([
      "shift_riverside_cleanup",
    ]);
    expect(scopeLogs(micro, logs).map((l) => l.id)).toEqual(["a"]);
  });
});

describe("assertMacro", () => {
  it("passes macro, throws AuthorizationError for micro", () => {
    expect(() => assertMacro(macro)).not.toThrow();
    expect(() => assertMacro(micro)).toThrow(AuthorizationError);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm run test --workspace=web`
Expected: FAIL — cannot resolve `@/lib/auth/scope`.

- [ ] **Step 3: Create `apps/web/lib/auth/scope.ts`**

```ts
/**
 * Data-boundary authorization. Every session-aware store function calls these
 * before reading or mutating, so a micro user invoking a server action
 * directly is blocked here regardless of what middleware or nav allowed.
 */

import type { MacroSession, ModeratorSession } from "@/lib/auth/session";

export class AuthorizationError extends Error {
  constructor(message = "You don't have access to this resource.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export function canAccessShift(
  session: ModeratorSession,
  shiftId: string,
): boolean {
  return session.access === "macro" || session.shiftIds.includes(shiftId);
}

export function assertShiftAccess(
  session: ModeratorSession,
  shiftId: string,
): void {
  if (!canAccessShift(session, shiftId)) {
    throw new AuthorizationError(
      "This shift is outside your assigned access.",
    );
  }
}

export function assertMacro(
  session: ModeratorSession,
): asserts session is MacroSession {
  if (session.access !== "macro") {
    throw new AuthorizationError(
      "This action requires organization-level access.",
    );
  }
}

export function scopeShifts<T extends { id: string }>(
  session: ModeratorSession,
  shifts: readonly T[],
): T[] {
  if (session.access === "macro") return [...shifts];
  return shifts.filter((shift) => session.shiftIds.includes(shift.id));
}

export function scopeLogs<T extends { shiftId: string }>(
  session: ModeratorSession,
  logs: readonly T[],
): T[] {
  if (session.access === "macro") return [...logs];
  return logs.filter((log) => session.shiftIds.includes(log.shiftId));
}
```

- [ ] **Step 4: Run tests**

Run: `npm run test --workspace=web`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/auth
git commit -m "feat: data-boundary scoping and AuthorizationError"
```

---

### Task 5: Mock personas (micro moderator + persona table)

**Files:**
- Modify: `apps/web/lib/mock-data-moderator.ts` (after the `currentModerator` block, ~line 21)
- Create: `apps/web/lib/auth/mock-users.ts`

- [ ] **Step 1: Add the micro persona to `apps/web/lib/mock-data-moderator.ts`**

Directly after the `currentModerator` export, add:

```ts
/** Micro-level persona: staffs only the Riverside cleanup shift. */
export const microModerator: ModeratorProfile = {
  id: "mod_parks_riverside",
  name: "Dana Whitfield",
  avatar:
    "https://api.dicebear.com/9.x/avataaars/svg?seed=Dana&backgroundColor=FBE4F1",
  roleTitle: "Riverside Shift Lead",
  totalVerifications: 12,
  orgId: "org_city_parks",
  orgName: "City Parks Dept.",
  orgAvatar:
    "https://api.dicebear.com/9.x/icons/svg?seed=ParksOrg&backgroundColor=DDF0FB",
};

/** Lookup for session → display persona (topbar, sidebar, greetings). */
export const moderatorProfiles: Record<string, ModeratorProfile> = {
  [currentModerator.id]: currentModerator,
  [microModerator.id]: microModerator,
};
```

- [ ] **Step 2: Create `apps/web/lib/auth/mock-users.ts`**

```ts
/**
 * Mock persona table backing /login. Deleted when Clerk replaces mock auth.
 */

import type { Session } from "@/lib/auth/session";
import { student } from "@/lib/mock-data";
import {
  currentModerator,
  microModerator,
} from "@/lib/mock-data-moderator";

export interface MockPersona {
  id: string;
  name: string;
  roleLine: string;
  avatar: string;
  session: Session;
}

export const personas: readonly MockPersona[] = [
  {
    id: "student",
    name: student.name,
    roleLine: "Student · Lincoln High",
    avatar: student.avatar,
    session: { role: "STUDENT", userId: student.id },
  },
  {
    id: "macro",
    name: currentModerator.name,
    roleLine: "Lead moderator · City Parks Dept.",
    avatar: currentModerator.avatar,
    session: {
      role: "ORG_MODERATOR",
      access: "macro",
      userId: currentModerator.id,
      orgId: currentModerator.orgId,
    },
  },
  {
    id: "micro",
    name: microModerator.name,
    roleLine: "Shift moderator · Riverside Park Cleanup",
    avatar: microModerator.avatar,
    session: {
      role: "ORG_MODERATOR",
      access: "micro",
      userId: microModerator.id,
      orgId: microModerator.orgId,
      shiftIds: ["shift_riverside_cleanup"],
    },
  },
];

export function getPersona(id: string): MockPersona | undefined {
  return personas.find((persona) => persona.id === id);
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run check-types --workspace=web`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/mock-data-moderator.ts apps/web/lib/auth/mock-users.ts
git commit -m "feat: micro moderator persona and mock persona table"
```

---

### Task 6: Server guards (`lib/auth/guards.ts`)

The server-only layer: reads the cookie, redirects when the session is missing/wrong. This file (plus `login/actions.ts`) is the entire mock↔Clerk swap surface.

**Files:**
- Create: `apps/web/lib/auth/guards.ts`

- [ ] **Step 1: Create `apps/web/lib/auth/guards.ts`**

```ts
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
```

Note: `redirect()` returns `never`, so the narrowed returns typecheck without casts.

- [ ] **Step 2: Typecheck**

Run: `npm run check-types --workspace=web`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add apps/web/lib/auth/guards.ts
git commit -m "feat: server-side session guards"
```

---

### Task 7: Middleware (`apps/web/proxy.ts`)

**Files:**
- Create: `apps/web/proxy.ts`

- [ ] **Step 1: Create `apps/web/proxy.ts`**

```ts
import { NextResponse, type NextRequest } from "next/server";
import { resolveRedirect } from "@/lib/auth/policy";
import { parseSession, SESSION_COOKIE } from "@/lib/auth/session";

/**
 * Routing, not security: drops each session into its portal and bounces
 * obviously-wrong requests. Authorization lives in lib/auth/scope.ts at the
 * data layer. (Next 16 convention: proxy.ts, formerly middleware.ts.)
 */
export default function proxy(request: NextRequest) {
  const session = parseSession(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  const destination = resolveRedirect(session, request.nextUrl.pathname);

  if (destination && destination !== request.nextUrl.pathname) {
    return NextResponse.redirect(new URL(destination, request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Everything except Next internals, API routes, and static files.
  matcher: ["/((?!_next|api|favicon\\.ico|fonts|.*\\..*).*)"],
};
```

- [ ] **Step 2: Verify redirects with the dev server**

Start: `npm run dev` (root; web is on port 3000). Then:

```bash
# Logged out → /login
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/moderator
# Expected: 307 http://localhost:3000/login

# Micro session probing the dashboard → bounced to their shift
MICRO=$(node -e 'console.log(encodeURIComponent(JSON.stringify({role:"ORG_MODERATOR",access:"micro",userId:"mod_parks_riverside",orgId:"org_city_parks",shiftIds:["shift_riverside_cleanup"]})))')
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -H "Cookie: kora_session=$MICRO" http://localhost:3000/moderator
# Expected: 307 http://localhost:3000/moderator/shifts/shift_riverside_cleanup

curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -H "Cookie: kora_session=$MICRO" http://localhost:3000/moderator/shifts
# Expected: 200 (no redirect_url)

# Student session on org portal → student home
STUDENT=$(node -e 'console.log(encodeURIComponent(JSON.stringify({role:"STUDENT",userId:"user_maya_chen"})))')
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -H "Cookie: kora_session=$STUDENT" http://localhost:3000/moderator/verifications
# Expected: 307 http://localhost:3000/
```

If `proxy.ts` is not picked up (no redirect happens), rename the file to `apps/web/middleware.ts` and the function to `export function middleware` — nothing else changes.

- [ ] **Step 3: Commit**

```bash
git add apps/web/proxy.ts
git commit -m "feat: session-routing middleware (Next 16 proxy)"
```

---

### Task 8: `/login` page + actions

Standalone screen outside both route groups; consumes existing tokens only (see spec §6). Server actions are the second half of the auth swap surface.

**Files:**
- Create: `apps/web/app/login/actions.ts`
- Create: `apps/web/app/login/login-personas.tsx`
- Create: `apps/web/app/login/page.tsx`

- [ ] **Step 1: Create `apps/web/app/login/actions.ts`**

```ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPersona } from "@/lib/auth/mock-users";
import { serializeSession, SESSION_COOKIE } from "@/lib/auth/session";

export interface LoginState {
  error: string;
}

/** Mock sign-in: validates persona, sets the session cookie, hands off to middleware. */
export async function login(
  _prevState: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  const personaId = formData.get("persona");
  const persona =
    typeof personaId === "string" ? getPersona(personaId) : undefined;

  if (!persona) {
    return { error: "Couldn't start the session. Try again." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, serializeSession(persona.session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  redirect("/");
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
```

- [ ] **Step 2: Create `apps/web/app/login/login-personas.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ChevronRight, Loader2 } from "lucide-react";
import { login, type LoginState } from "./actions";

export interface PersonaCard {
  id: string;
  name: string;
  roleLine: string;
  avatar: string;
}

function PersonaRow({ persona, index }: { persona: PersonaCard; index: number }) {
  const { pending, data } = useFormStatus();
  const isSubmitting = pending && data?.get("persona") === persona.id;

  return (
    <li
      className="animate-rise"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <button
        type="submit"
        name="persona"
        value={persona.id}
        disabled={pending}
        className="group flex w-full items-center gap-4 rounded-card bg-surface px-5 py-4 text-left shadow-card transition-[transform,box-shadow] duration-150 ease-soft hover:-translate-y-px hover:shadow-raised active:scale-[0.98] disabled:cursor-default motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100"
      >
        <span
          className={`flex min-w-0 flex-1 items-center gap-4 transition-[opacity,filter] duration-150 ease-soft ${
            isSubmitting ? "opacity-70 blur-[2px]" : ""
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={persona.avatar}
            alt=""
            className="h-11 w-11 shrink-0 rounded-xl bg-accent-sky object-cover"
          />
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-semibold leading-tight">
              {persona.name}
            </span>
            <span className="block truncate font-mono text-[11px] text-muted">
              {persona.roleLine}
            </span>
          </span>
        </span>
        {isSubmitting ? (
          <Loader2
            size={18}
            strokeWidth={2.2}
            className="shrink-0 animate-spin text-muted"
            aria-hidden
          />
        ) : (
          <ChevronRight
            size={18}
            strokeWidth={2.2}
            className="shrink-0 text-muted transition group-hover:text-primary"
            aria-hidden
          />
        )}
        <span className="sr-only">Log in as {persona.name}</span>
      </button>
    </li>
  );
}

export function LoginPersonas({ personas }: { personas: PersonaCard[] }) {
  const [state, formAction] = useActionState<LoginState | null, FormData>(
    login,
    null,
  );

  return (
    <form action={formAction} className="mt-8">
      <ul className="flex flex-col gap-3">
        {personas.map((persona, index) => (
          <PersonaRow key={persona.id} persona={persona} index={index} />
        ))}
      </ul>
      {state?.error ? (
        <p className="mt-4 text-[13px] font-semibold text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
```

- [ ] **Step 3: Create `apps/web/app/login/page.tsx`**

```tsx
import type { Metadata } from "next";
import { personas } from "@/lib/auth/mock-users";
import { LoginPersonas, type PersonaCard } from "./login-personas";

export const metadata: Metadata = {
  title: "Kora — Choose a session",
  description: "Mock sign-in for the Kora prototype.",
};

export default function LoginPage() {
  const cards: PersonaCard[] = personas.map(
    ({ id, name, roleLine, avatar }) => ({ id, name, roleLine, avatar }),
  );

  return (
    <main className="flex min-h-screen flex-col bg-canvas text-ink lg:flex-row">
      <section className="flex items-end bg-panel px-8 pb-8 pt-10 lg:w-[40%] lg:px-12 lg:pb-14">
        <div>
          <p className="font-display text-[34px] font-semibold italic tracking-tight text-cream">
            Kora<span className="not-italic text-ember">.</span>
          </p>
          <p className="mt-3 max-w-[36ch] text-[14px] leading-relaxed text-cream/70">
            Community service, recorded like it matters.
          </p>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center px-6 pb-16 pt-10">
        <div className="w-full max-w-[480px]">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted/80">
            Mock session — replaced by Clerk in production
          </p>
          <h1 className="mt-2 font-display text-[32px] font-semibold tracking-tight [text-wrap:balance]">
            Choose a session
          </h1>
          <LoginPersonas personas={cards} />
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Verify in the browser**

With `npm run dev` running, open `http://localhost:3000/login`:
- Three persona rows render (Maya, Elena, Dana) with avatars, staggered entrance.
- Clicking **Elena** lands on `/moderator` (via `/`); clicking **Maya** lands on `/`; clicking **Dana** lands on `/moderator/shifts/shift_riverside_cleanup` (page may still 404-or-render-unscoped until Tasks 9–11 — only the URL matters here).
- Revisiting `/login` while logged in redirects to your portal home.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/login
git commit -m "feat: mock login page with persona sessions"
```

---

### Task 9: Session-aware store + server actions

**Files:**
- Modify: `apps/web/lib/mock-store-server-moderator.ts` (full rewrite below)
- Modify: `apps/web/app/(moderator)/moderator/verifications/actions.ts`
- Modify: `apps/web/app/(moderator)/moderator/shifts/[shiftId]/actions.ts`

- [ ] **Step 1: Rewrite `apps/web/lib/mock-store-server-moderator.ts`**

```ts
import {
  assertShiftAccess,
  canAccessShift,
  scopeLogs,
  scopeShifts,
} from "@/lib/auth/scope";
import type { ModeratorSession } from "@/lib/auth/session";
import { syncOrgDecisionToStudent } from "@/lib/hours-sync";
import {
  moderatorShifts,
  orgShiftLogs as seedLogs,
} from "@/lib/mock-data-moderator";
import {
  ensureShiftQrSession,
  refreshShiftQrSession,
  type ShiftQrSession,
} from "@/lib/mock-store-server";
import type { ModeratorShift, OrgShiftLog } from "@/lib/types/moderator";

let orgLogs: OrgShiftLog[] = [...seedLogs];

export function getOrgLogs(session: ModeratorSession): OrgShiftLog[] {
  return scopeLogs(session, orgLogs).sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
}

export function getOrgLogById(
  session: ModeratorSession,
  logId: string,
): OrgShiftLog | undefined {
  const log = orgLogs.find((l) => l.id === logId);
  // Out-of-scope reads as "does not exist" — probing ids leaks nothing.
  if (!log || !canAccessShift(session, log.shiftId)) return undefined;
  return log;
}

export function getModeratorShifts(
  session: ModeratorSession,
): ModeratorShift[] {
  return scopeShifts(session, moderatorShifts);
}

export function createOrgLogFromScan(orgLog: OrgShiftLog): OrgShiftLog {
  if (orgLogs.some((log) => log.id === orgLog.id)) {
    return orgLog;
  }

  orgLogs = [orgLog, ...orgLogs];
  return orgLog;
}

function findAccessibleLog(
  session: ModeratorSession,
  logId: string,
): OrgShiftLog {
  const log = orgLogs.find((l) => l.id === logId);
  if (!log) {
    throw new Error("Log not found. It may have been removed.");
  }
  assertShiftAccess(session, log.shiftId);
  return log;
}

export function approveOrgLog(
  session: ModeratorSession,
  logId: string,
): OrgShiftLog {
  const log = findAccessibleLog(session, logId);
  if (log.status === "verified") {
    throw new Error("These hours are already verified.");
  }

  const updated: OrgShiftLog = {
    ...log,
    status: "verified",
    verifiedAt: new Date().toISOString(),
    verifiedByModeratorId: session.userId,
    rejectReason: undefined,
  };
  orgLogs = orgLogs.map((l) => (l.id === logId ? updated : l));
  syncOrgDecisionToStudent(updated);
  return updated;
}

export function rejectOrgLog(
  session: ModeratorSession,
  logId: string,
  reason?: string,
): OrgShiftLog {
  const log = findAccessibleLog(session, logId);

  const updated: OrgShiftLog = {
    ...log,
    status: "rejected",
    verifiedAt: null,
    verifiedByModeratorId: undefined,
    rejectReason: reason ?? "Rejected by moderator.",
  };
  orgLogs = orgLogs.map((l) => (l.id === logId ? updated : l));
  syncOrgDecisionToStudent(updated);
  return updated;
}

/** QR tokens: shift must be the org's AND within the session's access. */
function assertQrAccess(session: ModeratorSession, shiftId: string): void {
  if (!moderatorShifts.some((shift) => shift.id === shiftId)) {
    throw new Error("This shift does not belong to your organization.");
  }
  assertShiftAccess(session, shiftId);
}

export function getModeratorQrSession(
  session: ModeratorSession,
  shiftId: string,
): ShiftQrSession {
  assertQrAccess(session, shiftId);
  return ensureShiftQrSession(shiftId);
}

export function refreshModeratorQrSession(
  session: ModeratorSession,
  shiftId: string,
): ShiftQrSession {
  assertQrAccess(session, shiftId);
  return refreshShiftQrSession(shiftId);
}
```

(`createOrgLogFromScan` stays sessionless — it is called from the student QR-scan flow, not by moderators.)

- [ ] **Step 2: Update `apps/web/app/(moderator)/moderator/verifications/actions.ts`**

Replace the two exported actions so each resolves the session first (keep `revalidateModeratorDecisionPaths` exactly as is):

```ts
"use server";

import { revalidatePath } from "next/cache";
import { requireModerator } from "@/lib/auth/guards";
import {
  approveOrgLog,
  rejectOrgLog,
} from "@/lib/mock-store-server-moderator";
import type { OrgShiftLog } from "@/lib/types/moderator";

function revalidateModeratorDecisionPaths(logId: string, orgLog: OrgShiftLog): void {
  revalidatePath("/moderator");
  revalidatePath("/moderator/verifications");
  revalidatePath(`/moderator/verifications/${logId}`);
  revalidatePath(`/moderator/shifts/${orgLog.shiftId}`);

  if (orgLog.studentLogId) {
    revalidatePath("/hours");
    revalidatePath(`/hours/${orgLog.studentLogId}`);
    revalidatePath("/");
    revalidatePath("/goals");
  }
}

export async function approveLog(logId: string): Promise<OrgShiftLog> {
  const session = await requireModerator();
  const updated = approveOrgLog(session, logId);
  revalidateModeratorDecisionPaths(logId, updated);
  return updated;
}

export async function rejectLog(
  logId: string,
  reason?: string,
): Promise<OrgShiftLog> {
  const session = await requireModerator();
  const updated = rejectOrgLog(session, logId, reason);
  revalidateModeratorDecisionPaths(logId, updated);
  return updated;
}
```

- [ ] **Step 3: Update `apps/web/app/(moderator)/moderator/shifts/[shiftId]/actions.ts`**

```ts
"use server";

import { requireModerator } from "@/lib/auth/guards";
import { refreshModeratorQrSession } from "@/lib/mock-store-server-moderator";

export async function refreshQr(shiftId: string): Promise<{
  token: string;
  expiresAt: string;
}> {
  const moderator = await requireModerator();
  const session = refreshModeratorQrSession(moderator, shiftId);
  return {
    token: session.token,
    expiresAt: session.expiresAt,
  };
}
```

- [ ] **Step 4: Typecheck — expect known breakage list**

Run: `npm run check-types --workspace=web`
Expected failures **only** in callers fixed by Tasks 10–11: `app/(moderator)/moderator/layout.tsx` (`getOrgLogs()` now needs a session), `app/(moderator)/moderator/verifications/[logId]/page.tsx`, `app/(moderator)/moderator/shifts/[shiftId]/page.tsx`. Anything else failing means a mistake in this task.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/mock-store-server-moderator.ts "apps/web/app/(moderator)/moderator/verifications/actions.ts" "apps/web/app/(moderator)/moderator/shifts/[shiftId]/actions.ts"
git commit -m "feat: session-enforced moderator store and server actions"
```

---

### Task 10: Moderator layout, shell, and session context

**Files:**
- Create: `apps/web/components/moderator/session-provider.tsx`
- Modify: `apps/web/components/moderator/moderator-shell.tsx`
- Modify: `apps/web/app/(moderator)/moderator/layout.tsx`

- [ ] **Step 1: Create `apps/web/components/moderator/session-provider.tsx`**

```tsx
"use client";

import { createContext, useContext, useMemo } from "react";
import type { ModeratorSession } from "@/lib/auth/session";
import type { ModeratorProfile } from "@/lib/types/moderator";

interface ModeratorSessionValue {
  session: ModeratorSession;
  persona: ModeratorProfile;
}

const ModeratorSessionContext = createContext<ModeratorSessionValue | null>(
  null,
);

export function ModeratorSessionProvider({
  session,
  persona,
  children,
}: ModeratorSessionValue & { children: React.ReactNode }) {
  const value = useMemo(() => ({ session, persona }), [session, persona]);
  return (
    <ModeratorSessionContext.Provider value={value}>
      {children}
    </ModeratorSessionContext.Provider>
  );
}

export function useModeratorSession(): ModeratorSessionValue {
  const ctx = useContext(ModeratorSessionContext);
  if (!ctx) {
    throw new Error(
      "useModeratorSession must be used inside ModeratorSessionProvider",
    );
  }
  return ctx;
}
```

- [ ] **Step 2: Update `apps/web/components/moderator/moderator-shell.tsx`**

```tsx
"use client";

import { OrgLogsProvider } from "@/components/moderator/org-logs-provider";
import { ModeratorSessionProvider } from "@/components/moderator/session-provider";
import { ToastProvider } from "@/components/student/toast-provider";
import type { ModeratorSession } from "@/lib/auth/session";
import type { ModeratorProfile, OrgShiftLog } from "@/lib/types/moderator";

export function ModeratorShell({
  initialLogs,
  session,
  persona,
  children,
}: {
  initialLogs: OrgShiftLog[];
  session: ModeratorSession;
  persona: ModeratorProfile;
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <ModeratorSessionProvider session={session} persona={persona}>
        <OrgLogsProvider initialLogs={initialLogs}>{children}</OrgLogsProvider>
      </ModeratorSessionProvider>
    </ToastProvider>
  );
}
```

- [ ] **Step 3: Update `apps/web/app/(moderator)/moderator/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CommandPaletteLazy } from "@/components/moderator/command-palette-lazy";
import { MobileNav } from "@/components/moderator/mobile-nav";
import { ModeratorShell } from "@/components/moderator/moderator-shell";
import { Sidebar } from "@/components/moderator/sidebar";
import { requireModerator } from "@/lib/auth/guards";
import { moderatorProfiles } from "@/lib/mock-data-moderator";
import {
  getModeratorShifts,
  getOrgLogs,
} from "@/lib/mock-store-server-moderator";

export const metadata: Metadata = {
  title: "Kora — Org Portal",
  description:
    "Verify student hours, manage shifts, and display check-in codes for your organization.",
};

export default async function ModeratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireModerator();
  const persona = moderatorProfiles[session.userId];
  if (!persona) {
    redirect("/login");
  }

  const initialLogs = getOrgLogs(session);
  const shifts = getModeratorShifts(session);

  const nextUpcomingShift = [...shifts]
    .filter((shift) => shift.status === "upcoming")
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    )[0];
  const qrHref = nextUpcomingShift
    ? `/moderator/shifts/${nextUpcomingShift.id}`
    : "/moderator/shifts";

  return (
    <ModeratorShell initialLogs={initialLogs} session={session} persona={persona}>
      <div className="min-h-screen bg-canvas pb-20 text-ink lg:pb-0">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-pill focus:bg-panel focus:px-4 focus:py-2 focus:text-[13px] focus:font-semibold focus:text-cream"
        >
          Skip to content
        </a>
        <div className="mx-auto flex max-w-shell">
          <Sidebar />
          {children}
        </div>
        <MobileNav qrHref={qrHref} />
        {session.access === "macro" ? <CommandPaletteLazy /> : null}
      </div>
    </ModeratorShell>
  );
}
```

(The global command palette is macro-only: it deep-links into search/messages/dashboard.)

- [ ] **Step 4: Typecheck**

Run: `npm run check-types --workspace=web`
Expected failures shrink to: `MobileNav` (no `qrHref` prop yet — Task 12), `verifications/[logId]/page.tsx`, `shifts/[shiftId]/page.tsx`, dashboard/shifts pages still importing `moderatorShifts` is fine (read-only mock import, fixed in Task 11).

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/moderator/session-provider.tsx apps/web/components/moderator/moderator-shell.tsx "apps/web/app/(moderator)/moderator/layout.tsx"
git commit -m "feat: session-guarded moderator layout with session context"
```

---

### Task 11: Page-level guards + scoped fetches

**Files:**
- Modify: `apps/web/app/(moderator)/moderator/page.tsx`
- Modify: `apps/web/app/(moderator)/moderator/shifts/page.tsx`
- Modify: `apps/web/app/(moderator)/moderator/shifts/[shiftId]/page.tsx`
- Modify: `apps/web/app/(moderator)/moderator/verifications/[logId]/page.tsx`
- Modify: `apps/web/app/(moderator)/moderator/search/page.tsx`
- Modify: `apps/web/app/(moderator)/moderator/messages/page.tsx`
- Modify: `apps/web/app/(moderator)/moderator/profile/page.tsx`

- [ ] **Step 1: Dashboard `app/(moderator)/moderator/page.tsx` — macro-only + persona greeting**

```tsx
import { DashboardClient } from "@/components/moderator/dashboard-client";
import { PageShell } from "@/components/moderator/page-shell";
import { PageHeader } from "@/components/student/page-header";
import { requireMacro } from "@/lib/auth/guards";
import { moderatorProfiles } from "@/lib/mock-data-moderator";
import { getModeratorShifts } from "@/lib/mock-store-server-moderator";

export default async function ModeratorDashboardPage() {
  const session = await requireMacro();
  const persona = moderatorProfiles[session.userId];
  const firstName = persona ? persona.name.split(" ")[0] : "there";

  const upcomingShifts = getModeratorShifts(session)
    .filter((shift) => shift.status === "upcoming")
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );

  return (
    <PageShell>
      <PageHeader
        title={`Good morning, ${firstName}`}
        description="Here is where City Parks volunteering stands today."
      />
      <DashboardClient upcomingShifts={upcomingShifts} />
    </PageShell>
  );
}
```

- [ ] **Step 2: Shifts list `app/(moderator)/moderator/shifts/page.tsx` — scoped**

```tsx
import { PageShell } from "@/components/moderator/page-shell";
import { ShiftsPageClient } from "@/components/moderator/shifts-page-client";
import { PageHeader } from "@/components/student/page-header";
import { requireModerator } from "@/lib/auth/guards";
import { getModeratorShifts } from "@/lib/mock-store-server-moderator";

export default async function ModeratorShiftsPage() {
  const session = await requireModerator();
  const shifts = getModeratorShifts(session);

  return (
    <PageShell>
      <PageHeader
        title="Shifts"
        description="Your City Parks shift calendar. Open an upcoming shift to display its check-in code."
      />
      <ShiftsPageClient shifts={shifts} />
    </PageShell>
  );
}
```

- [ ] **Step 3: Shift detail `app/(moderator)/moderator/shifts/[shiftId]/page.tsx` — ownership → 404**

```tsx
import { notFound } from "next/navigation";
import { PageShell } from "@/components/moderator/page-shell";
import { ShiftDetailClient } from "@/components/moderator/shift-detail-client";
import { requireModerator } from "@/lib/auth/guards";
import { canAccessShift } from "@/lib/auth/scope";
import { getModeratorShiftById } from "@/lib/mock-data-moderator";
import { getModeratorQrSession } from "@/lib/mock-store-server-moderator";

export default async function ModeratorShiftDetailPage({
  params,
}: {
  params: Promise<{ shiftId: string }>;
}) {
  const session = await requireModerator();
  const { shiftId } = await params;
  const shift = getModeratorShiftById(shiftId);

  // Out-of-scope reads as nonexistent: probing ids confirms nothing.
  if (!shift || !canAccessShift(session, shift.id)) {
    notFound();
  }

  const qrSession =
    shift.status === "upcoming"
      ? getModeratorQrSession(session, shift.id)
      : null;

  return (
    <PageShell>
      <ShiftDetailClient
        shift={shift}
        qrSession={
          qrSession
            ? { token: qrSession.token, expiresAt: qrSession.expiresAt }
            : null
        }
      />
    </PageShell>
  );
}
```

- [ ] **Step 4: Verification detail `app/(moderator)/moderator/verifications/[logId]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { PageShell } from "@/components/moderator/page-shell";
import { VerificationDetail } from "@/components/moderator/verification-detail";
import { requireModerator } from "@/lib/auth/guards";
import { getOrgLogById } from "@/lib/mock-store-server-moderator";

interface VerificationDetailPageProps {
  params: Promise<{ logId: string }>;
}

export default async function VerificationDetailPage({
  params,
}: VerificationDetailPageProps) {
  const session = await requireModerator();
  const { logId } = await params;
  const log = getOrgLogById(session, logId);

  if (!log) {
    notFound();
  }

  return (
    <PageShell>
      <VerificationDetail initialLog={log} />
    </PageShell>
  );
}
```

(The verifications **list** page needs no change — it renders from `OrgLogsProvider`, whose `initialLogs` the layout already scopes.)

- [ ] **Step 5: Macro-gate search, messages, profile**

In each of `search/page.tsx`, `messages/page.tsx`, `profile/page.tsx`: make the default export `async`, and add the guard as the first statement. Example for messages (apply the same two-line pattern to all three):

```tsx
import { PageShell } from "@/components/moderator/page-shell";
import { MessagesPageClient } from "@/components/moderator/messages-page-client";
import { requireMacro } from "@/lib/auth/guards";

export default async function ModeratorMessagesPage() {
  await requireMacro();

  return (
    <PageShell>
      <MessagesPageClient />
    </PageShell>
  );
}
```

(search keeps its `Suspense`/fallback exactly as is; profile keeps its `currentModerator`-based header — it is macro-only, and macro *is* Elena.)

- [ ] **Step 6: Typecheck**

Run: `npm run check-types --workspace=web`
Expected: only the `MobileNav` `qrHref` prop error remains (Task 12).

- [ ] **Step 7: Commit**

```bash
git add "apps/web/app/(moderator)"
git commit -m "feat: page-level guards and scoped data fetches"
```

---

### Task 12: Nav, topbar, and sidebar wiring (behavior only — zero style changes)

Every change below swaps data sources or adds conditionals; classNames and markup structure stay identical.

**Files:**
- Modify: `apps/web/components/moderator/sidebar-nav.tsx`
- Modify: `apps/web/components/moderator/sidebar.tsx`
- Modify: `apps/web/components/moderator/topbar.tsx`
- Modify: `apps/web/components/moderator/mobile-nav.tsx`
- Modify: `apps/web/components/moderator/mobile-more-sheet.tsx`

- [ ] **Step 1: `sidebar-nav.tsx` — filter items through the policy**

Add imports and filter (keep the render body untouched):

```tsx
import { useModeratorSession } from "@/components/moderator/session-provider";
import { filterModeratorNav } from "@/lib/auth/policy";
```

Inside `SidebarNav()`, before `return`:

```tsx
const { session } = useModeratorSession();
const items = filterModeratorNav(session, nav);
```

…and change `nav.map(...)` to `items.map(...)`.

- [ ] **Step 2: `sidebar.tsx` — session persona + real sign-out**

- Replace `import { currentModerator } from "@/lib/mock-data-moderator";` with:

```tsx
import { signOut } from "@/app/login/actions";
import { useModeratorSession } from "@/components/moderator/session-provider";
import { isModeratorPathAllowed } from "@/lib/auth/policy";
```

- Remove the `useToast` import and `const toast = useToast();` (no longer used).
- Inside `Sidebar()`: `const { session, persona } = useModeratorSession();`
- Replace every `currentModerator.` with `persona.`.
- The account block links to `/moderator/profile`, which micro can't visit. Render the same inner content, but only wrap it in a `Link` for macro:

```tsx
{isModeratorPathAllowed(session, "/moderator/profile") ? (
  <Link
    href="/moderator/profile"
    className="flex items-center gap-3 rounded-chip px-3 py-2 transition-colors duration-200 hover:bg-accent-lavender/70"
  >
    {accountContent}
  </Link>
) : (
  <div className="flex items-center gap-3 rounded-chip px-3 py-2">
    {accountContent}
  </div>
)}
```

where `accountContent` is the existing `<img …/><div …>…</div>` pair extracted to a local variable (unchanged classes/content, `persona.` substituted).
- Replace the toast Logout button with a form submitting the server action (identical classes):

```tsx
<form action={signOut}>
  <button
    type="submit"
    className="flex w-full items-center gap-3 rounded-chip px-3 py-2.5 text-[15px] font-semibold text-danger transition-colors duration-200 hover:bg-danger/10"
  >
    <LogOut size={20} strokeWidth={2.2} className="shrink-0" />
    <span>Logout</span>
  </button>
</form>
```

- [ ] **Step 3: `topbar.tsx` — persona display + hide macro-only affordances for micro**

- Replace the `currentModerator` import with:

```tsx
import { useModeratorSession } from "@/components/moderator/session-provider";
import { isModeratorPathAllowed } from "@/lib/auth/policy";
```

- Inside `Topbar()`: `const { session, persona } = useModeratorSession();` and two flags:

```tsx
const canSearch = isModeratorPathAllowed(session, "/moderator/search");
const canMessage = isModeratorPathAllowed(session, "/moderator/messages");
```

- Replace every `currentModerator.` with `persona.`.
- Change the hardcoded `Org moderator` tagline to:

```tsx
{session.access === "macro" ? "Org moderator" : "Shift moderator"}
```

- Wrap the ⌘K search button in `{canSearch ? ( … ) : null}` (the palette itself is already macro-only via the layout).
- Wrap the Mail button block (the `div` with `ref={messagesAnchorRef}`) in `{canMessage ? ( … ) : null}`.
- Wrap the Bell block (`ref={notificationsAnchorRef}`) in `{session.access === "macro" ? ( … ) : null}` — the seeded notifications deep-link to flagged queues and messages across the whole org.
- The profile `Link` at the right: same pattern as the sidebar — keep the `Link` for macro, render the identical children inside a plain `<div className="hidden shrink-0 items-center gap-3 sm:flex">` for micro.

- [ ] **Step 4: `mobile-nav.tsx` — props + policy filtering**

- Delete the module-scope `nextUpcomingShift` / `showQrHref` computation and the `moderatorShifts` import; the layout now passes `qrHref`.
- New signature and session use:

```tsx
import { useModeratorSession } from "@/components/moderator/session-provider";
import { isModeratorPathAllowed } from "@/lib/auth/policy";

export function MobileNav({ qrHref }: { qrHref: string }) {
  const { session } = useModeratorSession();
  …
```

- Replace each `showQrHref` reference with `qrHref`.
- Wrap the Home tab (`href="/moderator"`) in `{isModeratorPathAllowed(session, "/moderator") ? ( … ) : null}`.
- Wrap the Messages tab in `{isModeratorPathAllowed(session, "/moderator/messages") ? ( … ) : null}`.
- Verify, Show QR, and More stay for everyone.

- [ ] **Step 5: `mobile-more-sheet.tsx` — filter the sheet links**

Add the same imports as Step 4, get `const { session } = useModeratorSession();` inside the component, and render `filterModeratorNav(session, moreItems)` instead of `moreItems` (this drops Search and Profile for micro; Shifts and Verifications remain).

- [ ] **Step 6: Lint, typecheck, tests**

Run:
```bash
npm run lint --workspace=web
npm run check-types --workspace=web
npm run test --workspace=web
```
Expected: all clean — this was the last known breakage.

- [ ] **Step 7: Commit**

```bash
git add apps/web/components/moderator
git commit -m "feat: session-driven nav, topbar persona, and sign-out"
```

---

### Task 13: Full verification matrix

**Files:** none (verification only).

- [ ] **Step 1: Automated checks**

```bash
npm run test --workspace=web        # session/policy/scope suites pass
npm run lint --workspace=web        # clean
npm run check-types --workspace=web # clean
npm run build --workspace=web       # production build succeeds
```

- [ ] **Step 2: Middleware matrix (curl, dev server running)**

Re-run the Task 7 curl matrix; all expectations must still hold.

- [ ] **Step 3: Browser matrix — Student (Maya)**

1. `/login` → click **Maya Chen** → lands on `/` student dashboard.
2. Visit `/moderator` → redirected to `/`.
3. (Student portal otherwise unchanged.)

- [ ] **Step 4: Browser matrix — Lead moderator (Elena, macro)**

1. Sign out (sidebar Logout) → `/login` → click **Elena Vasquez** → lands on `/moderator` dashboard, greeting "Good morning, Elena".
2. Sidebar shows Dashboard, Verifications, Shifts, Messages; topbar shows search, mail, bell, Elena's profile link.
3. Verifications lists **all** logs (Riverside + Trail Restoration + Playground Mulch); approving a Trail Restoration log succeeds.
4. `/login` while signed in → bounced back to `/moderator`.

- [ ] **Step 5: Browser matrix — Shift moderator (Dana, micro)**

1. Sign out → login as **Dana Whitfield** → lands on `/moderator/shifts/shift_riverside_cleanup` with the QR panel.
2. Sidebar shows only Verifications and Shifts; account block is not a link; topbar shows no search/mail/bell, tagline reads "Shift moderator", persona is Dana.
3. `/moderator`, `/moderator/search`, `/moderator/messages`, `/moderator/profile` all redirect to the Riverside shift page.
4. Shifts list shows only Riverside Park Cleanup. Verifications list shows only Riverside logs (Maya's pending 4 hrs). Approving it succeeds.
5. Probe a foreign resource: `/moderator/verifications/orglog_hannah_may24` and `/moderator/shifts/shift_parks_trail_may` both render the 404 page.
6. Mobile viewport (≤ lg): bottom nav shows Verify, Show QR, More (no Home, no Messages); More sheet lists only Shifts and Verifications.

- [ ] **Step 6: Forbidden mutation (the "physically blocked" proof)**

With the dev server running and Dana's session cookie, call the approve action against a foreign log. Easiest reliable check without hand-rolling the server-action protocol: temporarily run this in `node` against the store through a route — instead, verify at the unit level plus UI level:

1. Unit level (already automated): `scope.test.ts` proves `assertShiftAccess` throws `AuthorizationError` for foreign shifts, and Task 9 wired `approveOrgLog`/`rejectOrgLog` through `findAccessibleLog`.
2. Live level: as Dana, open browser devtools on `/moderator/verifications`, and replay the approve `POST` (copy as fetch from an own-shift approval, swap the log id to `orglog_hannah_may24`). Expected: the action responds with a digested server error (Next masks the message in prod mode; in dev you'll see `AuthorizationError: This shift is outside your assigned access.`) and Hannah's log stays pending for Elena.

- [ ] **Step 7: Commit any fixes found, then final commit if needed**

```bash
git status   # should be clean except intentional fixes
```

---

## Self-review record

- **Spec coverage:** §1 session model → Task 2; §2 login flow → Tasks 5, 8; §3 middleware/policy → Tasks 3, 7; §4 guards + store enforcement + notFound + action errors → Tasks 4, 6, 9, 11; §5 nav/topbar/layout wiring → Tasks 10, 12; §6 login visual design → Task 8; testing matrix → Task 13; production swap notes → comments in `guards.ts`/`mock-users.ts`.
- **Known intentional deviations:** `proxy.ts` instead of `middleware.ts` (Next 16), `requireMacro` redirects for pages with `assertMacro` as the throwing variant (documented in header).
- **Type consistency:** `Session`/`ModeratorSession`/`MacroSession` names match across Tasks 2–12; store signatures `(session, …)` match all call sites updated in Tasks 9–11; `MobileNav({ qrHref })` matches the layout in Task 10.
