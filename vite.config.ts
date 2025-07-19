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
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '5173'), // Use Render's dynamic port or fallback
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
