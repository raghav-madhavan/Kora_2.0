# Kora — Student & Org Portal (`apps/web`)

Next.js 16 App Router app hosting both the **student dashboard** and the **organization moderator portal**. Runs on port **3000**.

Part of the [Kora monorepo](../../README.md).

## What lives here

| Area | Route group | Base path | Description |
|---|---|---|---|
| Student portal | `(student)` | `/` | Dashboard, events, hours, goals, profile |
| Org moderator portal | `(moderator)` | `/moderator` | Verifications, shifts, QR check-in |
| Mock auth | — | `/login` | Persona picker (swap target for Clerk) |

### Student routes

| Route | Purpose |
|---|---|
| `/` | Dashboard — matched shifts, progress, quick actions |
| `/events` | Browse and commit to volunteer shifts |
| `/schedule` | Committed shifts |
| `/hours` | Hours ledger |
| `/goals` | Graduation / Bright Futures progress |
| `/organizations` | Partner org directory |
| `/log-hours` | Manual hour claims |
| `/log-hours/[shiftLogId]/qr` | QR display for org verification |
| `/profile` | Student profile and skills |

### Moderator routes

| Route | Purpose |
|---|---|
| `/moderator` | Org dashboard — pending verifications, upcoming shifts |
| `/moderator/verifications` | Approve / reject / review flagged logs |
| `/moderator/shifts` | Shift list |
| `/moderator/shifts/[shiftId]` | Rotating QR display (15-min HMAC tokens) |

## Architecture notes

- **Mock data layer** — `lib/mock-data.ts`, `lib/mock-store.ts` (client), `lib/mock-store-server.ts` (server QR sessions). Real tRPC + Prisma wiring is planned; do not bypass this layer with raw Prisma in app code.
- **Compliance rules** — `lib/compliance/` — state-specific thresholds (FL Bright Futures, WA graduation). Never hardcode hour limits in UI.
- **QR tokens** — `lib/qr-token.ts` (server-only HMAC). Requires `QR_HMAC_SECRET` in env.
- **Auth** — `lib/auth/session.ts` + `proxy.ts` coarse routing. Mock sessions use the `kora_session` cookie; internals swap for Clerk without changing guards.
- **Matching** — `lib/matching.ts` — skill-tag overlap for the "For You" feed until the AI engine ships.

## Development

From the repo root:

```bash
npm run dev          # turbo → apps/web only
npm run dev:all      # web + admin
```

From this directory:

```bash
npm run dev          # next dev --port 3000
npm run build
npm run check-types
npm run lint
npm run test         # vitest
```

Verify before merging:

```bash
npm run check-types && npm run lint && npm run build
```

## Environment

Copy [`.env.example`](../../.env.example) to the repo root as `.env.local`. Required for QR flow:

```
QR_HMAC_SECRET=change_this_to_a_random_64_char_string
```

## Related docs

- [Architecture](../../docs/architecture.md)
- [Session checkpoints](../../docs/superpowers/checkpoints/CONTINUE.md)
- [Org access levels spec](../../docs/superpowers/specs/2026-06-12-org-portal-access-levels-design.md)
