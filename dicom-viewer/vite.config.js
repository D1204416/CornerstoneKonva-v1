import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  optimizeDeps: {
    include: ['cornerstone-core', 'cornerstone-web-image-loader', 'cornerstone-wado-image-loader', 'dicom-parser']
  }
})