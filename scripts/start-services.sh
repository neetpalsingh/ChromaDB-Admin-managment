#!/bin/bash

# ChromaDB Dashboard - Service Startup Script
# Usage: ./start-services.sh [start|stop|restart|status]

PROJECT_DIR="$(pwd)"  # Use current directory
LOG_DIR="$PROJECT_DIR/logs"
PID_DIR="$PROJECT_DIR/pids"

# Create directories if they don't exist
mkdir -p "$LOG_DIR" "$PID_DIR"

# Service configurations
VITE_PORT=3002
TENANT_SERVER_PORT=3004
CHROMA_PROXY_PORT=8000  # Your ChromaDB instance port

start_services() {
    echo "Starting ChromaDB Dashboard services..."

    # Start Tenant Data Server
    echo "Starting Tenant Data Server on port $TENANT_SERVER_PORT..."
    cd "$PROJECT_DIR"
    nohup node server/tenantDataServer.cjs > "$LOG_DIR/tenant-server.log" 2>&1 &
    echo $! > "$PID_DIR/tenant-server.pid"
    echo "Tenant Data Server started with PID $(cat $PID_DIR/tenant-server.pid)"

    # Check if dist directory exists (production build)
    if [ -d "dist" ]; then
        echo "Starting Vite Preview Server (Production) on port $VITE_PORT..."
        nohup npm run preview -- --port $VITE_PORT --host 0.0.0.0 > "$LOG_DIR/vite-server.log" 2>&1 &
    else
        echo "No production build found. Starting Vite Dev Server on port $VITE_PORT..."
        nohup npm run dev > "$LOG_DIR/vite-server.log" 2>&1 &
    fi
    echo $! > "$PID_DIR/vite-server.pid"
    echo "Vite Server started with PID $(cat $PID_DIR/vite-server.pid)"

    # Wait a moment for services to start
    sleep 3

    echo "All services started successfully!"
    echo "Dashboard available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):$VITE_PORT"
    echo "Tenant API available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):$TENANT_SERVER_PORT"
}

stop_services() {
    echo "Stopping ChromaDB Dashboard services..."
    
    # Stop Vite Server
    if [ -f "$PID_DIR/vite-server.pid" ]; then
        PID=$(cat "$PID_DIR/vite-server.pid")
        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID"
            echo "Stopped Vite Server (PID: $PID)"
        fi
        rm -f "$PID_DIR/vite-server.pid"
    fi
    
    # Stop Tenant Data Server
    if [ -f "$PID_DIR/tenant-server.pid" ]; then
        PID=$(cat "$PID_DIR/tenant-server.pid")
        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID"
            echo "Stopped Tenant Data Server (PID: $PID)"
        fi
        rm -f "$PID_DIR/tenant-server.pid"
    fi
    
    echo "All services stopped."
}

status_services() {
    echo "ChromaDB Dashboard Service Status:"
    echo "=================================="
    
    # Check Vite Server
    if [ -f "$PID_DIR/vite-server.pid" ]; then
        PID=$(cat "$PID_DIR/vite-server.pid")
        if kill -0 "$PID" 2>/dev/null; then
            echo "✅ Vite Server: Running (PID: $PID)"
        else
            echo "❌ Vite Server: Not running (stale PID file)"
        fi
    else
        echo "❌ Vite Server: Not running"
    fi
    
    # Check Tenant Data Server
    if [ -f "$PID_DIR/tenant-server.pid" ]; then
        PID=$(cat "$PID_DIR/tenant-server.pid")
        if kill -0 "$PID" 2>/dev/null; then
            echo "✅ Tenant Data Server: Running (PID: $PID)"
        else
            echo "❌ Tenant Data Server: Not running (stale PID file)"
        fi
    else
        echo "❌ Tenant Data Server: Not running"
    fi
    
    echo ""
    echo "Recent logs:"
    echo "Vite Server: tail -5 $LOG_DIR/vite-server.log"
    echo "Tenant Server: tail -5 $LOG_DIR/tenant-server.log"
}

case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        sleep 2
        start_services
        ;;
    status)
        status_services
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
