import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  base: '/', // Ensures proper routing and asset loading on Render
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Enables use of @ for src directory
    },
  },
  server: {
    host: '0.0.0.0', // Allow external connections (needed for Render)
    port: 10000,     // Port matches your package.json start script
  },
  build: {
    outDir: 'dist', // Output directory for production build
    sourcemap: false,
  },
});
