#!/bin/bash

echo "========================================"
echo " HELENSVALE CONNECT - STARTUP SCRIPT"
echo "========================================"
echo

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

echo "[1/4] Starting MongoDB service..."
if command_exists mongod; then
    if ! port_in_use 27017; then
        mongod --dbpath ./data/db --logpath ./data/log/mongod.log --fork
        sleep 3
        echo "MongoDB started successfully"
    else
        echo "MongoDB is already running on port 27017"
    fi
else
    echo "MongoDB not found. Please install MongoDB first."
    exit 1
fi

echo "[2/4] Starting Backend Server..."
cd backend
if [ -f "package.json" ]; then
    npm install --silent
    npm start &
    BACKEND_PID=$!
    echo "Backend server started with PID: $BACKEND_PID"
    sleep 5
else
    echo "Backend package.json not found!"
    exit 1
fi

echo "[3/4] Starting Frontend Development Server..."
cd ../frontend
if [ -f "package.json" ]; then
    npm install --silent
    npm start &
    FRONTEND_PID=$!
    echo "Frontend server started with PID: $FRONTEND_PID"
    sleep 3
else
    echo "Frontend package.json not found!"
    exit 1
fi

echo "[4/4] Services are starting up..."
sleep 10

echo
echo "========================================"
echo " ALL SERVICES STARTED SUCCESSFULLY!"
echo "========================================"
echo
echo "Backend API: http://localhost:3001"
echo "Frontend App: http://localhost:3000"
echo "MongoDB: mongodb://localhost:27017"
echo
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo
echo "To stop all services, run: ./stop-all.sh"
echo "Or kill processes manually with: kill $BACKEND_PID $FRONTEND_PID"
echo

# Open browser (works on macOS and Linux)
if command_exists open; then
    open http://localhost:3000
elif command_exists xdg-open; then
    xdg-open http://localhost:3000
fi

# Keep script running
echo "Press Ctrl+C to stop all services..."
trap 'kill $BACKEND_PID $FRONTEND_PID; exit' INT
wait
