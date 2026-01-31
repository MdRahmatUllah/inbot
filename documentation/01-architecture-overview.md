# Architecture Overview

## System Architecture

### High-Level Architecture

The Chatbox application follows a multi-layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  (UI Components, Routing, State Management)                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  (Business Logic, Session Management, Message Processing)    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Platform Abstraction Layer                 │
│  (Storage, IPC, File System, Platform-specific APIs)         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  (IndexedDB, SQLite, File Storage, Vector Database)          │
└─────────────────────────────────────────────────────────────┘
```

### Current Technology Stack

**Desktop Application (Electron)**
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Webpack 5
- **State Management**: Jotai (atom-based)
- **UI Library**: Mantine v7 components
- **Routing**: TanStack Router (file-based)
- **Markdown Rendering**: react-markdown with syntax highlighting
- **Desktop Framework**: Electron (main + renderer process)

**Mobile Application (iOS/Android)**
- **Framework**: Capacitor
- **Storage**: SQLite for both settings and sessions
- **Platform**: iOS and Android native builds

**Web Application**
- **Framework**: Same React codebase
- **Storage**: IndexedDB for both settings and sessions
- **Deployment**: Static web hosting

**Storage Architecture**
- **Desktop**: File storage (Settings/Configs) + IndexedDB (Sessions)
- **Mobile**: SQLite (Settings + Sessions)
- **Web**: IndexedDB (Settings + Sessions)

**Key Libraries**
- **AI Integration**: Vercel AI SDK v5 with provider packages
- **Vector Database**: LibSQLVector with @mastra/rag
- **File Parsing**: officeparser, epub parser, chardet
- **Markdown**: react-markdown, remark-gfm, rehype-katex
- **Code Highlighting**: react-syntax-highlighter
- **Internationalization**: i18next
- **Drag & Drop**: @dnd-kit
- **Virtualization**: react-virtuoso

### Target Technology Stack (Python + Next.js)

**Backend (Python)**
- **Framework**: FastAPI (recommended for async + WebSocket support)
- **Database**: PostgreSQL with pgvector extension
- **ORM**: SQLAlchemy 2.0
- **Authentication**: JWT tokens
- **File Storage**: S3-compatible storage (MinIO/AWS S3)
- **Vector Search**: pgvector or Qdrant
- **Task Queue**: Celery with Redis (for async file processing)

**Frontend (Next.js)**
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **State Management**: Zustand or Jotai
- **UI Library**: Mantine or shadcn/ui
- **Styling**: Tailwind CSS
- **API Communication**: React Query (TanStack Query)
- **Real-time**: WebSocket or Server-Sent Events (SSE)

**Desktop Packaging (Optional)**
- **Framework**: Tauri (Rust-based, lighter than Electron)
- **Alternative**: Electron with Next.js

**Mobile Packaging (Optional)**
- **Framework**: Capacitor with Next.js
- **Alternative**: React Native

## Component Architecture

### Core Components

1. **Session Management**
   - Session CRUD operations
   - Session metadata (name, type, starred, timestamps)
   - Session threads (historical conversations)
   - Message forks (branching conversations)

2. **Message Processing**
   - Message creation and storage
   - Streaming response handling
   - Content parts (text, reasoning, tool calls)
   - File attachments and links
   - Token usage tracking

3. **AI Provider Integration**
   - Abstract model interface
   - Provider-specific implementations
   - Streaming text generation
   - Image generation (DALL-E)
   - Multi-modal support (vision)
   - Tool/function calling

4. **Knowledge Base**
   - Vector database integration
   - File upload and processing
   - Chunking and embedding
   - Semantic search
   - Reranking

5. **MCP (Model Context Protocol)**
   - Server management
   - Tool registration
   - IPC/HTTP transport
   - Dynamic tool loading

6. **Web Search**
   - Multiple providers (Built-in, Bing, Tavily)
   - Search result caching
   - Link parsing

7. **File Handling**
   - File upload and parsing
   - Supported formats: PDF, DOCX, XLSX, PPTX, TXT, JSON, CSV, XML, HTML, EPUB
   - Image processing and OCR
   - File attachment to messages

8. **Export/Import**
   - Export formats: HTML, Markdown, TXT, JSON
   - Session import
   - Settings import/export

9. **Settings Management**
   - Global settings
   - Session-specific settings
   - Provider configurations
   - Keyboard shortcuts
   - Theme preferences

10. **Copilots (Custom Assistants)**
    - Custom system prompts
    - Pre-configured settings
    - Avatar customization

## Data Flow Diagrams

### Message Streaming Flow

```
User Input → Validation → Message Creation → Storage
                                ↓
                    AI Provider Selection
                                ↓
                    Pre-processing (OCR, File Parsing)
                                ↓
                    Tool Use Decision (KB, Web Search, MCP)
                                ↓
                    Stream Text Generation
                                ↓
                    Chunk Processing → UI Update → Periodic Storage
                                ↓
                    Completion → Final Storage → Token Usage Update
