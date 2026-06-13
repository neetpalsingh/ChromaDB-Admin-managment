import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  Tenant,
  Database,
  Collection,
  Record,
  QueryRequest,
  GetRequest,
  AddRequest,
  UpdateRequest,
  DeleteRequest,
  APIResponse,
  UserIdentity
} from '../types/api';
import {
  getConnectionConfig,
  saveConnectionConfig,
  clearConnectionConfig,
  getAuthHeaders,
  type ConnectionConfig
} from '../utils/cookieStorage';

class APIService {
  private api: AxiosInstance;
  private baseURL: string = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CHROMADB_URL) || 'http://localhost:8000'; // Default from env, can be changed in settings
  private apiKey: string = '';
  private connectionConfig: ConnectionConfig | null = null;

  constructor() {
    // Detect if we're running in development or production
    const isDevelopment = typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname.includes('localhost'));

    // ALWAYS use proxy to avoid CORS issues in both development and production
    // The proxy server handles the actual ChromaDB connection
    const baseURL = ''; // Always use proxy

    console.log('🔧 API Service Environment:', {
      isDevelopment,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
      baseURL: 'proxy',
      defaultTarget: this.baseURL,
      note: 'Always using proxy to avoid CORS issues'
    });

    this.api = axios.create({
      baseURL,
      timeout: 300000, // 5 minutes timeout for large operations (get, query, etc.)
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use((config) => {
      // Get fresh connection config from cookies for each request
      const currentConfig = getConnectionConfig();

      if (currentConfig) {
        // Get authentication headers based on auth type
        const authHeaders = getAuthHeaders(currentConfig);

        // Apply auth headers
        Object.entries(authHeaders).forEach(([key, value]) => {
          config.headers.set(key, value);
        });
      }

      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );

    // Load connection config from localStorage if available
    this.loadConnectionConfig();
  }

  // Load connection configuration from cookies
  private loadConnectionConfig() {
    try {
      const savedConfig = getConnectionConfig();
      if (savedConfig) {
        this.connectionConfig = savedConfig;
        this.updateApiConfiguration();
      }
    } catch (error) {
      console.error('Failed to load connection config:', error);
    }
  }

  // Update API configuration based on connection config
  private updateApiConfiguration() {
    if (this.connectionConfig) {
      // ALWAYS use proxy in production to avoid CORS issues
      const isDevelopment = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

      // In development: use proxy (''), In production: also use proxy ('')
      // The proxy server will handle the actual ChromaDB connection
      const baseURL = ''; // Always use proxy to avoid CORS
      this.setBaseURL(baseURL);

      // Configure the proxy target via the /configure-proxy endpoint
      this.configureProxyTarget(this.connectionConfig.connectionString);

      // Set authentication based on auth type
      if (this.connectionConfig.authType === 'token' && this.connectionConfig.token) {
        this.setAPIKey(this.connectionConfig.token);
      } else if (this.connectionConfig.authType === 'basic' && this.connectionConfig.username && this.connectionConfig.password) {
        const credentials = btoa(`${this.connectionConfig.username}:${this.connectionConfig.password}`);
        this.setAPIKey(credentials);
      }

      console.log('🔧 API Service configured for proxy:', {
        baseURL: 'proxy',
        targetURL: this.connectionConfig.connectionString,
        authType: this.connectionConfig.authType,
        isDevelopment,
        note: 'All requests go through proxy to avoid CORS'
      });
    }
  }

  // Configure proxy target to avoid CORS issues
  private async configureProxyTarget(targetUrl: string) {
    try {
      console.log('🔧 Configuring proxy target:', targetUrl);

      // Call the proxy configuration endpoint
      const response = await fetch('/configure-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chromadbUrl: targetUrl
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Proxy configured successfully:', result);
      } else {
        console.error('❌ Failed to configure proxy:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Error configuring proxy:', error);
    }
  }

  // Set connection configuration
  setConnectionConfig(config: ConnectionConfig) {
    console.log('Setting connection config:', config);
    this.connectionConfig = config;
    this.updateApiConfiguration();

    // Save to cookies (secure storage)
    saveConnectionConfig(config);
  }

  // Get current connection configuration
  getConnectionConfig(): ConnectionConfig | null {
    return this.connectionConfig;
  }

  // Check if connected to ChromaDB
  isConnected(): boolean {
    return this.connectionConfig !== null;
  }

  // Disconnect and clear connection configuration
  disconnect() {
    this.connectionConfig = null;
    clearConnectionConfig();
    console.log('🔌 Disconnected from ChromaDB');
  }

  // Helper method to validate API response
  private isValidJsonResponse(data: any): boolean {
    if (typeof data === 'string' && data.includes('<!doctype html>')) {
      return false;
    }
    if (typeof data === 'string' && data.includes('<html')) {
      return false;
    }
    return true;
  }

  // Debug method to help troubleshoot tenant discovery
  async debugTenantDiscovery(): Promise<void> {
    console.log('=== TENANT DISCOVERY DEBUG ===');
    console.log('Connection config:', this.connectionConfig);
    
    // Test identity endpoint
    try {
      const identityResponse = await this.getIdentity();
      console.log('Identity response:', identityResponse);
    } catch (error) {
      console.log('Identity endpoint failed:', error);
    }
    
    // Test tenant endpoints
    const endpoints = ['/api/v2/tenants', '/api/v1/tenants', '/tenants'];
    for (const endpoint of endpoints) {
      try {
        const response = await this.api.get(endpoint);
        console.log(`Endpoint ${endpoint}:`, response.data);
      } catch (error: any) {
        console.log(`Endpoint ${endpoint} failed:`, error.message);
      }
    }
    
    // Test tenant discovery using only API calls
    console.log('Testing tenant discovery using API calls only...');
    const tenantsResponse = await this.getTenants();
    console.log('Tenants from API:', tenantsResponse);
    
    if (tenantsResponse.success && tenantsResponse.data && tenantsResponse.data.length > 0) {
      console.log('Testing databases for each discovered tenant...');
      for (const tenant of tenantsResponse.data) {
        try {
          const dbResponse = await this.getDatabases(tenant.name);
          console.log(`Tenant ${tenant.name} databases:`, dbResponse);
        } catch (error: any) {
          console.log(`Tenant ${tenant.name} databases failed:`, error.message);
        }
      }
    } else {
      console.log('No tenants found via API calls');
    }
    
    console.log('=== END DEBUG ===');
  }

  // Configuration methods
  setBaseURL(url: string) {
    this.baseURL = url;
    this.api.defaults.baseURL = url;
  }

  setAPIKey(key: string) {
    this.apiKey = key;
  }

  // System & Utility Endpoints
  async getIdentity(): Promise<APIResponse<UserIdentity>> {
    try {
      const response = await this.api.get('/api/v2/auth/identity');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async getHealthCheck(): Promise<APIResponse<{ status: string }>> {
    try {
      const response = await this.api.get('/api/v2/healthcheck');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async getHeartbeat(): Promise<APIResponse<{ timestamp: string }>> {
    try {
      const response = await this.api.get('/api/v2/heartbeat');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async getPreFlightChecks(): Promise<APIResponse<any>> {
    try {
      const response = await this.api.get('/api/v2/pre-flight-checks');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async resetDatabase(): Promise<APIResponse<{ message: string }>> {
    try {
      const response = await this.api.post('/api/v2/reset');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async getVersion(): Promise<APIResponse<{ version: string }>> {
    try {
      const response = await this.api.get('/api/v2/version');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  // Tenant Management
  async getTenants(): Promise<APIResponse<Tenant[]>> {
    try {
      console.log('Getting all tenants from ChromaDB API...');
      
      // Try the primary tenant endpoint first
      try {
        console.log('Trying /api/v2/tenants endpoint...');
        const response = await this.api.get('/api/v2/tenants');
        console.log('Tenants API response:', response.data);
        
        // Check if response.data is valid JSON (not HTML)
        if (!this.isValidJsonResponse(response.data)) {
          console.log('API returned HTML instead of JSON, trying alternative approach');
          throw new Error('Invalid response format');
        }
        
        // Handle different response formats
        let tenants: Tenant[] = [];
        
        if (Array.isArray(response.data)) {
          tenants = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // Try to extract tenants from object response
          if (response.data.tenants && Array.isArray(response.data.tenants)) {
            tenants = response.data.tenants;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            tenants = response.data.data;
          } else {
            // Single tenant object
            tenants = [response.data];
          }
        }
        
        if (tenants.length > 0) {
          console.log(`Successfully retrieved ${tenants.length} tenants from API:`, tenants.map(t => t.name));
          return { success: true, data: tenants };
        }
        
        console.log('No tenants found in API response');
        return { success: true, data: [] };
        
      } catch (apiError: any) {
        console.log('Primary tenant endpoint failed:', apiError.message);
        
        // Try alternative endpoints
        const alternativeEndpoints = ['/api/v1/tenants', '/tenants'];
        
        for (const endpoint of alternativeEndpoints) {
          try {
            console.log(`Trying alternative endpoint: ${endpoint}`);
            const response = await this.api.get(endpoint);
            
            if (this.isValidJsonResponse(response.data)) {
              let tenants: Tenant[] = [];
              
              if (Array.isArray(response.data)) {
                tenants = response.data;
              } else if (response.data && typeof response.data === 'object') {
                if (response.data.tenants && Array.isArray(response.data.tenants)) {
                  tenants = response.data.tenants;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                  tenants = response.data.data;
                } else {
                  tenants = [response.data];
                }
              }
              
              if (tenants.length > 0) {
                console.log(`Successfully retrieved ${tenants.length} tenants from ${endpoint}:`, tenants.map(t => t.name));
                return { success: true, data: tenants };
              }
            }
          } catch (altError: any) {
            console.log(`Alternative endpoint ${endpoint} failed:`, altError.message);
            continue;
          }
        }
        
        // If all tenant endpoints fail, return empty array (no hardcoded fallbacks)
        console.warn('All tenant API endpoints failed. No tenants found.');
        return { success: true, data: [] };
      }
      
    } catch (error: any) {
      console.error('Error getting tenants:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async getTenant(tenantName: string): Promise<APIResponse<Tenant>> {
    try {
      console.log(`Getting tenant: ${tenantName}`);
      const response = await this.api.get(`/api/v2/tenants/${tenantName}`);
      console.log(`Tenant ${tenantName} response:`, response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.log(`Tenant ${tenantName} not found:`, error.message);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async createTenant(tenant: Omit<Tenant, 'created_at' | 'updated_at'>): Promise<APIResponse<Tenant>> {
    try {
      const response = await this.api.post('/api/v2/tenants', tenant);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }



  async updateTenant(tenantName: string, updates: Partial<Tenant>): Promise<APIResponse<Tenant>> {
    try {
      const response = await this.api.patch(`/api/v2/tenants/${tenantName}`, updates);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  // Database Management
  async getDatabases(tenant: string): Promise<APIResponse<Database[]>> {
    try {
      const response = await this.api.get(`/api/v2/tenants/${tenant}/databases`);

      // Log the raw response for debugging
      console.log(`Raw getDatabases response for tenant ${tenant}:`, response.data);
      console.log('Response type:', typeof response.data);
      console.log('Is array:', Array.isArray(response.data));

      // Validate and normalize the response
      let databases: Database[] = [];

      if (Array.isArray(response.data)) {
        databases = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Handle different possible response structures
        const data = response.data as any;
        if (data.databases && Array.isArray(data.databases)) {
          databases = data.databases;
        } else if (data.data && Array.isArray(data.data)) {
          databases = data.data;
        } else if (data.name && data.tenant) {
          // Single database object
          databases = [data];
        } else {
          console.warn('Unexpected database response structure:', response.data);
          databases = [];
        }
      }

      console.log(`Normalized databases for tenant ${tenant}:`, databases);
      return { success: true, data: databases };
    } catch (error: any) {
      console.error(`Error getting databases for tenant ${tenant}:`, error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async createDatabase(tenant: string, database: Omit<Database, 'created_at' | 'updated_at'>): Promise<APIResponse<Database>> {
    try {
      const response = await this.api.post(`/api/v2/tenants/${tenant}/databases`, database);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async getDatabase(tenant: string, database: string): Promise<APIResponse<Database>> {
    try {
      const response = await this.api.get(`/api/v2/tenants/${tenant}/databases/${database}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async deleteDatabase(tenant: string, database: string): Promise<APIResponse<{ message: string }>> {
    try {
      const response = await this.api.delete(`/api/v2/tenants/${tenant}/databases/${database}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  // Collection Management
  async getCollections(tenant: string, database: string): Promise<APIResponse<Collection[]>> {
    try {
      const response = await this.api.get(`/api/v2/tenants/${tenant}/databases/${database}/collections`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async createCollection(tenant: string, database: string, collection: Omit<Collection, 'created_at' | 'updated_at'>): Promise<APIResponse<Collection>> {
    try {
      const response = await this.api.post(`/api/v2/tenants/${tenant}/databases/${database}/collections`, collection);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async getCollection(tenant: string, database: string, collectionId: string): Promise<APIResponse<Collection>> {
    try {
      const response = await this.api.get(`/api/v2/tenants/${tenant}/databases/${database}/collections/${collectionId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async updateCollection(tenant: string, database: string, collectionId: string, updates: Partial<Collection>): Promise<APIResponse<Collection>> {
    try {
      const response = await this.api.put(`/api/v2/tenants/${tenant}/databases/${database}/collections/${collectionId}`, updates);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async deleteCollection(tenant: string, database: string, collectionId: string): Promise<APIResponse<{ message: string }>> {
    try {
      const response = await this.api.delete(`/api/v2/tenants/${tenant}/databases/${database}/collections/${collectionId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async getCollectionsCount(tenant: string, database: string): Promise<APIResponse<{ count: number }>> {
    try {
      const response = await this.api.get(`/api/v2/tenants/${tenant}/databases/${database}/collections_count`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  // Data Operations
  async addRecords(tenant: string, database: string, collectionId: string, request: AddRequest): Promise<APIResponse<{ added_count: number }>> {
    try {
      const response = await this.api.post(`/api/v2/tenants/${tenant}/databases/${database}/collections/${collectionId}/add`, request);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async getRecords(tenant: string, database: string, collectionId: string, request: GetRequest): Promise<APIResponse<Record[]>> {
    try {
      const response = await this.api.post(`/api/v2/tenants/${tenant}/databases/${database}/collections/${collectionId}/get`, request);

      // Log the raw response for debugging
      console.log(`Raw getRecords response for ${tenant}/${database}/${collectionId}:`, response.data);
      console.log('Response type:', typeof response.data);
      console.log('Is array:', Array.isArray(response.data));

      // The response.data should be the ChromaDB response object or array
      // We'll let the component handle the transformation
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error(`Error getting records for ${tenant}/${database}/${collectionId}:`, error);

      // Check if it's a timeout error
      if (error.code === 'ECONNABORTED' || error.response?.status === 408) {
        return {
          success: false,
          error: 'Request timeout. The collection is too large to fetch all at once. Try using pagination with limit/offset, or use Query instead of Get for large collections.'
        };
      }

      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async queryRecords(tenant: string, database: string, collectionId: string, request: QueryRequest): Promise<APIResponse<Record[]>> {
    try {
      const response = await this.api.post(`/api/v2/tenants/${tenant}/databases/${database}/collections/${collectionId}/query`, request);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async updateRecords(tenant: string, database: string, collectionId: string, request: UpdateRequest): Promise<APIResponse<{ updated_count: number }>> {
    try {
      const response = await this.api.post(`/api/v2/tenants/${tenant}/databases/${database}/collections/${collectionId}/update`, request);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async deleteRecords(tenant: string, database: string, collectionId: string, request: DeleteRequest): Promise<APIResponse<{ deleted_count: number }>> {
    try {
      const response = await this.api.post(`/api/v2/tenants/${tenant}/databases/${database}/collections/${collectionId}/delete`, request);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async forkCollection(tenant: string, database: string, collectionId: string, newName: string): Promise<APIResponse<Collection>> {
    try {
      const response = await this.api.post(`/api/v2/tenants/${tenant}/databases/${database}/collections/${collectionId}/fork`, { new_name: newName });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async getRecordCount(tenant: string, database: string, collectionId: string): Promise<APIResponse<{ count: number }>> {
    try {
      const response = await this.api.get(`/api/v2/tenants/${tenant}/databases/${database}/collections/${collectionId}/count`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  // Utility method to test connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing API connection...');
      const result = await this.getHealthCheck();
      console.log('Connection test result:', result);
      return result.success;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // Debug method to check current configuration
  debugConfig() {
    console.log('API Service Debug Info:', {
      baseURL: this.api.defaults.baseURL,
      connectionConfig: this.connectionConfig,
      apiKey: this.apiKey ? '***' : 'none',
      headers: this.api.defaults.headers
    });
  }
}

export const apiService = new APIService();
export default apiService;
