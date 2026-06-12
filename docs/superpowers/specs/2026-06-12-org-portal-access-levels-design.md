  # Kora Org Portal — Macro/Micro Access Levels & Mock Auth

**Date:** 2026-06-12
**Scope:** `apps/web` — App Router auth architecture: session model, `/login` page,
middleware, authorization guards, data scoping. Existing UI components, Tailwind, and
layouts are frozen; the only new visual surface is `/login`.
**Constraint:** When mock auth is later swapped for Clerk, middleware routing and all
authorization logic must not change — only the session module's internals.

## Concept

An organization on Kora has two levels of user access:

- **Macro (lead moderator):** tied to the whole organization. Global views of all org
  shifts, event creation, full admin access to the org profile.
- **Micro (shift moderator):** tied strictly to specific shift(s). Can view the roster,
  display QR check-in codes, and approve/reject hour logs **for their assigned shifts
  only**. Cannot create events, see global org data, or access org admin surfaces.

A micro user must be *physically* blocked from macro routes **and** macro server
actions — enforcement lives at the data boundary, not just in navigation.

### Approaches considered

1. **Middleware-heavy enforcement** — full route-permission map in middleware, pages
   trusted. Rejected: middleware cannot protect server actions or do per-shift
   ownership checks, and it becomes the thing that must change when auth gets real.
2. **Physical route-group separation** — separate `(macro)`/`(micro)` route groups.
   Rejected: duplicates page wiring; user chose shared routes with scoped data.
3. **Middleware routes, data layer enforces** — **chosen.** Middleware does coarse
   role→portal routing only; authorization happens in guard functions called by every
   data fetch and server action. Matches Next.js guidance (middleware is optimistic;
   real checks live next to the data).

## 1. Session model (the swap seam)

`lib/auth/session.ts` defines one discriminated union, shaped to mirror future Clerk
session claims:

```ts
type Session =
  | { role: "STUDENT"; userId: string }
  | { role: "ORG_MODERATOR"; access: "macro"; userId: string; orgId: string }
  | { role: "ORG_MODERATOR"; access: "micro"; userId: string; orgId: string; shiftIds: string[] };
```

- Mock implementation: JSON in an `httpOnly`, `sameSite=lax`, path=`/` cookie named
  `kora_session`.
- `getSession(): Session | null` is the **only** function that knows where sessions
  come from. The Clerk swap replaces its internals with `auth()` + a claims→`Session`
  mapping. Middleware reads the cookie through a shared parse helper from the same
  module (edge-safe, no Node APIs).
- Micro context (`shiftIds`) travels **in the session**, not fetched from the store —
  this is what lets middleware route micro users with zero data access, exactly as a
  production JWT claim would.

## 2. Login flow

- `app/login/page.tsx` — standalone screen outside both route groups (no portal shell).
  Three persona buttons: **Login as Student**, **Login as Lead Moderator**,
  **Login as Shift Moderator**.
- `app/login/actions.ts` — one server action `loginAs(personaId)`: validates the id
  against the persona table, sets the session cookie, `redirect("/")`. `/` is the
  neutral entry point; middleware routes from there. A `signOut()` action clears the
  cookie and redirects to `/login`.
- `lib/auth/mock-users.ts` — persona table:
  - existing student persona (id reused from student mock data);
  - **Elena Vasquez** (`mod_parks`) — macro, `org_city_parks` (existing);
  - **new micro persona** — shift lead for City Parks assigned only to
    `shift_riverside_cleanup`, added to `mock-data-moderator.ts`.
- Sign-out is wired into the existing topbar persona menu — behavior only, no
  restyling.

## 3. Middleware (routing, not security)

New `apps/web/middleware.ts`, rules driven by a route-policy map in
`lib/auth/policy.ts` (single source of truth, importable by middleware, nav filtering,
and tests):

1. No session on any app route → redirect `/login`. Session present on `/login` →
   redirect to portal home.
2. `STUDENT` on `/moderator/*` → redirect `/`. `ORG_MODERATOR` on student routes →
   redirect `/moderator`.
3. **Micro** moderator on a macro-only prefix — `/moderator` (dashboard, exact),
   `/moderator/search`, `/moderator/messages`, `/moderator/profile` — → redirect to
   their home: `/moderator/shifts/{shiftId}` when they staff exactly one shift, else
   `/moderator/shifts`.
4. Static assets, `/api`, and Next internals excluded via the matcher.

Micro-reachable routes: `/moderator/shifts`, `/moderator/shifts/[shiftId]`,
`/moderator/verifications`, `/moderator/verifications/[logId]` — all data-scoped.
Middleware is deliberately coarse: it never decides whether a specific log or shift
belongs to the user. That is the data layer's job.

## 4. Guards + data scoping (the security boundary)

`lib/auth/guards.ts` (server-only, imports `server-only`):

- `requireSession()` / `requireModerator()` — redirect to `/login` when absent.
  Called in each portal's layout as the second layer behind middleware.
- `requireMacro()` — throws `AuthorizationError` for micro sessions. Used by
  macro-only pages and actions (dashboard fetch, event creation, org profile
  mutations, search, messages).
