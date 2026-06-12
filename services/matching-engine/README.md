# Kora AI Matching Engine (Phase 3)

Python FastAPI microservice that ranks volunteer shifts for students using OpenAI embeddings and skill-tag overlap.

## Status

**Not implemented** — directory reserved. `apps/web` uses a local heuristic in `lib/matching.ts` until this service ships.

## Planned interface

```
POST /match
  body: { studentId, skills[], limit }
  → ranked shift IDs with scores
```

Configured via `MATCHING_ENGINE_URL` in [`.env.example`](../../.env.example) (default `http://localhost:8000`).

## Planned stack

- Python 3.11+
- FastAPI
- OpenAI embeddings API
- Deployed on Railway

## Development (when implemented)

```bash
cd services/matching-engine
pip install -r requirements.txt
uvicorn main:app --reload
```

## Related

- [Architecture](../../docs/architecture.md)
- [Root roadmap](../../README.md)
