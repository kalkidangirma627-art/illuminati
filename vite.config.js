import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'spa-portal-fallback',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const spaRoutes = ['/login', '/register', '/dashboard'];
          const url = req.url.split('?')[0];
          if (spaRoutes.some(route => url === route || url.startsWith(route + '/'))) {
            const portalPath = path.resolve(__dirname, 'portal.html');
            const content = fs.readFileSync(portalPath, 'utf-8');
            try {
              const transformed = await server.transformIndexHtml(req.url, content);
              res.setHeader('Content-Type', 'text/html');
              res.end(transformed);
              return;
            } catch (e) {
              return next(e);
            }
          }
          next();
        });
      }
    }
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})

