#!/bin/bash
# Test script to verify Sprint 0 setup is complete

set -e

echo "🧪 Testing InBot Sprint 0 Setup..."
echo ""

# Test 1: Check if Docker Compose services are running
echo "1️⃣  Testing Docker Compose services..."
if docker-compose ps | grep -q "Up"; then
    echo "   ✅ Docker services are running"
else
    echo "   ❌ Docker services are not running"
    echo "   Run: docker-compose up -d postgres redis minio"
    exit 1
fi

# Test 2: Check PostgreSQL with pgvector
echo "2️⃣  Testing PostgreSQL with pgvector..."
if docker-compose exec -T postgres psql -U inbot -d inbot -c "SELECT * FROM pg_extension WHERE extname = 'vector';" | grep -q "vector"; then
    echo "   ✅ PostgreSQL with pgvector is working"
else
    echo "   ❌ pgvector extension not found"
    exit 1
fi

# Test 3: Check Redis
echo "3️⃣  Testing Redis..."
if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
    echo "   ✅ Redis is working"
else
    echo "   ❌ Redis is not responding"
    exit 1
fi

# Test 4: Check MinIO
echo "4️⃣  Testing MinIO..."
if curl -f http://localhost:9000/minio/health/live > /dev/null 2>&1; then
    echo "   ✅ MinIO is working"
else
    echo "   ❌ MinIO is not responding"
    exit 1
fi

# Test 5: Check backend structure
echo "5️⃣  Testing backend structure..."
if [ -f "backend/app/main.py" ] && [ -f "backend/requirements.txt" ] && [ -f "backend/alembic.ini" ]; then
    echo "   ✅ Backend structure is correct"
else
    echo "   ❌ Backend structure is incomplete"
    exit 1
fi

# Test 6: Check frontend structure
echo "6️⃣  Testing frontend structure..."
if [ -f "frontend/package.json" ] && [ -f "frontend/tsconfig.json" ] && [ -f "frontend/next.config.js" ]; then
    echo "   ✅ Frontend structure is correct"
else
    echo "   ❌ Frontend structure is incomplete"
    exit 1
fi

# Test 7: Check CI/CD workflows
echo "7️⃣  Testing CI/CD workflows..."
if [ -f ".github/workflows/backend-ci.yml" ] && [ -f ".github/workflows/frontend-ci.yml" ]; then
    echo "   ✅ CI/CD workflows are configured"
else
    echo "   ❌ CI/CD workflows are missing"
    exit 1
fi

echo ""
echo "✅ All Sprint 0 setup tests passed!"
echo ""
echo "📋 Manual verification steps:"
echo "   1. Start backend: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "   2. Check backend health: curl http://localhost:8000/health"
echo "   3. Start frontend: cd frontend && npm run dev"
echo "   4. Check frontend: open http://localhost:3000"
echo "   5. Run Alembic migrations: cd backend && alembic upgrade head"
echo ""

