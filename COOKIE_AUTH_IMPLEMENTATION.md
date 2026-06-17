# Cookie-Based Authentication Implementation Guide

## Overview
Implementing secure cookie-based storage for ChromaDB connection configuration with support for multiple authentication methods.

## ChromaDB Authentication Methods

### 1. Token Authentication
**Headers:**
- `Authorization: Bearer <token>` (default)
- `X-Chroma-Token: <token>` (alternative)

**Example:**
```bash
curl -H "Authorization: Bearer chr0ma-t0k3n" http://localhost:8000/api/v2/tenants
```

### 2. Basic Authentication
**Header:**
- `Authorization: Basic <base64(username:password)>`

**Example:**
```bash
curl -H "Authorization: Basic YWRtaW46cGFzc3dvcmQ=" http://localhost:8000/api/v2/tenants
```

### 3. No Authentication
No headers required for public ChromaDB instances.

## Implementation Files

### 1. Cookie Storage Utility (`src/utils/cookieStorage.ts`)
✅ **Created** - Handles:
- Secure cookie management
- Base64 encoding for sensitive data
- Auth header generation
- Support for both token and basic auth

### 2. API Service Updates (`src/services/apiService.ts`)
🔄 **To Update:**
- Replace localStorage with cookie storage
- Add request interceptor for dynamic auth headers
- Support tokenHeader configuration ('Authorization' vs 'X-Chroma-Token')

### 3. Connection Page (`src/components/ChromaConnectionPage.tsx`)
🔄 **To Update:**
- Add tokenHeader selector (Authorization/X-Chroma-Token)
- Use cookieStorage instead of localStorage
- Test connection with proper auth headers

### 4. Settings Page (`src/App.tsx`)
🔄 **To Update:**
- Load config from cookies
- Save updates to cookies
- Clear cookies on disconnect

## Changes Required

### File: `src/services/apiService.ts`

**Changes:**
1. Import cookie utilities
2. Replace `loadConnectionConfig()` to use cookies
3. Update request interceptor to use `getAuthHeaders()`
4. Remove localStorage usage
5. Add support for both token header types

**Key Code:**
```typescript
// In interceptor
const currentConfig = getConnectionConfig();
if (currentConfig) {
  const authHeaders = getAuthHeaders(currentConfig);
  config.headers = { ...config.headers, ...authHeaders };
}
```

### File: `src/components/ChromaConnectionPage.tsx`

**Changes:**
1. Import cookie utilities
2. Add tokenHeader field to form
3. Use `saveConnectionConfig()` on successful connection
4. Test connection with proper headers

**New Form Field:**
```typescript
<select value={config.tokenHeader || 'Authorization'}>
  <option value="Authorization">Authorization: Bearer</option>
  <option value="X-Chroma-Token">X-Chroma-Token</option>
</select>
```

### File: `src/App.tsx` (Settings)

**Changes:**
1. Import cookie utilities
2. Load settings from cookies
3. Save updates to cookies
4. Clear cookies on disconnect

## Security Considerations

### Cookie Settings
- **SameSite=Strict**: Prevents CSRF attacks
- **Secure flag**: Only on HTTPS (auto-detected)
- **Max-Age**: 30 days
- **Base64 encoding**: Basic obfuscation (not encryption)

### Important Notes
1. Cookies are **client-side accessible** (not httpOnly)
2. Base64 is **obfuscation**, not encryption
3. For production: Consider server-side session management
4. HTTPS strongly recommended for sensitive data

## Testing Scenarios

### 1. Token Auth (Authorization Bearer)
```typescript
{
  authType: 'token',
  token: 'my-secret-token',
  tokenHeader: 'Authorization'
}
// Result: Authorization: Bearer my-secret-token
```

### 2. Token Auth (X-Chroma-Token)
```typescript
{
  authType: 'token',
  token: 'my-secret-token',
  tokenHeader: 'X-Chroma-Token'
}
// Result: X-Chroma-Token: my-secret-token
```

### 3. Basic Auth
```typescript
{
  authType: 'basic',
  username: 'admin',
  password: 'password123'
}
// Result: Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM=
```

### 4. No Auth
```typescript
{
  authType: 'none'
}
// Result: No auth headers
```

## Implementation Steps

1. ✅ Create `cookieStorage.ts` utility
2. ⏳ Update `apiService.ts` to use cookies
3. ⏳ Update `ChromaConnectionPage.tsx` with tokenHeader field
4. ⏳ Update `Settings` component in `App.tsx`
5. ⏳ Test all authentication scenarios
6. ⏳ Update Python proxy server to forward auth headers
7. ⏳ Rebuild and test complete flow

## Next Actions

Run the implementation for files 2-4, then test with a real ChromaDB instance configured with authentication.
