import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/pages': resolve(__dirname, './src/pages'),
      '@/stores': resolve(__dirname, './src/stores'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/types': resolve(__dirname, './src/types')
    }
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 28888,
    host: '127.0.0.1',
    strictPort: false // 允許自動尋找可用端口
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
