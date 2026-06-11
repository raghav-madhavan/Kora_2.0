#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Kora Admin setup"

if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "Created .env.local from .env.example"
  echo ""
  echo "IMPORTANT: Edit .env.local and set:"
  echo "  - DATABASE_URL / DIRECT_URL (Supabase)"
  echo "  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY"
  echo "  - SEED_ADMIN_EMAIL (your Clerk sign-in email)"
  echo ""
  echo "Then re-run: npm run setup:admin"
  exit 1
fi

# shellcheck disable=SC1091
set -a && source .env.local && set +a

missing=()
for var in DATABASE_URL DIRECT_URL CLERK_SECRET_KEY NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY SEED_ADMIN_EMAIL; do
  if [ -z "${!var:-}" ] || [[ "${!var}" == *"["* ]] || [[ "${!var}" == *"..."* ]]; then
    missing+=("$var")
  fi
done

if [ ${#missing[@]} -gt 0 ]; then
  echo "These .env.local values still need real values:"
  printf '  - %s\n' "${missing[@]}"
  exit 1
fi

echo "==> Installing dependencies"
npm install

echo "==> Pushing Prisma schema"
npm run db:push

echo "==> Seeding demo data"
npm run db:seed

echo ""
echo "Setup complete. Start the admin console:"
echo "  npm run dev -- --filter=admin"
echo ""
echo "Open http://localhost:3001 and sign in with: $SEED_ADMIN_EMAIL"
