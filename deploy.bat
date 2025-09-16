@echo off
echo ========================================
echo Helensvale Connect - Docker Deployment
echo ========================================
echo.

REM Check if Docker is running
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running
    echo Please install Docker Desktop and ensure it's running
    pause
    exit /b 1
)

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Compose is not available
    echo Please ensure Docker Desktop includes Docker Compose
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo ERROR: .env file not found
    echo Please create .env file with required environment variables
    echo You can copy from .env.production and update the values
    pause
    exit /b 1
)

echo [1/6] Stopping existing containers...
docker-compose down

echo [2/6] Removing old images...
docker image prune -f

echo [3/6] Building containers...
docker-compose build --no-cache

echo [4/6] Starting services...
docker-compose up -d

echo [5/6] Waiting for services to start...
timeout /t 30 /nobreak >nul

echo [6/6] Checking deployment status...
docker-compose ps

echo.
echo ========================================
echo Deployment Status Check
echo ========================================

REM Check if containers are running
for /f "tokens=*" %%i in ('docker-compose ps -q') do (
    if "%%i"=="" (
        echo ERROR: No containers are running
        goto :error
    )
)

echo ✓ Containers are running

REM Check application health
echo Checking application health...
curl -f http://localhost/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Application is healthy
) else (
    echo ⚠ Application health check failed
    echo Checking logs...
    docker-compose logs --tail=20 app
)

REM Check database connection
echo Checking database connection...
docker-compose exec -T mongodb mongosh --quiet --eval "db.adminCommand('ping')" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Database is connected
) else (
    echo ⚠ Database connection failed
)

REM Check Redis connection
echo Checking Redis connection...
docker-compose exec -T redis redis-cli ping >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Redis is connected
) else (
    echo ⚠ Redis connection failed
)

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Application URLs:
echo - Frontend: http://localhost
echo - API: http://localhost/api
echo - Health Check: http://localhost/health
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
echo.
goto :end

:error
echo.
echo ========================================
echo Deployment Failed!
echo ========================================
echo.
echo Checking logs for errors...
docker-compose logs --tail=50
echo.
echo To troubleshoot:
echo 1. Check .env file configuration
echo 2. Ensure ports 80, 27017, 6379 are available
echo 3. Check Docker Desktop is running
echo 4. Review logs above for specific errors
echo.

:end
pause
