# Data Models & Storage

## Overview

This document defines the complete data schema for the Chatbox application, including entity relationships, validation rules, and migration strategies.

## Core Data Models

### 1. User Model

```typescript
interface User {
  id: string                    // UUID
  email: string                 // Unique email
  username: string              // Display name
  passwordHash: string          // Hashed password
  createdAt: Date
  updatedAt: Date
  settings: UserSettings        // Reference to settings
}
```

**Validation Rules**:
- Email: Valid email format, unique
- Username: 3-50 characters, alphanumeric + underscore
- Password: Minimum 8 characters (hashed with bcrypt)

**Database**: PostgreSQL table `users`

### 2. Session Model

```typescript
interface Session {
  id: string                    // UUID
  userId: string                // Foreign key to User
  type: 'chat' | 'picture'      // Session type
  name: string                  // Session name
  starred: boolean              // Starred flag
  createdAt: Date
  updatedAt: Date
  
  // AI Configuration
  copilotId?: string            // Reference to Copilot
  assistantAvatarKey?: string   // Custom avatar
  
  // Session-specific settings (overrides global)
  settings?: SessionSettings
  
  // Threading
  threads: SessionThread[]      // Historical threads
  threadName?: string           // Current thread name
  
  // Message forking
  messageForksHash?: Record<string, MessageFork>
  
  // Relationships
  messages: Message[]           // One-to-many
}
```

**Validation Rules**:
- Name: 1-200 characters
- Type: Must be 'chat' or 'picture'
- Settings: Must conform to SessionSettings schema

**Database**: PostgreSQL table `sessions`

