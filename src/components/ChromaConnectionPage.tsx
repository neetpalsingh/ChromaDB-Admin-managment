import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

interface ConnectionConfig {
  connectionString: string;
  tenant: string;
  database: string;
  authType: 'none' | 'token' | 'basic';
  token?: string;
  username?: string;
  password?: string;
}

interface ChromaConnectionPageProps {
  onConnectionSuccess: (config: ConnectionConfig) => void;
}

const ChromaConnectionPage: React.FC<ChromaConnectionPageProps> = ({ onConnectionSuccess }) => {
  const defaultChromaURL = import.meta.env.VITE_CHROMADB_URL || 'http://localhost:8000';
  const [config, setConfig] = useState<ConnectionConfig>({
    connectionString: defaultChromaURL,
    tenant: 'default_tenant',
    database: 'default_database',
    authType: 'none'
  });
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (field: keyof ConnectionConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    // Reset connection status when config changes
    if (connectionStatus !== 'idle') {
      setConnectionStatus('idle');
      setErrorMessage('');
    }
  };

  const handleAuthTypeChange = (authType: 'none' | 'token' | 'basic') => {
    setConfig(prev => ({
      ...prev,
      authType,
      token: authType === 'token' ? prev.token : undefined,
      username: authType === 'basic' ? prev.username : undefined,
      password: authType === 'basic' ? prev.password : undefined
    }));
  };

  const testConnection = async () => {
    setIsConnecting(true);
    setConnectionStatus('idle');
    setErrorMessage('');

    try {
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add auth headers if needed
      if (config.authType === 'token' && config.token) {
        headers['Authorization'] = `Bearer ${config.token}`;
      } else if (config.authType === 'basic' && config.username && config.password) {
        const credentials = btoa(`${config.username}:${config.password}`);
        headers['Authorization'] = `Basic ${credentials}`;
      }

      // ALWAYS use proxy for connection testing to avoid CORS issues
      const isDevelopment = window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname.includes('localhost');

      // First, configure the proxy to point to the user's ChromaDB instance
      try {
        await fetch('/configure-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chromadbUrl: config.connectionString
          })
        });
        console.log('🔧 Proxy configured for:', config.connectionString);
      } catch (error) {
        console.warn('⚠️ Could not configure proxy (might be in development):', error);
      }

      // Always use proxy for testing
      const testUrl = '/api/v2/healthcheck';

      console.log('🔧 Connection Test (using proxy):', {
        testUrl,
        connectionString: config.connectionString,
        isDevelopment,
        hostname: window.location.hostname,
        note: 'Using proxy to avoid CORS issues'
      });

      // Test with health check endpoint
      const response = await fetch(testUrl, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        setConnectionStatus('success');
        setErrorMessage('');
        console.log('Connection test successful');
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Connection failed: ${response.status} ${response.statusText}. ${errorText}`);
      }
    } catch (error: any) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
      
      // Provide more helpful error messages
      if (error.name === 'AbortError') {
        setErrorMessage('Connection timeout - please check your network and try again');
      } else if (error.message.includes('CORS')) {
        setErrorMessage('CORS error - the server needs to allow cross-origin requests. Try using the development proxy or contact your server administrator.');
      } else if (error.message.includes('NetworkError')) {
        setErrorMessage('Network error - please check your internet connection and server URL');
      } else {
        setErrorMessage(error.message || 'Failed to connect to ChromaDB instance');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnect = () => {
    if (connectionStatus === 'success') {
      // Save connection config to localStorage
      localStorage.setItem('chroma_connection_config', JSON.stringify(config));
      onConnectionSuccess(config);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Skip step 2 (Database Configuration) and go directly to step 3 (Authentication)
      setCurrentStep(3);
    } else if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep === 3) {
      // Go back to step 1 (Connection) from step 3 (Authentication)
      setCurrentStep(1);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return config.connectionString.trim() !== '';
      case 3:
        if (config.authType === 'token') {
          return config.token?.trim() !== '';
        } else if (config.authType === 'basic') {
          return config.username?.trim() !== '' && config.password?.trim() !== '';
        }
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <LinkIcon className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Connect to ChromaDB
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Configure your ChromaDB vector database connection
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {[1, 3].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  {index < 1 && (
                    <div className={`w-16 h-1 mx-2 ${
                      currentStep === 3 ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Connection</span>
              <span>Authentication</span>
            </div>
          </div>

          {/* Step 1: Connection String */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">ChromaDB Connection</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chroma connection string
                  </label>
                  <p className="text-xs text-gray-500 mb-2">For example, http://localhost:8000</p>
                  <input
                    type="text"
                    value={config.connectionString}
                    onChange={(e) => handleInputChange('connectionString', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://your-chroma-instance.com"
                  />
                </div>
              </div>
            </div>
          )}



          {/* Step 3: Authentication */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Authentication</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Authentication Type
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Select the authentication method required by your ChromaDB instance. Credentials will be validated during connection testing.
                    </p>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="authType"
                          value="none"
                          checked={config.authType === 'none'}
                          onChange={() => handleAuthTypeChange('none')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">No Auth</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="authType"
                          value="token"
                          checked={config.authType === 'token'}
                          onChange={() => handleAuthTypeChange('token')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Token</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="authType"
                          value="basic"
                          checked={config.authType === 'basic'}
                          onChange={() => handleAuthTypeChange('basic')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Basic</span>
                      </label>
                    </div>
                  </div>

                  {config.authType === 'token' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Token <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={config.token || ''}
                        onChange={(e) => handleInputChange('token', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          config.token?.trim() ? 'border-gray-300' : 'border-red-300 bg-red-50'
                        }`}
                        placeholder="Enter your authentication token"
                        required
                      />
                      {!config.token?.trim() && (
                        <p className="mt-1 text-xs text-red-600">Token is required for authentication</p>
                      )}
                    </div>
                  )}

                  {config.authType === 'basic' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={config.username || ''}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                            config.username?.trim() ? 'border-gray-300' : 'border-red-300 bg-red-50'
                          }`}
                          placeholder="Enter your username"
                          required
                        />
                        {!config.username?.trim() && (
                          <p className="mt-1 text-xs text-red-600">Username is required for basic authentication</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={config.password || ''}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                            config.password?.trim() ? 'border-gray-300' : 'border-red-300 bg-red-50'
                          }`}
                          placeholder="Enter your password"
                          required
                        />
                        {!config.password?.trim() && (
                          <p className="mt-1 text-xs text-red-600">Password is required for basic authentication</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Connection Status */}
          {connectionStatus !== 'idle' && (
            <div className={`p-4 rounded-lg ${
              connectionStatus === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {connectionStatus === 'success' ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                )}
                <span className={`text-sm font-medium ${
                  connectionStatus === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {connectionStatus === 'success' ? 'Connection successful!' : 'Connection failed'}
                </span>
              </div>
              {errorMessage && (
                <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
              )}
            </div>
          )}



           {/* Navigation Buttons */}
           <div className="flex justify-between mt-8">
             <button
               onClick={prevStep}
               disabled={currentStep === 1}
               className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <ArrowLeftIcon className="h-4 w-4 mr-2" />
               Back
             </button>

             <div className="flex space-x-3">
               {currentStep === 3 ? (
                 <>
                   <button
                     onClick={testConnection}
                     disabled={isConnecting || !isStepValid()}
                     className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {isConnecting ? 'Testing...' : 'Test Connection'}
                   </button>
                   <button
                     onClick={handleConnect}
                     disabled={connectionStatus !== 'success'}
                     className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     Connect
                     <ArrowRightIcon className="h-4 w-4 ml-2" />
                   </button>
                 </>
               ) : (
                 <button
                   onClick={nextStep}
                   disabled={!isStepValid()}
                   className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Next
                   <ArrowRightIcon className="h-4 w-4 ml-2" />
                 </button>
               )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ChromaConnectionPage;
