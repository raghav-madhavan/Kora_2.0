# Kora
> The API-first, AI-routed system of record for high school community service.

## What is Kora?
Kora replaces forged paper signatures and legacy software (x2VOL) with a verified,
AI-matched platform for student community service hours.

**Three portals. One source of truth.**
- **Student Dashboard** — AI-matched shifts, QR-verified sign-off, hours ledger
- **Organization Portal** — Shift builder, automated verification, waiver gating
- **Admin Console** — FERPA-compliant compliance master-list, fraud detection, PowerSchool export

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
git clone https://github.com/YOUR_USERNAME/kora
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
