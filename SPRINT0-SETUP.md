# Sprint 0: Setup & Infrastructure - Completion Guide

This document provides instructions for verifying and completing Sprint 0 setup.

## ✅ Completed Tasks

### 1. Backend Setup
- ✅ FastAPI project structure with Clean Architecture
- ✅ PostgreSQL 14+ with pgvector extension
- ✅ Redis for caching and rate limiting
- ✅ S3/MinIO for file storage
- ✅ Docker Compose configuration
- ✅ Environment configuration (.env.example)
- ✅ Alembic for database migrations
- ✅ Backend Dockerfile

### 2. Frontend Setup
- ✅ Next.js 14+ with App Router
- ✅ TypeScript with strict mode
- ✅ Tailwind CSS + Mantine UI v7
- ✅ ESLint and Prettier configuration
- ✅ React Query for data fetching
- ✅ Zustand for state management
- ✅ API client with axios
- ✅ Frontend Dockerfile

### 3. DevOps Setup
- ✅ GitHub Actions CI/CD for backend
- ✅ GitHub Actions CI/CD for frontend
- ✅ Docker Compose integration tests
- ✅ Alembic migrations configured
- ✅ Development setup scripts (Bash + PowerShell)

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

**Linux/macOS:**
```bash
chmod +x scripts/setup-dev.sh
./scripts/setup-dev.sh
```

**Windows PowerShell:**
```powershell
.\scripts\setup-dev.ps1
```

### Option 2: Manual Setup

#### Step 1: Start Docker Services
```bash
docker-compose up -d postgres redis minio
```

#### Step 2: Setup Backend
```bash
# Create environment file
cp backend/.env.example backend/.env

# Edit backend/.env and add your configuration
# Required: SECRET_KEY, JWT_SECRET_KEY

# Create virtual environment
cd backend
python -m venv venv

# Activate virtual environment
# Linux/macOS:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload
```

Backend will be available at: http://localhost:8000
API docs at: http://localhost:8000/api/docs

#### Step 3: Setup Frontend
```bash
# Create environment file
cp frontend/.env.local.example frontend/.env.local

# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:3000

## 🧪 Testing Criteria

Run the automated test script:

**Linux/macOS:**
```bash
chmod +x scripts/test-setup.sh
./scripts/test-setup.sh
```

### Manual Verification Checklist

- [ ] **Docker Services Running**
  ```bash
  docker-compose ps
  # All services should show "Up" and "healthy"
  ```

- [ ] **PostgreSQL with pgvector**
  ```bash
  docker-compose exec postgres psql -U inbot -d inbot -c "SELECT * FROM pg_extension WHERE extname IN ('vector', 'uuid-ossp');"
  # Should show both extensions
  ```

- [ ] **Redis Working**
  ```bash
  docker-compose exec redis redis-cli ping
  # Should return "PONG"
  ```

- [ ] **MinIO Working**
  ```bash
  curl http://localhost:9000/minio/health/live
  # Should return success
  # MinIO Console: http://localhost:9001 (minioadmin/minioadmin)
  ```

- [ ] **Backend Server Running**
  ```bash
  curl http://localhost:8000/health
  # Should return: {"status":"healthy","service":"InBot","version":"1.0.0"}
  ```

- [ ] **Database Migrations Execute**
  ```bash
  cd backend
  alembic upgrade head
  # Should complete without errors
  ```

- [ ] **Frontend Dev Server Running**
  - Open http://localhost:3000
  - Should see "Welcome to InBot" page
  - No console errors

## 📁 Project Structure

```
inbot/
├── backend/
│   ├── app/
│   │   ├── api/          # API layer (thin controllers)
│   │   ├── models/       # SQLAlchemy models (Domain)
│   │   ├── schemas/      # Pydantic schemas (DTOs)
│   │   ├── services/     # Business logic (Use Cases)
│   │   ├── ai/           # AI provider integrations
│   │   ├── utils/        # Utility functions
│   │   ├── tasks/        # Celery background tasks
│   │   ├── config.py     # Application configuration
│   │   ├── database.py   # Database configuration
│   │   └── main.py       # FastAPI application
│   ├── alembic/          # Database migrations
│   ├── requirements.txt  # Python dependencies
│   ├── .env.example      # Environment template
│   └── Dockerfile        # Backend Docker image
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   ├── components/   # Shared UI components
│   │   ├── features/     # Feature-first organization
│   │   ├── lib/          # API clients, utils
│   │   └── types/        # TypeScript types
│   ├── package.json      # Node.js dependencies
│   ├── tsconfig.json     # TypeScript configuration
│   ├── next.config.js    # Next.js configuration
│   └── Dockerfile        # Frontend Docker image
├── .github/
│   └── workflows/        # CI/CD pipelines
├── scripts/              # Development scripts
├── docker-compose.yml    # Docker services
└── README.md             # Project documentation
```

## 🔧 Common Issues

### Issue: Docker services won't start
**Solution:** Ensure Docker Desktop is running and ports 5432, 6379, 9000, 9001 are not in use.

### Issue: Backend won't start - "SECRET_KEY not set"
**Solution:** Copy `.env.example` to `.env` and set required values:
```bash
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
```

### Issue: Alembic migrations fail
**Solution:** Ensure PostgreSQL is running and DATABASE_URL in `.env` is correct.

### Issue: Frontend build errors
**Solution:** Delete `node_modules` and `.next`, then run `npm install` again.

## 📊 Sprint 0 Deliverables

All deliverables have been completed:

1. ✅ Backend project structure following Clean Architecture
2. ✅ Frontend project with Next.js 14+ and TypeScript
3. ✅ Docker Compose with PostgreSQL (pgvector), Redis, MinIO
4. ✅ Database migrations with Alembic
5. ✅ CI/CD pipelines for backend and frontend
6. ✅ Development setup scripts
7. ✅ Environment configuration templates
8. ✅ Docker images for backend and frontend

## 🎯 Next Steps

After verifying all testing criteria pass:

1. Mark Sprint 0 as complete
2. Begin Sprint 1: Authentication & Core Backend
3. Implement user authentication system
4. Create core session management API
5. Set up JWT token system

## 📚 Additional Resources

- [Architecture Overview](documentation/01-architecture-overview.md)
- [API Specifications](documentation/04-api-specifications.md)
- [Frontend Architecture](documentation/05-frontend-architecture.md)
- [Sprint Plan](documentation/06-sprint-plan.md)

