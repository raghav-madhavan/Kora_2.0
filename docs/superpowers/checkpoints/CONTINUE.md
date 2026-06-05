# CONTINUE HERE — Kora Student Portal

> **Paste this into a new Cursor chat** to resume without losing context.

## Session status (2026-06-05)

**Student portal MVP is implemented** on the mock-data layer. All 6 plan phases completed. `check-types`, `lint`, and `build` all pass. **Nothing committed yet** — all changes are local working tree.

## What was built

- **Routes:** `/` (dashboard), `/events`, `/hours`, `/goals`, `/organizations`, `/log-hours`, `/log-hours/[shiftLogId]/qr`, `/scan` → redirects to `/log-hours`
- **Mock layer:** `lib/mock-data.ts`, `lib/mock-store.ts` (client + localStorage), `lib/mock-store-server.ts` (server QR state)
- **Rules engine:** `lib/compliance/` — FL Bright Futures + graduation thresholds (not hardcoded in UI)
- **Matching:** `lib/matching.ts` — skill tag overlap for "For You" feed
- **QR flow:** `lib/qr-token.ts` (HMAC server-only) + Server Action `log-hours/actions.ts`

## Key decisions (do not undo without asking)

1. Dashboard stays at **`/`** (not `/dashboard`) until Clerk auth lands
2. Student **displays** QR; org moderator **scans** (Phase 2 org portal)
3. Only **verified** hours count toward goals (`getVerifiedHours`)
4. UI uses **local Tailwind components**, not shadcn yet
5. `QR_HMAC_SECRET` declared in `turbo.json` `globalEnv`

## Verify before new work

```bash
cd apps/web && npm run check-types && npm run lint && npm run build
npm run dev   # smoke-test routes listed in full log
```

## Next work (pick one)

| Priority | Task | Notes |
|----------|------|-------|
| 1 | **Commit** student portal work | User has not requested commit yet |
| 2 | **tRPC + packages/db** | Wire mock-store → real procedures; see migration map in full log |
| 3 | **Clerk auth** | Route groups, role guards, real `student` from session |
| 4 | **Org moderator portal** | QR scan + `verifyQrToken` + set `verifiedAt` |
| 5 | **Topbar global search** | Deferred optional from plan — wire `?q=` to sub-pages |
| 6 | **AI matching engine** | Phase 3 — `services/matching-engine` (empty today) |

## Files to read first

- Full session log: [`2026-06-05-student-portal.md`](./2026-06-05-student-portal.md)
- Plan: [`.cursor/plans/student_dashboard_completion_e7653b14.plan.md`](../../.cursor/plans/student_dashboard_completion_e7653b14.plan.md)
- Project rules: [`CLAUDE.md`](../../CLAUDE.md), [`.cursor/rules`](../../.cursor/rules)

## Suggested next-chat prompt

```
Read docs/superpowers/checkpoints/CONTINUE.md and 2026-06-05-student-portal.md.
Continue Kora from the "Next work" section — [describe task].
Do not deviate from established patterns (mock layer, compliance rules engine, server-only QR).
```
