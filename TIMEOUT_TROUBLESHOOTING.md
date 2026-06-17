# ⏱️ Timeout Troubleshooting Guide

## Problem: 408 Request Timeout

If you're seeing **408 Request Timeout** errors when fetching large collections, this guide will help you resolve it.

---

## Understanding the Issue

The 408 timeout can occur at different levels:

1. **Frontend (Browser)** - Axios timeout (default: 5 minutes) ✅ **Already optimized**
2. **Proxy Server (NPM/Python)** - Server timeout (default: 5 minutes) ✅ **Already optimized**
3. **ChromaDB Server** - Internal timeout ❌ **This is likely your issue**

---

## Version 1.0.6 Improvements

### ✅ What We Fixed

1. **Frontend Timeout**: Increased from 30s to 300s (5 minutes)
   - File: `src/services/apiService.ts`
   - Setting: `timeout: 300000`

2. **Python Proxy Timeout**: Increased to 5 minutes with granular control
   - File: `python-package/src/chromadb_admin/server.py`
   - Settings:
     - Connect: 10 seconds
     - Read: 300 seconds (5 minutes)
     - Write: 60 seconds
     - Pool: 10 seconds

3. **NPM Proxy Timeout**: Already set to 5 minutes
   - File: `server/productionServer.js`
   - Setting: `timeout: 300000`

4. **Better Error Messages**: Now shows helpful message when timeout occurs

---

## Solutions

### Solution 1: Increase ChromaDB Server Timeout (Recommended)

Your ChromaDB server needs to be configured to handle long-running queries.

#### If using Docker:

```yaml
version: '3.8'
services:
  chromadb:
    image: chromadb/chroma:latest
    environment:
      # Increase server timeout to 5 minutes
      - CHROMA_SERVER_HTTP_REQUEST_TIMEOUT=300
      - CHROMA_SERVER_CORS_ALLOW_ORIGINS=["*"]
    ports:
      - "8000:8000"
    volumes:
      - chromadb-data:/chroma/chroma

volumes:
  chromadb-data:
```

#### If using Python:

```python
import chromadb
from chromadb.config import Settings

client = chromadb.HttpClient(
    host="localhost",
    port=8000,
    settings=Settings(
        chroma_server_http_request_timeout=300  # 5 minutes
    )
)
```

#### If using chromadb command:

```bash
# Set environment variable
export CHROMA_SERVER_HTTP_REQUEST_TIMEOUT=300

# Then start ChromaDB
chroma run --path /path/to/db
```

---

### Solution 2: Use Pagination for Large Collections

Instead of fetching all records at once, use pagination:

```javascript
// Bad: Fetch all records (can timeout)
const request = {
  ids: null,  // Gets ALL records
  include: ["documents", "metadatas", "embeddings"]
};

// Good: Use limit and offset for pagination
const request = {
  limit: 100,     // Fetch 100 records at a time
  offset: 0,      // Start from beginning
  include: ["documents", "metadatas"]  // Don't fetch embeddings if not needed
};
```

**In the UI:**
1. Go to Data Operations
2. Click "Get Records"
3. Set a **Limit** (e.g., 100)
4. Use **Offset** to paginate through results

---

### Solution 3: Use Query Instead of Get

For large collections, use `query` instead of `get`:

```javascript
// Query is faster and supports n_results for pagination
const request = {
  query_texts: [""],  // Empty query to match all
  n_results: 100,     // Limit results
  include: ["documents", "metadatas"]
};
```

**In the UI:**
1. Go to Data Operations
2. Use "Query Records" instead of "Get Records"
3. Set `n_results` to a reasonable number (100-1000)

---

### Solution 4: Exclude Embeddings

Embeddings are large vectors that take time to transfer:

```javascript
const request = {
  limit: 100,
  include: ["documents", "metadatas"]  // Skip "embeddings"
};
```

**In the UI:**
1. In Get/Query dialogs
2. Uncheck "Embeddings" in the Include section
3. This can speed up requests by 10-100x

---

## Checking Which Timeout is Failing

### Check Server Logs

#### NPM Server:
```
🔄 Proxying request: POST /api/v2/.../get to https://...
✅ Proxy response: 408 ...
```
If you see `✅ Proxy response: 408`, the proxy successfully forwarded the request, but **ChromaDB returned 408**.

#### Python Server:
```
❌ Timeout error to http://...: ...
```
If you see this, the proxy itself timed out waiting for ChromaDB.

### Check Browser Console:
```
Error getting records: Request timeout. The collection is too large...
```
This means the timeout happened and our error handler caught it.

---

## Performance Tips

1. **Start Small**: Test with `limit: 10` first
2. **Increase Gradually**: If 10 works, try 100, then 1000
3. **Monitor Size**: Check collection count before fetching
4. **Use Filters**: Use `where` clauses to filter data server-side
5. **Skip Embeddings**: Only fetch embeddings when you need them

---

## Still Having Issues?

1. **Check ChromaDB logs** for timeout settings
2. **Test directly** with ChromaDB API (bypass admin panel)
3. **Check network** - slow networks can cause timeouts
4. **Check ChromaDB version** - newer versions may have better performance
5. **Open an issue** on GitHub with:
   - Collection size (number of records)
   - ChromaDB version
   - Request that's timing out
   - Server logs

---

## Quick Reference

| Component | Timeout | File |
|-----------|---------|------|
| Frontend | 300s | `src/services/apiService.ts` |
| Python Proxy | 300s read | `python-package/src/chromadb_admin/server.py` |
| NPM Proxy | 300s | `server/productionServer.js` |
| ChromaDB | **Configure this!** | Your ChromaDB config |

---

**Bottom Line:** If you're getting 408 errors on large collections, you need to either:
1. Increase ChromaDB server timeout
2. Use pagination (limit/offset)
3. Use query instead of get
4. Exclude embeddings from results
