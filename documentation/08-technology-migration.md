# Technology Migration Guide

## Overview

This document provides detailed guidance for migrating from the current Electron-based Chatbox application to a Python (FastAPI) backend with Next.js frontend.

---

## Backend: Python with FastAPI

### Why FastAPI?

- **Performance**: Async/await support, comparable to Node.js
- **Type Safety**: Pydantic models with automatic validation
- **WebSocket Support**: Native WebSocket support for streaming
- **Auto Documentation**: Automatic OpenAPI/Swagger docs
- **Modern**: Python 3.10+ with type hints
- **Ecosystem**: Rich ecosystem for AI/ML integrations

### Required Python Packages

#### Core Framework

```bash
# Web framework
fastapi==0.109.0
uvicorn[standard]==0.27.0  # ASGI server
python-multipart==0.0.6    # File uploads
websockets==12.0           # WebSocket support

# Database
sqlalchemy==2.0.25         # ORM
alembic==1.13.1            # Migrations
psycopg2-binary==2.9.9     # PostgreSQL driver
asyncpg==0.29.0            # Async PostgreSQL

# Validation & Serialization
pydantic==2.5.3            # Data validation
pydantic-settings==2.1.0   # Settings management

# Authentication
python-jose[cryptography]==3.3.0  # JWT tokens
passlib[bcrypt]==1.7.4            # Password hashing
python-multipart==0.0.6           # OAuth2 forms

# Caching & Task Queue
redis==5.0.1               # Redis client
celery==5.3.6              # Task queue
flower==2.0.1              # Celery monitoring

# File Storage
boto3==1.34.34             # AWS S3 / MinIO
python-magic==0.4.27       # File type detection

# Vector Database
pgvector==0.2.4            # PostgreSQL vector extension
# OR
qdrant-client==1.7.0       # Qdrant vector DB

# AI Provider SDKs
openai==1.10.0             # OpenAI
anthropic==0.8.1           # Anthropic Claude
google-generativeai==0.3.2 # Google Gemini
cohere==4.47               # Cohere
mistralai==0.0.12          # Mistral AI

# File Parsing
pypdf==3.17.4              # PDF parsing
python-docx==1.1.0         # DOCX parsing
openpyxl==3.1.2            # Excel parsing
python-pptx==0.6.23        # PowerPoint parsing
ebooklib==0.18             # EPUB parsing
pillow==10.2.0             # Image processing
pytesseract==0.3.10        # OCR (optional)

# Web Scraping (for web search)
beautifulsoup4==4.12.3     # HTML parsing
requests==2.31.0           # HTTP client
httpx==0.26.0              # Async HTTP client

# Utilities
python-dotenv==1.0.0       # Environment variables
loguru==0.7.2              # Logging
tenacity==8.2.3            # Retry logic
```

### Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Configuration
│   ├── database.py             # Database connection
│   ├── dependencies.py         # Dependency injection
│   │
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── session.py
│   │   ├── message.py
│   │   ├── knowledge_base.py
│   │   └── ...
│   │
│   ├── schemas/                # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── session.py
│   │   ├── message.py
│   │   └── ...
│   │
│   ├── api/                    # API routes
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── sessions.py
│   │   │   ├── messages.py
│   │   │   ├── websocket.py
│   │   │   ├── knowledge_base.py
│   │   │   └── ...
│   │
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── session_service.py
│   │   ├── message_service.py
│   │   ├── ai_service.py
│   │   ├── embedding_service.py
│   │   ├── file_service.py
│   │   └── ...
│   │
│   ├── ai/                     # AI provider integrations
│   │   ├── __init__.py
│   │   ├── base.py             # Abstract base class
│   │   ├── openai_provider.py
│   │   ├── anthropic_provider.py
│   │   ├── google_provider.py
│   │   └── ...
│   │
│   ├── utils/                  # Utilities
│   │   ├── __init__.py
│   │   ├── security.py         # JWT, hashing
│   │   ├── file_parser.py      # File parsing
│   │   ├── chunking.py         # Text chunking
│   │   └── ...
│   │
│   └── tasks/                  # Celery tasks
│       ├── __init__.py
│       ├── embedding_tasks.py
│       └── file_processing_tasks.py
│
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
│
├── tests/                      # Tests
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_sessions.py
│   └── ...
│
├── .env.example                # Environment variables template
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Docker image
├── docker-compose.yml          # Local development
└── alembic.ini                 # Alembic config
```

### FastAPI Setup Example

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, sessions, messages, websocket
from app.database import engine
from app.models import Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Chatbox API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(sessions.router, prefix="/api/v1/sessions", tags=["sessions"])
app.include_router(messages.router, prefix="/api/v1/messages", tags=["messages"])
app.include_router(websocket.router, prefix="/api/v1/ws", tags=["websocket"])

@app.get("/")
def read_root():
    return {"message": "Chatbox API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
```

### Database Configuration

