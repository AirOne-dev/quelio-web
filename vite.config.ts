import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import type { Connect } from 'vite'

// Middleware to redirect manifest.json and icon.svg to their PHP equivalents
// This runs BEFORE the proxy, so we need to rewrite to .php but keep /api prefix
function manifestIconRewrite(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const url = req.url || ''
    if (url.startsWith('/api/manifest.json')) {
      req.url = url.replace('/api/manifest.json', '/api/manifest.php')
    } else if (url.startsWith('/api/icon.svg')) {
      req.url = url.replace('/api/icon.svg', '/api/icon.php')
    }
    next()
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    tailwindcss(),
    {
      name: 'manifest-icon-rewrite',
      configureServer(server) {
        server.middlewares.use(manifestIconRewrite())
      },
      configurePreviewServer(server) {
        server.middlewares.use(manifestIconRewrite())
      }
    }
  ],
  server: {
    port: 9876,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
