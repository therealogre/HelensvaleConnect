@echo off
echo ========================================
echo  HELENSVALE CONNECT - STARTUP SCRIPT
echo ========================================
echo.

echo [1/4] Starting MongoDB service...
net start MongoDB
if %errorlevel% neq 0 (
    echo MongoDB service failed to start. Attempting manual start...
    "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db" --logpath "C:\data\log\mongod.log" --service
)
timeout /t 3 /nobreak > nul

echo [2/4] Starting Backend Server...
cd /d "%~dp0backend"
start "HelensvaleConnect Backend" cmd /k "npm start"
timeout /t 5 /nobreak > nul

echo [3/4] Starting Frontend Development Server...
cd /d "%~dp0frontend"
start "HelensvaleConnect Frontend" cmd /k "npm start"
timeout /t 3 /nobreak > nul

echo [4/4] Opening application in browser...
timeout /t 10 /nobreak > nul
start http://localhost:3000

echo.
echo ========================================
echo  ALL SERVICES STARTED SUCCESSFULLY!
echo ========================================
echo.
echo Backend API: http://localhost:3001
echo Frontend App: http://localhost:3000
echo MongoDB: mongodb://localhost:27017
echo.
echo Press any key to exit...
pause > nul