- `assertShiftAccess(session, shiftId)` — macro: shift must belong to
  `session.orgId`; micro: `shiftId ∈ session.shiftIds`.
- `assertLogAccess(session, logId)` — resolves log → its shift → `assertShiftAccess`.

`lib/mock-store-server-moderator.ts` becomes session-aware; every function enforces
internally, so a micro user invoking a server action directly is blocked by the store
itself:

- `getOrgLogs(session)` / `getModeratorShifts(session)` — macro: all org data;
  micro: only their shifts' data.
- `approveOrgLog` / `rejectOrgLog` — `assertLogAccess` first;
  `verifiedByModeratorId` comes from `session.userId` (replaces hardcoded
  `currentModerator`). Micro **can** verify logs on their own shifts (user decision).
- QR session issue/refresh — `assertShiftAccess` (replaces org-wide `assertOrgShift`).
- Detail pages call `notFound()` for out-of-scope resources, so a micro user probing
  a foreign log/shift id cannot confirm it exists.
- Server actions surface `AuthorizationError` through the existing error paths (the
  store already throws user-facing `Error`s today).

## 5. Wiring into the existing UI

No Tailwind or layout changes; data changes only:

- Sidebar and mobile nav render their item lists filtered through the policy map —
  micro users do not see Dashboard / Search / Messages / Profile entries.
- Topbar displays the session persona (name, avatar, role line) instead of the
  hardcoded Elena; persona menu gains a Sign out item.
- Moderator layout calls `requireModerator()` and passes scoped data down; pages keep
  their exact markup and receive scoped data.
- Student portal changes are minimal: middleware protection + login; no student page
  rewiring.

## 6. `/login` visual design

Produced under `redesign-existing-projects` + `emil-design-eng` against the Kora
Ledger token system (`globals.css`). The page **consumes existing tokens only** — no
new colors, fonts, radii, or shadows.

- **Split panel, not a centered card.** Left ~40% `bg-panel` (dark teal ledger)
  column: Fraunces wordmark + one quiet line of copy. Right ~60% `bg-canvas` (warm
  paper): the persona list, max content width ~480px, bottom padding slightly larger
  than top. Mobile: single canvas column with a slim panel band on top.
- **Personas as three wide stacked rows**, not three equal buttons: dicebear avatar,
  name at 600 weight, muted role line ("Student · Westview High",
  "Lead moderator · City Parks Dept.", "Shift moderator · Riverside Park Cleanup"),
  trailing chevron. Rows are `rounded-card` `bg-surface` `shadow-card` full-width
  `<button>`s, each inside its own `<form>` submitting the login action (real
  buttons → global `:focus-visible` ring applies).
- **Type & copy:** Fraunces headline, sentence case ("Choose a session"),
  `text-wrap: balance`. `font-mono` eyebrow above it:
  "mock session — replaced by Clerk in production". No exclamation marks.
- **Motion:** rows stagger in with existing `--animate-rise` at 0/50/100 ms delays.
  Hover: `shadow-raised` + `translateY(-1px)`, 160 ms `var(--ease-soft)`, gated
  behind `@media (hover: hover) and (pointer: fine)`; `:active` scale `0.98`; never
  `transition: all`. Pending: chosen row drops to opacity .7 + `blur(2px)` with a
  small spinner; other rows disable. `prefers-reduced-motion`: keep fades, drop
  transforms.
- **Error state** (cookie write fails): inline message under the list —
  "Couldn't start the session. Try again."

## Files

**New:** `middleware.ts`, `lib/auth/session.ts`, `lib/auth/policy.ts`,
`lib/auth/guards.ts`, `lib/auth/mock-users.ts`, `app/login/page.tsx`,
`app/login/actions.ts`.

**Modified:** `lib/mock-store-server-moderator.ts`, `lib/mock-data-moderator.ts`
(micro persona), `app/(moderator)/moderator/layout.tsx`,
`app/(moderator)/moderator/verifications/actions.ts`,
`app/(moderator)/moderator/shifts/[shiftId]/actions.ts`, moderator pages (scoped
fetches), `components/moderator/sidebar.tsx` / `mobile-nav.tsx` / `topbar.tsx`
(nav filtering + session persona, no style changes).

## Testing

Manual matrix via `/login`, verified during implementation:

| Persona | Lands on | Blocked URLs redirect | Data scope | Forbidden mutation |
|---|---|---|---|---|
| Student | `/` | `/moderator/*` → `/` | n/a | n/a |
| Lead (macro) | `/moderator` | `/login` → home | all org shifts/logs | — |
| Shift (micro) | `/moderator/shifts/shift_riverside_cleanup` | dashboard/search/messages/profile → shift home | only riverside shift + its logs; foreign log id → 404 | approving a foreign-shift log via direct action call throws `AuthorizationError` |

Plus: sign-out clears cookie and lands on `/login`; unauthenticated hit on any app
route redirects to `/login`.

## Production swap (Clerk)

- `getSession()` internals → Clerk `auth()` + claims mapping; same `Session` type.
- `middleware.ts` wraps the same policy map in `clerkMiddleware`.
- `/login` mock actions deleted in favor of Clerk sign-in; page can remain as a
  styled entry that hosts Clerk components.
- Guards, policy map, store enforcement, nav filtering: unchanged.
