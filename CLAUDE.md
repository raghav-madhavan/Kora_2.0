# Kora — Claude Context

## What This Is
Kora is an API-first, AI-routed SaaS platform for high school community service compliance.
B2B revenue model: $5K–$10K annual licenses to school districts.
Built by a high school founder with extreme founder-market fit.

## Monorepo Layout
- `apps/web` — Student + Org portal (Next.js 14 App Router)
- `apps/admin` — School admin console (Next.js 14 App Router)
- `packages/db` — Prisma schema, client, all DB queries (single source of truth)
- `packages/ui` — Shared shadcn/ui components
- `packages/config` — Shared ESLint, TypeScript, Tailwind configs
- `services/matching-engine` — Python FastAPI AI matching microservice

## Stack
- Next.js 14 App Router + TypeScript
- tRPC for all internal API calls
- Prisma ORM + PostgreSQL via Supabase
- Clerk for auth (roles: STUDENT, ORG_MODERATOR, SCHOOL_ADMIN)
- Tailwind CSS + shadcn/ui
- Turborepo monorepo

## Key Constraints
1. FERPA compliance — student data is always scoped to schoolId, never cross-school
2. QR verification uses HMAC-signed tokens — never expose raw shift/user IDs
3. Hours require ORG_MODERATOR verification before they count toward any requirement
4. Multi-state compliance rules (FL Bright Futures vs WA graduation standards) live in
   a rules engine, never hardcoded inline
5. Fraud detection triggers when 3+ students log identical unverified hours within 10 min

## Data Model (core)
- User (role, schoolId, clerkId)
- Shift (orgId, slots, scheduledAt, skills[])
- ShiftLog (userId, shiftId, hours, verifiedAt, qrToken)
- Organization (name)
- School (name, state)

## Commands
- `npm run dev` — start all apps
- `npm run db:push` — push Prisma schema
- `npm run db:studio` — Prisma Studio
- `npm run build` — full monorepo build
- `cd services/matching-engine && uvicorn main:app --reload` — start matching engine

## Current Phase
MVP — Student dashboard + QR sign-off flow + Org verification portal.
Admin console is Phase 2. AI matching engine is Phase 3.

**Student portal mock MVP is built** (2026-06-05). Resume in a new chat via
[`docs/superpowers/checkpoints/CONTINUE.md`](docs/superpowers/checkpoints/CONTINUE.md).
Full session log: [`docs/superpowers/checkpoints/2026-06-05-student-portal.md`](docs/superpowers/checkpoints/2026-06-05-student-portal.md).

## Model Usage
Use extended thinking for:
- System architecture decisions
- QR HMAC token scheme design
- FERPA multi-tenant data isolation
- Matching algorithm architecture
- Anything touching auth, security, or compliance

Use standard mode for:
- UI components and Tailwind styling
- tRPC boilerplate and CRUD procedures
- Prisma query writing
- Config, setup, and docs

## Do Not
- Do not write raw SQL — use Prisma
- Do not add Next.js API routes that bypass tRPC
- Do not hardcode school IDs, state logic, or hour thresholds inline
- Do not use `any` TypeScript types
- Do not import Prisma client directly in app code — always go through packages/db
