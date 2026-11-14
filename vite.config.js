import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Serve the frontend directly through Vite during local development.
    // This avoids applying Vercel's production CSP to Vite's React-refresh
    // preamble, which must run in the development page.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
});
