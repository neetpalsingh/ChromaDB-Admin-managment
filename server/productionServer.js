const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3434;

// Get CORS origins from environment or use defaults
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3434', 'http://localhost:3435'];

// Enable CORS for all routes
app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

// Add middleware to parse JSON
app.use(express.json());

// Dynamic ChromaDB target - can be updated via API
// Load from environment variable, default to localhost
let CHROMADB_TARGET = process.env.CHROMADB_URL || process.env.VITE_CHROMADB_URL || 'http://localhost:8000';
const ADMIN_URL = process.env.VITE_ADMIN_URL || process.env.VITE_APP_URL || 'http://localhost:3434';

// Endpoint to configure proxy target dynamically
app.post('/configure-proxy', (req, res) => {
  const { chromadbUrl } = req.body;
  if (chromadbUrl) {
    CHROMADB_TARGET = chromadbUrl;
    console.log('🔧 Proxy target updated to:', CHROMADB_TARGET);
    res.json({ success: true, target: CHROMADB_TARGET });
  } else {
    res.status(400).json({ error: 'chromadbUrl is required' });
  }
});

// Endpoint to get current proxy target
app.get('/proxy-config', (req, res) => {
  res.json({ target: CHROMADB_TARGET });
});

// Proxy API requests to ChromaDB (now dynamic)
app.use('/api', (req, res, next) => {
  const proxy = createProxyMiddleware({
    target: CHROMADB_TARGET,
    changeOrigin: true,
    secure: false, // Allow self-signed certificates
    timeout: 300000, // 5 minutes timeout
    proxyTimeout: 300000, // 5 minutes proxy timeout
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    onProxyReq: function (proxyReq, req, res) {
      console.log('🔄 Proxying request:', req.method, req.url, 'to', CHROMADB_TARGET);

      // Set origin header to match your domain from environment
      proxyReq.setHeader('Origin', ADMIN_URL);
      proxyReq.setHeader('Referer', ADMIN_URL);

      // CRITICAL: Set socket timeout on the underlying HTTP request
      // This is the actual fix for timeout issues
      if (proxyReq.socket) {
        proxyReq.socket.setTimeout(300000); // 5 minutes
        proxyReq.socket.setKeepAlive(true, 60000); // Keep alive for 1 minute
      }

      // Also set timeout on the request itself
      proxyReq.setTimeout(300000, () => {
        console.error('⏱️ Request timeout after 5 minutes');
        proxyReq.abort();
      });
    },
    onProxyRes: function (proxyRes, req, res) {
      console.log('✅ Proxy response:', proxyRes.statusCode, req.url);

      // Set timeout on response socket as well
      if (proxyRes.socket) {
        proxyRes.socket.setTimeout(300000); // 5 minutes
      }

      // Add CORS headers to response
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    },
    onError: function (err, req, res) {
      console.error('❌ Proxy error:', err.message);

      // Check if it's a timeout error
      if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
        res.status(504).json({
          error: 'Gateway Timeout',
          message: 'ChromaDB server took too long to respond. Try using pagination or increase ChromaDB server timeout.',
          code: err.code
        });
      } else {
        res.status(500).json({ error: 'Proxy error', message: err.message, code: err.code });
      }
    }
  });

  proxy(req, res, next);
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../build')));

// Handle React routing - send all non-API requests to React app
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

// Error handling
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Initial proxy target: ${CHROMADB_TARGET}`);
  console.log(`🌐 Application URL: ${ADMIN_URL}`);
  console.log(`🔧 Proxy can be reconfigured via POST /configure-proxy`);
  console.log(`💡 To set default ChromaDB instance, set CHROMADB_URL or VITE_CHROMADB_URL environment variable`);
});

// Set server timeout to 5 minutes (300,000 ms)
server.timeout = 300000; // Overall request timeout
server.keepAliveTimeout = 300000; // Keep-alive timeout
server.headersTimeout = 310000; // Headers timeout (slightly higher than keepAlive)
server.requestTimeout = 300000; // Request timeout (Node.js 18+)

// Set timeout on all incoming connections
server.on('connection', (socket) => {
  socket.setTimeout(300000); // 5 minutes
  socket.setKeepAlive(true, 60000); // Keep alive for 1 minute
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please stop other servers or use a different port.`);
  }
  process.exit(1);
});
