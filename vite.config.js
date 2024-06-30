import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 10001,
    mimeTypes: {
      // Ensure that JavaScript files are served with the correct MIME type
      'application/javascript': ['js'],
    }
  },
  optimizeDeps: {
    include: ['vue', '@vueuse/core', 'vue3-toastify'] // Include vue3-toastify if it's a dependency
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./src/main.js', import.meta.url)) // Specify the entry point
      }
    }
  }
});
