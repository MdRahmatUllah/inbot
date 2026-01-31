---
type: "always_apply"
---

---
type: "always_apply"---

# AI Agent & Tooling Standards

## Orchestration
- GraphBit is the ONLY agent orchestration layer
- No ad-hoc tool calling outside GraphBit workflows

## Standard Agent Flow
1. Build RunContext
2. Retrieve memory (chat + KB)
3. Decide tools
4. Execute tools
5. Compose response with citations

## Tool Contract (MANDATORY)

### Input
```ts
type ToolRequest = {
  tool_name: string;
  trace_id: string;
  params: Record<string, unknown>;
  context: {
    user_id: string;
    project_id?: string;
    thread_id?: string;
  };
}

Output: 
type ToolResult = {
  tool_name: string;
  trace_id: string;
  status: "ok" | "error";
  data?: unknown;
  error?: { code: string; message: string };
  citations?: Array<{
    source_type: "url" | "document_chunk";
    ref: string;
  }>;
}

Prompt Versioning

Prompt IDs: assistant.{domain}.{purpose}.v{n}

Never edit prompts without bumping version
