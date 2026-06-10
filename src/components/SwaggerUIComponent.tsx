import React, { useState, useEffect, useCallback } from 'react';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  LinkIcon,
  ArrowTopRightOnSquareIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/apiService';

interface SwaggerUIComponentProps {
  className?: string;
}

const SwaggerUIComponent: React.FC<SwaggerUIComponentProps> = ({ className = '' }) => {
  const [docsUrl, setDocsUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [connectionConfig, setConnectionConfig] = useState<any>(null);
  const [currentProxyTarget, setCurrentProxyTarget] = useState<string>('');

  // Function to get current proxy configuration
  const getCurrentProxyTarget = useCallback(async () => {
    try {
      const response = await fetch('/proxy-config');
      if (response.ok) {
        const data = await response.json();
        setCurrentProxyTarget(data.target);
        return data.target;
      }
    } catch (error) {
      console.error('Failed to get proxy config:', error);
    }
    return null;
  }, []);

  // Function to update proxy configuration
  const updateProxyTarget = useCallback(async (chromadbUrl: string) => {
    try {
      const response = await fetch('/configure-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chromadbUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentProxyTarget(data.target);
        console.log('🔧 Proxy updated for Swagger UI:', data.target);
        return true;
      }
    } catch (error) {
      console.error('Failed to update proxy config:', error);
    }
    return false;
  }, []);

  const loadDocsUrl = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const config = apiService.getConnectionConfig();
      if (!config) {
        throw new Error('No connection configuration found. Please connect to a Chroma instance first.');
      }

      setConnectionConfig(config);

      // Get current proxy target
      const proxyTarget = await getCurrentProxyTarget();

      // Check if we need to update the proxy to match the connection config
      if (proxyTarget !== config.connectionString) {
        console.log('🔄 Updating proxy for Swagger UI from', proxyTarget, 'to', config.connectionString);
        await updateProxyTarget(config.connectionString);
      }

      // Construct the Swagger docs URL
      let baseUrl = config.connectionString;

      // Remove trailing slash if present
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }

      // Add /docs to get the Swagger documentation page
      const swaggerDocsUrl = `${baseUrl}/docs`;

      setDocsUrl(swaggerDocsUrl);

    } catch (err: any) {
      setError(err.message || 'Failed to load Swagger documentation');
      console.error('Error loading Swagger URL:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentProxyTarget, updateProxyTarget]);

  useEffect(() => {
    loadDocsUrl();

    // Set up an interval to check for connection config changes
    const interval = setInterval(() => {
      const config = apiService.getConnectionConfig();
      if (config && config.connectionString !== connectionConfig?.connectionString) {
        console.log('🔄 Connection config changed, reloading Swagger UI');
        loadDocsUrl();
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [loadDocsUrl, connectionConfig?.connectionString]);

  const handleRetry = () => {
    loadDocsUrl();
  };

  const openInNewTab = () => {
    if (docsUrl) {
      window.open(docsUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading API Documentation</h3>
          <p className="text-gray-600">Connecting to your Chroma instance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center max-w-md">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load API Documentation</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!docsUrl) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center max-w-md">
          <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No API Documentation Available</h3>
          <p className="text-gray-600">Unable to find Swagger documentation for the connected Chroma instance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Connection Info Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm font-medium text-gray-900">Connected to Chroma Instance</span>
          </div>
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <ArrowPathIcon className="h-3 w-3 mr-1" />
            Refresh
          </button>
        </div>
        <div className="mt-2 flex items-center text-sm text-gray-600">
          <LinkIcon className="h-4 w-4 mr-1" />
          <span className="font-mono">{connectionConfig?.connectionString}</span>
        </div>
        {currentProxyTarget && (
          <div className="mt-1 flex items-center text-xs text-gray-500">
            <Cog6ToothIcon className="h-3 w-3 mr-1" />
            <span>Proxy Target: {currentProxyTarget}</span>
          </div>
        )}
        <div className="mt-1 text-xs text-gray-500">
          API Documentation: {docsUrl}
        </div>
        <div className="mt-2 flex space-x-2">
          <button
            onClick={openInNewTab}
            className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowTopRightOnSquareIcon className="h-3 w-3 mr-1" />
            Open in New Tab
          </button>
        </div>
      </div>

      {/* Embedded Swagger UI via iframe */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ height: '800px' }}>
        <iframe
          key={docsUrl} // Force iframe reload when URL changes
          src={docsUrl}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          title="Chroma API Documentation"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
          onLoad={() => console.log('📄 Swagger UI loaded:', docsUrl)}
          onError={() => console.error('❌ Failed to load Swagger UI:', docsUrl)}
        />
      </div>
    </div>
  );
};

export default SwaggerUIComponent;
