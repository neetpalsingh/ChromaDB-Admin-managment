#!/bin/bash

# ChromaDB Dashboard Deployment Script
# This script builds the React app and prepares it for production deployment

set -e  # Exit on any error

echo "🚀 Starting ChromaDB Dashboard deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the api-ui directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the React application
echo "🔨 Building React application..."
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo "❌ Error: Build failed. build directory not found."
    exit 1
fi

echo "✅ Build completed successfully!"

# Create deployment package
echo "📦 Creating deployment package..."
DEPLOY_DIR="deploy-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEPLOY_DIR"

# Copy necessary files
cp -r build "$DEPLOY_DIR/"
cp -r server "$DEPLOY_DIR/"
cp package.json "$DEPLOY_DIR/"
cp package-lock.json "$DEPLOY_DIR/"

# Create a simple start script for production
cat > "$DEPLOY_DIR/start.sh" << 'EOF'
#!/bin/bash
echo "Installing production dependencies..."
npm install --production

echo "Starting ChromaDB Dashboard..."
node server/productionServer.js
EOF

chmod +x "$DEPLOY_DIR/start.sh"

# Create PM2 ecosystem file
cat > "$DEPLOY_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [{
    name: 'chromadb-dashboard',
    script: 'server/productionServer.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    }
  }]
};
EOF

echo "✅ Deployment package created: $DEPLOY_DIR"
echo ""
echo "📋 Next steps:"
echo "1. Upload the '$DEPLOY_DIR' directory to your EC2 server"
echo "2. On EC2, run: cd $DEPLOY_DIR && ./start.sh"
echo "3. Or use PM2: cd $DEPLOY_DIR && pm2 start ecosystem.config.js"
echo ""
echo "🌐 Your app will be available at: https://chromadb-admin.ascentbusiness.com"