```python
# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Environment Configuration

```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:pass@localhost/chatbox"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # S3/MinIO
    S3_ENDPOINT: str = "http://localhost:9000"
    S3_ACCESS_KEY: str = ""
    S3_SECRET_KEY: str = ""
    S3_BUCKET: str = "chatbox"
    
    # AI Providers (encrypted in DB, these are for admin)
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()
```

---

## Frontend: Next.js with React

### Why Next.js?

- **Server Components**: Better performance, SEO
- **App Router**: File-based routing
- **API Routes**: Optional backend endpoints
- **Image Optimization**: Built-in image optimization
- **TypeScript**: First-class TypeScript support
- **Deployment**: Easy deployment to Vercel, Netlify

### Required npm Packages

```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.3",
    
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.17.19",
    
    "@mantine/core": "^7.5.0",
    "@mantine/hooks": "^7.5.0",
    "@mantine/notifications": "^7.5.0",
    
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    
    "react-markdown": "^9.0.1",
    "remark-gfm": "^4.0.0",
    "rehype-katex": "^7.0.0",
    "rehype-highlight": "^7.0.0",
    "react-syntax-highlighter": "^15.5.0",
    
    "axios": "^1.6.5",
    "zod": "^3.22.4",
    "react-hook-form": "^7.49.3",
    "@hookform/resolvers": "^3.3.4",
    
    "i18next": "^23.7.16",
    "react-i18next": "^14.0.1",
    "i18next-browser-languagedetector": "^7.2.0",
    
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "react-virtuoso": "^4.6.2"
  },
  "devDependencies": {
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.1.0",
    "prettier": "^3.2.4"
  }
}
```

### Next.js Configuration

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  images: {
    domains: ['cdn.chatbox.app'],
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
  },

  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

---

## Desktop Packaging: Tauri (Recommended)

### Why Tauri over Electron?

- **Smaller Bundle Size**: ~600KB vs ~50MB (Electron)
- **Better Performance**: Uses system webview
- **Lower Memory Usage**: ~50% less than Electron
- **Rust Backend**: Secure, fast
- **Modern**: Built for modern web frameworks

### Tauri Setup

```bash
# Install Tauri CLI
npm install --save-dev @tauri-apps/cli

# Initialize Tauri
npm run tauri init
```

### Tauri Configuration

```json
// src-tauri/tauri.conf.json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:3000",
    "distDir": "../out"
  },
  "package": {
    "productName": "Chatbox",
    "version": "2.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "all": true,
        "scope": ["$APPDATA/*"]
      },
      "dialog": {
        "all": true
      },
      "clipboard": {
        "all": true
      }
    },
    "windows": [
      {
        "title": "Chatbox",
        "width": 1200,
        "height": 800,
        "resizable": true,
        "fullscreen": false
      }
    ]
  }
}
```

---

## Mobile Packaging: Capacitor

### Why Capacitor?

- **Web-First**: Built for web apps
- **Native APIs**: Access to native features
- **Cross-Platform**: iOS and Android
- **Plugin Ecosystem**: Rich plugin ecosystem

### Capacitor Setup

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor
npx cap init

# Add platforms
npx cap add ios
npx cap add android
```

### Capacitor Configuration

```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chatbox.app',
  appName: 'Chatbox',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff"
    }
  }
};

export default config;
```

---

## Deployment

### Backend Deployment Options

#### Option 1: Docker + Cloud Provider

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Deploy to**:
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform

#### Option 2: Platform-as-a-Service

- **Railway**: Easy deployment, auto-scaling
- **Render**: Free tier, auto-deploy from Git
- **Fly.io**: Global edge deployment
- **Heroku**: Classic PaaS (more expensive)

### Frontend Deployment Options

#### Option 1: Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

#### Option 3: Self-Hosted

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --production

CMD ["npm", "start"]
```

### Database Deployment

#### Managed PostgreSQL

- **Supabase**: Free tier, includes auth, storage
- **Neon**: Serverless PostgreSQL
- **AWS RDS**: Managed PostgreSQL
- **DigitalOcean Managed Databases**
- **Google Cloud SQL**

#### Self-Hosted

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: chatbox
      POSTGRES_USER: chatbox
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"

volumes:
  postgres_data:
  minio_data:
```

---

## Migration from Current App

### Data Export from Current App

```typescript
// Export script for current Electron app
import { getAllSessions } from './storage'
import fs from 'fs'

async function exportData() {
  const sessions = await getAllSessions()
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    sessions: sessions,
  }

  fs.writeFileSync(
    'chatbox-export.json',
    JSON.stringify(exportData, null, 2)
  )
}

exportData()
```

### Data Import to New App

```python
# Import script for new FastAPI app
import json
from app.database import SessionLocal
from app.models import User, Session, Message
from app.services.session_service import create_session
from app.services.message_service import create_message

def import_data(user_id: str, export_file: str):
    db = SessionLocal()

    with open(export_file, 'r') as f:
        data = json.load(f)

    for session_data in data['sessions']:
        # Create session
        session = create_session(
            db=db,
            user_id=user_id,
            name=session_data['name'],
            type=session_data['type']
        )

        # Create messages
        for msg_data in session_data.get('messages', []):
            create_message(
                db=db,
                session_id=session.id,
                role=msg_data['role'],
                content_parts=msg_data['contentParts']
            )

    db.close()

if __name__ == '__main__':
    import_data(user_id='user-uuid', export_file='chatbox-export.json')
```

---

## Development Workflow

### Local Development Setup

1. **Start Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Start Services** (Docker Compose)
   ```bash
   docker-compose up -d
   ```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and push Docker image
        run: |
          docker build -t chatbox-backend ./backend
          docker push chatbox-backend

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## Performance Optimization

### Backend

- Use async/await for I/O operations
- Implement caching with Redis
- Use connection pooling for database
- Optimize database queries (indexes, EXPLAIN)
- Use background tasks (Celery) for heavy operations

### Frontend

- Use Server Components where possible
- Implement code splitting
- Optimize images (Next.js Image component)
- Use virtual scrolling for long lists
- Implement lazy loading
- Minimize bundle size

---

## Security Considerations

### Backend

- Use HTTPS in production
- Implement rate limiting
- Validate all inputs (Pydantic)
- Encrypt sensitive data (API keys)
- Use parameterized queries (SQLAlchemy)
- Implement CORS properly
- Use secure password hashing (bcrypt)

### Frontend

- Sanitize user inputs
- Implement CSP headers
- Use HTTPS only
- Store tokens securely (httpOnly cookies)
- Implement CSRF protection
- Validate API responses