**Indexes**:
- `userId` (for user's sessions)
- `createdAt` (for sorting)
- `starred` (for filtering)

### 3. Message Model

```typescript
interface Message {
  id: string                    // UUID
  sessionId: string             // Foreign key to Session
  role: 'user' | 'assistant' | 'system'
  name?: string                 // Optional name for role
  
  // Content
  contentParts: ContentPart[]   // Array of content parts
  
  // Attachments
  files?: FileAttachment[]      // File attachments
  links?: LinkAttachment[]      // URL attachments
  
  // AI-specific
  reasoningContent?: string     // Chain-of-thought (o1 models)
  aiProvider?: string           // Provider used
  model?: string                // Model used
  
  // Metadata
  generating: boolean           // Currently generating
  timestamp: Date
  usage?: TokenUsage            // Token usage stats
  firstTokenLatency?: number    // Time to first token (ms)
  
  // Status
  status?: MessageStatus[]      // Processing status
  error?: string                // Error message if failed
}

interface ContentPart {
  type: 'text' | 'image' | 'tool-call' | 'tool-result' | 'reasoning'
  
  // Text content
  text?: string
  
  // Image content
  image?: string                // Base64 or URL
  mimeType?: string
  
  // Tool call
  toolCallId?: string
  toolName?: string
  args?: Record<string, any>
  result?: any
}

interface FileAttachment {
  name: string
  type: string                  // MIME type
  size: number
  path?: string                 // File path (desktop)
  storageKey?: string           // Storage key for parsed content
}

interface LinkAttachment {
  url: string
  title?: string
  storageKey?: string           // Storage key for parsed content
}

interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

interface MessageStatus {
  type: 'info' | 'warning' | 'error'
  text: string
}
```

**Validation Rules**:
- Role: Must be 'user', 'assistant', or 'system'
- ContentParts: At least one content part
- Files: Max 10 files per message
- File size: Max 100MB per file

**Database**: PostgreSQL table `messages`

**Indexes**:
- `sessionId` (for session's messages)
- `timestamp` (for ordering)

### 4. SessionThread Model

```typescript
interface SessionThread {
  id: string                    // UUID
  sessionId: string             // Foreign key to Session
  name: string                  // Thread name
  messages: Message[]           // Snapshot of messages
  createdAt: Date
}
```

**Database**: PostgreSQL table `session_threads`

**Storage**: Messages stored as JSONB for historical snapshot

### 5. MessageFork Model

```typescript
interface MessageFork {
  position: number              // Position in message list
  lists: Message[][]            // Array of message arrays (forks)
  createdAt: Date
}
```

**Database**: Stored as JSONB in `sessions` table

### 6. Settings Model

```typescript
interface Settings {
  id: string                    // UUID
  userId: string                // Foreign key to User
  
  // UI Settings
  language: string              // UI language
  theme: 'light' | 'dark' | 'system'
  fontSize: number              // Font size multiplier
  
  // Chat Settings
  showMessageTimestamp: boolean
  showModelName: boolean
  showTokenCount: boolean
  showWordCount: boolean
  showTokenUsed: boolean
  showFirstTokenLatency: boolean
  enableMarkdownRendering: boolean
  enableLaTeXRendering: boolean
  enableMermaidRendering: boolean
  autoPreviewArtifacts: boolean
  autoCollapseCodeBlock: boolean
  pasteLongTextAsAFile: boolean
  
  // Provider Configurations
  providers: ProviderConfig[]
  
  // Keyboard Shortcuts
  shortcuts: KeyboardShortcuts
  
  // MCP Configuration
  mcp: MCPConfig
  
  // Web Search Configuration
  webSearch: WebSearchConfig
  
  // Desktop-specific
  autoLaunch?: boolean
  autoUpdate?: boolean
  betaUpdate?: boolean
}
```

**Database**: PostgreSQL table `settings` (one per user)

**Storage**: Complex nested objects stored as JSONB

### 7. ProviderConfig Model

```typescript
interface ProviderConfig {
  id: string                    // Provider ID (e.g., 'openai', 'anthropic')
  name: string                  // Display name
  enabled: boolean              // Enabled flag

  // Authentication
  apiKey: string                // Encrypted API key
  apiHost?: string              // Custom API endpoint
  apiVersion?: string           // API version

  // Model Configuration
  defaultModel?: string         // Default model ID
  availableModels?: string[]    // Available models

  // Parameters
  temperature?: number          // 0-2
  topP?: number                 // 0-1
  maxOutputTokens?: number      // Max tokens

  // Provider-specific
  providerOptions?: Record<string, any>

  // Proxy
  useProxy?: boolean
  proxyUrl?: string
}
```

**Validation Rules**:
- API Key: Encrypted at rest using AES-256
- Temperature: 0-2
- Top P: 0-1
- Max Tokens: Positive integer

### 8. Copilot Model

```typescript
interface Copilot {
  id: string                    // UUID
  userId: string                // Foreign key to User
  name: string                  // Copilot name
  systemPrompt: string          // Custom system instructions
  avatarKey?: string            // Custom avatar

  // Default Configuration
  defaultProvider?: string      // Default AI provider
  defaultModel?: string         // Default model
  settings?: SessionSettings    // Default settings

  createdAt: Date
  updatedAt: Date
}
```

**Database**: PostgreSQL table `copilots`

### 9. KnowledgeBase Model

```typescript
interface KnowledgeBase {
  id: number                    // Auto-increment ID
  userId: string                // Foreign key to User
  name: string                  // KB name
  description?: string          // Optional description

  // Model Configuration
  embeddingProvider: string     // Embedding model provider
  embeddingModel: string        // Embedding model ID
  visionModel?: string          // Vision model for images
  rerankProvider?: string       // Reranking provider
  rerankModel?: string          // Reranking model

  // Settings
  chunkSize: number             // Default: 512
  chunkOverlap: number          // Default: 50
  topK: number                  // Default: 5

  createdAt: Date
  updatedAt: Date

  // Relationships
  files: KBFile[]               // One-to-many
}
```

**Database**: PostgreSQL table `knowledge_bases`

### 10. KBFile Model

```typescript
interface KBFile {
  id: number                    // Auto-increment ID
  kbId: number                  // Foreign key to KnowledgeBase
  filename: string              // Original filename
  mimeType: string              // MIME type
  size: number                  // File size in bytes
  storageKey: string            // S3/MinIO storage key

  // Processing
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string                // Error message if failed

  // Metadata
  chunkCount?: number           // Number of chunks
  embeddingCount?: number       // Number of embeddings

  createdAt: Date
  processedAt?: Date
}
```

**Database**: PostgreSQL table `kb_files`

### 11. KBChunk Model (Vector Storage)

```typescript
interface KBChunk {
  id: string                    // UUID
  fileId: number                // Foreign key to KBFile
  kbId: number                  // Foreign key to KnowledgeBase

  // Content
  text: string                  // Chunk text
  embedding: number[]           // Vector embedding (1536 dimensions for OpenAI)

  // Metadata
  chunkIndex: number            // Chunk position in file
  startOffset: number           // Start position in original file
  endOffset: number             // End position in original file

  createdAt: Date
}
```

**Database**: PostgreSQL with pgvector extension

**Table**: `kb_chunks`

**Indexes**:
- Vector index on `embedding` using HNSW or IVFFlat
- `kbId` for filtering
- `fileId` for file-specific queries

### 12. MCPServer Model

```typescript
interface MCPServer {
  id: string                    // UUID
  userId: string                // Foreign key to User
  name: string                  // Server name
  enabled: boolean              // Enabled flag

  // Transport Configuration
  transport: {
    type: 'stdio' | 'http'

    // For stdio
    command?: string            // Command to run
    args?: string[]             // Command arguments
    env?: Record<string, string> // Environment variables

    // For HTTP
    url?: string                // HTTP endpoint
  }

  // Status
  status: 'idle' | 'starting' | 'running' | 'stopping' | 'error'
  error?: string                // Error message

  createdAt: Date
  updatedAt: Date
}
```

**Database**: PostgreSQL table `mcp_servers`

## Entity Relationships

```
User (1) ──────< (N) Session
User (1) ──────< (N) Copilot
User (1) ──────< (N) KnowledgeBase
User (1) ──────< (N) MCPServer
User (1) ────── (1) Settings

Session (1) ──────< (N) Message
Session (1) ──────< (N) SessionThread

KnowledgeBase (1) ──────< (N) KBFile
KBFile (1) ──────< (N) KBChunk
```

## Database Schema (PostgreSQL)

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### Sessions Table

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('chat', 'picture')),
  name VARCHAR(200) NOT NULL,
  starred BOOLEAN DEFAULT FALSE,
  copilot_id UUID REFERENCES copilots(id) ON DELETE SET NULL,
  assistant_avatar_key VARCHAR(255),
  settings JSONB,
  threads JSONB DEFAULT '[]',
  thread_name VARCHAR(200),
  message_forks_hash JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX idx_sessions_starred ON sessions(starred) WHERE starred = TRUE;
```

### Messages Table

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  name VARCHAR(100),
  content_parts JSONB NOT NULL,
  files JSONB,
  links JSONB,
  reasoning_content TEXT,
  ai_provider VARCHAR(100),
  model VARCHAR(100),
  generating BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usage JSONB,
  first_token_latency INTEGER,
  status JSONB,
  error TEXT
);

CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
```

### Session Threads Table

```sql
CREATE TABLE session_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  messages JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_session_threads_session_id ON session_threads(session_id);
```

### Settings Table

```sql
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  language VARCHAR(10) DEFAULT 'en',
  theme VARCHAR(20) DEFAULT 'system',
  font_size DECIMAL(3,1) DEFAULT 1.0,
  show_message_timestamp BOOLEAN DEFAULT TRUE,
  show_model_name BOOLEAN DEFAULT FALSE,
  show_token_count BOOLEAN DEFAULT FALSE,
  show_word_count BOOLEAN DEFAULT FALSE,
  show_token_used BOOLEAN DEFAULT FALSE,
  show_first_token_latency BOOLEAN DEFAULT FALSE,
  enable_markdown_rendering BOOLEAN DEFAULT TRUE,
  enable_latex_rendering BOOLEAN DEFAULT TRUE,
  enable_mermaid_rendering BOOLEAN DEFAULT TRUE,
  auto_preview_artifacts BOOLEAN DEFAULT FALSE,
  auto_collapse_code_block BOOLEAN DEFAULT FALSE,
  paste_long_text_as_file BOOLEAN DEFAULT TRUE,
  providers JSONB DEFAULT '[]',
  shortcuts JSONB,
  mcp JSONB,
  web_search JSONB,
  auto_launch BOOLEAN DEFAULT FALSE,
  auto_update BOOLEAN DEFAULT TRUE,
  beta_update BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settings_user_id ON settings(user_id);
```

### Copilots Table

```sql
CREATE TABLE copilots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  system_prompt TEXT NOT NULL,
  avatar_key VARCHAR(255),
  default_provider VARCHAR(100),
  default_model VARCHAR(100),
  settings JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_copilots_user_id ON copilots(user_id);
```

### Knowledge Bases Table

```sql
CREATE TABLE knowledge_bases (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  embedding_provider VARCHAR(100) NOT NULL,
  embedding_model VARCHAR(100) NOT NULL,
  vision_model VARCHAR(100),
  rerank_provider VARCHAR(100),
  rerank_model VARCHAR(100),
  chunk_size INTEGER DEFAULT 512,
  chunk_overlap INTEGER DEFAULT 50,
  top_k INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_knowledge_bases_user_id ON knowledge_bases(user_id);
```

### KB Files Table

```sql
CREATE TABLE kb_files (
  id SERIAL PRIMARY KEY,
  kb_id INTEGER NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error TEXT,
  chunk_count INTEGER,
  embedding_count INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);

CREATE INDEX idx_kb_files_kb_id ON kb_files(kb_id);
CREATE INDEX idx_kb_files_status ON kb_files(status);
```

### KB Chunks Table (with pgvector)

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE kb_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id INTEGER NOT NULL REFERENCES kb_files(id) ON DELETE CASCADE,
  kb_id INTEGER NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  embedding vector(1536),  -- OpenAI embedding dimension
  chunk_index INTEGER NOT NULL,
  start_offset INTEGER,
  end_offset INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kb_chunks_kb_id ON kb_chunks(kb_id);
CREATE INDEX idx_kb_chunks_file_id ON kb_chunks(file_id);

-- Vector similarity search index (HNSW for better performance)
CREATE INDEX idx_kb_chunks_embedding ON kb_chunks
  USING hnsw (embedding vector_cosine_ops);
```

### MCP Servers Table

```sql
CREATE TABLE mcp_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  transport JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'idle',
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mcp_servers_user_id ON mcp_servers(user_id);
CREATE INDEX idx_mcp_servers_enabled ON mcp_servers(enabled) WHERE enabled = TRUE;
```

## Data Validation Rules

### Zod Schemas (TypeScript)

The current application uses Zod for runtime validation. Here are the key schemas:

```typescript
import { z } from 'zod'

// Content Part Schema
const ContentPartSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    text: z.string(),
  }),
  z.object({
    type: z.literal('image'),
    image: z.string(),
    mimeType: z.string().optional(),
  }),
  z.object({
    type: z.literal('tool-call'),
    toolCallId: z.string(),
    toolName: z.string(),
    args: z.record(z.any()),
  }),
  z.object({
    type: z.literal('tool-result'),
    toolCallId: z.string(),
    toolName: z.string(),
    result: z.any(),
  }),
  z.object({
    type: z.literal('reasoning'),
    text: z.string(),
  }),
])

