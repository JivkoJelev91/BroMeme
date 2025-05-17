import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   base: './', // Use relative pat
     publicDir: 'public', // Ensure public directory is properly set
   build: {
    outDir: 'dist',
    // Conditionally generate source maps
    sourcemap: process.env.NODE_ENV !== 'production',
      // Ensure assets are properly copied
    assetsDir: 'assets',
    // Copy files from public directory to build output
    copyPublicDir: true,
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      components: path.resolve(__dirname, './src/components'),
      store: path.resolve(__dirname, './src/redux'),
      assets: path.resolve(__dirname, './src/assets'),
      styles: path.resolve(__dirname, './src/styles')
    }
  }
})
