# Migration Guide - Removing Hardcoded URLs

## What Changed?

All hardcoded URLs have been removed and replaced with environment variables for better configuration management and security.

### Before (Hardcoded)
```typescript
// ❌ Old way - hardcoded
const baseURL = 'https://croma-db.ascentbusiness.com';
```

### After (Environment Variables)
```typescript
// ✅ New way - from environment
const baseURL = import.meta.env.VITE_CHROMADB_URL || 'http://localhost:8000';
```

## Migration Steps

### Step 1: Install dotenv (if needed)

```bash
npm install
```

This will install the `dotenv` package that was added to `package.json`.

### Step 2: Create .env File

Copy the example file:

```bash
cp .env.example .env
```

### Step 3: Configure Your ChromaDB URL

Edit `.env` and replace with your actual ChromaDB server URL:

```env
# Replace with your actual ChromaDB URL
VITE_CHROMADB_URL=https://your-chromadb-server.com
CHROMADB_URL=https://your-chromadb-server.com

# If you have a custom dashboard URL
VITE_APP_URL=https://your-dashboard.com
VITE_ADMIN_URL=https://your-dashboard.com
```

### Step 4: Update CORS Configuration (if needed)

If you're running in production, add your domains to CORS:

```env
CORS_ORIGINS=https://your-dashboard.com,https://another-domain.com
```

### Step 5: Restart Your Server

```bash
# For development
npm run dev

# For production
npm run build:vite
npm run serve:production
```

## Files Modified

The following files have been updated to use environment variables:

1. **Frontend Components:**
   - ✅ `src/App.tsx`
   - ✅ `src/services/apiService.ts`
   - ✅ `src/components/ChromaConnectionPage.tsx`

2. **Server Configuration:**
   - ✅ `server/productionServer.js`
   - ✅ `vite.config.js`
   - ✅ `src/setupProxy.js`

3. **Utilities:**
   - ✅ `debug-api.js`

4. **New Files:**
   - ✅ `.env.example` - Template for environment variables
   - ✅ `src/vite-env.d.ts` - TypeScript definitions for env vars
   - ✅ `ENV_CONFIGURATION.md` - Detailed configuration guide

## Environment Variables Reference

### Required Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_CHROMADB_URL` | ChromaDB URL (frontend) | `http://localhost:8000` |
| `CHROMADB_URL` | ChromaDB URL (backend) | `http://localhost:8000` |

### Optional Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_APP_URL` | `http://localhost:3002` | Dashboard URL |
| `VITE_ADMIN_URL` | `http://localhost:3002` | Admin URL for CORS |
| `PORT` | `3002` | Server port |
| `CORS_ORIGINS` | `http://localhost:3002,...` | Allowed origins |

## Common Migration Issues

### Issue 1: "Cannot connect to ChromaDB"

**Cause:** Environment variables not loaded or incorrect URL.

**Solution:**
1. Check `.env` file exists in `api-ui/` directory
2. Verify `VITE_CHROMADB_URL` and `CHROMADB_URL` are set
3. Restart the development server
4. Clear browser cache

### Issue 2: "CORS Error"

**Cause:** Your dashboard URL is not in the CORS allowed origins.

**Solution:**
Add your dashboard URL to `.env`:
```env
VITE_ADMIN_URL=https://your-dashboard.com
CORS_ORIGINS=https://your-dashboard.com
```

### Issue 3: Environment Variables Not Working

**Cause:** Server needs restart after `.env` changes.

**Solution:**
```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### Issue 4: TypeScript Errors with import.meta.env

**Cause:** Missing TypeScript definitions.

**Solution:**
The file `src/vite-env.d.ts` has been created. If you still see errors:
1. Restart your IDE/TypeScript server
2. Run `npm run build` to verify

## Verification Checklist

After migration, verify:

- [ ] `.env` file created with your URLs
- [ ] Development server starts without errors
- [ ] Can connect to ChromaDB from the dashboard
- [ ] No CORS errors in browser console
- [ ] All pages load correctly
- [ ] API calls work properly

## Rollback (If Needed)

If you need to rollback to hardcoded URLs temporarily:

1. **In `src/App.tsx` (line 95):**
   ```typescript
   const [baseURL, setBaseURL] = useState('YOUR_CHROMADB_URL');
   ```

2. **In `src/services/apiService.ts` (line 29):**
   ```typescript
   private baseURL: string = 'YOUR_CHROMADB_URL';
   ```

3. **In `src/components/ChromaConnectionPage.tsx` (line 26):**
   ```typescript
   connectionString: 'YOUR_CHROMADB_URL',
   ```

**Note:** This is not recommended. Use environment variables for proper configuration management.

## Benefits of This Change

1. ✅ **Security:** No sensitive URLs in source code
2. ✅ **Flexibility:** Easy to switch environments (dev/staging/prod)
3. ✅ **Portability:** Same code works in different environments
4. ✅ **Best Practice:** Industry standard for configuration
5. ✅ **Version Control:** `.env` is excluded, `.env.example` is tracked

## Next Steps

1. **Read:** [ENV_CONFIGURATION.md](./ENV_CONFIGURATION.md) for detailed configuration
2. **Configure:** Set up your `.env` file
3. **Test:** Verify everything works with your ChromaDB instance
4. **Deploy:** Update your deployment configuration with environment variables

## Need Help?

- Check [ENV_CONFIGURATION.md](./ENV_CONFIGURATION.md) for detailed configuration
- Review [README.md](./README.md) for general setup
- Check `.env.example` for all available variables
- Verify ChromaDB is running and accessible

## Summary

All hardcoded URLs have been removed! 🎉

- ✅ No more `https://croma-db.ascentbusiness.com` in code
- ✅ All URLs now come from `.env` file
- ✅ Easy to configure for any environment
- ✅ Better security and flexibility