// Message Schema
const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  name: z.string().optional(),
  contentParts: z.array(ContentPartSchema),
  files: z.array(z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
    path: z.string().optional(),
    storageKey: z.string().optional(),
  })).optional(),
  links: z.array(z.object({
    url: z.string().url(),
    title: z.string().optional(),
    storageKey: z.string().optional(),
  })).optional(),
  reasoningContent: z.string().optional(),
  aiProvider: z.string().optional(),
  model: z.string().optional(),
  generating: z.boolean(),
  timestamp: z.date(),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number(),
  }).optional(),
  firstTokenLatency: z.number().optional(),
  status: z.array(z.object({
    type: z.enum(['info', 'warning', 'error']),
    text: z.string(),
  })).optional(),
  error: z.string().optional(),
})

// Session Schema
const SessionSchema = z.object({
  id: z.string(),
  type: z.enum(['chat', 'picture']),
  name: z.string().min(1).max(200),
  starred: z.boolean(),
  copilotId: z.string().optional(),
  assistantAvatarKey: z.string().optional(),
  settings: z.any().optional(),  // SessionSettings schema
  threads: z.array(z.any()),     // SessionThread schema
  threadName: z.string().optional(),
  messageForksHash: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
```

## Migration Strategy

### From Current Storage to Backend Database

#### Phase 1: Data Export

1. **Export User Data**
   - Export all sessions from IndexedDB/SQLite
   - Export all settings
   - Export copilots
   - Export knowledge bases (if any)

2. **Data Format**
   - JSON format for easy parsing
   - Include all relationships
   - Preserve timestamps

#### Phase 2: Data Transformation

1. **Add User Context**
   - Assign all data to user accounts
   - Generate user IDs

2. **Transform Storage Keys**
   - Convert blob storage keys to S3 keys
   - Upload blobs to S3/MinIO

3. **Normalize Data**
   - Ensure all data conforms to new schemas
   - Handle missing fields with defaults

#### Phase 3: Data Import

1. **Create User Accounts**
   - Import users first
   - Hash passwords

2. **Import Settings**
   - One settings record per user
   - Decrypt and re-encrypt API keys

3. **Import Sessions**
   - Link to user IDs
   - Preserve creation dates

4. **Import Messages**
   - Link to session IDs
   - Preserve order and timestamps

5. **Import Knowledge Bases**
   - Re-process files for embeddings
   - Or migrate existing embeddings

#### Phase 4: Verification

1. **Data Integrity Checks**
   - Verify all relationships
   - Check for missing data
   - Validate foreign keys

2. **User Acceptance Testing**
   - Test with sample users
   - Verify all features work

## Storage Optimization

### Blob Storage (S3/MinIO)

**Structure**:
```
/users/{userId}/
  /avatars/{avatarKey}
  /files/{fileKey}
  /parsed/{parsedKey}
  /images/{imageKey}
```

**Lifecycle Policies**:
- Delete orphaned files after 30 days
- Compress old files
- Archive inactive user data

### Caching Strategy (Redis)

**Cache Keys**:
```
user:{userId}:settings
user:{userId}:sessions
session:{sessionId}:messages
kb:{kbId}:search:{queryHash}
provider:{providerId}:models
```

**TTL**:
- Settings: 1 hour
- Sessions list: 5 minutes
- Messages: 10 minutes
- KB search results: 5 minutes
- Provider models: 24 hours

### Database Optimization

1. **Partitioning**
   - Partition messages table by session_id
   - Partition kb_chunks by kb_id

2. **Archival**
   - Archive old sessions to separate table
   - Move inactive data to cold storage

3. **Vacuum & Analyze**
   - Regular maintenance
   - Update statistics

## Backup Strategy

1. **Database Backups**
   - Daily full backups
   - Hourly incremental backups
   - 30-day retention

2. **Blob Storage Backups**
   - Versioning enabled
   - Cross-region replication
   - 90-day retention

3. **Disaster Recovery**
   - Point-in-time recovery
   - Automated failover
   - Regular DR drills
