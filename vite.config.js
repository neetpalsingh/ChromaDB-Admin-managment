import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Dynamic ChromaDB target - can be updated via API
// Load from environment variable, default to localhost
let CHROMADB_TARGET = process.env.CHROMADB_URL || process.env.VITE_CHROMADB_URL || 'http://localhost:8000';

// Custom plugin to add proxy configuration endpoints and dynamic proxy
const proxyConfigPlugin = () => {
  const { createProxyMiddleware } = require('http-proxy-middleware');
  let currentProxy = null;

  const createProxy = (target) => {
    const adminURL = process.env.VITE_ADMIN_URL || process.env.VITE_APP_URL || 'http://localhost:3434';
    return createProxyMiddleware({
      target: target,
      changeOrigin: true,
      secure: true,
      onProxyReq: (proxyReq, req) => {
        console.log('🔄 Proxying request:', req.method, req.url, 'to', target);
        proxyReq.setHeader('Origin', adminURL);
        proxyReq.setHeader('Referer', adminURL);
      },
      onProxyRes: (proxyRes, req) => {
        console.log('✅ Proxy response:', proxyRes.statusCode, req.url);
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
      },
      onError: (err, req, res) => {
        console.error('❌ Proxy error:', err.message);
        if (res && res.status) {
          res.status(500).json({ error: 'Proxy error', message: err.message });
        }
      }
    });
  };

  return {
    name: 'proxy-config',
    configureServer(server) {
      // Initialize proxy with default target
      currentProxy = createProxy(CHROMADB_TARGET);

      // Dynamic API proxy middleware
      server.middlewares.use('/api', (req, res, next) => {
        currentProxy(req, res, next);
      });

      // Add middleware to parse JSON for configure-proxy endpoint
      server.middlewares.use('/configure-proxy', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const { chromadbUrl } = JSON.parse(body);
              if (chromadbUrl) {
                CHROMADB_TARGET = chromadbUrl;
                currentProxy = createProxy(CHROMADB_TARGET);
                console.log('🔧 Proxy target updated to:', CHROMADB_TARGET);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, target: CHROMADB_TARGET }));
              } else {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'chromadbUrl is required' }));
              }
            } catch (error) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
        } else {
          next();
        }
      });

      // Add GET endpoint to get current proxy target
      server.middlewares.use('/proxy-config', (req, res, next) => {
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ target: CHROMADB_TARGET }));
        } else {
          next();
        }
      });
    }
  }
}

export default defineConfig({
  plugins: [react(), proxyConfigPlugin()],
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.VITE_PORT) || 3434,
    cors: true
  },
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.VITE_PORT) || 3434,
    cors: true,
    proxy: {
      '/api': {
        target: CHROMADB_TARGET,
        changeOrigin: true,
        secure: true
      }
    }
  },
  build: {
    outDir: 'build'
  }
})
