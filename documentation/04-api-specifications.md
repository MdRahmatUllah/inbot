# API Specifications

## Overview

This document defines the complete REST API and WebSocket specifications for the Chatbox backend.

## Base URL

```
Production: https://api.chatbox.app
Development: http://localhost:8000
```

## Authentication

### JWT Token Authentication

**Headers**:
```
Authorization: Bearer <access_token>
```

**Token Structure**:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

**Token Refresh**:
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJ..."
}
```

## API Endpoints

### 1. Authentication

#### Register User

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword123"
}

Response: 201 Created
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "johndoe",
  "created_at": "2026-01-28T10:00:00Z"
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response: 200 OK
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

#### Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer <token>

Response: 204 No Content
```

### 2. Sessions

#### List Sessions

```http
GET /api/v1/sessions?type=chat&starred=true&limit=50&offset=0
Authorization: Bearer <token>

Response: 200 OK
{
  "sessions": [
    {
      "id": "uuid",
      "type": "chat",
      "name": "My Conversation",
      "starred": true,
      "created_at": "2026-01-28T10:00:00Z",
      "updated_at": "2026-01-28T11:00:00Z",
      "message_count": 10,
      "last_message_preview": "Hello, how can I help you?"
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

#### Get Session

```http
GET /api/v1/sessions/{session_id}
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "type": "chat",
  "name": "My Conversation",
  "starred": false,
  "copilot_id": null,
  "assistant_avatar_key": null,
  "settings": {},
  "threads": [],
  "thread_name": null,
  "created_at": "2026-01-28T10:00:00Z",
  "updated_at": "2026-01-28T11:00:00Z"
}
```

#### Create Session

```http
POST /api/v1/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "chat",
  "name": "New Conversation",
  "copilot_id": null,
  "settings": {}
}

Response: 201 Created
{
  "id": "uuid",
  "type": "chat",
  "name": "New Conversation",
  "starred": false,
  "created_at": "2026-01-28T10:00:00Z",
  "updated_at": "2026-01-28T10:00:00Z"
}
```

#### Update Session

```http
PATCH /api/v1/sessions/{session_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "starred": true
}

Response: 200 OK
{
  "id": "uuid",
  "name": "Updated Name",
  "starred": true,
  "updated_at": "2026-01-28T11:00:00Z"
}
```

#### Delete Session

```http
DELETE /api/v1/sessions/{session_id}
Authorization: Bearer <token>

Response: 204 No Content
```

### 3. Messages

#### List Messages

```http
GET /api/v1/sessions/{session_id}/messages?limit=50&offset=0
Authorization: Bearer <token>

