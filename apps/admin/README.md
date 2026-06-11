# Kora Admin Console

School admin compliance console (`SCHOOL_ADMIN` role). Runs on port **3001**.

## Setup

1. Copy env vars from the monorepo root `.env.example` into `.env.local`.
2. Set `DATABASE_URL`, `DIRECT_URL`, Clerk keys, and `SEED_ADMIN_EMAIL` (your Clerk email).
3. From the repo root:

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001), sign in with Clerk.

On first sign-in, `SEED_ADMIN_EMAIL` is promoted to `SCHOOL_ADMIN` and linked to the seeded Lincoln High School.

## tRPC procedures

| Procedure | Description |
|-----------|-------------|
| `school.getOverview` | Dashboard stats |
| `school.getComplianceMasterList` | Student compliance rows |
| `school.getStudentHours` | Single student hour logs |
| `fraud.listFlags` | Computed fraud clusters |
| `export.powerSchool` | CSV export for PowerSchool |

All admin procedures are read-only and scoped to the signed-in admin's `schoolId`.
