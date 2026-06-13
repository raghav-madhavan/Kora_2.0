# Kora

Verified community service hours for high schools — AI-matched shifts, QR sign-off, and FERPA-compliant compliance reporting.

Kora replaces forged paper signatures and legacy software (x2VOL) with a single source of truth across three portals.

## Portals

| Portal | App | Port | Status |
|---|---|---|---|
| **Student + Org** | [`apps/web`](./apps/web) | 3000 | MVP on mock data layer |
| **School Admin** | [`apps/admin`](./apps/admin) | 3001 | Phase 2 scaffold |

- **Student Dashboard** — AI-matched shifts, QR-verified sign-off, hours ledger, graduation goals
- **Organization Portal** — Shift management, verification queue, rotating QR check-in
- **Admin Console** — FERPA-compliant compliance master-list, fraud detection, PowerSchool export (planned)

## Monorepo layout

| Path | Description |
|---|---|
| [`apps/web`](./apps/web) | Student dashboard, org moderator portal, mock auth (`/login`) |
| [`apps/admin`](./apps/admin) | School admin compliance console (Phase 2) |
| [`packages/db`](./packages/db) | Prisma schema — single source of truth for data model |
| [`packages/ui`](./packages/ui) | Shared component library (`@kora/ui`) |
| [`packages/eslint-config`](./packages/eslint-config) | Shared ESLint configs (`@repo/eslint-config`) |
| [`packages/typescript-config`](./packages/typescript-config) | Shared TypeScript configs (`@repo/typescript-config`) |
| [`services/matching-engine`](./services/matching-engine) | Python FastAPI AI matching service (Phase 3) |
| [`docs/architecture.md`](./docs/architecture.md) | System design, auth flow, QR scheme |
| [`CLAUDE.md`](./CLAUDE.md) | AI coding context for Claude Code / Cursor |

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | tRPC (planned), Prisma |
| Database | PostgreSQL (Supabase) |
| Auth | Mock session cookie today → Clerk (planned) |
| AI Matching | Python, FastAPI, OpenAI embeddings (Phase 3) |
| QR Verification | HMAC-signed tokens |
| Infra | Vercel (web), Railway (services) |

## Getting started

```bash
git clone https://github.com/raghav-madhavan/Kora_2.0.git
cd Kora_2.0
npm install
cp .env.example .env.local   # fill in secrets
npm run dev                  # starts apps/web on :3000
```

Other commands:

```bash
npm run dev:all      # web (:3000) + admin (:3001)
npm run build        # full monorepo build
npm run lint         # lint all packages
npm run type-check   # type-check all packages
npm run db:push      # push Prisma schema (when @kora/db is wired)
npm run db:studio    # Prisma Studio
```

Open [http://localhost:3000/login](http://localhost:3000/login) to pick a mock persona (student or org moderator).

## Roadmap

- [x] Student portal MVP (mock layer) — dashboard, events, hours, goals, QR flow
- [x] Org moderator portal MVP (mock layer) — verifications, shifts, QR display
- [ ] Org portal macro/micro access levels + mock auth guards
- [ ] Clerk auth + tRPC + `packages/db` wiring
- [ ] Admin console + PowerSchool export
- [ ] AI matching engine (`services/matching-engine`)
- [ ] Multi-state compliance rules engine (FL Bright Futures, WA graduation)

## Status

Pre-launch — Tampa, FL beta targeting robotics teams and FBLA chapters.

Resume development from [`docs/superpowers/checkpoints/CONTINUE.md`](./docs/superpowers/checkpoints/CONTINUE.md).
