# Kora
> The API-first, AI-routed system of record for high school community service.

## What is Kora?
Kora replaces forged paper signatures and legacy software (x2VOL) with a verified,
AI-matched platform for student community service hours.

**Three portals. One source of truth.**
- **Student Dashboard** — AI-matched shifts, QR-verified sign-off, hours ledger
- **Organization Portal** — Shift builder, automated verification, waiver gating
- **Admin Console** — FERPA-compliant compliance master-list, fraud detection, PowerSchool export

## Directory Structure

| Path | Description |
|---|---|
| [`apps/web`](./apps/web) | Student dashboard, org portal, QR sign-off flow |
| [`apps/admin`](./apps/admin) | School admin compliance console |
| [`packages/db`](./packages/db) | Prisma schema, client, all DB queries |
| [`packages/ui`](./packages/ui) | Shared shadcn/ui component library |
| [`packages/config`](./packages/config) | Shared TS, ESLint, Tailwind configs |
| [`services/matching-engine`](./services/matching-engine) | Python FastAPI AI matching service |
| [`docs/architecture.md`](./docs/architecture.md) | System design, auth flow, QR scheme |
| [`CLAUDE.md`](./CLAUDE.md) | AI coding context for Claude Code |
| [`.cursor/rules`](./.cursor/rules) | Cursor IDE coding rules |


## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, shadcn/ui |
| Backend | tRPC, Prisma |
| Database | PostgreSQL (Supabase) |
| Auth | Clerk |
| AI Matching | Python, FastAPI, OpenAI embeddings |
| QR Verification | HMAC-signed tokens |
| Infra | Vercel (web), Railway (services) |

## Getting Started

```bash
git clone https://github.com/VGGladiator/Kora_2.0.git
cd kora
npm install
cp .env.example .env.local
npm run dev
```

## Monorepo Structure
apps/web         → Student + Org portal
apps/admin       → School admin console
packages/db      → Prisma schema + all DB queries
packages/ui      → Shared component library
packages/config  → Shared ESLint, TS, Tailwind configs
services/matching-engine → Python FastAPI AI matching

## Roadmap
- [ ] MVP: Student dashboard + QR sign-off
- [ ] Organization portal + shift builder
- [ ] Admin console + PowerSchool export
- [ ] AI matching engine
- [ ] Multi-state compliance rules engine (FL Bright Futures, WA graduation)

## Status
🚧 Pre-launch — Tampa, FL beta targeting robotics teams + FBLA chapters
