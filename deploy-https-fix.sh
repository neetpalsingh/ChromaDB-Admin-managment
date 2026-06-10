#!/bin/bash

# Deploy HTTPS Fix for ChromaDB Dashboard
# This script updates the application to use HTTPS for ChromaDB connections

echo "🔧 Deploying HTTPS fix for ChromaDB Dashboard..."

# Stop existing services
echo "⏹️  Stopping existing services..."
pm2 stop chromadb-dashboard 2>/dev/null || true
pm2 stop chromadb-tenant-server 2>/dev/null || true

# Install dependencies (if needed)
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🏗️  Building application..."
npm run build

# Start services
echo "🚀 Starting services..."
pm2 start server/productionServer.js --name chromadb-dashboard
pm2 start server/tenantDataServer.cjs --name chromadb-tenant-server

# Save PM2 configuration
pm2 save

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your application should now be accessible at:"
echo "   https://chromadb-admin.ascentbusiness.com"
echo ""
echo "🔍 To check status:"
echo "   pm2 status"
echo "   pm2 logs chromadb-dashboard"
echo ""
echo "🔧 If you're using systemd instead of PM2:"
echo "   sudo systemctl restart chromadb-dashboard"
echo "   sudo systemctl status chromadb-dashboard"
