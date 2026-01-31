---
type: "always_apply"
---

---
type: "always_apply"---

# Frontend Standards (Next.js / React)

## Stack
- Next.js 16+ App Router
- TypeScript (strict)
- React 18+
- Mantine UI
- Mermaid.js for diagrams

## Structure
frontend/src/
- features/    # Feature-first organization
- components/  # Shared UI components
- lib/         # API clients, utils

## Chat Rendering Pipeline
1. Markdown
2. Code blocks
3. Mermaid blocks
4. Tool output cards
5. Citations

## Rules
- No `any` in feature code
- All API access via typed client
- Streaming handled via dedicated hooks

## Mermaid
- Render ONLY fenced ```mermaid``` blocks
- Fail gracefully with fallback message