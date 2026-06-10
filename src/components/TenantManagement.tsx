import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

import { apiService } from '../services/apiService';
import { tenantService } from '../services/tenantService';
import type { Tenant } from '../types/api';

interface TenantManagementProps {}

const TenantManagement: React.FC<TenantManagementProps> = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantDatabaseCounts, setTenantDatabaseCounts] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    if (tenants && tenants.length > 0) {
      loadDatabaseCounts();
    }
  }, [tenants]);

  const loadTenants = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔍 Auto-discovering tenants (including default_tenant with default_database)...');
      // Get all available tenants (with auto-discovery of default_tenant)
      const storedTenants = await tenantService.getTenantsForDisplay();
      setTenants(storedTenants);
      console.log('✅ Loaded tenants:', storedTenants);

      if (storedTenants.length === 0) {
        setError('❌ No tenants found (including default_tenant with default_database). The Chroma instance may not have any accessible tenants.');
      } else {
        console.log(`✅ Found ${storedTenants.length} tenants including default_tenant`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tenants');
      console.error('Error loading tenants:', err);
      setTenants([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDatabaseCounts = async () => {
    const counts: {[key: string]: number} = {};
    
    for (const tenant of tenants) {
      try {
        console.log(`Loading database count for tenant: ${tenant.name}`);
        const response = await apiService.getDatabases(tenant.name);
        if (response.success && response.data) {
          counts[tenant.name] = response.data.length;
        } else {
          counts[tenant.name] = 0;
        }
      } catch (err) {
        console.warn(`Failed to get database count for tenant ${tenant.name}:`, err);
        counts[tenant.name] = 0;
      }
    }
    
    setTenantDatabaseCounts(counts);
  };

  const handleCheckAndAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    setError('');
    
    try {
      const result = await tenantService.addTenant(formData.name);
      
      if (result.success) {
        setFormData({ name: '' });
        setShowCreateForm(false);
        setSuccessMessage(`✅ ${result.message}`);
        setTimeout(() => setSuccessMessage(''), 5000);
        loadTenants(); // Reload the list
        // Reload database counts for the new tenant
        setTimeout(() => loadDatabaseCounts(), 1000);
      } else {
        setError(`❌ ${result.message}`);
        setTimeout(() => setError(''), 5000);
      }
    } catch (err: any) {
      setError(`❌ Error checking tenant: ${err.message || 'Unknown error'}`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await apiService.createTenant({
        name: formData.name
      });
      
      if (response.success && response.data) {
        // After creating, add to local storage
        const addResult = await tenantService.addTenant(formData.name);
        if (addResult.success) {
          setSuccessMessage(`✅ Tenant "${response.data.name}" created and added to list successfully!`);
        } else {
          setSuccessMessage(`✅ Tenant "${response.data.name}" created successfully! (Note: Could not add to local list)`);
        }
        setFormData({ name: '' });
        setShowCreateForm(false);
        setTimeout(() => setSuccessMessage(''), 5000);
        loadTenants(); // Reload the list
        // Reload database counts for the new tenant
        setTimeout(() => loadDatabaseCounts(), 1000);
      } else {
        setError(`❌ Failed to create tenant: ${response.error || 'Unknown error'}`);
        setTimeout(() => setError(''), 5000);
      }
    } catch (err: any) {
      setError(`❌ Failed to create tenant: ${err.message || 'Unknown error'}`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant || !formData.name.trim()) return;

    setIsSubmitting(true);
    setError('');
    
    try {
      // In real usage, you'd call apiService.updateTenant()
      const updatedTenant: Tenant = {
        ...editingTenant,
        name: formData.name,
        updated_at: new Date().toISOString()
      };
      
      setTenants((tenants || []).map(t => t.name === editingTenant.name ? updatedTenant : t));
      setFormData({ name: '' });
      setEditingTenant(null);
      setSuccessMessage(`✅ Tenant "${updatedTenant.name}" updated successfully!`);
      
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      setError(`❌ Failed to update tenant: ${err.message || 'Unknown error'}`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTenant = async (tenantName: string) => {
    if (!confirm(`Are you sure you want to remove tenant "${tenantName}" from the list?`)) {
      return;
    }

    try {
      // Remove from local storage
      const removeResult = await tenantService.removeTenant(tenantName);
      if (removeResult.success) {
        setTenants((tenants || []).filter(t => t.name !== tenantName));
        setSuccessMessage(`✅ ${removeResult.message}`);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setError(`❌ ${removeResult.message}`);
        setTimeout(() => setError(''), 5000);
      }
    } catch (err: any) {
      setError(`❌ Failed to remove tenant: ${err.message || 'Unknown error'}`);
      setTimeout(() => setError(''), 5000);
    }
  };

  const startEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({ name: tenant.name });
  };

  const cancelEdit = () => {
    setEditingTenant(null);
    setFormData({ name: '' });
  };

  const filteredTenants = (tenants || []).filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading tenants...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
            <p className="text-gray-600 mt-2">Manage your vector database tenants</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={loadTenants}
              className="btn-secondary flex items-center"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center"
              data-action="create-tenant"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Tenant
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

      {/* Create/Edit Form */}
      {(showCreateForm || editingTenant) && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingTenant ? 'Edit Tenant' : 'Create New Tenant'}
          </h2>
          
          <form onSubmit={editingTenant ? handleUpdateTenant : handleCreateTenant} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tenant Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="Enter tenant name"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                <strong>Check & Add Existing:</strong> Verify if tenant exists in ChromaDB and add to list<br/>
                <strong>Create New Tenant:</strong> Create a new tenant in ChromaDB and add to list
              </p>
            </div>
            

            
            <div className="flex space-x-3">
              {editingTenant ? (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? 'Updating...' : 'Update Tenant'}
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleCheckAndAddTenant}
                    disabled={isSubmitting}
                    className="btn-secondary"
                  >
                    {isSubmitting ? 'Checking...' : 'Check & Add Existing'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary"
                  >
                    {isSubmitting ? 'Creating...' : 'Create New Tenant'}
                  </button>
                </div>
              )}
              
              <button
                type="button"
                onClick={editingTenant ? cancelEdit : () => setShowCreateForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Stats */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <div className="text-sm text-gray-600">
            {filteredTenants.length} of {(tenants || []).length} tenants
          </div>
        </div>
      </div>

      {/* Tenants List */}
      <div className="card">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Databases
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
              {filteredTenants.map((tenant, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                      <div className="text-sm text-gray-500">Active</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tenantDatabaseCounts[tenant.name] || 0} databases
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
                        onClick={() => startEdit(tenant)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Edit tenant"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteTenant(tenant.name)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete tenant"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                      
                      <button
                        className="text-gray-600 hover:text-gray-900 p-1"
                        title="View tenant details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredTenants.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {/* CodeBracketIcon is not imported, so it's commented out */}
              {/* <CodeBracketIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" /> */}
              <p className="text-lg">
                {searchTerm ? 'No tenants found matching your search' : 'No tenants created yet'}
              </p>
              <p className="text-sm">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first tenant to get started'}
              </p>
              {!searchTerm && (tenants || []).length === 0 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> If you're seeing this message, it might be because:
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 text-left">
                    <li>• Your ChromaDB version doesn't support the tenants endpoint</li>
                    <li>• No tenants have been created yet</li>
                    <li>• The tenant discovery process is still running</li>
                  </ul>
                  <p className="text-sm text-blue-800 mt-2">
                    Try creating a tenant using the "Create Tenant" button above.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{(tenants || []).length}</div>
          <div className="text-sm text-gray-600">Total Tenants</div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {(tenants || []).filter(t => t.created_at && new Date(t.created_at) > new Date(Date.now() - 86400000)).length}
          </div>
          <div className="text-sm text-gray-600">Created Today</div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">
            {(tenants || []).filter(t => t.updated_at && new Date(t.updated_at) > new Date(Date.now() - 86400000)).length}
          </div>
          <div className="text-sm text-gray-600">Updated Today</div>
        </div>
      </div>
    </div>
  );
};

export default TenantManagement;
