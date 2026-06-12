# `@kora/db` (in progress)

Prisma schema and database access layer — the single source of truth for all Kora data queries.

## Status

**Schema defined; package not fully wired.** `schema.prisma` models the core domain. Root `package.json` scripts (`db:push`, `db:studio`) target `@kora/db` once the package is completed with a `package.json`, Prisma client export, and query helpers.

## Data model (summary)

| Model | Purpose |
|---|---|
| `User` | Clerk-linked user with `Role` and optional `schoolId` |
| `School` | District school — scopes all student data (FERPA) |
| `Organization` | Partner org hosting volunteer shifts |
| `Shift` | Scheduled volunteer opportunity |
| `ShiftLog` | Hours logged by a student, with `verifiedAt` and `qrToken` |

Roles: `STUDENT`, `ORG_MODERATOR`, `SCHOOL_ADMIN`.

## Rules

- All student-data queries must filter by `schoolId` — no cross-school access.
- App code must not import Prisma directly — go through this package once wired.
- No raw SQL — Prisma only.

## Environment

Requires `DATABASE_URL` and `DIRECT_URL` (Supabase PostgreSQL). See [`.env.example`](../../.env.example).

## Related

- [Architecture — multi-tenant isolation](../../docs/architecture.md)
- [`apps/web` mock layer](../../apps/web/README.md) — current data source until tRPC wiring lands
