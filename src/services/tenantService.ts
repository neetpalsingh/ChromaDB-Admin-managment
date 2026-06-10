import { apiService } from './apiService';
import type { Tenant } from '../types/api';

interface StoredTenant {
  name: string;
  addedAt: string;
  lastChecked: string;
  exists: boolean;
}

class TenantService {
  private readonly STORAGE_KEY = 'chromadb_tenants';
  private readonly TENANT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Get current Chroma instance URL
  private getCurrentChromaInstanceUrl(): string {
    const connectionConfig = apiService.getConnectionConfig();
    return connectionConfig?.connectionString || '';
  }

  // Auto-discover and add default tenants if none exist
  async autoDiscoverDefaultTenants(): Promise<StoredTenant[]> {
    const currentInstanceUrl = this.getCurrentChromaInstanceUrl();
    if (!currentInstanceUrl) {
      return [];
    }

    const storageKey = `${this.STORAGE_KEY}_${btoa(currentInstanceUrl)}`;
    const existingTenants = this.getStoredTenantsForInstance(storageKey);

    // If we already have tenants for this instance, return them
    if (existingTenants.length > 0) {
      return existingTenants;
    }

    console.log('No tenants found for this instance. Auto-discovering default tenants...');

    // Try to discover default tenant with default database
    console.log('🔍 Checking for default_tenant with default_database...');

    try {
      // First check if default_tenant exists
      const tenantResponse = await apiService.getTenant('default_tenant');

      if (tenantResponse.success && tenantResponse.data) {
        // Check if default_database exists in default_tenant
        try {
          const databaseResponse = await apiService.getDatabases('default_tenant');

          if (databaseResponse.success && databaseResponse.data) {
            const hasDefaultDatabase = databaseResponse.data.some(db => db.name === 'default_database');

            if (hasDefaultDatabase) {
              const tenant: StoredTenant = {
                name: 'default_tenant',
                addedAt: new Date().toISOString(),
                lastChecked: new Date().toISOString(),
                exists: true
              };

              console.log('✅ Found default_tenant with default_database - Auto-adding to tenant list');
              return [tenant];
            } else {
              console.log('⚠️ default_tenant exists but no default_database found');
            }
          }
        } catch (dbError) {
          console.log('⚠️ Could not check databases for default_tenant');
        }
      }
    } catch (error) {
      console.log('❌ default_tenant not found or not accessible');
    }

    // No default tenant found
    console.log('❌ No default_tenant with default_database found');
    return [];
  }

