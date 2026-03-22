const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

// Get URLs from environment variables with defaults
const CHROMADB_TARGET = process.env.CHROMADB_URL || process.env.VITE_CHROMADB_URL || 'http://localhost:8000';
const ADMIN_URL = process.env.VITE_ADMIN_URL || process.env.VITE_APP_URL || 'http://localhost:3434';

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: CHROMADB_TARGET,
      changeOrigin: true,
      secure: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      onProxyReq: function (proxyReq, req, res) {
        console.log('Sending Request to the Target:', req.method, req.url);
        // Add CORS headers to the proxy request
        proxyReq.setHeader('Origin', ADMIN_URL);
      },
      onProxyRes: function (proxyRes, req, res) {
        console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
        // Add CORS headers to the response
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
      },
      onError: function (err, req, res) {
        console.log('Proxy error:', err);
      }
    })
  );
};
