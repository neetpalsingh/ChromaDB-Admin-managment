import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  CodeBracketIcon,
  EyeIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/apiService';
import { tenantService } from '../services/tenantService';
import type { Tenant, Database, Collection } from '../types/api';

interface DashboardStats {
  totalTenants: number;
  totalDatabases: number;
  totalCollections: number;
  systemStatus: 'healthy' | 'unhealthy' | 'unknown';
  lastUpdated: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalTenants: 0,
    totalDatabases: 0,
    totalCollections: 0,
    systemStatus: 'unknown',
    lastUpdated: new Date().toLocaleString()
  });
  const [recentTenants, setRecentTenants] = useState<Tenant[]>([]);
  const [recentDatabases, setRecentDatabases] = useState<Database[]>([]);
  const [recentCollections, setRecentCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Helper function to format dates with relative time for recent items
  const formatDateWithRelative = (date: Date | null): string => {
    if (!date) return 'N/A';

    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Loading dashboard data...');
      
      // Get connection config to know which tenant/database to use
      const connectionConfig = apiService.getConnectionConfig();
      console.log('Connection config:', connectionConfig);
      
      if (!connectionConfig) {
        throw new Error('No connection configuration found');
      }

      // Check system health
      console.log('Testing health check...');
      const healthCheck = await apiService.getHealthCheck();
      console.log('Health check result:', healthCheck);
      const systemStatus = healthCheck.success ? 'healthy' : 'unhealthy';

      // Get all available tenants from local storage (with auto-discovery)
      console.log('🔍 Getting all tenants from local storage (with auto-discovery)...');
      const allTenants = await tenantService.getTenantsForDisplay();
      const availableTenants = await tenantService.getTenantNames();

      console.log(`✅ Found ${availableTenants.length} tenants in local storage:`, availableTenants);

      // Calculate totals across all tenants
      let totalDatabases = 0;
      let totalCollections = 0;
      const allDatabases: Database[] = [];
      const allCollections: Collection[] = [];

      console.log('Calculating totals across all tenants...');
      
      // Get databases and collections for each tenant
      for (const tenant of allTenants) {
        try {
          console.log(`Getting databases for tenant: ${tenant.name}`);
          const tenantDbResponse = await apiService.getDatabases(tenant.name);
          
          if (tenantDbResponse.success && tenantDbResponse.data) {
            const tenantDatabases = tenantDbResponse.data;
            totalDatabases += tenantDatabases.length;
            allDatabases.push(...tenantDatabases);
            
            // Get collections for each database in this tenant
            for (const db of tenantDatabases) {
              try {
                console.log(`Getting collections for tenant: ${tenant.name}, database: ${db.name}`);
                const tenantCollectionsResponse = await apiService.getCollections(tenant.name, db.name);
                
                if (tenantCollectionsResponse.success && tenantCollectionsResponse.data) {
                  const tenantCollections = tenantCollectionsResponse.data;
                  totalCollections += tenantCollections.length;
                  allCollections.push(...tenantCollections);
                }
              } catch (err) {
                console.log(`Failed to get collections for tenant ${tenant.name}, database ${db.name}:`, err);
              }
            }
          }
        } catch (err) {
          console.log(`Failed to get databases for tenant ${tenant.name}:`, err);
        }
      }

      console.log('Final dashboard data:', {
        totalTenants: allTenants.length,
        totalDatabases,
        totalCollections,
        allTenants: allTenants.slice(0, 5),
        allDatabases: allDatabases.slice(0, 5),
        allCollections: allCollections.slice(0, 5)
      });

      // Sort and set recent items - show latest changes first
      const sortedTenants = [...allTenants].sort((a, b) => {
        const dateA = new Date(a.created_at || a.updated_at || '1970-01-01').getTime();
        const dateB = new Date(b.created_at || b.updated_at || '1970-01-01').getTime();
        return dateB - dateA; // Latest first
      });

      const sortedDatabases = [...allDatabases].sort((a, b) => {
        const dateA = new Date(a.created_at || a.updated_at || '1970-01-01').getTime();
        const dateB = new Date(b.created_at || b.updated_at || '1970-01-01').getTime();
        return dateB - dateA; // Latest first
      });

      const sortedCollections = [...allCollections].sort((a, b) => {
        const dateA = new Date(a.created_at || a.updated_at || '1970-01-01').getTime();
        const dateB = new Date(b.created_at || b.updated_at || '1970-01-01').getTime();
        return dateB - dateA; // Latest first
      });

      setRecentTenants(sortedTenants.slice(0, 5)); // Show 5 most recent tenants
      setRecentDatabases(sortedDatabases.slice(0, 5)); // Show 5 most recent databases
      setRecentCollections(sortedCollections.slice(0, 5)); // Show 5 most recent collections
      
      setStats({
        totalTenants: allTenants.length,
        totalDatabases: totalDatabases,
        totalCollections: totalCollections,
        systemStatus,
        lastUpdated: new Date().toLocaleString()
      });
      
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'unhealthy': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircleIcon className="h-5 w-5" />;
      case 'unhealthy': return <ExclamationTriangleIcon className="h-5 w-5" />;
      default: return <ClockIcon className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vector Database Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Overview of your vector database system</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadDashboardData}
              className="btn-secondary flex items-center text-sm py-1.5 px-3"
            >
              <ArrowPathIcon className="h-3 w-3 mr-1 icon-extra-compact" />
              Refresh
            </button>
            <button
              onClick={() => {
                apiService.debugConfig();
                console.log('Current connection config:', apiService.getConnectionConfig());
              }}
              className="btn-secondary flex items-center text-sm py-1.5 px-3"
            >
              Debug Config
            </button>
            <button
              onClick={async () => {
                console.log('Starting tenant discovery debug...');
                await apiService.debugTenantDiscovery();
                alert('Tenant discovery debug completed. Check browser console for detailed logs.');
              }}
              className="btn-secondary flex items-center"
            >
              Debug Tenants
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card card-compact">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CodeBracketIcon className="h-5 w-5 text-blue-600 icon-compact" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Total Tenants</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalTenants}</p>
            </div>
          </div>
        </div>

        <div className="card card-compact">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CircleStackIcon className="h-5 w-5 text-green-600 icon-compact" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Total Databases</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalDatabases}</p>
            </div>
          </div>
        </div>

        <div className="card card-compact">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-purple-600 icon-compact" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Total Collections</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalCollections}</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="card mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
            <p className="text-sm text-gray-600">Current system health and performance</p>
          </div>
          <div className={`flex items-center px-3 py-1 rounded-full ${getStatusColor(stats.systemStatus)}`}>
            {getStatusIcon(stats.systemStatus)}
            <span className="ml-2 text-sm font-medium capitalize">{stats.systemStatus}</span>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          Last updated: {stats.lastUpdated}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tenants */}
        <div className="card card-compact">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">Recent Tenants</h3>
            <button
              onClick={() => navigate('/tenants')}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              View All
            </button>
          </div>
          <div className="space-y-2 space-compact">
            {recentTenants.map((tenant, index) => {
              const createdDate = tenant.created_at ? new Date(tenant.created_at) : null;
              const updatedDate = tenant.updated_at ? new Date(tenant.updated_at) : null;
              const latestDate = updatedDate && createdDate && updatedDate > createdDate ? updatedDate : createdDate;
              const isUpdated = updatedDate && createdDate && updatedDate > createdDate;

              return (
                <div key={index} className="p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{tenant.name}</p>
                      <p className="text-xs text-gray-500">
                        {isUpdated ? 'Updated' : 'Created'} {formatDateWithRelative(latestDate)}
                      </p>
                    </div>
                    {index === 0 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Latest
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Databases */}
        <div className="card card-compact">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">Recent Databases</h3>
            <button
              onClick={() => navigate('/databases')}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              View All
            </button>
          </div>
          <div className="space-y-2 space-compact">
            {recentDatabases.map((db, index) => {
              const createdDate = db.created_at ? new Date(db.created_at) : null;
              const updatedDate = db.updated_at ? new Date(db.updated_at) : null;
              const latestDate = updatedDate && createdDate && updatedDate > createdDate ? updatedDate : createdDate;
              const isUpdated = updatedDate && createdDate && updatedDate > createdDate;

              return (
                <div key={index} className="p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{db.name}</p>
                      <p className="text-xs text-gray-500">Tenant: {db.tenant}</p>
                      <p className="text-xs text-gray-400">
                        {isUpdated ? 'Updated' : 'Created'} {formatDateWithRelative(latestDate)}
                      </p>
                    </div>
                    {index === 0 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Latest
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Collections */}
        <div className="card card-compact">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">Recent Collections</h3>
            <button
              onClick={() => navigate('/data')}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              View All
            </button>
          </div>
          <div className="space-y-2 space-compact">
            {recentCollections.map((collection, index) => {
              const createdDate = collection.created_at ? new Date(collection.created_at) : null;
              const updatedDate = collection.updated_at ? new Date(collection.updated_at) : null;
              const latestDate = updatedDate && createdDate && updatedDate > createdDate ? updatedDate : createdDate;
              const isUpdated = updatedDate && createdDate && updatedDate > createdDate;

              return (
                <div key={index} className="p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate" title={collection.name}>
                        {collection.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {collection.database} • {collection.tenant}
                      </p>
                      <p className="text-xs text-gray-400">
                        {isUpdated ? 'Updated' : 'Created'} {formatDateWithRelative(latestDate)}
                      </p>
                    </div>
                    {index === 0 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Latest
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card card-compact mt-6">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/tenants')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <PlusIcon className="h-5 w-5 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Create Tenant</p>
              <p className="text-sm text-gray-600">Add a new tenant</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/databases')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <CircleStackIcon className="h-5 w-5 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Add Database</p>
              <p className="text-sm text-gray-600">Create new database</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
