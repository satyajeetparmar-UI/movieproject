import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: '3000',
    proxy: {
      '/api': {
        target: 'https://movieverse-9fz4.onrender.com',
        changeOrigin: true,
        secure: false, // Prevents SSL alert internal error
      },
    },
  },
})