  // Get stored tenants for a specific instance
  private getStoredTenantsForInstance(storageKey: string): StoredTenant[] {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const tenants: StoredTenant[] = JSON.parse(stored);
        // Filter out tenants that haven't been checked recently or don't exist
        return tenants.filter(tenant =>
          tenant.exists &&
          (Date.now() - new Date(tenant.lastChecked).getTime()) < this.TENANT_CACHE_DURATION
        );
      }
    } catch (error) {
      console.error('Error reading stored tenants:', error);
    }
    return [];
  }

  // Get all stored tenants (with auto-discovery)
  async getStoredTenants(): Promise<StoredTenant[]> {
    return await this.autoDiscoverDefaultTenants();
  }

  // Add a new tenant to the list
  async addTenant(tenantName: string): Promise<{ success: boolean; message: string; tenant?: StoredTenant }> {
    try {
      // Check if tenant already exists in storage
      const existingTenants = await this.getStoredTenants();
      if (existingTenants.some(t => t.name === tenantName)) {
        return { success: false, message: 'Tenant already exists in the list' };
      }

      // Check if tenant exists in ChromaDB
      console.log(`Checking if tenant "${tenantName}" exists in ChromaDB...`);
      const tenantResponse = await apiService.getTenant(tenantName);
      
      if (tenantResponse.success && tenantResponse.data) {
        // Tenant exists, add to storage
        const newTenant: StoredTenant = {
          name: tenantName,
          addedAt: new Date().toISOString(),
          lastChecked: new Date().toISOString(),
          exists: true
        };

        const currentInstanceUrl = this.getCurrentChromaInstanceUrl();
        const storageKey = `${this.STORAGE_KEY}_${btoa(currentInstanceUrl)}`;
        const updatedTenants = [...existingTenants, newTenant];
        localStorage.setItem(storageKey, JSON.stringify(updatedTenants));
        
        console.log(`Tenant "${tenantName}" added successfully`);
        return { 
          success: true, 
          message: `Tenant "${tenantName}" added successfully`, 
          tenant: newTenant 
        };
      } else {
        return { 
          success: false, 
          message: `Tenant "${tenantName}" does not exist in ChromaDB instance` 
        };
      }
    } catch (error: any) {
      console.error('Error adding tenant:', error);
      return { 
        success: false, 
        message: `Error checking tenant: ${error.message}` 
      };
    }
  }

  // Remove a tenant from the list
  async removeTenant(tenantName: string): Promise<{ success: boolean; message: string }> {
    try {
      const currentInstanceUrl = this.getCurrentChromaInstanceUrl();
      if (!currentInstanceUrl) {
        return { success: false, message: 'No Chroma instance connected' };
      }

      const storageKey = `${this.STORAGE_KEY}_${btoa(currentInstanceUrl)}`;
      const existingTenants = await this.getStoredTenants();
      const updatedTenants = existingTenants.filter(t => t.name !== tenantName);

      if (updatedTenants.length === existingTenants.length) {
        return { success: false, message: 'Tenant not found in the list' };
      }

      localStorage.setItem(storageKey, JSON.stringify(updatedTenants));
      console.log(`Tenant "${tenantName}" removed successfully`);
      return { success: true, message: `Tenant "${tenantName}" removed successfully` };
    } catch (error) {
      console.error('Error removing tenant:', error);
      return { success: false, message: 'Error removing tenant' };
    }
  }

  // Check if a tenant exists in ChromaDB
  async checkTenantExists(tenantName: string): Promise<{ exists: boolean; message: string }> {
    try {
      console.log(`Checking if tenant "${tenantName}" exists...`);
      const tenantResponse = await apiService.getTenant(tenantName);
      
      if (tenantResponse.success && tenantResponse.data) {
        return { exists: true, message: `Tenant "${tenantName}" exists in ChromaDB` };
      } else {
        return { exists: false, message: `Tenant "${tenantName}" does not exist in ChromaDB` };
      }
    } catch (error: any) {
      console.error('Error checking tenant:', error);
      return { exists: false, message: `Error checking tenant: ${error.message}` };
    }
  }

  // Refresh tenant existence status
  async refreshTenantStatus(tenantName: string): Promise<{ success: boolean; message: string }> {
    try {
      const currentInstanceUrl = this.getCurrentChromaInstanceUrl();
      if (!currentInstanceUrl) {
        return { success: false, message: 'No Chroma instance connected' };
      }

      const storageKey = `${this.STORAGE_KEY}_${btoa(currentInstanceUrl)}`;
      const existingTenants = await this.getStoredTenants();
      const tenantIndex = existingTenants.findIndex(t => t.name === tenantName);

      if (tenantIndex === -1) {
        return { success: false, message: 'Tenant not found in storage' };
      }

      // Check if tenant still exists
      const checkResult = await this.checkTenantExists(tenantName);

      // Update the tenant status
      existingTenants[tenantIndex] = {
        ...existingTenants[tenantIndex],
        lastChecked: new Date().toISOString(),
        exists: checkResult.exists
      };

      localStorage.setItem(storageKey, JSON.stringify(existingTenants));

      return {
        success: true,
        message: checkResult.exists
          ? `Tenant "${tenantName}" is still active`
          : `Tenant "${tenantName}" no longer exists`
      };
    } catch (error: any) {
      console.error('Error refreshing tenant status:', error);
      return { success: false, message: `Error refreshing tenant: ${error.message}` };
    }
  }

  // Get tenant names for dropdowns
  async getTenantNames(): Promise<string[]> {
    const tenants = await this.getStoredTenants();
    return tenants.map(t => t.name);
  }

  // Convert stored tenants to Tenant objects for display
  async getTenantsForDisplay(): Promise<Tenant[]> {
    const tenants = await this.getStoredTenants();
    return tenants.map(storedTenant => ({
      name: storedTenant.name,
      created_at: storedTenant.addedAt,
      updated_at: storedTenant.lastChecked
    }));
  }

  // Clear all stored tenants
  clearAllTenants(): { success: boolean; message: string } {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('All tenants cleared from storage');
      return { success: true, message: 'All tenants cleared successfully' };
    } catch (error) {
      console.error('Error clearing tenants:', error);
      return { success: false, message: 'Error clearing tenants' };
    }
  }
}

export const tenantService = new TenantService();
