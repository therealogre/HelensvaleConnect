@echo off
echo ========================================
echo  HELENSVALE CONNECT - SHUTDOWN SCRIPT
echo ========================================
echo.

echo [1/3] Stopping Frontend Server...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000"') do taskkill /f /pid %%a 2>nul
echo Frontend server stopped.

echo [2/3] Stopping Backend Server...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001"') do taskkill /f /pid %%a 2>nul
echo Backend server stopped.

echo [3/3] Stopping MongoDB service...
net stop MongoDB 2>nul
echo MongoDB service stopped.

echo.
echo ========================================
echo  ALL SERVICES STOPPED SUCCESSFULLY!
echo ========================================
echo.
pause
