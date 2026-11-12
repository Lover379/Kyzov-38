
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Kyzov-38/',

  server: {
    host: true,
    port: 5173,
    open: true,
  },

  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
})
