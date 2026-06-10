#!/bin/bash

# ChromaDB Dashboard Production Startup Script
# This script starts the application with nohup and logging

set -e

echo "🚀 Starting ChromaDB Dashboard in production mode..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the api-ui directory."
    exit 1
fi

# Check if already running
if pgrep -f "server/productionServer.js" > /dev/null; then
    echo "⚠️  Application is already running. Stopping existing process..."
    pkill -f "server/productionServer.js" || true
    sleep 2
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the application with nohup
echo "🔄 Starting application with nohup..."
nohup npm run serve:production > logs/react-dev.log 2>&1 &

# Get the process ID
PID=$!
echo "✅ Application started successfully!"
echo "📊 Process ID: $PID"
echo "📝 Log file: logs/react-dev.log"

# Wait a moment and check if process is still running
sleep 3
if ps -p $PID > /dev/null; then
    echo "✅ Application is running in background"
    echo "🌐 Access at: http://$(curl -s ifconfig.me 2>/dev/null || echo 'your-server-ip'):3002"
else
    echo "❌ Application failed to start. Check logs:"
    tail -20 logs/react-dev.log
    exit 1
fi

echo ""
echo "📋 Useful commands:"
echo "   - View logs: tail -f logs/react-dev.log"
echo "   - Check status: ps aux | grep 'server/productionServer.js'"
echo "   - Stop application: pkill -f 'server/productionServer.js'"
echo "   - Restart: ./scripts/start-production.sh"
