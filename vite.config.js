import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages deployment configuration
  // When deployed to https://yveszun.github.io/finvanta-diagnostic/
  base: process.env.GITHUB_PAGES === 'true' ? '/finvanta-diagnostic/' : '/',
  build: {
    // Ensure assets are correctly referenced with the base path
    assetsDir: 'assets',
    // Generate sourcemaps for debugging (optional, but helpful)
    sourcemap: false,
    // Ensure proper output structure
    outDir: 'dist',
  },
})