```

### Knowledge Base Query Flow

```
User Message → Extract Query Intent
                    ↓
            Generate Search Query
                    ↓
            Embed Query → Vector Search
                    ↓
            Retrieve Top K Results
                    ↓
            Rerank Results (if enabled)
                    ↓
            Inject into Context → AI Generation
```

### File Upload Flow

```
File Selection → Validation (Type, Size)
                    ↓
            Upload to Storage
                    ↓
            Parse File Content
                    ↓
            Chunk Content
                    ↓
            Generate Embeddings
                    ↓
            Store in Vector DB
                    ↓
            Update File Metadata
```

## Platform Abstraction Layer

The application uses a platform abstraction layer to support multiple platforms (Desktop, Web, Mobile):

### Storage Interface

```typescript
interface StorageInterface {
  get(key: string): Promise<any>
  set(key: string, value: any): Promise<void>
  remove(key: string): Promise<void>
  getBlob(key: string): Promise<string | null>
  setBlob(key: string, value: string): Promise<void>
}
```

**Implementations:**
- **Desktop**: File-based storage for configs, IndexedDB for sessions
- **Web**: IndexedDB for all data
- **Mobile**: SQLite for all data

### Platform Interface

```typescript
interface PlatformInterface {
  type: 'desktop' | 'web' | 'mobile'
  storage: StorageInterface
  parseFile(file: File): Promise<{ text: string }>
  parseUrl(url: string): Promise<{ key: string, title: string }>
  getKnowledgeBaseController(): KnowledgeBaseController
  // ... other platform-specific methods
}
```

## Migration Architecture

### Proposed Backend Architecture (Python + FastAPI)

```
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway (FastAPI)                   │
│  - REST endpoints                                            │
│  - WebSocket for streaming                                   │
│  - Authentication middleware                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
│  - SessionService                                            │
│  - MessageService                                            │
│  - AIProviderService                                         │
│  - KnowledgeBaseService                                      │
│  - FileService                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                         │
│  - SQLAlchemy ORM                                            │
│  - Repository pattern                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Storage Layer                             │
│  - PostgreSQL (relational data)                              │
│  - pgvector (embeddings)                                     │
│  - S3/MinIO (file storage)                                   │
│  - Redis (caching, task queue)                               │
└─────────────────────────────────────────────────────────────┘
```

### Proposed Frontend Architecture (Next.js)

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
│  /app                                                        │
│    ├── (auth)                                                │
│    │   ├── login                                             │
│    │   └── register                                          │
│    ├── (dashboard)                                           │
│    │   ├── layout.tsx                                        │
│    │   ├── page.tsx (session list)                           │
│    │   ├── session/[id]                                      │
│    │   ├── copilots                                          │
│    │   ├── knowledge-base                                    │
│    │   └── settings                                          │
│    └── api (optional API routes)                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    State Management (Zustand)                │
│  - sessionStore                                              │
│  - messageStore                                              │
│  - settingsStore                                             │
│  - uiStore                                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    API Client Layer                          │
│  - React Query for data fetching                             │
│  - WebSocket client for streaming                            │
│  - Axios/Fetch for HTTP requests                             │
└─────────────────────────────────────────────────────────────┘
```

## Key Architectural Decisions

### 1. Streaming Architecture

**Current**: Direct streaming from AI provider to UI using Vercel AI SDK

**Target**:
- Backend receives stream from AI provider
- Backend forwards chunks via WebSocket/SSE to frontend
- Frontend updates UI in real-time

### 2. State Management

**Current**: Jotai (atom-based, minimal boilerplate)

**Target**: Zustand (similar philosophy, works well with Next.js)
- Simple API
- No providers needed
- TypeScript support
- Middleware for persistence

### 3. Storage Strategy

**Current**: Platform-specific (IndexedDB, SQLite, File)

**Target**: Centralized backend storage
- PostgreSQL for relational data
- pgvector for embeddings
- S3/MinIO for files
- Redis for caching

### 4. Authentication

**Current**: None (desktop app)

**Target**: JWT-based authentication
- Access tokens (short-lived)
- Refresh tokens (long-lived)
- Secure HTTP-only cookies

### 5. Real-time Communication

**Current**: Direct AI SDK streaming

**Target**: WebSocket or SSE
- WebSocket: Bidirectional, better for interactive features
- SSE: Simpler, sufficient for streaming responses

## Scalability Considerations

1. **Horizontal Scaling**: Stateless API servers behind load balancer
2. **Database**: Read replicas for query performance
3. **Caching**: Redis for frequently accessed data
4. **File Storage**: CDN for static assets
5. **Background Jobs**: Celery for async processing (embeddings, file parsing)

## Security Architecture

1. **Authentication**: JWT tokens with refresh mechanism
2. **Authorization**: Role-based access control (RBAC)
3. **API Keys**: Encrypted storage for AI provider keys
4. **File Upload**: Virus scanning, type validation, size limits
5. **XSS Protection**: Content sanitization
6. **CSRF Protection**: Token-based validation
7. **Rate Limiting**: Per-user and per-endpoint limits

