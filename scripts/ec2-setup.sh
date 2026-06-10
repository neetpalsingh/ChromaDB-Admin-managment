#!/bin/bash

# ChromaDB Dashboard EC2 Setup Script
# Run this script on your EC2 instance to set up the application from scratch

set -e  # Exit on any error

echo "🚀 Starting ChromaDB Dashboard EC2 setup..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the api-ui directory."
    exit 1
fi

# Step 1: Clean up existing files
echo "🧹 Cleaning up existing files..."
rm -rf node_modules
rm -rf build
rm -rf dist
rm -rf .next
rm -rf out

# Clean npm cache
echo "🧹 Cleaning npm cache..."
npm cache clean --force

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 3: Build the application
echo "🔨 Building React application..."
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo "❌ Error: Build failed. build directory not found."
    exit 1
fi

echo "✅ Build completed successfully!"

# Step 4: Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Step 5: Stop any existing PM2 processes
echo "🛑 Stopping existing PM2 processes..."
pm2 stop chromadb-dashboard 2>/dev/null || true
pm2 delete chromadb-dashboard 2>/dev/null || true

# Step 6: Start the application with PM2
echo "🚀 Starting application with PM2..."
pm2 start server/productionServer.js --name "chromadb-dashboard"

# Step 7: Configure PM2 to start on boot
echo "⚙️ Configuring PM2 startup..."
pm2 startup
pm2 save

# Step 8: Show status
echo "📊 Application status:"
pm2 status

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "📋 Application Details:"
echo "   - Name: chromadb-dashboard"
echo "   - Port: 3002"
echo "   - Status: $(pm2 jlist | jq -r '.[] | select(.name=="chromadb-dashboard") | .pm2_env.status')"
echo ""
echo "🌐 Access your application at:"
echo "   - http://$(curl -s ifconfig.me):3002"
echo "   - https://chromadb-admin.ascentbusiness.com (if DNS configured)"
echo ""
echo "📝 Useful commands:"
echo "   - Check logs: pm2 logs chromadb-dashboard"
echo "   - Restart: pm2 restart chromadb-dashboard"
echo "   - Stop: pm2 stop chromadb-dashboard"
echo "   - Monitor: pm2 monit"
