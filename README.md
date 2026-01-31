# InBot

**InBot** is an enterprise-grade AI chat platform with multi-turn conversations, knowledge base integration, agentic AI workflows, and advanced tool calling capabilities.

## Overview

InBot provides a comprehensive AI chat experience with:

- **Multi-turn Conversations**: Seamless chat and picture sessions with streaming responses
- **Knowledge Base Integration**: Vector search with semantic understanding using pgvector
- **Multiple AI Providers**: OpenAI, Anthropic, Google Gemini, Azure, Mistral, Groq, DeepSeek, xAI, OpenRouter, Ollama, LM Studio
- **Tool Calling**: Web search, document processing, file attachments, and MCP (Model Context Protocol) integration
- **Custom Copilots**: Create AI assistants with custom system prompts
- **Export/Import**: Multiple formats (Markdown, HTML, TXT, JSON)
- **Internationalization**: Support for 8+ languages
- **Multi-platform**: Web, Desktop (Tauri), and Mobile (Capacitor)

## Architecture

InBot follows **Clean Architecture** principles with strict separation of concerns:

- **Backend**: Python (FastAPI) with PostgreSQL + pgvector, Redis, Celery, S3/MinIO
- **Frontend**: Next.js 14+ App Router with TypeScript, Zustand/Jotai, Tailwind CSS
- **Desktop**: Tauri (recommended) or Electron
- **Mobile**: Capacitor with Next.js

### Key Principles

- SOLID principles and Domain-Driven Design (DDD-lite)
- 12-Factor App methodology
- Mandatory layers: API → Use Case → Domain → Infrastructure
- Deterministic, testable, and observable AI behavior
- Enterprise-grade security and scalability

## Documentation

Comprehensive documentation is available in the `documentation/` directory:

- **[Architecture Overview](documentation/01-architecture-overview.md)** - System architecture, technology stack, component design
- **[Feature Catalog](documentation/02-feature-catalog.md)** - Complete feature inventory with MVP/Phase 2/Phase 3 prioritization
- **[Data Models & Storage](documentation/03-data-models-storage.md)** - Database schema, data models, validation rules
- **[API Specifications](documentation/04-api-specifications.md)** - REST API and WebSocket specifications
- **[Frontend Architecture](documentation/05-frontend-architecture.md)** - Next.js architecture, state management, component patterns
- **[Sprint Plan](documentation/06-sprint-plan.md)** - 18-week implementation plan with deliverables
- **[User Workflows](documentation/07-user-workflows.md)** - Detailed user interaction flows
- **[Technology Migration](documentation/08-technology-migration.md)** - Migration from Electron to FastAPI + Next.js
- **[Integration Points](documentation/09-integration-points.md)** - External integrations, file handling, real-time communication
- **[Non-Functional Requirements](documentation/10-non-functional-requirements.md)** - Performance, security, reliability, scalability

## Quick Start

### Prerequisites

- **Backend**: Python 3.10+, PostgreSQL 14+ with pgvector, Redis, S3/MinIO
- **Frontend**: Node.js 20+, npm/yarn/pnpm
- **Docker** (optional, for local services)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your configuration

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Docker Compose (Recommended for Local Development)

