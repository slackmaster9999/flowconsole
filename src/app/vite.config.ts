import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Ensure all deps use the same React instance to avoid "Invalid hook call" errors.
    dedupe: ['react', 'react-dom'],
    //preserveSymlinks: true // this is the fix!
  },
})
