# Kora Architecture

## System Overview

```
[Student Browser]  ──→ [apps/web]    ──→ [tRPC API] ──→ [packages/db] ──→ [Supabase/Postgres]
[Org Browser]      ──→ [apps/web]         ↓
[Admin Browser]    ──→ [apps/admin]   [matching-engine] ←── [OpenAI Embeddings]
```

## Auth Flow
Clerk handles authentication. On first sign-in, users complete an onboarding flow
that assigns their Role and links them to a School or Organization.

Roles:
- STUDENT — browse shifts, commit, generate QR codes
- ORG_MODERATOR — create shifts, scan QR codes, verify hours
- SCHOOL_ADMIN — read-only compliance view, scoped to their schoolId

## QR Verification Flow
1. Student completes shift → requests QR token
2. Server generates HMAC(shiftLogId + userId + timestamp, QR_HMAC_SECRET)
3. Token stored on ShiftLog, QR code displayed to student
4. Org moderator scans QR → server verifies HMAC → sets verifiedAt timestamp
5. Hours are now locked and count toward requirements

## Multi-Tenant Data Isolation
All queries involving student data include a schoolId filter.
School admins receive a schoolId claim in their Clerk JWT.
tRPC middleware validates schoolId on every admin procedure.

## Compliance Rules Engine
State-specific requirements stored as JSON config, not hardcoded:

```json
{
  "FL": { "brightFutures": { "gold": 100, "silver": 75 } },
  "WA": { "graduation": { "default": 40 } }
}
```

## Fraud Detection
Triggers when 3+ students log identical unverified hours within 10 minutes.
Flags are surfaced in the School Admin Console for manual review.
