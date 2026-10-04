import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Mshauri-Tax-AI/',  // Critical for assets to load
  server: {
    port: 5173,
  },
})
