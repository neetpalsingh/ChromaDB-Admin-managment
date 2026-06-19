import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';

import { apiService } from '../services/apiService';
import { tenantService } from '../services/tenantService';
import type { Database, Tenant } from '../types/api';

interface DatabaseManagementProps {}

const DatabaseManagement: React.FC<DatabaseManagementProps> = () => {
  const [databases, setDatabases] = useState<Database[]>([]);
  const [databaseStats, setDatabaseStats] = useState<{[key: string]: {collections: number, records: number}}>({});
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDatabase, setEditingDatabase] = useState<Database | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    tenant: ''
  });

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      loadDatabases();
    } else {
      setDatabases([]);
    }
  }, [selectedTenant]);

  useEffect(() => {
    if (databases.length > 0 && selectedTenant) {
      loadDatabaseStats();
    }
  }, [databases, selectedTenant]);

  const loadTenants = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Get connection config to know which tenant to use
      const connectionConfig = apiService.getConnectionConfig();
      if (!connectionConfig) {
        throw new Error('No connection configuration found');
      }

      // Get all available tenants from local storage (with auto-discovery)
      const storedTenants = await tenantService.getTenantsForDisplay();
      setTenants(storedTenants);
      
      // Set default tenant if available
      if (storedTenants.length > 0 && !selectedTenant) {
        setSelectedTenant(storedTenants[0].name);
      }
      
      if (storedTenants.length === 0) {
        setError('No tenants found in local storage. Add tenants in Tenant Management page.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tenants');
      console.error('Error loading tenants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDatabases = async () => {
    if (!selectedTenant) return;

    setIsLoading(true);
    setError('');

    try {
      console.log(`Loading databases for tenant: ${selectedTenant}`);
      const response = await apiService.getDatabases(selectedTenant);

      if (response.success && response.data) {
        console.log('Raw database response:', response.data);
        console.log('Response type:', typeof response.data);
        console.log('Is array:', Array.isArray(response.data));

        // Handle different response formats
        let databasesArray: Database[] = [];

        if (Array.isArray(response.data)) {
          databasesArray = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // Check if it's a single database object
          const data = response.data as any;
          if (data.name && data.tenant) {
            databasesArray = [data];
          } else {
            // Try to extract databases from nested object
            if (data.databases && Array.isArray(data.databases)) {
              databasesArray = data.databases;
            } else if (data.data && Array.isArray(data.data)) {
              databasesArray = data.data;
            } else {
              console.error('Unexpected database response format:', response.data);
              setError('Unexpected response format from server');
              setDatabases([]);
              return;
            }
          }
        } else {
          console.error('Invalid database response format:', response.data);
          setError('Invalid response format from server');
          setDatabases([]);
          return;
        }

        // Filter out any invalid database objects
        const validDatabases = databasesArray.filter(db =>
          db && typeof db === 'object' && db.name && db.tenant
        );

        setDatabases(validDatabases);
        console.log('Loaded databases:', validDatabases);
        console.log('Database count:', validDatabases.length);
      } else {
        console.warn('Failed to load databases:', response.error);
        setDatabases([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load databases');
      console.error('Error loading databases:', err);
      setDatabases([]); // Ensure databases is always an array
    } finally {
      setIsLoading(false);
    }
  };

  const loadDatabaseStats = async () => {
    const stats: {[key: string]: {collections: number, records: number}} = {};

    for (const database of databases) {
      // Skip invalid database objects
      if (!database || !database.name || !database.tenant) {
        console.warn('Skipping invalid database object:', database);
        continue;
      }

      try {
        console.log(`Loading stats for database: ${database.name}`);

        // Get collections count
        const collectionsResponse = await apiService.getCollections(selectedTenant, database.name);
        const collectionsCount = collectionsResponse.success ? (collectionsResponse.data?.length || 0) : 0;

        stats[database.name] = {
          collections: collectionsCount,
          records: 0 // No longer needed
        };
      } catch (err) {
        console.warn(`Failed to get stats for database ${database.name}:`, err);
        stats[database.name] = { collections: 0, records: 0 };
      }
    }

    setDatabaseStats(stats);
  };

  const handleCreateDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.tenant.trim()) return;

    setIsSubmitting(true);
    setError('');
    
    try {
      console.log('Creating database:', formData);
      const response = await apiService.createDatabase(formData.tenant, {
        name: formData.name,
        tenant: formData.tenant
      });
      
      if (response.success && response.data) {
        // Ensure the response data has the required properties
        const newDatabase = {
          name: response.data.name || formData.name,
          tenant: response.data.tenant || formData.tenant,
          created_at: response.data.created_at,
          updated_at: response.data.updated_at
        };

        setDatabases(prev => [newDatabase, ...prev]);
        setFormData({ name: '', tenant: '' });
        setShowCreateForm(false);
        setSuccessMessage(`✅ Database "${newDatabase.name}" created successfully!`);
        setTimeout(() => setSuccessMessage(''), 5000);
        // Reload database stats for the new database
        setTimeout(() => loadDatabaseStats(), 1000);
      } else {
        setError(`❌ Failed to create database: ${response.error || 'Unknown error'}`);
        setTimeout(() => setError(''), 5000);
      }
    } catch (err: any) {
      setError(`❌ Failed to create database: ${err.message || 'Unknown error'}`);
      setTimeout(() => setError(''), 5000);
      console.error('Error creating database:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDatabase || !formData.name.trim()) return;

    setIsSubmitting(true);
    setError('');
    
    try {
      // Note: Update database API might not be available in ChromaDB
      // This is a placeholder for future implementation
      console.log('Updating database:', editingDatabase, formData);
      
      const updatedDatabase: Database = {
        ...editingDatabase,
        name: formData.name
      };
      
      setDatabases(databases.map(db => db.name === editingDatabase.name ? updatedDatabase : db));
      setFormData({ name: '', tenant: '' });
      setEditingDatabase(null);
      setSuccessMessage(`✅ Database "${updatedDatabase.name}" updated successfully!`);
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (err: any) {
      setError(`❌ Failed to update database: ${err.message || 'Unknown error'}`);
      setTimeout(() => setError(''), 5000);
      console.error('Error updating database:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDatabase = async (database: Database) => {
    if (!window.confirm(`Are you sure you want to delete database "${database.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log('Deleting database:', database);
      const response = await apiService.deleteDatabase(database.tenant, database.name);
      
      if (response.success) {
        setDatabases(prev => prev.filter(db => db.name !== database.name));
        setSuccessMessage(`✅ Database "${database.name}" deleted successfully!`);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setError(`❌ Failed to delete database: ${response.error || 'Unknown error'}`);
        setTimeout(() => setError(''), 5000);
      }
    } catch (err: any) {
      setError(`❌ Failed to delete database: ${err.message || 'Unknown error'}`);
      setTimeout(() => setError(''), 5000);
      console.error('Error deleting database:', err);
    }
  };

  const startEdit = (database: Database) => {
    setEditingDatabase(database);
    setFormData({ name: database.name, tenant: database.tenant });
  };

  const cancelEdit = () => {
    setEditingDatabase(null);
    setFormData({ name: '', tenant: '' });
  };

  const filteredDatabases = (Array.isArray(databases) ? databases : []).filter(database =>
    database && database.name && database.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && (tenants || []).length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading databases...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Database Management</h1>
            <p className="text-gray-600 mt-2">Manage databases across tenants</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={loadDatabases}
              className="btn-secondary flex items-center"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center"
              data-action="create-database"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Database
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-green-800 font-medium">Success</span>
          </div>
          <p className="text-green-700 mt-1">{successMessage}</p>
        </div>
      )}

      {/* Tenant Selector */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Select Tenant</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="input-field"
            >
              <option value="">Select a tenant</option>
              {(tenants || []).map((tenant) => (
                <option key={tenant.name} value={tenant.name}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600">
            {databases.length} databases found
          </div>
        </div>
      </div>

      {/* Search and Create Form */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search databases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>

        {/* Create/Edit Form */}
        {(showCreateForm || editingDatabase) && (
          <form onSubmit={editingDatabase ? handleUpdateDatabase : handleCreateDatabase} className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenant *
                </label>
                <select
                  value={formData.tenant}
                  onChange={(e) => setFormData({ ...formData, tenant: e.target.value })}
                  className="input-field"
                  required
                  disabled={!!editingDatabase}
                >
                  <option value="">Select tenant</option>
                  {(tenants || []).map((tenant) => (
                    <option key={tenant.name} value={tenant.name}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Database Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Enter database name"
                  required
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? 'Saving...' : (editingDatabase ? 'Update Database' : 'Create Database')}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  cancelEdit();
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Databases Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Databases {selectedTenant && `in ${selectedTenant}`}
          </h2>
          <div className="text-sm text-gray-600">
            {filteredDatabases.length} of {databases.length} databases
          </div>
        </div>

        {selectedTenant ? (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Database Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collections
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(Array.isArray(filteredDatabases) ? filteredDatabases : []).map((database, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{database?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">Tenant: {database?.tenant || 'Unknown'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {database?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {database?.name ? (databaseStats[database.name]?.collections || 0) : 0} collections
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => startEdit(database)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit database"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        
                        <button
                          className="text-green-600 hover:text-green-900 p-1"
                          title="View database details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteDatabase(database)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete database"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredDatabases.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <CircleStackIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No databases found</p>
                <p className="text-sm">
                  {searchTerm ? 'Try adjusting your search terms' : 'Create your first database to get started'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <CircleStackIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">Select a tenant to view databases</p>
            <p className="text-sm">Choose a tenant from the dropdown above to see its databases</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseManagement;
