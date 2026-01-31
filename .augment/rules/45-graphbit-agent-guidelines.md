---
type: "always_apply"---

# GraphBit Agent Development Guidelines

This project uses **GraphBit** as the **only allowed agentic AI orchestration framework**.

All agent logic, tool routing, and workflow execution MUST follow the rules below.

Reference:
- https://docs.graphbit.ai/python/

---

## 1. Core Principles (NON-NEGOTIABLE)

- GraphBit is the **single source of truth** for:
  - Agent reasoning
  - Tool calling
  - Workflow execution
- No custom agent loops, planners, or routers outside GraphBit
- No direct LLM calls outside GraphBit Executors
- Agents must be **deterministic, inspectable, and replayable**

---

## 2. Mandatory Folder Structure

All GraphBit-related code MUST live under:

```txt
backend/app/agents/
  config.py              # GraphBit init + LLM config
  prompts.py             # Versioned system + task prompts
  workflow_*.py          # Workflow definitions
  tools_*.py             # Tool implementations
  runner.py              # Single execution entrypoint
````

Forbidden:

* Agent logic in controllers
* Prompts embedded inside workflows or tools
* Tools defined inside workflow files

---

## 3. GraphBit Initialization Rules

### Initialization

* GraphBit MUST be initialized via `graphbit.init()`
* Initialization happens **once per process**

```python
from graphbit import init

init(debug=False)
```

### Executor Creation

* All executions MUST go through `Executor`
* Executors are created via a factory method (never inline)

```python
executor = Executor(llm_config, timeout_seconds=300)
```

---

## 4. LLM Configuration Rules

* Use `LlmConfig` helpers ONLY
* No raw SDK usage (OpenAI / Anthropic / Ollama SDKs forbidden)

Allowed:

```python
LlmConfig.openai(...)
LlmConfig.anthropic(...)
LlmConfig.ollama(...)
```

* Provider selection must be environment-driven
* Model, temperature, and max_tokens are agent-level concerns

---

## 5. Workflow Design Rules

### Workflow Construction

* All workflows must be created via `Workflow(name)`
* Every workflow MUST call `wf.validate()`

```python
wf = Workflow("Chat Agent Workflow")
wf.validate()
```

### Node Rules

* Agents MUST be created using `Node.agent(...)`
* Tool usage is declared at node creation time
* One node = one responsibility

Allowed:

```python
Node.agent(
  name="Chat Agent",
  prompt=CHAT_PROMPT,
  system_prompt=SYSTEM_PROMPT,
  tools=[web_search, kb_search],
  temperature=0.2,
  max_tokens=1200,
)
```

Forbidden:

* Dynamic tool injection at runtime
* Modifying node configuration after creation

---

## 6. Prompt Management (STRICT)

### Prompt Versioning

All prompts MUST be versioned.

Naming convention:

```
assistant.{domain}.{purpose}.v{n}
```

Examples:

* `assistant.chat.general.v1`
* `assistant.kb.citation_strict.v2`

### Prompt Storage

* Prompts MUST live in `prompts.py`
* Prompts MUST NOT be modified without version bump
* Old versions must remain intact

Forbidden:

* Inline prompt strings in workflow files
* Editing prompts without version change

---

## 7. Tooling Rules (CRITICAL)

### Tool Declaration

* Tools MUST be declared using `@tool`
* Tools must be **pure, stateless, and deterministic**

```python
from graphbit import tool

@tool(_description="Search the web")
def web_search(query: str) -> list[dict]:
    ...
```

### Tool Output Rules

* Outputs MUST be JSON-serializable
* Outputs MUST be compact and structured
* Tools MUST NOT return free-form text paragraphs

Allowed:

```json
{
  "results": [
    {"title": "...", "url": "...", "snippet": "..."}
  ]
}
```

Forbidden:

* Markdown
* HTML
* Raw LLM-like text

---

## 8. Standard Tool Contract (MANDATORY)

All tools MUST conceptually conform to this structure:

### Input

```ts
{
  tool_name: string
  params: Record<string, unknown>
  context: {
    user_id: string
    project_id?: string
    thread_id?: string
  }
}
```

### Output

```ts
{
  status: "ok" | "error"
  data?: unknown
  error?: {
    code: string
    message: string
  }
  citations?: Array<{
    source_type: "url" | "document_chunk"
    ref: string
  }>
}
```

---

## 9. Execution & Runner Rules

### Single Entry Point

* All workflows MUST be executed via `runner.py`
* Controllers call **only the runner**, never workflows directly

```python
result = executor.execute(workflow)
```

### Result Handling

* Always extract outputs via:

  * `result.get_variable(name)`
  * `result.get_all_variables()`

Forbidden:

* Parsing raw LLM output manually
* Assuming a variable exists without fallback

---

## 10. Error Handling Rules

* Workflow failures MUST be captured and returned gracefully
* Never retry tool calls manually — rely on Executor config

```python
if result.is_failed():
    ...
```

* Errors must NOT be hidden or replaced with hallucinated answers

---

## 11. Observability Requirements

Every GraphBit execution MUST emit:

* `trace_id`
* execution time
* tool usage count
* failure reason (if any)

GraphBit tracing/debug mode should be enabled in non-prod.

---

## 12. Security & Safety

* Tools must validate inputs
* Project/tenant scoping is mandatory for KB tools
* Never allow unrestricted file system or network access
* No prompt injection bypass logic in tools

---

## 13. Definition of Done (GraphBit)

A GraphBit agent is complete only if:

* Workflow validates successfully
* Prompts are versioned
* Tools are documented
* Runner is used
* Tests exist for:

  * Workflow execution
  * Tool behavior
  * Failure paths

---

## 14. Forbidden Patterns (Hard Stop)

❌ Direct LLM SDK usage
❌ LangChain / CrewAI / custom agent loops
❌ Inline prompts
❌ Unversioned workflows
❌ Tools returning natural language

---

## 15. Guiding Philosophy

> **GraphBit workflows are executable specifications, not experiments.**

Agents must be:

* Predictable
* Auditable
* Reproducible
* Enterprise-safe
