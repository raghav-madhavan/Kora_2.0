# Kora — School Admin Console (`apps/admin`)

Next.js 16 App Router app for **school administrators** — FERPA-scoped compliance views, fraud review, and PowerSchool export.

Runs on port **3001**. Part of the [Kora monorepo](../../README.md).

## Status

**Phase 2 — scaffold only.** The app boots and builds, but compliance dashboards, fraud flags, and export flows are not implemented yet. Active MVP work lives in [`apps/web`](../web).

## Planned scope

- Read-only compliance master-list scoped to `schoolId`
- Fraud detection surfacing (3+ identical unverified hours within 10 min)
- PowerSchool / SIS export
- Clerk role guard: `SCHOOL_ADMIN` only

## Development

From the repo root:

```bash
npm run dev:all      # starts web (:3000) and admin (:3001)
```

From this directory:

```bash
npm run dev          # next dev --port 3001
npm run build
npm run check-types
npm run lint
```

Open [http://localhost:3001](http://localhost:3001).

## Environment

Uses the shared [`.env.example`](../../.env.example) at the repo root. Admin-specific URL:

```
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
```

## Related docs

- [Architecture](../../docs/architecture.md)
- [Project context](../../CLAUDE.md)
