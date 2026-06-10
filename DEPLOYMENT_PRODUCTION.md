# Production Deployment Guide

## CORS Issue Fix

The CORS issue has been resolved with the following changes:

### 1. Fixed TypeScript Import Error
- Created `src/main.tsx` file to resolve the import error
- This file serves as an alternative entry point for Vite builds

### 2. Updated Proxy Configuration
- Enhanced `setupProxy.js` with proper CORS headers
- Updated `vite.config.js` with CORS support and better proxy configuration
- Created production server with Express that handles CORS properly

### 3. Production Server Setup
- Created `server/productionServer.js` that:
  - Serves the React build files
  - Proxies API requests to ChromaDB with proper CORS headers
  - Handles React routing for SPA
  - Adds necessary CORS headers to all responses

## Deployment Steps for EC2

### 1. Build the Application
```bash
npm run build
```

### 2. Deploy to EC2
Upload the following files to your EC2 server:
- `build/` directory (entire React build)
- `server/productionServer.js`
- `package.json`
- `package-lock.json`

### 3. Install Dependencies on EC2
```bash
npm install --production
# Or install only the required packages:
npm install express cors http-proxy-middleware
```

### 4. Run Production Server
```bash
# Option 1: Direct run
npm run serve:production

# Option 2: Using PM2 (recommended for production)
npm install -g pm2
pm2 start server/productionServer.js --name "chromadb-dashboard"
pm2 startup
pm2 save
```

### 5. Configure Nginx (if using reverse proxy)
```nginx
server {
    listen 80;
    server_name chromadb-admin.ascentbusiness.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    }
}
```

## Testing the Fix

### Local Testing
1. Build: `npm run build`
2. Serve: `npm run serve:production`
3. Visit: `http://localhost:3002`
4. Check browser console for CORS errors

### Production Testing
1. Deploy to EC2
2. Visit: `https://chromadb-admin.ascentbusiness.com`
3. Check that API calls work and data loads properly

## Key Changes Made

1. **setupProxy.js**: Added CORS headers and proper origin handling
2. **vite.config.js**: Enhanced proxy configuration with CORS support
3. **productionServer.js**: New Express server with CORS and proxy handling
4. **main.tsx**: Created to resolve TypeScript import errors
5. **package.json**: Added production server scripts

## Environment Variables (Optional)
You can set these on your EC2 server:
```bash
export PORT=3002
export NODE_ENV=production
export CHROMA_API_URL=https://croma-db.ascentbusiness.com
```

## Troubleshooting

### If CORS errors persist:
1. Check that the production server is running on port 3002
2. Verify that the proxy is correctly forwarding to `https://croma-db.ascentbusiness.com`
3. Check browser network tab for failed requests
4. Ensure your ChromaDB server allows requests from your domain

### If API calls fail:
1. Check the server logs: `pm2 logs chromadb-dashboard`
2. Verify ChromaDB server is accessible from EC2
3. Test direct API calls: `curl https://croma-db.ascentbusiness.com/api/v1/heartbeat`
