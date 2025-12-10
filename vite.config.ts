import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// Vite configuration for React + TypeScript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    // Rollup native dependencies 문제 해결
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    port: 5173
  },
  // Optional dependencies 강제 설치
  optimizeDeps: {
    include: ['rollup']
  }
});
