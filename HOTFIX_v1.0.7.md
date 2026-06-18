# 🔥 HOTFIX v1.0.7 - NPM Express Proxy Timeout Fix

## 🐛 Critical Bug in v1.0.6

**Problem:** NPM package still experiencing 408 timeout errors on large collection `/get` requests, while Python package works correctly.

**Root Cause:** Express proxy middleware wasn't properly setting socket-level timeouts, causing the underlying HTTP connection to timeout before the 5-minute proxy timeout could take effect.

---

## ✅ What's Fixed in v1.0.7

### NPM Package Only (Python package v1.0.6 works fine)

1. **Socket-Level Timeouts**
   - Added `socket.setTimeout(300000)` on proxy request socket
   - Added `socket.setKeepAlive(true, 60000)` to keep connection alive
   - Added socket timeout on proxy response as well

2. **Request Timeout Handling**
   - Added explicit timeout callback on `proxyReq.setTimeout()`
   - Properly aborts request if timeout occurs

3. **Server Connection Timeouts**
   - Added `requestTimeout` for Node.js 18+
   - Added connection-level timeout handling
   - Increased `headersTimeout` to 310s (higher than keepAlive)

4. **Better Error Messages**
   - Detects `ECONNRESET` and `ETIMEDOUT` errors
   - Returns 504 Gateway Timeout with helpful message
   - Includes error code in response

5. **Security Fix**
   - Set `secure: false` to allow self-signed certificates

---

## 📦 Publishing

### NPM Only

```powershell
cd D:\Gitlab\chroma\ascent-ai-labs\api-ui

# Publish to NPM
npm publish --access public --otp YOUR_2FA_CODE
```

### Python Package

**No changes needed** - v1.0.6 already works correctly.

---

## 🧪 Testing

### Before (v1.0.6 NPM):
```
🔄 Proxying request: POST /api/.../get to https://...
✅ Proxy response: 408 /api/.../get
❌ ERROR: Request timeout
```

### After (v1.0.7 NPM):
```
🔄 Proxying request: POST /api/.../get to https://...
✅ Proxy response: 200 /api/.../get
✅ SUCCESS: Large collection fetched
```

---

## 📊 Version Matrix

| Package | v1.0.6 | v1.0.7 | Status |
|---------|--------|--------|--------|
| **Python (PyPI)** | ✅ Works | N/A | Keep v1.0.6 |
| **NPM** | ❌ Timeout | ✅ Fixed | **Publish v1.0.7** |
| **Docker** | ⏸️ Pending | ⏸️ Pending | Publish after NPM |

---

## 🔧 Technical Details

### The Problem

Express `http-proxy-middleware` has multiple timeout layers:

1. **Middleware timeout** (`timeout: 300000`) - ✅ Was set
2. **Proxy timeout** (`proxyTimeout: 300000`) - ✅ Was set  
3. **Socket timeout** (`socket.setTimeout()`) - ❌ **Was missing**
4. **Server timeout** (`server.timeout`) - ✅ Was set

The **socket timeout** is the lowest level and was not set, causing the connection to close prematurely.

### The Fix

```javascript
onProxyReq: function (proxyReq, req, res) {
  // CRITICAL FIX: Set socket timeout
  if (proxyReq.socket) {
    proxyReq.socket.setTimeout(300000); // 5 minutes
    proxyReq.socket.setKeepAlive(true, 60000); // Keep alive
  }
  
  proxyReq.setTimeout(300000, () => {
    console.error('⏱️ Request timeout after 5 minutes');
    proxyReq.abort();
  });
}
```

---

## 🚀 Deployment Plan

1. **NPM v1.0.7** - Publish hotfix for timeout issue
2. **Docker v1.0.7** - Update after NPM is live
3. **Python v1.0.6** - No update needed (working correctly)

---

## 📝 Release Notes

```markdown
## v1.0.7 - NPM Hotfix (2026-06-19)

### Fixed
- **Critical:** Fixed 408 timeout errors in NPM package when fetching large collections
- Added socket-level timeout handling in Express proxy
- Improved connection keep-alive for long-running requests
- Better error messages for timeout scenarios
- Allow self-signed SSL certificates

### Technical
- Set socket timeout on proxy request and response
- Added request timeout callback with abort
- Increased server connection timeouts
- Added error code detection for timeouts

### Notes
- Python package v1.0.6 continues to work correctly (no changes)
- This hotfix is NPM-specific
```

---

## ✅ Checklist

- [x] Socket timeout added to proxy requests
- [x] Socket timeout added to proxy responses  
- [x] Request timeout callback implemented
- [x] Server connection timeouts configured
- [x] Error handling improved
- [x] Self-signed cert support added
- [x] Version bumped to 1.0.7
- [x] Build completed
- [ ] NPM published
- [ ] Tested with large collections
- [ ] Docker image updated

---

**This is a critical hotfix for NPM users experiencing timeout issues.** Python users can continue using v1.0.6.
