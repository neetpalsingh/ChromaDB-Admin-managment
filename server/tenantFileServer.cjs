const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Path to the tenants.json file
const TENANTS_FILE_PATH = path.join(__dirname, '../src/data/tenants.json');

// Ensure the data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(TENANTS_FILE_PATH);
  try {
    await fs.access(dataDir);
  } catch (error) {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Initialize default tenants.json if it doesn't exist
async function initializeTenantsFile() {
  try {
    await fs.access(TENANTS_FILE_PATH);
  } catch (error) {
    // File doesn't exist, create it with default structure
    const defaultData = {
      tenants: [],
      lastUpdated: new Date().toISOString(),
      version: "1.0"
    };
    await fs.writeFile(TENANTS_FILE_PATH, JSON.stringify(defaultData, null, 2));
    console.log('Created default tenants.json file');
  }
}

// Load tenants from file
app.get('/api/tenants/load', async (req, res) => {
  try {
    const data = await fs.readFile(TENANTS_FILE_PATH, 'utf8');
    const tenantData = JSON.parse(data);
    res.json(tenantData);
  } catch (error) {
    console.error('Error loading tenants:', error);
    // Return default structure if file doesn't exist or is corrupted
    res.json({
      tenants: [],
      lastUpdated: new Date().toISOString(),
      version: "1.0"
    });
  }
});

// Save tenants to file
app.post('/api/tenants/save', async (req, res) => {
  try {
    const tenantData = req.body;
    
    // Validate the data structure
    if (!tenantData || !Array.isArray(tenantData.tenants)) {
      return res.status(400).json({ error: 'Invalid tenant data structure' });
    }

    // Update the lastUpdated timestamp
    tenantData.lastUpdated = new Date().toISOString();

    // Write to file with pretty formatting
    await fs.writeFile(TENANTS_FILE_PATH, JSON.stringify(tenantData, null, 2));
    
    console.log(`Saved ${tenantData.tenants.length} tenants to file`);
    res.json({ success: true, message: 'Tenants saved successfully' });
  } catch (error) {
    console.error('Error saving tenants:', error);
    res.status(500).json({ error: 'Failed to save tenants' });
  }
});

// Health check
app.get('/api/tenants/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'tenant-file-server'
  });
});

// Start server
async function startServer() {
  try {
    await ensureDataDirectory();
    await initializeTenantsFile();
    
    app.listen(PORT, () => {
      console.log(`Tenant file server running on http://localhost:${PORT}`);
      console.log(`Tenants file: ${TENANTS_FILE_PATH}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
