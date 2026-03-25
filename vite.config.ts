import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  // Expose env variables to the process.env for the dev-server middleware
  process.env = { ...process.env, ...env };

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        }
      }
    },
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-animations': ['framer-motion'],
            'vendor-icons': ['lucide-react'],
          }
        }
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: false,
      minify: 'esbuild', // Use esbuild for faster, more reliable minification
    }
  };
});
