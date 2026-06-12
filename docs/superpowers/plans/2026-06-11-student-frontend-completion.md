# Student Portal Frontend Completion Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the mock student portal into one cohesive, mobile-first product demo where hours/progress stay in sync, matching feels intelligent, navigation is obvious, and every major entity has a drill-down page.

**Architecture:** Introduce two shared client layers — `HoursProvider` (merged hours + derived progress) and `ToastProvider` (global feedback) — at `(student)/layout.tsx`. Extend `lib/matching.ts` with goals-aware scoring and human-readable reasons. Keep server actions for check-in validation; mirror successful scans into client hours store so dashboard updates instantly. No tRPC/Clerk/org portal.

**Tech Stack:** Next.js 14 App Router, React client stores (`useSyncExternalStore` pattern from `mock-profile-store.ts`), Tailwind v4, `lib/compliance/`.

**Verify after each phase:**
```bash
cd apps/web && npm run check-types && npm run lint && npm run build
```

**Do not commit unless the user explicitly asks.**

---

## File map

| File | Responsibility |
|------|----------------|
| `lib/hours-store.ts` | Client hours log store (localStorage + merge with seed) |
| `lib/progress.ts` | Derived verified hours, category gaps, progress snapshot |
| `lib/matching.ts` | Goals-aware rank + `getMatchReasons()` |
| `lib/orgs.ts` | `getOrgById`, org helpers |
| `components/student/hours-provider.tsx` | Context: logs, refresh, append after scan |
| `components/student/toast-provider.tsx` | Global toast queue |
| `components/student/match-badge.tsx` | Reusable match chip |
| `components/student/match-explainer.tsx` | "Why this shift" block |
| `components/student/for-you-empty.tsx` | No skills / no matches CTA |
| `components/student/dashboard-next-action.tsx` | Mobile/tablet "what to do next" |
| `components/student/search-page-client.tsx` | Unified search results |
| `components/student/org-detail-client.tsx` | Org profile + shifts |
| `components/student/log-hours-mobile-list.tsx` | Card layout for committed shifts |
| `components/student/check-in-scanner.tsx` | Large mobile check-in UI |
| `components/student/mobile-more-sheet.tsx` | More nav sheet on mobile |
| `app/(student)/search/page.tsx` | Search route |
| `app/(student)/organizations/[orgId]/page.tsx` | Org detail route |
| `app/(student)/not-found.tsx` | Branded 404 |
| `app/(student)/loading.tsx` | Shell skeleton |

---

## Phase 1 — Unified hours & progress

### Task 1: Hours store + progress helpers
- Create `apps/web/lib/hours-store.ts` using `useSyncExternalStore` (mirror `mock-profile-store.ts`)
- Create `apps/web/lib/progress.ts` with `getProgressSnapshot(logs)`
- Merge seed `hoursLog` with client-scanned logs in localStorage key `kora-hours-store-v1`
- Export `useHoursStore()` => `{ logs, appendLog, replaceLogs }`

### Task 2: HoursProvider at layout
- Create `apps/web/components/student/hours-provider.tsx`
- Export `useHours()` => `{ logs, progress, appendLog }`
- Modify `apps/web/app/(student)/layout.tsx` — server fetches `getAllHoursLogs()`, wraps children in `HoursProvider` + `ToastProvider`

### Task 3: Rewire progress consumers
- `requirements-carousel.tsx` — use `useHours().logs`
- `hours-table.tsx` — client component, `logs.slice(0, 4)`
- `right-rail.tsx` — use `progress.verifiedHours`, `progress.hoursRemaining`
- `progress-ring.tsx` — accept props from context
- `profile-page-client.tsx` — hat unlocks from `progress.verifiedHours`
- `use-student-avatar.ts` — use verified hours from context or param
- `scan-qr-panel.tsx` — call `appendLog` on successful scan

---

## Phase 2 — Toast system

### Task 4: Toast provider
- Create `apps/web/components/student/toast-provider.tsx`
- Export `useToast()` with `success(message)` and `error(message)`
- Wire to: shift-detail commit, profile skill changes, mock-store save/follow handlers in components

---

## Phase 3 — Navigation & IA

### Task 5: Mobile nav
- Modify `mobile-nav.tsx` — Home, Events, Log Hours (center/primary), Goals, More sheet
- Create `mobile-more-sheet.tsx` — Schedule, Hours, Organizations, Messages, Profile

### Task 6: Desktop sidebar
- Add Log Hours to `sidebar-nav.tsx`
- Rename Settings → Profile in `sidebar.tsx`
- Logout button shows toast "Sign-in coming soon" (no href="#")
- Remove or wire `MoreVertical` in `right-rail.tsx`

---

## Phase 4 — AI matching / For You

### Task 7: Enhanced matching
- Extend `lib/matching.ts` with `MatchResult`, goals boost (+0.15 for category gaps), `getMatchLabel()`
- Create `match-badge.tsx`, `match-explainer.tsx`, `for-you-empty.tsx`

### Task 8: Events For You tab
- Add `for-you` tab to `events-page-client.tsx` (default when no tab)
- `shifts-carousel.tsx` "See all" → `/events?tab=for-you`
- Shift cards show match badge

### Task 9: Profile matching loop
- Profile shows "X events match your skills"
- Toast on skill change: "Recommendations updated"

---

## Phase 5 — Search

### Task 10: Unified search
- Create `app/(student)/search/page.tsx` + `search-page-client.tsx`
- Topbar routes to `/search?q=...`
- Sections: Events, Organizations, Hours

---

## Phase 6 — Organization detail

### Task 11: Org detail route
- Create `lib/orgs.ts`, `organizations/[orgId]/page.tsx`, `org-detail-client.tsx`
- `org-card.tsx` links to org detail
- `shift-detail-summary.tsx` org link → `/organizations/${shift.orgId}`

---

## Phase 7 — Mobile check-in

### Task 12: Check-in scanner UX
- Create `check-in-scanner.tsx` — large mobile input, camera shell modal (mock)
- Update `scan-qr-panel.tsx` to use it

### Task 13: Log hours mobile list
- Create `log-hours-mobile-list.tsx`
- `log-hours-page-client.tsx` — cards below md, table above

---

## Phase 8 — Dashboard mobile

### Task 14: Next action card
- Create `dashboard-next-action.tsx` — committed shift / hours remaining / top match / browse
- Add to `page.tsx` below xl breakpoint
- Delete unused `hero.tsx` and `category-cards.tsx`

### Task 15: Right rail compact reuse optional

---

## Phase 9 — Cross-linking

### Task 16: Query-param deep links
- `/hours?status=` and `/hours?q=` in hours-ledger
- Goals category chart → `/hours?category=`
- Add category filter to hours-filters if missing

---

## Phase 10 — Polish

### Task 17: not-found.tsx + loading.tsx in `(student)/`
### Task 18: alt text on shift/org images, aria-labels on carousel buttons
### Task 19: Grep cleanup stale hoursLog imports

---

## Manual test plan

| # | Flow | Expected |
|---|------|----------|
| 1 | Edit skills on Profile | For You reorders; toast shows |
| 2 | Check in with demo token | Dashboard hours + goals update |
| 3 | Mobile nav | Log Hours one tap |
| 4 | Search "library" | Multi-section results |
| 5 | Org card tap | Org detail |
| 6 | Events For You tab | Matched shifts only |
| 7 | check-types && lint && build | Pass |
