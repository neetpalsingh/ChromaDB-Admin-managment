#!/usr/bin/env node

/**
 * Debug script to test API responses and identify data format issues
 * Run this script to see what the actual API responses look like
 */

const axios = require('axios');
require('dotenv').config();

// Configuration - load from environment or use defaults
const CHROMADB_URL = process.env.CHROMADB_URL || process.env.VITE_CHROMADB_URL || 'http://localhost:8000';
const TENANT_NAME = process.env.VITE_DEFAULT_TENANT || 'default_tenant';
const DATABASE_NAME = process.env.VITE_DEFAULT_DATABASE || 'default_database';

async function debugAPI() {
  console.log('🔍 ChromaDB API Debug Script');
  console.log('============================');
  console.log(`Target URL: ${CHROMADB_URL}`);
  console.log(`Tenant: ${TENANT_NAME}`);
  console.log(`Database: ${DATABASE_NAME}`);
  console.log('');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    try {
      const healthResponse = await axios.get(`${CHROMADB_URL}/api/v2/healthcheck`);
      console.log('✅ Health Check Response:', healthResponse.data);
      console.log('   Type:', typeof healthResponse.data);
      console.log('   Is Array:', Array.isArray(healthResponse.data));
    } catch (error) {
      console.log('❌ Health Check Failed:', error.message);
    }
    console.log('');

    // Test 2: Get Tenants
    console.log('2️⃣ Testing Get Tenants...');
    try {
      const tenantsResponse = await axios.get(`${CHROMADB_URL}/api/v2/tenants`);
      console.log('✅ Tenants Response:', tenantsResponse.data);
      console.log('   Type:', typeof tenantsResponse.data);
      console.log('   Is Array:', Array.isArray(tenantsResponse.data));
      if (Array.isArray(tenantsResponse.data)) {
        console.log('   Length:', tenantsResponse.data.length);
      } else if (tenantsResponse.data && typeof tenantsResponse.data === 'object') {
        console.log('   Keys:', Object.keys(tenantsResponse.data));
      }
    } catch (error) {
      console.log('❌ Get Tenants Failed:', error.message);
    }
    console.log('');

    // Test 3: Get Databases for default_tenant
    console.log('3️⃣ Testing Get Databases...');
    try {
      const databasesResponse = await axios.get(`${CHROMADB_URL}/api/v2/tenants/${TENANT_NAME}/databases`);
      console.log('✅ Databases Response:', databasesResponse.data);
      console.log('   Type:', typeof databasesResponse.data);
      console.log('   Is Array:', Array.isArray(databasesResponse.data));
      if (Array.isArray(databasesResponse.data)) {
        console.log('   Length:', databasesResponse.data.length);
        console.log('   First item:', databasesResponse.data[0]);
      } else if (databasesResponse.data && typeof databasesResponse.data === 'object') {
        console.log('   Keys:', Object.keys(databasesResponse.data));
        console.log('   Full object:', JSON.stringify(databasesResponse.data, null, 2));
      }
    } catch (error) {
      console.log('❌ Get Databases Failed:', error.message);
    }
    console.log('');

    // Test 4: Get Collections
    console.log('4️⃣ Testing Get Collections...');
    try {
      const collectionsResponse = await axios.get(`${CHROMADB_URL}/api/v2/tenants/${TENANT_NAME}/databases/${DATABASE_NAME}/collections`);
      console.log('✅ Collections Response:', collectionsResponse.data);
      console.log('   Type:', typeof collectionsResponse.data);
      console.log('   Is Array:', Array.isArray(collectionsResponse.data));
      if (Array.isArray(collectionsResponse.data)) {
        console.log('   Length:', collectionsResponse.data.length);
        if (collectionsResponse.data.length > 0) {
          console.log('   First collection:', collectionsResponse.data[0]);
          
          // Test 5: Get Records from first collection
          const firstCollection = collectionsResponse.data[0];
          if (firstCollection && firstCollection.id) {
            console.log('');
            console.log('5️⃣ Testing Get Records...');
            try {
              const recordsResponse = await axios.post(
                `${CHROMADB_URL}/api/v2/tenants/${TENANT_NAME}/databases/${DATABASE_NAME}/collections/${firstCollection.id}/get`,
                {
                  limit: 5,
                  include: ['embeddings', 'documents', 'metadatas']
                }
              );
              console.log('✅ Records Response:', recordsResponse.data);
              console.log('   Type:', typeof recordsResponse.data);
              console.log('   Is Array:', Array.isArray(recordsResponse.data));
              if (recordsResponse.data && typeof recordsResponse.data === 'object') {
                console.log('   Keys:', Object.keys(recordsResponse.data));
                if (recordsResponse.data.ids) {
                  console.log('   IDs length:', recordsResponse.data.ids.length);
                }
                if (recordsResponse.data.documents) {
                  console.log('   Documents length:', recordsResponse.data.documents.length);
                }
                if (recordsResponse.data.embeddings) {
                  console.log('   Embeddings length:', recordsResponse.data.embeddings.length);
                }
              }
            } catch (error) {
              console.log('❌ Get Records Failed:', error.message);
            }
          }
        }
      }
    } catch (error) {
      console.log('❌ Get Collections Failed:', error.message);
    }

  } catch (error) {
    console.error('💥 Script failed:', error.message);
  }

  console.log('');
  console.log('🏁 Debug script completed');
}

// Run the debug script
debugAPI().catch(console.error);
