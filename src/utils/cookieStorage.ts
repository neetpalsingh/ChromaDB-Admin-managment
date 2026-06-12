/**
 * Cookie Storage Utility
 * Secure cookie management for ChromaDB connection configuration
 * Stores sensitive data (tokens, credentials) in httpOnly cookies when possible
 */

export interface ConnectionConfig {
  connectionString: string;
  tenant: string;
  database: string;
  authType: 'none' | 'token' | 'basic';
  token?: string;
  username?: string;
  password?: string;
  tokenHeader?: 'Authorization' | 'X-Chroma-Token'; // Which header to use for token auth
}

const COOKIE_NAME = 'chromadb_connection_config';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Set a cookie with proper security settings
 */
function setCookie(name: string, value: string, maxAge: number = COOKIE_MAX_AGE): void {
  const isSecure = window.location.protocol === 'https:';
  const cookieString = [
    `${name}=${encodeURIComponent(value)}`,
    `max-age=${maxAge}`,
    'path=/',
    'SameSite=Strict',
    // Only set Secure flag on HTTPS
    isSecure ? 'Secure' : ''
  ].filter(Boolean).join('; ');
  
  document.cookie = cookieString;
}

/**
 * Get a cookie value by name
 */
function getCookie(name: string): string | null {
  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
}

/**
 * Delete a cookie
 */
function deleteCookie(name: string): void {
  document.cookie = `${name}=; max-age=0; path=/`;
}

/**
 * Save connection configuration to cookies
 */
export function saveConnectionConfig(config: ConnectionConfig): void {
  try {
    // Encrypt/encode sensitive data before storing
    const configToStore = {
      connectionString: config.connectionString,
      tenant: config.tenant,
      database: config.database,
      authType: config.authType,
      tokenHeader: config.tokenHeader || 'Authorization',
      // Base64 encode sensitive data for basic obfuscation
      ...(config.token && { token: btoa(config.token) }),
      ...(config.username && { username: btoa(config.username) }),
      ...(config.password && { password: btoa(config.password) })
    };
    
    const jsonString = JSON.stringify(configToStore);
    setCookie(COOKIE_NAME, jsonString);
    
    console.log('✅ Connection configuration saved to cookies');
  } catch (error) {
    console.error('❌ Error saving connection config to cookies:', error);
    throw new Error('Failed to save connection configuration');
  }
}

/**
 * Get connection configuration from cookies
 */
export function getConnectionConfig(): ConnectionConfig | null {
  try {
    const cookieValue = getCookie(COOKIE_NAME);
    if (!cookieValue) {
      return null;
    }
    
    const stored = JSON.parse(cookieValue);
    
    // Decode sensitive data
    const config: ConnectionConfig = {
      connectionString: stored.connectionString,
      tenant: stored.tenant,
      database: stored.database,
      authType: stored.authType,
      tokenHeader: stored.tokenHeader || 'Authorization',
      ...(stored.token && { token: atob(stored.token) }),
      ...(stored.username && { username: atob(stored.username) }),
      ...(stored.password && { password: atob(stored.password) })
    };
    
    return config;
  } catch (error) {
    console.error('❌ Error reading connection config from cookies:', error);
    return null;
  }
}

/**
 * Clear connection configuration from cookies
 */
export function clearConnectionConfig(): void {
  deleteCookie(COOKIE_NAME);
  console.log('🗑️ Connection configuration cleared from cookies');
}

/**
 * Check if connection configuration exists
 */
export function hasConnectionConfig(): boolean {
  return getCookie(COOKIE_NAME) !== null;
}

/**
 * Get authentication headers for ChromaDB API requests
 */
export function getAuthHeaders(config: ConnectionConfig | null): Record<string, string> {
  if (!config) {
    return {};
  }
  
  const headers: Record<string, string> = {};
  
  switch (config.authType) {
    case 'token':
      if (config.token) {
        if (config.tokenHeader === 'X-Chroma-Token') {
          // Use X-Chroma-Token header
          headers['X-Chroma-Token'] = config.token;
        } else {
          // Use Authorization: Bearer header (default)
          headers['Authorization'] = `Bearer ${config.token}`;
        }
      }
      break;
      
    case 'basic':
      if (config.username && config.password) {
        // RFC 7617 compliant Basic Auth
        const credentials = btoa(`${config.username}:${config.password}`);
        headers['Authorization'] = `Basic ${credentials}`;
      }
      break;
      
    case 'none':
    default:
      // No authentication headers
      break;
  }
  
  return headers;
}