```bash
# Start all services (PostgreSQL, Redis, MinIO, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Supported AI Providers

InBot supports multiple AI providers with unified abstraction:

- **OpenAI**: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
- **Google**: Gemini Pro, Gemini Ultra
- **Azure OpenAI**: All Azure-hosted models
- **Mistral AI**: Mistral Large, Mistral Medium
- **Groq**: Fast inference for supported models
- **DeepSeek**: DeepSeek Chat, DeepSeek Coder
- **xAI**: Grok models
- **OpenRouter**: Access to multiple providers
- **Ollama**: Local model hosting
- **LM Studio**: Local model hosting

## Features

### MVP Features (Sprints 0-7)
- Authentication & User Management
- Session Management (chat/picture sessions)
- Message Management with streaming
- AI Provider Integration
- File Handling (PDF, DOCX, XLSX, PPTX, images)
- Knowledge Base with vector search
- Export/Import (Markdown, HTML, TXT, JSON)
- Settings Management

### Phase 2 Features (Sprint 8+)
- Custom Copilots
- Web Search Integration
- MCP Server Support
- Advanced Session Features (threads, forking)
- Message Regeneration & Editing

### Phase 3 Features (Future)
- Voice Input/Output
- Image Generation
- Multi-modal Conversations
- Workflow Automation
- Plugin System

## Project Structure

```
infinitibit-assistant/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/v1/      # API routes (thin controllers)
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic DTOs
│   │   ├── services/    # Business logic (use cases)
│   │   ├── ai/          # AI provider integrations
│   │   ├── utils/       # Utilities (security, file parsing, chunking)
│   │   ├── tasks/       # Celery background tasks
│   │   ├── config.py    # Configuration
│   │   ├── database.py  # Database connection
│   │   └── main.py      # FastAPI app entry point
│   ├── alembic/         # Database migrations
│   ├── tests/           # Backend tests
│   └── requirements.txt # Python dependencies
├── frontend/            # Next.js frontend
│   ├── src/
│   │   ├── app/         # Next.js App Router pages
│   │   ├── components/  # React components
│   │   ├── features/    # Feature-specific code
│   │   ├── lib/         # API client, hooks, stores, utils
│   │   ├── types/       # TypeScript types
│   │   └── styles/      # Global styles
│   ├── public/          # Static assets
│   └── package.json     # npm dependencies
├── documentation/       # Comprehensive documentation
│   ├── 01-architecture-overview.md
│   ├── 02-feature-catalog.md
│   ├── 03-data-models-storage.md
│   ├── 04-api-specifications.md
│   ├── 05-frontend-architecture.md
│   ├── 06-sprint-plan.md
│   ├── 07-user-workflows.md
│   ├── 08-technology-migration.md
│   ├── 09-integration-points.md
│   └── 10-non-functional-requirements.md
├── .augment/            # AI agent rules and guidelines
│   └── rules/
│       ├── 00-project-overview.md
│       ├── 10-architecture-standards.md
│       ├── 20-backend-standards.md
│       ├── 30-frontend-standards.md
│       ├── 40-ai-agent-tooling.md
│       ├── 50-document-ingestion.md
│       ├── 60-security-compliance.md
│       └── 70-observability-testing.md
├── docker-compose.yml   # Docker services configuration
├── AGENTS.md            # Global agent instructions
└── README.md            # This file
```

## Development Guidelines

### Backend Development

- **Keep controllers thin**: API routes should only handle request/response, delegate to services
- **Business logic in services**: All use case logic lives in `backend/app/services/`
- **Use DTOs**: Always use Pydantic schemas for request/response validation
- **Never access DB directly from API routes**: Use service layer
- **Add tests**: Unit tests for services, integration tests for APIs

### Frontend Development

- **Feature-first structure**: Organize code by feature, not by type
- **Typed API clients only**: All API calls through typed client in `lib/api/`
- **No inline business logic**: Keep components presentational, logic in hooks/stores
- **Chat rendering must support streaming and tools**: Handle real-time updates and tool calls
- **Use TypeScript strict mode**: No `any` types in feature code

### AI Provider Integration

- **Use abstract base class**: All providers implement common interface
- **Support streaming**: All providers must support streaming responses
- **Track token usage**: Log and display token consumption
- **Handle errors gracefully**: Implement retry logic and fallbacks
- **Encrypt API keys**: Store user API keys encrypted in database

## Testing

### Backend Testing

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_sessions.py
```

### Frontend Testing

```bash
cd frontend

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## Deployment

### Production Deployment

See [Technology Migration Guide](documentation/08-technology-migration.md) for detailed deployment instructions.

**Recommended Stack**:
- **Backend**: Docker + Cloud Provider (AWS ECS, Google Cloud Run, Azure Container Instances)
- **Frontend**: Vercel or Netlify
- **Database**: Managed PostgreSQL (Supabase, Neon, AWS RDS)
- **Storage**: S3 or compatible object storage
- **Cache**: Redis (managed or self-hosted)

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost/inbot
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-here
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=inbot
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## Contributing

1. Follow the architecture standards in `.augment/rules/`
2. Write tests for all new features
3. Update documentation when adding features
4. Follow the sprint plan in `documentation/06-sprint-plan.md`
5. Ensure code passes linting and type checking

## License

[Add your license here]

## Support

For questions or issues, please refer to the comprehensive documentation in the `documentation/` directory or contact the development team.

---

**Built with ❤️ using Clean Architecture principles**
