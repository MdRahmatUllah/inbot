---
type: "always_apply"
---

---
type: "always_apply"---

# Project Overview & Scope

This project implements a **ChatboxAI-style AI chat platform** with:
- Multi-turn chat
- Knowledge base ingestion
- Agentic AI workflows
- Tool calling (web search, documents, diagrams, charts)
- Project/workspace-based context isolation

## Primary Goals
- Maintain **enterprise-grade architecture**
- Ensure **strict separation of concerns**
- Produce **deterministic, testable, observable AI behavior**
- Keep all AI interactions auditable and reproducible

## Non-Goals
- No business logic inside UI components
- No direct DB access from controllers
- No unversioned prompts or embeddings
