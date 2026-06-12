# Org Moderator Portal (Mock MVP) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the org moderator portal frontend (`/moderator/*`) for Elena Vasquez at City Parks & Rec — dashboard, verification queue, shift list, and rotating shift-QR display — mirroring the student portal's design language and mock-layer architecture.

**Architecture:** New route group `app/(moderator)/moderator/` with its own `ModeratorShell` (reuses student `ToastProvider`, adds `OrgLogsProvider`). Moderator-only seed data + server store live in `lib/mock-data-moderator.ts` / `lib/mock-store-server-moderator.ts`; the existing `lib/mock-store-server.ts` gains `ensureShiftQrSession`/`refreshShiftQrSession` so the moderator's displayed QR and the student's scanner share one session list. Server `page.tsx` + client `*-page-client.tsx` + colocated `actions.ts`, exactly like the student portal. No tRPC/Clerk/Prisma.

**Tech Stack:** Next.js App Router, React client context, Tailwind v4 tokens from `globals.css`, Lucide (`strokeWidth={2.2}`), `qrcode` (already a dep) for client-side QR rendering.

**Verify after each phase:**
```bash
cd apps/web && npm run check-types && npm run lint && npm run build
```

**Do not commit unless the user explicitly asks.**

---

## Design decisions (locked)

- **Persona:** Elena Vasquez (`mod_parks`), org `org_city_parks` ("City Parks Dept."). All data scoped to that org.
- **Org shift inventory:** shared `shifts` only has one City Parks shift, so `mock-data-moderator.ts` defines `moderatorShifts`: `shift_riverside_cleanup` (referenced from shared data) plus three City-Parks-only shifts (one upcoming, two past) that the student portal never reads.
- **Verification logs:** student-side `hoursLog` is Maya-only, so the moderator gets its own `OrgShiftLog` seed (multiple students, statuses `pending`/`flagged`/`verified`/`rejected`). `OrgLogStatus = LogStatus | "rejected"` lives in `lib/types/moderator.ts` so student types stay untouched.
- **Fraud narrative:** flagged seed logs reproduce the CLAUDE.md rule — 3 students logging identical unverified hours within 10 minutes.
- **QR flow:** moderator **displays** the rotating shift QR (15-min TTL from `qr-token.ts`); the student scanner already consumes it. Sessions must live in the *existing* server store state so a moderator-refreshed token immediately validates for a student scan. Moderator store guards that tokens are only issued for her org's shifts (no cross-org issuance — mirrors FERPA scoping discipline).
- **Reused student components (generic, not forked):** `toast-provider.tsx`, `page-header.tsx`. Everything shell-related (sidebar, topbar, mobile nav, page shell) is forked into `components/moderator/` because contents differ.

## File map

| File | Responsibility |
|------|----------------|
| `lib/types/moderator.ts` | `OrgLogStatus`, `OrgShiftLog`, `ModeratorShift`, `ModeratorProfile` |
| `lib/mock-data-moderator.ts` | Elena persona, `moderatorShifts`, seed `orgShiftLogs` |
| `lib/mock-store-server.ts` (modify) | add `ensureShiftQrSession(shiftId)`, `refreshShiftQrSession(shiftId)` |
| `lib/mock-store-server-moderator.ts` | org log state, `approveOrgLog`, `rejectOrgLog`, org-scoped QR helpers |
| `app/(moderator)/moderator/layout.tsx` | server layout: fetch logs, `ModeratorShell`, sidebar, mobile nav, metadata |
| `app/(moderator)/moderator/loading.tsx` | shell skeleton |
| `app/(moderator)/moderator/page.tsx` | dashboard (server) |
| `app/(moderator)/moderator/verifications/page.tsx` + `actions.ts` | queue route + approve/reject server actions |
| `app/(moderator)/moderator/shifts/page.tsx` | shift list route |
| `app/(moderator)/moderator/shifts/[shiftId]/page.tsx` + `actions.ts` | shift detail + QR session route + refresh action |
| `components/moderator/moderator-shell.tsx` | `ToastProvider` + `OrgLogsProvider` |
| `components/moderator/org-logs-provider.tsx` | client log state, approve/reject wrappers |
| `components/moderator/sidebar.tsx`, `sidebar-nav.tsx` | desktop nav (Dashboard / Verifications / Shifts), pending badge |
| `components/moderator/topbar.tsx` | Elena identity header, org chip |
| `components/moderator/mobile-nav.tsx` | bottom nav, center "Show QR" CTA |
| `components/moderator/page-shell.tsx` | main column wrapper using moderator topbar |
| `components/moderator/stat-card.tsx` | dashboard stat tile |
| `components/moderator/dashboard-client.tsx` | stats + pending preview (uses provider) |
| `components/moderator/verifications-page-client.tsx` | tabbed queue (Pending / Flagged / History) |
| `components/moderator/verification-row.tsx` | one log row: student, hours, approve/reject |
| `components/moderator/shifts-page-client.tsx` | upcoming/past shift cards |
| `components/moderator/qr-display-panel.tsx` | large QR, countdown, refresh, copy fallback |
| `components/moderator/shift-detail-client.tsx` | shift info + QR panel composition |

