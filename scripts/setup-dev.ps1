# Development environment setup script for InBot (Windows PowerShell)

Write-Host "🚀 Setting up InBot development environment..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Create environment files if they don't exist
if (-not (Test-Path "backend\.env")) {
    Write-Host "📝 Creating backend\.env from .env.example..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "⚠️  Please update backend\.env with your actual values" -ForegroundColor Yellow
}

if (-not (Test-Path "frontend\.env.local")) {
    Write-Host "📝 Creating frontend\.env.local from .env.local.example..." -ForegroundColor Yellow
    Copy-Item "frontend\.env.local.example" "frontend\.env.local"
}

# Start Docker services
Write-Host "🐳 Starting Docker services (PostgreSQL, Redis, MinIO)..." -ForegroundColor Cyan
docker-compose up -d postgres redis minio

# Wait for PostgreSQL to be ready
Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
$timeout = 60
$elapsed = 0
while ($elapsed -lt $timeout) {
    try {
        docker-compose exec -T postgres pg_isready -U inbot 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) { break }
    } catch {}
    Start-Sleep -Seconds 2
    $elapsed += 2
}

Write-Host "✅ PostgreSQL is ready" -ForegroundColor Green

# Wait for Redis to be ready
Write-Host "⏳ Waiting for Redis to be ready..." -ForegroundColor Yellow
$timeout = 30
$elapsed = 0
while ($elapsed -lt $timeout) {
    try {
        docker-compose exec -T redis redis-cli ping 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) { break }
    } catch {}
    Start-Sleep -Seconds 2
    $elapsed += 2
}

Write-Host "✅ Redis is ready" -ForegroundColor Green

# Wait for MinIO to be ready
Write-Host "⏳ Waiting for MinIO to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "✅ MinIO is ready" -ForegroundColor Green

# Setup backend
Write-Host "🐍 Setting up backend..." -ForegroundColor Cyan
Set-Location backend

if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

Write-Host "Activating virtual environment and installing dependencies..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt

Write-Host "Running database migrations..." -ForegroundColor Yellow
alembic upgrade head

Set-Location ..

# Setup frontend
Write-Host "⚛️  Setting up frontend..." -ForegroundColor Cyan
Set-Location frontend

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
    npm install
}

Set-Location ..

Write-Host ""
Write-Host "✅ Development environment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Update backend\.env with your API keys and configuration"
Write-Host "   2. Start the backend: cd backend; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload"
Write-Host "   3. Start the frontend: cd frontend; npm run dev"
Write-Host "   4. Access the application at http://localhost:3000"
Write-Host ""
Write-Host "🔗 Services:" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:3000"
Write-Host "   - Backend API: http://localhost:8000"
Write-Host "   - API Docs: http://localhost:8000/api/docs"
Write-Host "   - MinIO Console: http://localhost:9001 (minioadmin/minioadmin)"
Write-Host ""

