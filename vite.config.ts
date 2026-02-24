import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
const backend = process.env.VITE_API_BASE || 'http://localhost:4000'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: backend,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
