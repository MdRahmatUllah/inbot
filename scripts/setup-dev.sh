#!/bin/bash
# Development environment setup script for InBot

set -e

echo "🚀 Setting up InBot development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create environment files if they don't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env from .env.example..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please update backend/.env with your actual values"
fi

if [ ! -f frontend/.env.local ]; then
    echo "📝 Creating frontend/.env.local from .env.local.example..."
    cp frontend/.env.local.example frontend/.env.local
fi

# Start Docker services
echo "🐳 Starting Docker services (PostgreSQL, Redis, MinIO)..."
docker-compose up -d postgres redis minio

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
timeout 60 bash -c 'until docker-compose exec -T postgres pg_isready -U inbot > /dev/null 2>&1; do sleep 2; done'

echo "✅ PostgreSQL is ready"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
timeout 30 bash -c 'until docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do sleep 2; done'

echo "✅ Redis is ready"

# Wait for MinIO to be ready
echo "⏳ Waiting for MinIO to be ready..."
sleep 5

echo "✅ MinIO is ready"

# Setup backend
echo "🐍 Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment and installing dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "Running database migrations..."
alembic upgrade head

cd ..

# Setup frontend
echo "⚛️  Setting up frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

cd ..

echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Update backend/.env with your API keys and configuration"
echo "   2. Start the backend: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "   3. Start the frontend: cd frontend && npm run dev"
echo "   4. Access the application at http://localhost:3000"
echo ""
echo "🔗 Services:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - API Docs: http://localhost:8000/api/docs"
echo "   - MinIO Console: http://localhost:9001 (minioadmin/minioadmin)"
echo ""

