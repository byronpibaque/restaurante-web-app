import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist', // Directorio de salida
    rollupOptions: {
      output: {
        manualChunks: {
          // Divide los paquetes grandes en chunks más pequeños
          vue: ['vue']
        }
      }
    }
  },
  server: {
    port: 3000, // Puerto de desarrollo
    open: true  // Abrir el navegador automáticamente
  }
});