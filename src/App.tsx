import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import {
  HomeIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  CogIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';

// Import API service
import { apiService } from './services/apiService';

// Import Dark Mode Context
import { DarkModeProvider, useDarkMode } from './contexts/DarkModeContext';


// Import components
import EndpointsPage from './components/EndpointsPage';
import Dashboard from './components/Dashboard';
import TenantManagement from './components/TenantManagement';
import DatabaseManagement from './components/DatabaseManagement';
import DataOperations from './components/DataOperations';
import ChromaConnectionPage from './components/ChromaConnectionPage';
import ErrorBoundary from './components/ErrorBoundary';
import ToggleSwitch from './components/ToggleSwitch';

// Create a client for React Query
const queryClient = new QueryClient();

// Navigation component
function Navigation() {
  const connectionConfig = apiService.getConnectionConfig();
  
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between h-12">
          <div className="flex items-center">
            <CodeBracketIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 icon-compact" />
            <span className="ml-2 text-base font-bold text-gray-900 dark:text-white">ChromaDB Dashboard</span>
            <div className="ml-3 flex items-center">
              <div className={`w-2 h-2 rounded-full ${connectionConfig ? 'bg-green-500' : 'bg-red-500'}`} title={connectionConfig ? 'Connected' : 'Disconnected'}></div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors nav-compact">
              <HomeIcon className="h-4 w-4 mr-1 icon-extra-compact" />
              Dashboard
            </Link>
            <Link to="/tenants" className="flex items-center px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors nav-compact">
              <CodeBracketIcon className="h-4 w-4 mr-1 icon-extra-compact" />
              Tenants
            </Link>
            <Link to="/databases" className="flex items-center px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors nav-compact">
              <CircleStackIcon className="h-4 w-4 mr-1 icon-extra-compact" />
              Databases
            </Link>
            <Link to="/data" className="flex items-center px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors nav-compact">
              <DocumentTextIcon className="h-4 w-4 mr-1 icon-extra-compact" />
              Data
            </Link>
            <Link to="/endpoints" className="flex items-center px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors nav-compact">
              <CodeBracketIcon className="h-4 w-4 mr-1 icon-extra-compact" />
              API Reference
            </Link>
            <Link to="/settings" className="flex items-center px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors nav-compact">
              <CogIcon className="h-4 w-4 mr-1 icon-extra-compact" />
              Settings
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Home component (Dashboard)
function Home() {
  return <Dashboard />;
}

// Endpoints component
function Endpoints() {
  return <EndpointsPage />;
}





// Settings component
function Settings({ onDisconnect }: { onDisconnect: () => void }) {
  const defaultChromaURL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CHROMADB_URL) || 'http://localhost:8000';
  const [baseURL, setBaseURL] = useState(defaultChromaURL);
  const [apiKey, setApiKey] = useState('');
  const [autoSave, setAutoSave] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [connectionConfig, setConnectionConfig] = useState<any>(null);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      // Update API service configuration
      apiService.setBaseURL(baseURL);
      apiService.setAPIKey(apiKey);

      // Save to localStorage
      localStorage.setItem('api_base_url', baseURL);
      localStorage.setItem('api_key', apiKey);
      localStorage.setItem('auto_save', autoSave.toString());

      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    try {
      const isConnected = await apiService.testConnection();
      if (isConnected) {
        setMessage('Connection successful!');
      } else {
        setMessage('Connection failed');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Connection test failed');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedBaseURL = localStorage.getItem('api_base_url');
    const savedApiKey = localStorage.getItem('api_key');
    const savedAutoSave = localStorage.getItem('auto_save');

    if (savedBaseURL) setBaseURL(savedBaseURL);
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedAutoSave) setAutoSave(savedAutoSave === 'true');

    // Load connection configuration
    const config = apiService.getConnectionConfig();
    setConnectionConfig(config);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure your vector database API dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Connection Information */}
        {connectionConfig && (
          <div className="card lg:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Current Connection</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Connection String</label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                    <code className="text-sm text-gray-800 dark:text-gray-200">{connectionConfig.connectionString}</code>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Authentication Type</label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                    <span className="text-sm text-gray-800 dark:text-gray-200 capitalize">{connectionConfig.authType}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tenant</label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                    <span className="text-sm text-gray-800 dark:text-gray-200">{connectionConfig.tenant}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Database</label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                    <span className="text-sm text-gray-800 dark:text-gray-200">{connectionConfig.database}</span>
                  </div>
                </div>
                {connectionConfig.authType === 'token' && connectionConfig.token && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API Token</label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                      <span className="text-sm text-gray-800 dark:text-gray-200">••••••••{connectionConfig.token.slice(-4)}</span>
                    </div>
                  </div>
                )}
                {connectionConfig.authType === 'basic' && connectionConfig.username && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                        <span className="text-sm text-gray-800 dark:text-gray-200">{connectionConfig.username}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                        <span className="text-sm text-gray-800 dark:text-gray-200">••••••••</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={onDisconnect}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
                >
                  Disconnect from Chroma Instance
                </button>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  This will disconnect you from the current Chroma instance and return you to the connection page.
                </p>
              </div>
            </div>
          </div>
        )}
        {/* API Configuration */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">API Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Base URL</label>
              <input
                type="text"
                value={baseURL}
                onChange={(e) => setBaseURL(e.target.value)}
                placeholder="http://localhost:8000"
                className="input-field"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your vector database API server URL</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="input-field"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Authentication token for API access</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={testConnection}
                className="btn-secondary flex-1"
              >
                Test Connection
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary flex-1"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('successful') || message.includes('success')
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Preferences</h3>
          <div className="space-y-4">
            <ToggleSwitch
              enabled={autoSave}
              onChange={setAutoSave}
              label="Auto-save requests"
              description="Automatically save API requests for later use"
            />
            <ToggleSwitch
              enabled={isDarkMode}
              onChange={toggleDarkMode}
              label="Dark mode"
              description="Switch between light and dark theme"
            />
          </div>
        </div>
      </div>

      {/* API Information */}
      <div className="card mt-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">API Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Total Endpoints:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">28</span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Authentication:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Bearer Token</span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Base Path:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">/api/v2</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App component
function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has already connected to ChromaDB
    const checkConnection = () => {
      const connected = apiService.isConnected();
      setIsConnected(connected);
      setIsLoading(false);
    };

    checkConnection();
  }, []);

  const handleConnectionSuccess = (config: any) => {
    apiService.setConnectionConfig(config);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    localStorage.removeItem('chroma_connection_config');
    setIsConnected(false);
    // Reset API service
    apiService.setBaseURL('');
    apiService.setAPIKey('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <DarkModeProvider>
        <QueryClientProvider client={queryClient}>
          <ChromaConnectionPage onConnectionSuccess={handleConnectionSuccess} />
        </QueryClientProvider>
      </DarkModeProvider>
    );
  }

  return (
    <DarkModeProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navigation />
            <main>
              <Routes>
                <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
                <Route path="/tenants" element={<ErrorBoundary><TenantManagement /></ErrorBoundary>} />
                <Route path="/databases" element={<ErrorBoundary><DatabaseManagement /></ErrorBoundary>} />
                <Route path="/data" element={<ErrorBoundary><DataOperations /></ErrorBoundary>} />
                <Route path="/endpoints" element={<ErrorBoundary><Endpoints /></ErrorBoundary>} />
                <Route path="/settings" element={<ErrorBoundary><Settings onDisconnect={handleDisconnect} /></ErrorBoundary>} />
              </Routes>
            </main>
          </div>
        </Router>
      </QueryClientProvider>
    </DarkModeProvider>
  );
}

export default App;
