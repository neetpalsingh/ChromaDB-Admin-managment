import React, { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  CodeBracketIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/apiService';
import { tenantService } from '../services/tenantService';
import type { Tenant, Database, Collection, Record, QueryRequest } from '../types/api';

interface APITestingPageProps {}

const APITestingPage: React.FC<APITestingPageProps> = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [requestData, setRequestData] = useState<any>({});
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number>(0);
  const [error, setError] = useState<string>('');
  
  // Hierarchical data
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [databases, setDatabases] = useState<Database[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');

  // Endpoint definitions
  const endpoints = [
    {
      id: 'healthcheck',
      name: 'Health Check',
      method: 'GET',
      path: '/api/v2/healthcheck',
      category: 'system',
      description: 'Check if the server is healthy',
      requiresParams: false
    },
    {
      id: 'identity',
      name: 'Get Identity',
      method: 'GET',
      path: '/api/v2/auth/identity',
      category: 'system',
      description: 'Get current user identity',
      requiresParams: false
    },
    {
      id: 'version',
      name: 'Get Version',
      method: 'GET',
      path: '/api/v2/version',
      category: 'system',
      description: 'Get server version',
      requiresParams: false
    },
    {
      id: 'get-tenants',
      name: 'Get Tenants',
      method: 'GET',
      path: '/api/v2/tenants',
      category: 'tenant',
      description: 'List all tenants',
      requiresParams: false
    },
    {
      id: 'get-databases',
      name: 'Get Databases',
      method: 'GET',
      path: '/api/v2/tenants/{tenant}/databases',
      category: 'database',
      description: 'List databases for a tenant',
      requiresParams: true,
      params: ['tenant']
    },
    {
      id: 'get-collections',
      name: 'Get Collections',
      method: 'GET',
      path: '/api/v2/tenants/{tenant}/databases/{database}/collections',
      category: 'collection',
      description: 'List collections in a database',
      requiresParams: true,
      params: ['tenant', 'database']
    },
    {
      id: 'query-records',
      name: 'Query Records',
      method: 'POST',
      path: '/api/v2/tenants/{tenant}/databases/{database}/collections/{collection_id}/query',
      category: 'data',
      description: 'Query records with vector search and filters',
      requiresParams: true,
      params: ['tenant', 'database', 'collection_id']
    },
    {
      id: 'add-records',
      name: 'Add Records',
      method: 'POST',
      path: '/api/v2/tenants/{tenant}/databases/{database}/collections/{collection_id}/add',
      category: 'data',
      description: 'Add new records to a collection',
      requiresParams: true,
      params: ['tenant', 'database', 'collection_id']
    },
    {
      id: 'get-records',
      name: 'Get Records',
      method: 'POST',
      path: '/api/v2/tenants/{tenant}/databases/{database}/collections/{collection_id}/get',
      category: 'data',
      description: 'Get records by ID or metadata filter',
      requiresParams: true,
      params: ['tenant', 'database', 'collection_id']
    }
  ];

  // Load hierarchical data
  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      loadDatabases(selectedTenant);
    }
  }, [selectedTenant]);

  useEffect(() => {
    if (selectedTenant && selectedDatabase) {
      loadCollections(selectedTenant, selectedDatabase);
    }
  }, [selectedTenant, selectedDatabase]);

  const loadTenants = async () => {
    try {
      console.log('🔍 Loading tenants from local storage (with auto-discovery)...');

      // Get all tenants from local storage (with auto-discovery)
      const storedTenants = await tenantService.getTenantsForDisplay();
      setTenants(storedTenants);
      console.log(`✅ Loaded ${storedTenants.length} tenants from local storage:`, storedTenants.map(t => t.name));
    } catch (error) {
      console.error('Error loading tenants:', error);
      setTenants([]);
    }
  };

  const loadDatabases = async (tenant: string) => {
    try {
      const response = await apiService.getDatabases(tenant);
      if (response.success && response.data) {
        setDatabases(response.data);
      } else {
        console.warn('Failed to load databases:', response.error);
        setDatabases([]);
      }
    } catch (error) {
      console.error('Error loading databases:', error);
      setDatabases([]);
    }
  };

  const loadCollections = async (tenant: string, database: string) => {
    try {
      const response = await apiService.getCollections(tenant, database);
      if (response.success && response.data) {
        setCollections(response.data);
      } else {
        console.warn('Failed to load collections:', response.error);
        setCollections([]);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
      setCollections([]);
    }
  };

  const handleEndpointSelect = (endpointId: string) => {
    setSelectedEndpoint(endpointId);
    setRequestData({});
    setResponse(null);
    setError('');
    
    const endpoint = endpoints.find(e => e.id === endpointId);
    if (endpoint && endpoint.requiresParams) {
      const initialData: any = {};
      endpoint.params?.forEach(param => {
        if (param === 'tenant') initialData.tenant = selectedTenant;
        if (param === 'database') initialData.database = selectedDatabase;
        if (param === 'collection_id') initialData.collection_id = selectedCollection;
      });
      setRequestData(initialData);
    }
  };

  const executeRequest = async () => {
    if (!selectedEndpoint) return;

    setIsLoading(true);
    setError('');
    setResponse(null);
    const startTime = Date.now();

    try {
      const endpoint = endpoints.find(e => e.id === selectedEndpoint);
      if (!endpoint) throw new Error('Invalid endpoint');

      let result: any;

      switch (endpoint.id) {
        case 'healthcheck':
          result = await apiService.getHealthCheck();
          break;
        case 'identity':
          result = await apiService.getIdentity();
          break;
        case 'version':
          result = await apiService.getVersion();
          break;
        case 'query-records':
          if (!requestData.tenant || !requestData.database || !requestData.collection_id) {
            throw new Error('Missing required parameters');
          }
          const queryRequest: QueryRequest = {
            query: requestData.query || '',
            filter: requestData.filter ? JSON.parse(requestData.filter) : undefined,
            limit: requestData.limit ? parseInt(requestData.limit) : undefined,
            offset: requestData.offset ? parseInt(requestData.offset) : undefined
          };
          result = await apiService.queryRecords(
            requestData.tenant,
            requestData.database,
            requestData.collection_id,
            queryRequest
          );
          break;
        case 'add-records':
          if (!requestData.tenant || !requestData.database || !requestData.collection_id) {
            throw new Error('Missing required parameters');
          }
          const records: Record[] = requestData.records ? JSON.parse(requestData.records) : [];
          result = await apiService.addRecords(
            requestData.tenant,
            requestData.database,
            requestData.collection_id,
            { records }
          );
          break;
        default:
          throw new Error('Endpoint not implemented yet');
      }

      setResponse(result);
      setResponseTime(Date.now() - startTime);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setResponseTime(Date.now() - startTime);
    } finally {
      setIsLoading(false);
    }
  };

  const renderParameterInputs = () => {
    const endpoint = endpoints.find(e => e.id === selectedEndpoint);
    if (!endpoint || !endpoint.requiresParams) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Parameters</h3>
        {endpoint.params?.map(param => (
          <div key={param}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {param.charAt(0).toUpperCase() + param.slice(1).replace('_', ' ')}
            </label>
            {param === 'tenant' ? (
              <select
                value={requestData[param] || ''}
                onChange={(e) => setRequestData({ ...requestData, [param]: e.target.value })}
                className="input-field"
              >
                <option value="">Select a tenant</option>
                {(tenants || []).map(tenant => (
                  <option key={tenant.name} value={tenant.name}>{tenant.name}</option>
                ))}
              </select>
            ) : param === 'database' ? (
              <select
                value={requestData[param] || ''}
                onChange={(e) => setRequestData({ ...requestData, [param]: e.target.value })}
                className="input-field"
                disabled={!requestData.tenant}
              >
                <option value="">Select a database</option>
                {databases.map(db => (
                  <option key={db.name} value={db.name}>{db.name}</option>
                ))}
              </select>
            ) : param === 'collection_id' ? (
              <select
                value={requestData[param] || ''}
                onChange={(e) => setRequestData({ ...requestData, [param]: e.target.value })}
                className="input-field"
                disabled={!requestData.database}
              >
                <option value="">Select a collection</option>
                {collections.map(col => (
                  <option key={col.id} value={col.id}>{col.name}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={requestData[param] || ''}
                onChange={(e) => setRequestData({ ...requestData, [param]: e.target.value })}
                className="input-field"
                placeholder={`Enter ${param}`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderRequestBody = () => {
    const endpoint = endpoints.find(e => e.id === selectedEndpoint);
    if (!endpoint || endpoint.method === 'GET') return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Request Body</h3>
        
        {endpoint.id === 'query-records' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Query Text</label>
              <input
                type="text"
                value={requestData.query || ''}
                onChange={(e) => setRequestData({ ...requestData, query: e.target.value })}
                className="input-field"
                placeholder="Enter search query"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter (JSON)</label>
              <textarea
                value={requestData.filter || ''}
                onChange={(e) => setRequestData({ ...requestData, filter: e.target.value })}
                className="input-field h-20"
                placeholder='{"key": "value"}'
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Limit</label>
                <input
                  type="number"
                  value={requestData.limit || ''}
                  onChange={(e) => setRequestData({ ...requestData, limit: e.target.value })}
                  className="input-field"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Offset</label>
                <input
                  type="number"
                  value={requestData.offset || ''}
                  onChange={(e) => setRequestData({ ...requestData, offset: e.target.value })}
                  className="input-field"
                  placeholder="0"
                />
              </div>
            </div>
          </>
        )}

        {endpoint.id === 'add-records' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Records (JSON)</label>
            <textarea
              value={requestData.records || ''}
              onChange={(e) => setRequestData({ ...requestData, records: e.target.value })}
              className="input-field h-32"
              placeholder='[{"text": "sample text", "metadata": {"source": "demo"}}]'
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">API Testing</h1>
        <p className="text-gray-600">Test your vector database APIs with this interactive interface</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel - Endpoint Selection */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Endpoint</h2>
            
            {/* Hierarchical Navigation */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Navigation</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tenant</label>
                  <select
                    value={selectedTenant}
                    onChange={(e) => {
                      setSelectedTenant(e.target.value);
                      setSelectedDatabase('');
                      setSelectedCollection('');
                    }}
                    className="input-field text-sm"
                  >
                    <option value="">Select tenant</option>
                    {(tenants || []).map(tenant => (
                      <option key={tenant.name} value={tenant.name}>{tenant.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Database</label>
                  <select
                    value={selectedDatabase}
                    onChange={(e) => {
                      setSelectedDatabase(e.target.value);
                      setSelectedCollection('');
                    }}
                    className="input-field text-sm"
                    disabled={!selectedTenant}
                  >
                    <option value="">Select database</option>
                    {databases.map(db => (
                      <option key={db.name} value={db.name}>{db.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Collection</label>
                  <select
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    className="input-field text-sm"
                    disabled={!selectedDatabase}
                  >
                    <option value="">Select collection</option>
                    {collections.map(col => (
                      <option key={col.id} value={col.id}>{col.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Endpoint List */}
            <div className="space-y-2">
              {endpoints.map(endpoint => (
                <button
                  key={endpoint.id}
                  onClick={() => handleEndpointSelect(endpoint.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedEndpoint === endpoint.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                      endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {endpoint.method}
                    </span>
                    <span className="text-xs text-gray-500">{endpoint.category}</span>
                  </div>
                  <div className="font-medium text-gray-900 text-sm">{endpoint.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{endpoint.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Request/Response */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Panel */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Request</h2>
            
            {selectedEndpoint ? (
              <div className="space-y-6">
                {renderParameterInputs()}
                {renderRequestBody()}
                
                <button
                  onClick={executeRequest}
                  disabled={isLoading}
                  className="btn-primary w-full"
                >
                  {isLoading ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-5 w-5 mr-2" />
                      Send Request
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CodeBracketIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select an endpoint to start testing</p>
              </div>
            )}
          </div>

          {/* Response Panel */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Response</h2>
            
            {isLoading && (
              <div className="text-center py-8">
                <ArrowPathIcon className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-600" />
                <p className="text-gray-600">Executing request...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-red-800 font-medium">Error</span>
                </div>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            )}

            {response && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-700">Success</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 text-gray-600 mr-1" />
                    <span className="text-gray-700">{responseTime}ms</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Response Body</label>
                  <textarea
                    value={JSON.stringify(response, null, 2)}
                    className="input-field h-64 font-mono text-sm"
                    readOnly
                  />
                </div>
              </div>
            )}

            {!isLoading && !error && !response && (
              <div className="text-center py-8 text-gray-500">
                <CodeBracketIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Response will appear here after executing a request</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default APITestingPage;
