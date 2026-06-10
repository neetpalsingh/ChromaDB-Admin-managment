import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  EyeIcon,
  TrashIcon,
  PencilIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

import { apiService } from '../services/apiService';
import { tenantService } from '../services/tenantService';
import type { Record, Tenant, Database, Collection } from '../types/api';

interface DataOperationsProps {}

const DataOperations: React.FC<DataOperationsProps> = () => {
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [records, setRecords] = useState<Record[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLimit, setSearchLimit] = useState(10);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Popup state
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [showRecordPopup, setShowRecordPopup] = useState(false);
  const [activeTab, setActiveTab] = useState<'documents' | 'embeddings' | 'metadata'>('documents');
  const [isViewMode, setIsViewMode] = useState(true); // true for view, false for edit

  // Real data from APIs
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [databases, setDatabases] = useState<Database[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [recordCount, setRecordCount] = useState<number>(0);

  // Form state for adding records
  const [newRecord, setNewRecord] = useState({
    text: '',
    metadata: '{}',
    vector: ''
  });

  // Option to include embeddings (can be disabled for large collections)
  const [includeEmbeddings, setIncludeEmbeddings] = useState(false);

  // Loading status for retry attempts
  const [loadingStatus, setLoadingStatus] = useState<string>('');

  // Delete collection modal state
  const [showDeleteCollectionModal, setShowDeleteCollectionModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Duplicate collection modal state
  const [showDuplicateCollectionModal, setShowDuplicateCollectionModal] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  // Helper function to transform ChromaDB response to Record array
  const transformChromaResponse = (chromaResponse: any): Record[] => {
    const transformedRecords: Record[] = [];

    // Validate input
    if (!chromaResponse || typeof chromaResponse !== 'object') {
      console.error('Invalid chromaResponse:', chromaResponse);
      return [];
    }

    // Check if it's already an array of records
    if (Array.isArray(chromaResponse)) {
      console.log('Response is already an array, returning as-is');
      return chromaResponse;
    }

    // Check if we have the expected ChromaDB format with ids array
    if (!chromaResponse.ids || !Array.isArray(chromaResponse.ids)) {
      console.error('ChromaDB response missing ids array:', chromaResponse);
      return [];
    }

    if (chromaResponse.ids.length > 0) {
      for (let i = 0; i < chromaResponse.ids.length; i++) {
        const metadata = chromaResponse.metadatas?.[i] || {};

        // Extract URIs from metadata (common field names: uri, url, source, link)
        const uris: string[] = [];
        if (metadata.uri) uris.push(metadata.uri);
        if (metadata.url) uris.push(metadata.url);
        if (metadata.source) uris.push(metadata.source);
        if (metadata.link) uris.push(metadata.link);

        const record: Record = {
          id: chromaResponse.ids[i],
          text: chromaResponse.documents?.[i] || '',
          metadata: metadata,
          vector: chromaResponse.embeddings?.[i] || undefined,
          distance: undefined, // Distance is only available in query results, not get
          uris: uris.length > 0 ? uris : undefined
        };
        transformedRecords.push(record);
      }
    }

    return transformedRecords;
  };

  // Load tenants on component mount
  useEffect(() => {
    loadTenants();
  }, []);

  // Load databases when tenant changes
  useEffect(() => {
    if (selectedTenant) {
      loadDatabases(selectedTenant);
      setSelectedDatabase('');
      setSelectedCollection('');
      setRecords([]);
    }
  }, [selectedTenant]);

  // Load collections when database changes
  useEffect(() => {
    if (selectedTenant && selectedDatabase) {
      loadCollections(selectedTenant, selectedDatabase);
      setSelectedCollection('');
      setRecords([]);
    }
  }, [selectedTenant, selectedDatabase]);

  // Load records when collection changes
  useEffect(() => {
    if (selectedTenant && selectedDatabase && selectedCollection) {
      loadRecords();
      loadRecordCount();
    }
  }, [selectedTenant, selectedDatabase, selectedCollection]);

  const loadTenants = async () => {
    try {
      console.log('🔍 Loading tenants from local storage (with auto-discovery)...');

      // Get all tenants from local storage (with auto-discovery)
      const storedTenants = await tenantService.getTenantsForDisplay();
      setTenants(storedTenants);
      console.log(`✅ Loaded ${storedTenants.length} tenants from local storage:`, storedTenants.map(t => t.name));
      
      // Set the first tenant as selected if none is selected
      if (storedTenants.length > 0 && !selectedTenant) {
        setSelectedTenant(storedTenants[0].name);
      }
      
      if (storedTenants.length === 0) {
        setError('No tenants found in local storage. Add tenants in Tenant Management page.');
      }
    } catch (err: any) {
      console.error('Error loading tenants:', err);
      setError(err.message || 'Failed to load tenants');
      setTenants([]);
    }
  };

  const loadDatabases = async (tenant: string) => {
    try {
      console.log(`Loading databases for tenant: ${tenant}`);
      const response = await apiService.getDatabases(tenant);
      if (response.success && response.data) {
        setDatabases(response.data);
        console.log('Loaded databases:', response.data);
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
      console.log(`Loading collections for tenant: ${tenant}, database: ${database}`);
      const response = await apiService.getCollections(tenant, database);
      if (response.success && response.data) {
        setCollections(response.data);
        console.log('Loaded collections:', response.data);
        console.log('Collection details:');
        response.data.forEach((col, index) => {
          console.log(`  ${index}: ID="${col.id}", Name="${col.name}", Type: ${typeof col.id}`);
        });
      } else {
        console.warn('Failed to load collections:', response.error);
        setCollections([]);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
      setCollections([]);
    }
  };

  const loadRecordCount = async () => {
    if (!selectedTenant || !selectedDatabase || !selectedCollection) return;

    try {
      console.log(`Loading record count for collection: ${selectedCollection}`);
      const response = await apiService.getRecordCount(selectedTenant, selectedDatabase, selectedCollection);
      if (response.success && response.data) {
        // Handle different possible response structures
        const count = typeof response.data === 'number' ? response.data : (response.data.count || 0);
        setRecordCount(count);
        console.log('Record count response:', response.data);
        console.log('Record count:', count);
      } else {
        console.warn('Failed to get record count:', response.error);
        setRecordCount(0);
      }
    } catch (error) {
      console.error('Error loading record count:', error);
    }
  };

  const loadRecords = async () => {
    if (!selectedTenant || !selectedDatabase || !selectedCollection) return;

    setIsLoading(true);
    setError('');

    try {
      console.log(`Loading records for collection: ${selectedCollection}`);

      // Use getRecords to get records (with optional embeddings)
      // Start with very small page size for large collections to avoid timeouts
      let effectivePageSize = includeEmbeddings ? Math.min(pageSize, 3) : Math.min(pageSize, 10);

      // Include embeddings only if requested (they can be very large)
      const includeFields = ['documents', 'metadatas'];
      if (includeEmbeddings) {
        includeFields.push('embeddings');
      }

      // Try with progressively smaller batch sizes if we get timeouts
      let response;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          setLoadingStatus(`Attempt ${attempts + 1}: Loading ${effectivePageSize} records...`);
          console.log(`Attempt ${attempts + 1}: Loading ${effectivePageSize} records...`);

          response = await apiService.getRecords(selectedTenant, selectedDatabase, selectedCollection, {
            limit: effectivePageSize,
            offset: (currentPage - 1) * effectivePageSize,
            include: includeFields
          });

          setLoadingStatus(''); // Clear status on success
          break; // Success, exit retry loop

        } catch (error: any) {
          attempts++;

          if (error.message && (error.message.includes('timeout') || error.message.includes('408'))) {
            if (attempts < maxAttempts) {
              // Reduce batch size and try again
              effectivePageSize = Math.max(1, Math.floor(effectivePageSize / 2));
              setLoadingStatus(`Timeout detected, reducing batch size to ${effectivePageSize} and retrying...`);
              console.log(`Timeout detected, reducing batch size to ${effectivePageSize} and retrying...`);
              continue;
            }
          }

          // If not a timeout or max attempts reached, try one last fallback
          if (attempts >= maxAttempts) {
            console.log('All attempts failed, trying fallback with IDs only...');
            try {
              response = await apiService.getRecords(selectedTenant, selectedDatabase, selectedCollection, {
                limit: 1,
                offset: (currentPage - 1),
                include: [] // Just IDs, no content
              });

              if (response.success) {
                console.log('Fallback successful with IDs only');
                break;
              }
            } catch (fallbackError) {
              console.log('Fallback also failed');
            }
          }

          throw error;
        }
      }

      if (response.success && response.data) {
        // ChromaDB returns an object with arrays, we need to transform it
        const chromaResponse = response.data;
        console.log('ChromaDB response:', chromaResponse);
        console.log('Response type:', typeof chromaResponse);
        console.log('Is array:', Array.isArray(chromaResponse));

        // Validate that we have a proper ChromaDB response object
        if (!chromaResponse || typeof chromaResponse !== 'object') {
          console.error('Invalid response format - not an object:', chromaResponse);
          setError('Invalid response format from server');
          setRecords([]);
          return;
        }

        // Check if it's already an array of records (some APIs might return this)
        if (Array.isArray(chromaResponse)) {
          console.log('Response is already an array of records');
          setRecords(chromaResponse);
          return;
        }

        console.log('Available fields:', Object.keys(chromaResponse));
        console.log('Embeddings available:', !!(chromaResponse as any).embeddings);
        console.log('Documents available:', !!(chromaResponse as any).documents);
        console.log('Metadatas available:', !!(chromaResponse as any).metadatas);
        console.log('IDs available:', !!(chromaResponse as any).ids);

        const transformedRecords = transformChromaResponse(chromaResponse);
        setRecords(transformedRecords);
        console.log('Transformed records:', transformedRecords);
        console.log('First record embeddings:', transformedRecords[0]?.vector?.length);
      } else {
        console.warn('Failed to load records:', response.error);
        setRecords([]);
      }
    } catch (err: any) {
      console.error('Error loading records:', err);

      // Handle timeout errors specifically
      if (err.message && err.message.includes('timeout')) {
        setError('⏱️ Request timed out. This collection has large records. Try reducing the page size or contact your administrator to increase server timeout limits.');
      } else if (err.message && err.message.includes('408')) {
        setError('⏱️ Server timeout (408). This collection contains large embeddings that take too long to load. Try viewing fewer records at a time.');
      } else {
        setError(err.message || 'Failed to load records');
      }

      setRecords([]); // Ensure records is always an array
    } finally {
      setIsLoading(false);
      setLoadingStatus(''); // Clear loading status
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.text.trim() || !selectedTenant || !selectedDatabase || !selectedCollection) return;

    setIsLoading(true);
    setError('');
    
    try {
      console.log('Adding new record...');
      
      const recordToAdd: Record = {
        id: Date.now().toString(),
        text: newRecord.text,
        metadata: JSON.parse(newRecord.metadata || '{}'),
        vector: newRecord.vector ? newRecord.vector.split(',').map(Number) : undefined
      };
      
      const response = await apiService.addRecords(selectedTenant, selectedDatabase, selectedCollection, {
        records: [recordToAdd]
      });
      
      if (response.success) {
        setNewRecord({ text: '', metadata: '{}', vector: '' });
        setShowAddForm(false);
        setSuccessMessage('Record added successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Reload records to show the new one
        await loadRecords();
        await loadRecordCount();
      } else {
        throw new Error(response.error || 'Failed to add record');
      }
    } catch (err: any) {
      console.error('Error adding record:', err);
      setError(err.message || 'Failed to add record');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !selectedTenant || !selectedDatabase || !selectedCollection) return;

    setIsLoading(true);
    setError('');
    
    try {
      console.log(`Searching records with query: ${searchQuery}`);
      
      // For text search, use getRecords with metadata filter
      const response = await apiService.getRecords(selectedTenant, selectedDatabase, selectedCollection, {
        where: { text: { $contains: searchQuery } }, // Simple text search
        limit: searchLimit,
        offset: 0,
        include: ['embeddings', 'documents', 'metadatas']
      });
      
      if (response.success && response.data) {
        // Transform ChromaDB response to our Record format
        const chromaResponse = response.data;
        console.log('Search ChromaDB response:', chromaResponse);
        
        const transformedRecords = transformChromaResponse(chromaResponse);
        setRecords(transformedRecords);
        setSuccessMessage(`Found ${transformedRecords.length} records matching "${searchQuery}"`);
        console.log('Search results:', transformedRecords);
      } else {
        console.warn('Search failed:', response.error);
        setRecords([]);
        setError(response.error || 'Search failed');
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error searching records:', err);
      setError(err.message || 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this record?') || !selectedTenant || !selectedDatabase || !selectedCollection) return;

    try {
      console.log(`Deleting record: ${recordId}`);
      
      const response = await apiService.deleteRecords(selectedTenant, selectedDatabase, selectedCollection, {
        ids: [recordId]
      });
      
      if (response.success) {
        setSuccessMessage('Record deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Reload records to show updated list
        await loadRecords();
        await loadRecordCount();
      } else {
        throw new Error(response.error || 'Failed to delete record');
      }
    } catch (err: any) {
      console.error('Error deleting record:', err);
      setError(err.message || 'Failed to delete record');
    }
  };

  const resetSearch = () => {
    setSearchQuery('');
    setSearchLimit(10);
    setCurrentPage(1);
    if (selectedTenant && selectedDatabase && selectedCollection) {
      loadRecords();
    }
  };

  const handleDeleteCollection = async () => {
    if (!selectedTenant || !selectedDatabase || !selectedCollection) return;

    setIsDeleting(true);
    setError('');

    try {
      // Get the collection details for debugging
      const selectedCollectionObj = collections.find(c => c.id === selectedCollection);
      console.log('Debug: Selected collection object:', selectedCollectionObj);
      console.log('Debug: Selected collection ID:', selectedCollection);
      console.log('Debug: Available collections:', collections);
      
      // Use collection name for deletion (API expects collection name, not UUID)
      const collectionNameToDelete = selectedCollectionObj?.name || selectedCollection;
      console.log(`Deleting collection: ${collectionNameToDelete} from ${selectedTenant}/${selectedDatabase}`);
      
      const response = await apiService.deleteCollection(selectedTenant, selectedDatabase, collectionNameToDelete);
      
      if (response.success) {
        setSuccessMessage(`Collection "${collectionNameToDelete}" deleted successfully! ${recordCount} records were permanently removed.`);
        setTimeout(() => setSuccessMessage(''), 5000);
        
        // Reset collection selection and reload collections list
        setSelectedCollection('');
        setRecords([]);
        setRecordCount(0);
        
        // Reload collections to show updated list
        if (selectedTenant && selectedDatabase) {
          await loadCollections(selectedTenant, selectedDatabase);
        }
        
        // Close the modal
        setShowDeleteCollectionModal(false);
      } else {
        throw new Error(response.error || 'Failed to delete collection');
      }
    } catch (err: any) {
      console.error('Error deleting collection:', err);
      
      let errorMessage = 'Failed to delete collection';
      
      // Handle specific error cases
      if (err.response?.status === 404) {
        errorMessage = 'Collection not found. It may have already been deleted or the collection ID is invalid.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Permission denied. You do not have access to delete this collection.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setTimeout(() => setError(''), 8000); // Longer timeout for error messages
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicateCollection = async () => {
    if (!selectedTenant || !selectedDatabase || !selectedCollection || !newCollectionName.trim()) return;

    setIsDuplicating(true);
    setError('');

    try {
      const selectedCollectionObj = collections.find(c => c.id === selectedCollection);
      const sourceCollectionName = selectedCollectionObj?.name || selectedCollection;
      
      // Validate that the new collection name doesn't already exist
      const existingCollection = collections.find(c => 
        c.name.toLowerCase() === newCollectionName.trim().toLowerCase()
      );
      
      if (existingCollection) {
        throw new Error(`Collection name "${newCollectionName.trim()}" already exists in this database. Please choose a different name.`);
      }

      console.log(`Duplicating collection: ${sourceCollectionName} -> ${newCollectionName.trim()}`);
      
      // Use UUID for fork API (it expects collection_id, not name)
      const response = await apiService.forkCollection(selectedTenant, selectedDatabase, selectedCollection, newCollectionName.trim());
      
      if (response.success) {
        setSuccessMessage(`Collection "${sourceCollectionName}" successfully duplicated as "${newCollectionName.trim()}"!`);
        setTimeout(() => setSuccessMessage(''), 5000);
        
        // Clear the input and close the modal
        setNewCollectionName('');
        setShowDuplicateCollectionModal(false);
        
        // Reload collections to show the new duplicated collection
        if (selectedTenant && selectedDatabase) {
          await loadCollections(selectedTenant, selectedDatabase);
        }
      } else {
        throw new Error(response.error || 'Failed to duplicate collection');
      }
    } catch (err: any) {
      console.error('Error duplicating collection:', err);
      
      let errorMessage = 'Failed to duplicate collection';
      
      // Handle specific error cases
      if (err.message?.includes('already exists')) {
        errorMessage = err.message;
      } else if (err.response?.status === 404) {
        errorMessage = 'Source collection not found. It may have been deleted.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Permission denied. You do not have access to duplicate this collection.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setTimeout(() => setError(''), 8000);
    } finally {
      setIsDuplicating(false);
    }
  };

  // Pagination functions
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (selectedTenant && selectedDatabase && selectedCollection) {
      loadRecords();
    }
  };

  // Record action functions
  const handleViewRecord = (record: Record) => {
    setSelectedRecord(record);
    setActiveTab('documents');
    setIsViewMode(true); // Set to view mode
    setShowRecordPopup(true);
  };

  const handleUpdateRecord = (record: Record) => {
    setSelectedRecord(record);
    setActiveTab('documents');
    setIsViewMode(false); // Set to edit mode
    setShowRecordPopup(true);
  };

  const closeRecordPopup = () => {
    setShowRecordPopup(false);
    setSelectedRecord(null);
    setIsViewMode(true); // Reset to view mode
  };

  // Copy embedding to clipboard
  const copyEmbeddingToClipboard = async () => {
    if (!selectedRecord?.vector) return;

    try {
      const embeddingText = `[${selectedRecord.vector.join(', ')}]`;
      await navigator.clipboard.writeText(embeddingText);
      setSuccessMessage('Embedding copied to clipboard!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to copy embedding:', err);
      setError('Failed to copy embedding to clipboard');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Calculate pagination info
  const totalPages = Math.ceil(recordCount / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, recordCount);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">
          {loadingStatus || 'Loading...'}
        </span>
        {loadingStatus && (
          <div className="mt-2 text-sm text-gray-500 text-center max-w-md">
            Large collections may require multiple attempts with smaller batch sizes to avoid timeouts.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Data Operations</h1>
        <p className="text-gray-600 mt-2">Manage records in your vector database collections</p>
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

      {/* Collection Selection */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Collection</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tenant</label>
            <select
              value={selectedTenant}
              onChange={(e) => {
                setSelectedTenant(e.target.value);
                setSelectedDatabase('');
                setSelectedCollection('');
              }}
              className="input-field"
            >
              <option value="">Select tenant</option>
              {(tenants || []).map(tenant => (
                <option key={tenant.name} value={tenant.name}>{tenant.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Database</label>
            <select
              value={selectedDatabase}
              onChange={(e) => {
                setSelectedDatabase(e.target.value);
                setSelectedCollection('');
              }}
              className="input-field"
              disabled={!selectedTenant}
            >
              <option value="">Select database</option>
              {databases.map(db => (
                <option key={db.name} value={db.name}>{db.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <div className="flex justify-between items-start mb-2">
              <label className="block text-sm font-medium text-gray-700">Collection</label>
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-3">Include embeddings</span>
                <button
                  type="button"
                  onClick={() => setIncludeEmbeddings(!includeEmbeddings)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    includeEmbeddings ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      includeEmbeddings ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="input-field"
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

      {selectedCollection && (
        <>
          {/* Collection Info */}
          <div className="card mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Collection: {collections.find(c => c.id === selectedCollection)?.name || selectedCollection}
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedTenant} → {selectedDatabase} → {collections.find(c => c.id === selectedCollection)?.name || selectedCollection}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{recordCount}</div>
                  <div className="text-sm text-gray-600">Total Records</div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowDuplicateCollectionModal(true)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    title="Duplicate Collection"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => setShowDeleteCollectionModal(true)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    title="Delete Collection"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="card mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Records</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by text or metadata..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="w-32">
                <input
                  type="number"
                  placeholder="Limit"
                  value={searchLimit}
                  onChange={(e) => setSearchLimit(Number(e.target.value))}
                  className="input-field"
                  min="1"
                  max="100"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
                className="btn-primary"
              >
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                Search
              </button>
              <button
                onClick={resetSearch}
                className="btn-secondary"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Add Record Form */}
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Add New Record</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn-secondary"
              >
                {showAddForm ? 'Hide Form' : 'Show Form'}
              </button>
            </div>
            
            {showAddForm && (
              <form onSubmit={handleAddRecord} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Content *
                  </label>
                  <textarea
                    value={newRecord.text}
                    onChange={(e) => setNewRecord({ ...newRecord, text: e.target.value })}
                    className="input-field h-24"
                    placeholder="Enter the text content for this record"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metadata (JSON)
                  </label>
                  <textarea
                    value={newRecord.metadata}
                    onChange={(e) => setNewRecord({ ...newRecord, metadata: e.target.value })}
                    className="input-field h-20 font-mono text-sm"
                    placeholder='{"category": "example", "tags": ["tag1", "tag2"]}'
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vector (comma-separated numbers)
                  </label>
                  <input
                    type="text"
                    value={newRecord.vector}
                    onChange={(e) => setNewRecord({ ...newRecord, vector: e.target.value })}
                    className="input-field font-mono text-sm"
                    placeholder="0.1, 0.2, 0.3, 0.4, 0.5"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={!newRecord.text.trim()}
                  className="btn-primary"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Record
                </button>
              </form>
            )}
          </div>

          {/* Records Table */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Records in {collections.find(c => c.id === selectedCollection)?.name || selectedCollection}
              </h2>
              <div className="text-sm text-gray-600">
                Showing {startRecord}-{endRecord} of {recordCount} records
              </div>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Distance <span className="text-gray-400 normal-case">(Query only)</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URIs <span className="text-gray-400 normal-case">(from metadata)</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(Array.isArray(records) ? records : []).map((record, index) => (
                    <tr key={record.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {record.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500 italic">
                          N/A (use Query for distances)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {record.uris && record.uris.length > 0 ? (
                            <div className="space-y-1">
                              {record.uris.slice(0, 2).map((uri, idx) => (
                                <div key={idx} className="truncate max-w-xs text-blue-600 hover:text-blue-800">
                                  <a href={uri} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {uri}
                                  </a>
                                </div>
                              ))}
                              {record.uris.length > 2 && (
                                <span className="text-gray-500 text-xs">+{record.uris.length - 2} more</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">No URIs in metadata</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewRecord(record)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View record details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateRecord(record)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Update record"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id || '')}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete record"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {records.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <DocumentTextIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No records found</p>
                  <p className="text-sm">
                    {searchQuery ? 'Try adjusting your search terms' : 'Add some records to get started'}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Record Details Popup */}
      {showRecordPopup && selectedRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {isViewMode ? 'Record Details' : 'Edit Record'} - {selectedRecord.id}
                </h3>
                <button
                  onClick={closeRecordPopup}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'documents', name: 'Documents', icon: DocumentTextIcon },
                    { id: 'embeddings', name: 'Embeddings', icon: ChartBarIcon },
                    { id: 'metadata', name: 'Metadata', icon: CogIcon }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                      <tab.icon className="h-4 w-4 mr-2" />
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="min-h-96">
                {activeTab === 'documents' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Document Text
                      </label>
                      <textarea
                        value={selectedRecord.text || ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-32"
                        placeholder="No document text available"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URIs
                      </label>
                      <div className="space-y-2">
                        {selectedRecord.uris && selectedRecord.uris.length > 0 ? (
                          selectedRecord.uris.map((uri, index) => (
                            <div key={index} className="p-2 bg-gray-50 rounded border">
                              <span className="text-sm text-gray-700">{uri}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">No URIs available</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'embeddings' && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Vector Embedding
                        </label>
                        {selectedRecord.vector && selectedRecord.vector.length > 0 && (
                          <button
                            onClick={copyEmbeddingToClipboard}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            title="Copy entire embedding to clipboard"
                          >
                            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy All
                          </button>
                        )}
                      </div>
                      {selectedRecord.vector && selectedRecord.vector.length > 0 ? (
                        <div className="space-y-3">
                          <div className="p-3 bg-blue-50 rounded border border-blue-200">
                            <div className="text-sm font-medium text-blue-800 mb-1">
                              Vector Dimensions: {selectedRecord.vector.length}
                            </div>
                            <div className="text-xs text-blue-600">
                              Complete embedding vector with all {selectedRecord.vector.length} dimensions
                            </div>
                          </div>
                          <div className="p-4 bg-gray-50 rounded border">
                            <div className="text-xs font-mono text-gray-700 max-h-64 overflow-y-auto whitespace-pre-wrap break-all">
                              [{selectedRecord.vector.map(v => v.toFixed(6)).join(', ')}]
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">No embedding vector available</span>
                      )}
                    </div>
                    {selectedRecord.distance !== undefined && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Distance
                        </label>
                        <div className="p-2 bg-gray-50 rounded border">
                          <span className="text-sm text-gray-700">{selectedRecord.distance.toFixed(6)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'metadata' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Metadata
                      </label>
                      {selectedRecord.metadata && Object.keys(selectedRecord.metadata).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(selectedRecord.metadata).map(([key, value]) => (
                            <div key={key} className="p-3 bg-gray-50 rounded border">
                              <div className="text-sm font-medium text-gray-700 mb-1">{key}</div>
                              <div className="text-sm text-gray-600">
                                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">No metadata available</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={closeRecordPopup}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
                {!isViewMode && (
                  <button
                    onClick={() => {
                      // TODO: Implement update functionality
                      console.log('Update record:', selectedRecord);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Update Record
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Collection Confirmation Modal */}
      {showDeleteCollectionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Delete Collection
                  </h3>
                </div>
                <button
                  onClick={() => setShowDeleteCollectionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isDeleting}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete this collection? This action cannot be undone.
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Collection: {collections.find(c => c.id === selectedCollection)?.name || selectedCollection}
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        Path: {selectedTenant} → {selectedDatabase}
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        <span className="font-semibold">{recordCount}</span> records will be permanently deleted from the database.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteCollectionModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCollection}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete Collection
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Collection Modal */}
      {showDuplicateCollectionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <DocumentDuplicateIcon className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Duplicate Collection
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowDuplicateCollectionModal(false);
                    setNewCollectionName('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isDuplicating}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Create a duplicate of this collection with all its records.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <DocumentDuplicateIcon className="h-5 w-5 text-blue-400 mr-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800">
                        Source: {collections.find(c => c.id === selectedCollection)?.name || selectedCollection}
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Path: {selectedTenant} → {selectedDatabase}
                      </p>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="flex justify-center my-3">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                  
                  <div className="flex items-center">
                    <DocumentDuplicateIcon className="h-5 w-5 text-blue-400 mr-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800">
                        Duplicate: {newCollectionName.trim() || '[Enter name below]'}
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Records: {recordCount} (will be copied)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Input Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Collection Name *
                  </label>
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter new collection name"
                    disabled={isDuplicating}
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Collection name must be unique within this database
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDuplicateCollectionModal(false);
                    setNewCollectionName('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isDuplicating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDuplicateCollection}
                  disabled={isDuplicating || !newCollectionName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isDuplicating ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                      Duplicating...
                    </>
                  ) : (
                    <>
                      <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                      Create Duplicate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataOperations;
