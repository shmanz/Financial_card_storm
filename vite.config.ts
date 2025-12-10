import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// Vite configuration for React + TypeScript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false
  },
  server: {
    port: 5173
  }
});
