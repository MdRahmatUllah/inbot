---
type: "always_apply"
---

---
type: "always_apply"---

# Architecture Standards

## Core Principles
- Clean Architecture (Ports & Adapters)
- SOLID principles
- Domain-Driven Design (DDD-lite)
- 12-Factor App principles

## Mandatory Layers
- API Layer: request validation + orchestration only
- Use Case Layer: business logic
- Domain Layer: entities, value objects
- Infrastructure Layer: DB, cache, external APIs

## Forbidden
- Controllers calling databases directly
- UI logic embedded in domain logic
- AI prompts hardcoded inside controllers
