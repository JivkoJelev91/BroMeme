import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
