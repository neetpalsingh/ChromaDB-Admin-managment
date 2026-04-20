# Environment Configuration Guide

This document explains how to configure the ChromaDB Dashboard using environment variables.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your values:**
   ```bash
   # Minimum required configuration
   VITE_CHROMADB_URL=http://your-chromadb-server:8000
   CHROMADB_URL=http://your-chromadb-server:8000
   ```

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

## Environment Variables

### ChromaDB Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_CHROMADB_URL` | Yes | `http://localhost:8000` | ChromaDB server URL (frontend) |
| `CHROMADB_URL` | Yes | `http://localhost:8000` | ChromaDB server URL (backend proxy) |

> **Note:** Both variables should have the same value. `VITE_*` prefix makes it available to frontend code.

### Application URLs

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_APP_URL` | No | `http://localhost:3434` | Dashboard application URL |
| `VITE_ADMIN_URL` | No | `http://localhost:3434` | Admin URL for CORS headers |

### Server Ports

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3434` | Main application port |
| `VITE_PORT` | No | `3434` | Vite dev server port |
| `TENANT_SERVER_PORT` | No | `3004` | Tenant file server port |

### CORS Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CORS_ORIGINS` | No | `http://localhost:3434,http://localhost:3003` | Comma-separated allowed origins |

### Application Metadata

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment mode |
| `VITE_APP_TITLE` | No | `ChromaDB Dashboard` | Application title |
| `VITE_APP_VERSION` | No | `1.0.0` | Application version |

## Configuration Examples

### Local Development

Create `.env`:
```bash
# ChromaDB running locally
VITE_CHROMADB_URL=http://localhost:8000
CHROMADB_URL=http://localhost:8000

# Application
PORT=3434
NODE_ENV=development
```

### Remote ChromaDB Server

Create `.env`:
```bash
# ChromaDB on remote server
VITE_CHROMADB_URL=https://chromadb.yourcompany.com
CHROMADB_URL=https://chromadb.yourcompany.com

# Application
VITE_APP_URL=http://localhost:3434
VITE_ADMIN_URL=http://localhost:3434
PORT=3434
```

### Production Deployment

Create `.env`:
```bash
# Production ChromaDB
VITE_CHROMADB_URL=https://chromadb.production.com
CHROMADB_URL=https://chromadb.production.com

# Production Application
VITE_APP_URL=https://dashboard.yourcompany.com
VITE_ADMIN_URL=https://dashboard.yourcompany.com

# Production Settings
NODE_ENV=production
PORT=3434
CORS_ORIGINS=https://dashboard.yourcompany.com

# Optional: Authentication
VITE_AUTH_ENABLED=true
VITE_API_KEY=your-secret-api-key
```

## How It Works

### Frontend (React/Vite)

Variables prefixed with `VITE_` are embedded into the frontend bundle at build time:

```typescript
// In your React components
const chromaURL = import.meta.env.VITE_CHROMADB_URL;
```

### Backend (Node.js)

Non-prefixed variables are available in Node.js server code:

```javascript
// In server files
const chromaURL = process.env.CHROMADB_URL;
```

### Files Using Environment Variables

1. **`src/App.tsx`** - Default ChromaDB URL for connection
2. **`src/services/apiService.ts`** - API service base URL
3. **`src/components/ChromaConnectionPage.tsx`** - Connection form default
4. **`server/productionServer.js`** - Production proxy configuration
5. **`vite.config.js`** - Vite dev server proxy
6. **`src/setupProxy.js`** - Development proxy (react-scripts)
7. **`debug-api.js`** - API debugging script

## Important Notes

### Security

1. **Never commit `.env` files to version control**
   - `.env` is in `.gitignore`
   - Only commit `.env.example`

2. **Sensitive Data**
   - Keep API keys and tokens in `.env`
   - Don't expose them in frontend code
   - Use `VITE_` prefix only for non-sensitive configuration

### Vite Environment Variables

- Only `VITE_*` prefixed variables are exposed to client code
- Other variables are server-side only
- Changes require server restart

### Production Deployment

When deploying to production:

1. Set environment variables on your hosting platform
2. Or create `.env.production` file
3. Ensure ChromaDB URL is accessible from your server
4. Update CORS origins to match your domain

## Troubleshooting

### "Cannot connect to ChromaDB"

1. Check `VITE_CHROMADB_URL` and `CHROMADB_URL` are set correctly
2. Verify ChromaDB server is running
3. Check firewall/network settings
4. Ensure URLs don't have trailing slashes

### "CORS Error"

1. Add your dashboard URL to `CORS_ORIGINS`
2. Check `VITE_ADMIN_URL` matches your dashboard URL
3. Verify ChromaDB server allows your origin

### Environment Variables Not Working

1. Restart the development server after changing `.env`
2. Clear browser cache
3. Rebuild the application: `npm run build`
4. Check variable names (case-sensitive)

## Migration from Hardcoded Values

If you're upgrading from a version with hardcoded URLs:

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Replace old hardcoded values with your actual URLs in `.env`**

3. **All hardcoded URLs have been removed from:**
   - ✅ `src/App.tsx`
   - ✅ `src/services/apiService.ts`
   - ✅ `src/components/ChromaConnectionPage.tsx`
   - ✅ `server/productionServer.js`
   - ✅ `vite.config.js`
   - ✅ `src/setupProxy.js`
   - ✅ `debug-api.js`

4. **Install dotenv dependency (if not already installed):**
   ```bash
   npm install
   ```

## Support

For more information:
- See `.env.example` for all available variables
- Check `README.md` for general setup instructions
- Review individual component files for usage examples