Response: 200 OK
{
  "messages": [
    {
      "id": "uuid",
      "session_id": "uuid",
      "role": "user",
      "content_parts": [
        {
          "type": "text",
          "text": "Hello!"
        }
      ],
      "timestamp": "2026-01-28T10:00:00Z"
    },
    {
      "id": "uuid",
      "session_id": "uuid",
      "role": "assistant",
      "content_parts": [
        {
          "type": "text",
          "text": "Hello! How can I help you today?"
        }
      ],
      "ai_provider": "openai",
      "model": "gpt-4",
      "usage": {
        "prompt_tokens": 10,
        "completion_tokens": 15,
        "total_tokens": 25
      },
      "timestamp": "2026-01-28T10:00:05Z"
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

#### Create Message (Non-Streaming)

```http
POST /api/v1/sessions/{session_id}/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "user",
  "content_parts": [
    {
      "type": "text",
      "text": "What is the capital of France?"
    }
  ],
  "files": [],
  "links": [],
  "generate_response": true
}

Response: 201 Created
{
  "user_message": {
    "id": "uuid",
    "role": "user",
    "content_parts": [...],
    "timestamp": "2026-01-28T10:00:00Z"
  },
  "assistant_message": {
    "id": "uuid",
    "role": "assistant",
    "content_parts": [
      {
        "type": "text",
        "text": "The capital of France is Paris."
      }
    ],
    "ai_provider": "openai",
    "model": "gpt-4",
    "usage": {
      "prompt_tokens": 20,
      "completion_tokens": 10,
      "total_tokens": 30
    },
    "timestamp": "2026-01-28T10:00:05Z"
  }
}
```

#### Update Message

```http
PATCH /api/v1/messages/{message_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "content_parts": [
    {
      "type": "text",
      "text": "Updated message text"
    }
  ]
}

Response: 200 OK
{
  "id": "uuid",
  "content_parts": [...],
  "updated_at": "2026-01-28T11:00:00Z"
}
```

#### Delete Message

```http
DELETE /api/v1/messages/{message_id}
Authorization: Bearer <token>

Response: 204 No Content
```

#### Regenerate Message

```http
POST /api/v1/messages/{message_id}/regenerate
Authorization: Bearer <token>
Content-Type: application/json

{
  "create_fork": false
}

Response: 201 Created
{
  "id": "uuid",
  "role": "assistant",
  "content_parts": [...],
  "timestamp": "2026-01-28T11:00:00Z"
}
```

### 4. Streaming Messages (WebSocket)

#### WebSocket Connection

```
ws://localhost:8000/api/v1/ws/sessions/{session_id}/stream
Authorization: Bearer <token>
```

#### Client → Server: Send Message

```json
{
  "type": "send_message",
  "data": {
    "role": "user",
    "content_parts": [
      {
        "type": "text",
        "text": "Tell me a story"
      }
    ],
    "files": [],
    "links": []
  }
}
```

#### Server → Client: Message Created

```json
{
  "type": "message_created",
  "data": {
    "id": "uuid",
    "role": "user",
    "content_parts": [...],
    "timestamp": "2026-01-28T10:00:00Z"
  }
}
```

#### Server → Client: Stream Start

```json
{
  "type": "stream_start",
  "data": {
    "message_id": "uuid",
    "role": "assistant",
    "ai_provider": "openai",
    "model": "gpt-4"
  }
}
```

#### Server → Client: Stream Chunk

```json
{
  "type": "stream_chunk",
  "data": {
    "message_id": "uuid",
    "chunk": "Once upon a time",
    "chunk_index": 0
  }
}
```

#### Server → Client: Stream End

```json
{
  "type": "stream_end",
  "data": {
    "message_id": "uuid",
    "usage": {
      "prompt_tokens": 50,
      "completion_tokens": 200,
      "total_tokens": 250
    },
    "first_token_latency": 150
  }
}
```

#### Server → Client: Stream Error

```json
{
  "type": "stream_error",
  "data": {
    "message_id": "uuid",
    "error": "Rate limit exceeded"
  }
}
```

#### Client → Server: Stop Generation

```json
{
  "type": "stop_generation",
  "data": {
    "message_id": "uuid"
  }
}
```

### 5. Settings

#### Get Settings

```http
GET /api/v1/settings
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "language": "en",
  "theme": "dark",
  "font_size": 1.0,
  "show_message_timestamp": true,
  "show_model_name": false,
  "providers": [
    {
      "id": "openai",
      "name": "OpenAI",
      "enabled": true,
      "api_key": "sk-***",
      "default_model": "gpt-4"
    }
  ],
  "shortcuts": {...},
  "mcp": {...},
  "web_search": {...}
}
```

#### Update Settings

```http
PATCH /api/v1/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "theme": "light",
  "show_model_name": true
}

Response: 200 OK
{
  "id": "uuid",
  "theme": "light",
  "show_model_name": true,
  "updated_at": "2026-01-28T11:00:00Z"
}
```

#### Update Provider Configuration

```http
PATCH /api/v1/settings/providers/{provider_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "enabled": true,
  "api_key": "sk-new-key",
  "default_model": "gpt-4-turbo"
}

Response: 200 OK
{
  "id": "openai",
  "enabled": true,
  "api_key": "sk-***",
  "default_model": "gpt-4-turbo"
}
```

### 6. Copilots

#### List Copilots

```http
GET /api/v1/copilots
Authorization: Bearer <token>

Response: 200 OK
{
  "copilots": [
    {
      "id": "uuid",
      "name": "Code Assistant",
      "system_prompt": "You are an expert programmer...",
      "avatar_key": "avatar_123",
      "default_provider": "openai",
      "default_model": "gpt-4",
      "created_at": "2026-01-28T10:00:00Z"
    }
  ]
}
```

#### Create Copilot

```http
POST /api/v1/copilots
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Writing Assistant",
  "system_prompt": "You are a professional writer...",
  "default_provider": "anthropic",
  "default_model": "claude-3-opus"
}

Response: 201 Created
{
  "id": "uuid",
  "name": "Writing Assistant",
  "created_at": "2026-01-28T10:00:00Z"
}
```

#### Update/Delete Copilot

```http
PATCH /api/v1/copilots/{copilot_id}
DELETE /api/v1/copilots/{copilot_id}
```

### 7. Knowledge Base

#### List Knowledge Bases

```http
GET /api/v1/knowledge-bases
Authorization: Bearer <token>

Response: 200 OK
{
  "knowledge_bases": [
    {
      "id": 1,
      "name": "My Documents",
      "description": "Personal knowledge base",
      "embedding_provider": "openai",
      "embedding_model": "text-embedding-3-small",
      "file_count": 25,
      "created_at": "2026-01-28T10:00:00Z"
    }
  ]
}
```

#### Create Knowledge Base

```http
POST /api/v1/knowledge-bases
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Project Documentation",
  "description": "All project docs",
  "embedding_provider": "openai",
  "embedding_model": "text-embedding-3-small",
  "chunk_size": 512,
  "chunk_overlap": 50,
  "top_k": 5
}

Response: 201 Created
{
  "id": 1,
  "name": "Project Documentation",
  "created_at": "2026-01-28T10:00:00Z"
}
```

#### Upload File to Knowledge Base

```http
POST /api/v1/knowledge-bases/{kb_id}/files
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary data>

Response: 202 Accepted
{
  "id": 1,
  "filename": "document.pdf",
  "mime_type": "application/pdf",
  "size": 1024000,
  "status": "processing",
  "created_at": "2026-01-28T10:00:00Z"
}
```

#### List Files in Knowledge Base

```http
GET /api/v1/knowledge-bases/{kb_id}/files
Authorization: Bearer <token>

Response: 200 OK
{
  "files": [
    {
      "id": 1,
      "filename": "document.pdf",
      "mime_type": "application/pdf",
      "size": 1024000,
      "status": "completed",
      "chunk_count": 50,
      "embedding_count": 50,
      "created_at": "2026-01-28T10:00:00Z",
      "processed_at": "2026-01-28T10:05:00Z"
    }
  ]
}
```

#### Search Knowledge Base

```http
POST /api/v1/knowledge-bases/{kb_id}/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "What is the project timeline?",
  "top_k": 5,
  "use_reranking": true
}

Response: 200 OK
{
  "results": [
    {
      "text": "The project timeline is 6 months...",
      "score": 0.95,
      "file_id": 1,
      "filename": "project_plan.pdf",
      "chunk_index": 5
    }
  ]
}
```

#### Delete File from Knowledge Base

```http
DELETE /api/v1/knowledge-bases/{kb_id}/files/{file_id}
Authorization: Bearer <token>

Response: 204 No Content
```

### 8. File Upload & Management

#### Upload File (General)

```http
POST /api/v1/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary data>
purpose: "message_attachment" | "avatar" | "knowledge_base"

Response: 201 Created
{
  "id": "uuid",
  "filename": "document.pdf",
  "mime_type": "application/pdf",
  "size": 1024000,
  "storage_key": "users/uuid/files/abc123.pdf",
  "url": "https://cdn.chatbox.app/files/abc123.pdf",
  "created_at": "2026-01-28T10:00:00Z"
}
```

#### Parse File

```http
POST /api/v1/files/{file_id}/parse
Authorization: Bearer <token>

Response: 200 OK
{
  "text": "Extracted text content...",
  "page_count": 10,
  "word_count": 5000
}
```

### 9. Export & Import

#### Export Session

```http
GET /api/v1/sessions/{session_id}/export?format=markdown
Authorization: Bearer <token>

Response: 200 OK
Content-Type: text/markdown
Content-Disposition: attachment; filename="conversation.md"

# My Conversation

**User**: Hello!

**Assistant**: Hello! How can I help you today?
```

**Supported Formats**: `markdown`, `html`, `txt`, `json`

#### Import Session

```http
POST /api/v1/sessions/import
Authorization: Bearer <token>
Content-Type: application/json

{
  "format": "json",
  "data": {
    "name": "Imported Conversation",
    "messages": [...]
  }
}

Response: 201 Created
{
  "id": "uuid",
  "name": "Imported Conversation",
  "message_count": 10
}
```

### 10. Web Search

#### Search Web

```http
POST /api/v1/search/web
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "latest AI news",
  "provider": "bing",
  "max_results": 5
}

Response: 200 OK
{
  "query": "latest AI news",
  "results": [
    {
      "title": "AI Breakthrough Announced",
      "snippet": "Researchers have made a significant...",
      "link": "https://example.com/article",
      "raw_content": "Full article text..."
    }
  ]
}
```

#### Parse URL

```http
POST /api/v1/search/parse-url
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://example.com/article"
}

Response: 200 OK
{
  "url": "https://example.com/article",
  "title": "Article Title",
  "content": "Extracted article content...",
  "storage_key": "parsed/abc123"
}
```

### 11. MCP Servers

#### List MCP Servers

```http
GET /api/v1/mcp/servers
Authorization: Bearer <token>

Response: 200 OK
{
  "servers": [
    {
      "id": "uuid",
      "name": "GitHub MCP",
      "enabled": true,
      "status": "running",
      "transport": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-github"]
      }
    }
  ]
}
```

#### Create MCP Server

```http
POST /api/v1/mcp/servers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Custom MCP Server",
  "enabled": true,
  "transport": {
    "type": "http",
    "url": "https://mcp.example.com"
  }
}

Response: 201 Created
{
  "id": "uuid",
  "name": "Custom MCP Server",
  "status": "idle"
}
```

#### Start/Stop MCP Server

```http
POST /api/v1/mcp/servers/{server_id}/start
POST /api/v1/mcp/servers/{server_id}/stop
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "status": "running"
}
```

## Error Responses

### Standard Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

### Error Codes

- `AUTHENTICATION_ERROR` (401): Invalid or expired token
- `AUTHORIZATION_ERROR` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (422): Invalid request data
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error
- `SERVICE_UNAVAILABLE` (503): Service temporarily unavailable

## Rate Limiting

**Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1643385600
```

**Limits**:
- Authentication: 10 requests/minute
- API calls: 100 requests/minute
- File uploads: 10 requests/minute
- Streaming: 5 concurrent connections

## Pagination

**Query Parameters**:
```
?limit=50&offset=0
```

**Response**:
```json
{
  "data": [...],
  "total": 1000,
  "limit": 50,
  "offset": 0,
  "has_more": true
}
```

## Versioning

API version is included in the URL path: `/api/v1/...`

Breaking changes will result in a new version: `/api/v2/...`
