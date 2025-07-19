import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

export default defineConfig(({ mode }) => ({
  base: '/', // Important for correct path resolution on static hosting like Render
  server: {
    host: '::',
    port: 8080, // For local development
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(), // Optional tagger plugin in dev only
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
