#!/bin/bash

# Advanced Trading Dashboard Startup Script
# This script starts both the frontend React app and backend Express server

echo "🚀 Starting Advanced Trading Dashboard..."
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Function to check if dependencies are installed
check_dependencies() {
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    
    if [ ! -d "backend/node_modules" ]; then
        echo "📦 Installing backend dependencies..."
        cd backend
        npm install
        cd ..
    fi
}

# Function to start backend server
start_backend() {
    echo "🔧 Starting backend server on port 3001..."
    cd backend
    npm start &
    BACKEND_PID=$!
    cd ..
    echo "✅ Backend server started (PID: $BACKEND_PID)"
}

# Function to start frontend
start_frontend() {
    echo "⚡ Starting frontend React app on port 3000..."
    npm start &
    FRONTEND_PID=$!
    echo "✅ Frontend app started (PID: $FRONTEND_PID)"
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend server stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend app stopped"
    fi
    echo "👋 Thank you for using the Trading Dashboard!"
    exit 0
}

# Trap ctrl+c and cleanup
trap cleanup SIGINT SIGTERM

# Main execution
echo "📋 Checking dependencies..."
check_dependencies

echo ""
echo "🚀 Starting services..."
start_backend
sleep 3  # Give backend time to start
start_frontend

echo ""
echo "=================================================="
echo "🎉 Trading Dashboard is now running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   Health:   http://localhost:3001/api/health"
echo "=================================================="
echo "💡 Press Ctrl+C to stop all services"
echo ""

# Wait for processes to finish
wait