import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    allowedHosts: true,
    cors: true,
  },
  build: {
    rollupOptions: {
      input: 'src/main.js',
    },
  },
});
