import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  base: '/Frontendproyecto/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  // Configuración para desarrollo
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Solo para desarrollo local
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})