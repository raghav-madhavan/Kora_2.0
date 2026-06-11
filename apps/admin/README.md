# Kora Admin Console

School admin compliance console (`SCHOOL_ADMIN` role). Runs on port **3001**.

## One-command setup

From the monorepo root:

```bash
cp .env.example .env.local
# Edit .env.local — set Supabase URLs, Clerk keys, SEED_ADMIN_EMAIL

npm run setup:admin   # install + db:push + db:seed
npm run dev           # admin on :3001
```

Open [http://localhost:3001](http://localhost:3001) and sign in with the email matching `SEED_ADMIN_EMAIL`.

On first sign-in you are promoted to `SCHOOL_ADMIN` and linked to the seeded Lincoln High School.

## tRPC procedures

| Procedure | Description |
|-----------|-------------|
| `school.getOverview` | Dashboard stats |
| `school.getComplianceMasterList` | Student compliance rows |
| `school.getStudentHours` | Single student hour logs |
| `fraud.listFlags` | Computed fraud clusters |
| `export.powerSchool` | CSV export for PowerSchool |

All admin procedures are read-only and scoped to the signed-in admin's `schoolId`.
