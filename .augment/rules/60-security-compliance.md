---
type: "always_apply"
---

---
type: "always_apply"---

# Security & Compliance Standards

## Authentication
- JWT / OIDC
- Short-lived access tokens

## Authorization
- RBAC: owner | admin | editor | viewer
- All queries scoped by tenant/project

## Data Protection
- Encrypt sensitive fields at rest
- No secrets in code or logs

## Auditing
- Log: who, what, when, where
- Required for document access and tool calls

## Rate Limiting
- Redis-based
- Per user + per project
