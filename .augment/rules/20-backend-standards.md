---
type: "always_apply"
---

---
type: "always_apply"---

# Backend Standards (FastAPI / Python)

## Stack
- Python + FastAPI
- PostgreSQL (SQLAlchemy / SQLModel)
- Qdrant (vector search)
- Neo4j (knowledge graph)
- Redis (cache, rate-limit, ephemeral state)

## Structure (MANDATORY)
backend/app/
- api/        # Routers only (thin)
- domain/     # Entities, value objects
- usecases/   # Business logic
- infra/      # DB, cache, vector, graph
- schemas/    # Pydantic DTOs
- workers/    # Background jobs

## API Rules
- REST-first
- Streaming via SSE/WebSocket only
- Version all routes: `/v1/...`

## DTO Naming
- Requests: `XxxRequest`
- Responses: `XxxResponse`
- Events: `XxxEvent`

## Error Envelope (MANDATORY)
```json
{
  "error": {
    "code": "domain_error_code",
    "message": "Human readable message",
    "request_id": "uuid"
  }
}

Transactions

Use Unit-of-Work pattern for multi-step writes

Never mix side effects without transaction boundaries

Background Jobs

Document ingestion MUST be async

Job states: pending | processing | succeeded | failed