---

## Phase 1 — Types, seed data, server stores

### Task 1: Moderator types
- [x] Create `lib/types/moderator.ts`:

```ts
import type { CategoryKey, LogStatus, OrgModerator, TintKey } from "@/lib/types/student";

export type OrgLogStatus = LogStatus | "rejected";

export interface OrgShiftLog {
  id: string;
  shiftId: string;
  shiftTitle: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  school: string;
  category: string;
  categoryKey: CategoryKey;
  categoryTint: TintKey;
  date: string;            // display date
  completedAt: string;     // ISO
  hours: number;
  status: OrgLogStatus;
  method: "qr" | "manual"; // how the student checked in
  verifiedAt: string | null;
  verifiedByModeratorId?: string;
  flagReason?: string;
  rejectReason?: string;
}

export interface ModeratorShift {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryKey: CategoryKey;
  categoryTint: TintKey;
  date: string;
  scheduledAt: string; // ISO
  slots: number;
  committedCount: number;
  checkedInCount: number;
  hours: number;
  location: string;
  img: string;
  status: "upcoming" | "completed";
}

export interface ModeratorProfile extends OrgModerator {
  orgId: string;
  orgName: string;
  orgAvatar: string;
}
```

### Task 2: Moderator seed data
- [x] Create `lib/mock-data-moderator.ts` with `currentModerator` (Elena + org_city_parks), `moderatorShifts` (riverside cleanup mirrored from shared `shifts` by id, plus `shift_parks_native_garden` upcoming and `shift_parks_mulch_apr`, `shift_parks_trail_may` completed), and `orgShiftLogs` seed:
  - 4 `pending` (incl. Maya Chen's riverside entries told from the org side, plus other students; at least one `method: "manual"` with a note-worthy date)
  - 3 `flagged` — Jordan Park, Sofia Reyes, Devin Walters logging identical 3 hrs within 10 minutes (`flagReason` cites the fraud rule)
  - 4 `verified` history (one `verifiedByModeratorId: "mod_parks"`)
  - 1 `rejected` history
  - Student avatars via dicebear like existing seeds. Export `getOrgShiftById(id)` helper.

### Task 3: Shared QR session helpers
- [x] Modify `lib/mock-store-server.ts` — add (keeping existing exports untouched):

```ts
export function ensureShiftQrSession(shiftId: string): ShiftQrSession {
  const existing = shiftQrSessions.find((s) => s.shiftId === shiftId);
  if (existing && new Date(existing.expiresAt).getTime() > Date.now()) {
    return existing;
  }
  return refreshShiftQrSession(shiftId);
}

export function refreshShiftQrSession(shiftId: string): ShiftQrSession {
  const { token, expiresAt, issuedAt } = generateShiftQrToken(shiftId);
  const session: ShiftQrSession = {
    shiftId,
    token,
    issuedAt,
    expiresAt: expiresAt.toISOString(),
  };
  shiftQrSessions = [
    ...shiftQrSessions.filter((s) => s.shiftId !== shiftId),
    session,
  ];
  return session;
}
```
  - Export the `ShiftQrSession` interface.

### Task 4: Moderator server store
- [x] Create `lib/mock-store-server-moderator.ts`:

```ts
import { currentModerator, moderatorShifts, orgShiftLogs as seedLogs } from "@/lib/mock-data-moderator";
import { ensureShiftQrSession, refreshShiftQrSession } from "@/lib/mock-store-server";
import type { OrgShiftLog } from "@/lib/types/moderator";

let orgLogs: OrgShiftLog[] = [...seedLogs];

export function getOrgLogs(): OrgShiftLog[] { /* sorted by completedAt desc */ }

export function approveOrgLog(logId: string): OrgShiftLog { /* status="verified", verifiedAt=now, verifiedByModeratorId=currentModerator.id; throw if not found or already verified */ }

export function rejectOrgLog(logId: string, reason?: string): OrgShiftLog { /* status="rejected", rejectReason, clears verifiedAt */ }

function assertOrgShift(shiftId: string) { /* throw unless shiftId in moderatorShifts — no cross-org token issuance */ }

export function getModeratorQrSession(shiftId: string) { assertOrgShift(shiftId); return ensureShiftQrSession(shiftId); }
export function refreshModeratorQrSession(shiftId: string) { assertOrgShift(shiftId); return refreshShiftQrSession(shiftId); }
```

- [x] Verify: `cd apps/web && npm run check-types && npm run lint && npm run build`

## Phase 2 — Shell (layout, sidebar, topbar, mobile nav)

### Task 5: Providers
- [x] Create `components/moderator/org-logs-provider.tsx` (client). Context value: `{ logs, pendingCount, flaggedCount, approve(logId), reject(logId) }`. `approve`/`reject` call the server actions from Task 9, then replace the log in local state and return the updated log. Initial state from `initialLogs` prop.
- [x] Create `components/moderator/moderator-shell.tsx` mirroring `student-shell.tsx`: `ToastProvider` (reused from `@/components/student/toast-provider`) wrapping `OrgLogsProvider`.

### Task 6: Nav chrome
- [x] Create `components/moderator/sidebar-nav.tsx`: items Dashboard `/moderator` (CircleGauge), Verifications `/moderator/verifications` (BadgeCheck) with ember dot when `pendingCount > 0`, Shifts `/moderator/shifts` (CalendarDays). Same active/hover classes as student `sidebar-nav.tsx`; no hotkeys, no collapse prop (fixed expanded sidebar — keep the fork simple).
- [x] Create `components/moderator/sidebar.tsx`: same visual frame as student sidebar minus collapse logic; section label "Org Portal"; account block shows Elena avatar + "Logout" toast button.
- [x] Create `components/moderator/topbar.tsx`: left — `font-display` "City Parks Dept." with verified BadgeCheck chip + `font-mono` "ORG MODERATOR" label; right — Elena avatar `img` + name/roleTitle (hidden below xl). No search/messages popups.
- [x] Create `components/moderator/mobile-nav.tsx`: Home, Verifications (ember dot), center raised CTA "Show QR" → `/moderator/shifts/${nextUpcomingShiftId}` (QrCode icon), Shifts. Same fixed-bottom styling as student `mobile-nav.tsx`.
- [x] Create `components/moderator/page-shell.tsx`: same as student `page-shell.tsx` but imports moderator `Topbar` and has no right rail.

### Task 7: Layout + loading
- [x] Create `app/(moderator)/moderator/layout.tsx`: server component, `getOrgLogs()` → `ModeratorShell initialLogs`, skip-link, `max-w-shell` flex with `Sidebar`, `MobileNav`; `export const metadata = { title: "Kora — Org Portal", ... }`.
- [x] Create `app/(moderator)/moderator/loading.tsx`: pulse skeleton like student `loading.tsx`.
- [x] Temporary dashboard stub `page.tsx` so the route builds (replaced in Phase 3).
- [x] Verify: `cd apps/web && npm run check-types && npm run lint && npm run build`

## Phase 3 — Dashboard

### Task 8: Dashboard
- [x] Create `components/moderator/stat-card.tsx`: surface card, `font-mono` uppercase label, big `font-display` number, tinted icon chip.
- [x] Create `components/moderator/dashboard-client.tsx`: uses `useOrgLogs()`; stat grid (Pending review, Flagged, Verified hours total, Upcoming shifts); "Needs review" list (top 4 pending/flagged) with inline Approve button + link to `/moderator/verifications`; "Next shift" card with Display QR link to shift detail.
- [x] Replace `app/(moderator)/moderator/page.tsx`: `PageShell` + `PageHeader` ("Good morning, Elena" / org context) + `DashboardClient` (pass `moderatorShifts` upcoming).
- [x] Verify phase commands.

## Phase 4 — Verifications

### Task 9: Actions
- [x] Create `app/(moderator)/moderator/verifications/actions.ts` (`"use server"`): `approveLog(logId)` / `rejectLog(logId)` thin wrappers over the moderator store, returning the updated `OrgShiftLog`.

### Task 10: Queue UI
- [x] Create `components/moderator/verification-row.tsx`: student avatar/name/school, shift title, date, `font-mono` hours, category pill (reuse `tints`), status badge (verified/pending/flagged/rejected — extend the student `statusConfig` pattern locally with a `rejected` entry using XCircle/`text-muted`), flag reason callout for flagged rows, Approve (primary pill) + Reject (ghost) buttons that call provider methods and toast.
- [x] Create `components/moderator/verifications-page-client.tsx`: tab pills Pending (`n`) / Flagged (`n`) / History; rows animate in with `stagger`; empty states per tab.
- [x] Create `app/(moderator)/moderator/verifications/page.tsx`: `PageShell` + `PageHeader` ("Verifications", "Approve hours so they count toward student requirements") + client.
- [x] Verify phase commands.

## Phase 5 — Shifts + QR display

### Task 11: Shift list
- [x] Create `components/moderator/shifts-page-client.tsx`: "Upcoming" and "Completed" sections; each card shows img, title, date, location, slots fill (`committedCount/slots`), checked-in count for completed; upcoming cards have "Display QR" CTA → `/moderator/shifts/[id]`.
- [x] Create `app/(moderator)/moderator/shifts/page.tsx`.

### Task 12: QR panel + detail route
- [x] Create `app/(moderator)/moderator/shifts/[shiftId]/actions.ts` (`"use server"`): `refreshQr(shiftId)` → `refreshModeratorQrSession`, returns `{ token, expiresAt }`.
- [x] Create `components/moderator/qr-display-panel.tsx` (client): renders token via `import QRCode from "qrcode"` `toDataURL` in an effect; QR sized large-first (`w-full max-w-[340px]` centered); `font-mono` countdown `MM:SS` to `expiresAt` ticking 1s; expired state dims QR + shows "Code expired" with Refresh primary; RefreshCw button calls `refreshQr` (toast "New check-in code issued"); Copy-token fallback button (`navigator.clipboard`, toast). Only upcoming shifts get a panel.
- [x] Create `components/moderator/shift-detail-client.tsx` + `app/(moderator)/moderator/shifts/[shiftId]/page.tsx`: server page resolves shift from `moderatorShifts` (else `notFound()`), calls `getModeratorQrSession` for upcoming shifts, renders hero summary + QR panel + that shift's logs (filter provider logs by shiftId).
- [x] Verify phase commands.

## Phase 6 — Final pass

### Task 13: Polish + full verification
- [x] alt text on images, aria-labels on icon-only buttons; grep for unused imports.
- [x] Run full manual flow check: `/moderator` stats match seed; approve a pending log → toast + History tab + dashboard count drops; flagged log shows fraud reason; `/moderator/shifts/shift_riverside_cleanup` shows QR with live countdown; Refresh issues a new token; copy works.
- [x] Cross-portal QR check: refresh riverside QR as moderator, then in student portal `/log-hours` confirm scanning that token verifies (student must be committed — riverside is not committed by default; use food-bank session via `ensureShiftQrSession` only if needed — this check is observational, do not change student seeds).
- [x] Final: `cd apps/web && npm run check-types && npm run lint && npm run build`

## Self-review notes

- Spec coverage: route prefix ✓ (Tasks 7+), visual system ✓ (forked chrome reuses tokens), component split ✓, providers ✓ (Task 5), mock-only ✓ (no API routes; server actions only), persona scoping ✓ (Task 2/4 guard), QR display flow ✓ (Task 12: large mobile QR, 15-min countdown, refresh, copy), verification approve/reject ✓ (Tasks 9–10), no commits ✓, per-phase verification ✓.
- `rejected` status deliberately lives only in moderator types; `lib/progress.ts` and student types untouched.
