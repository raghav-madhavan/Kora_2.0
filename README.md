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
| Backend | Node.js, tRPC, Prisma |
| Database | PostgreSQL (Supabase) |
| Auth | Clerk |
| AI Matching | Python, FastAPI, OpenAI embeddings |
| QR Verification | Custom HMAC-signed tokens |
| Infra | Vercel (web), Railway (services) |

## Getting Started
\`\`\`bash
git clone https://github.com/YOUR_USERNAME/kora
cd kora
npm install
cp .env.example .env.local
npm run dev
\`\`\`

## Roadmap
- [ ] MVP: Student dashboard + QR sign-off
- [ ] Organization portal
- [ ] Admin console + PowerSchool export
- [ ] AI matching engine
- [ ] Multi-state compliance rules engine

## Status
🚧 Pre-launch — Tampa, FL beta (Spring/Summer 2026)
