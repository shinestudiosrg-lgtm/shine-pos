import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Using relative base path ensures assets load properly on GitHub Pages, Vercel, & Netlify without blank white screen!
})
