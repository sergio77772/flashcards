import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build' // Configuramos la salida como "build" para que Vercel lo encuentre automáticamente
  }
})
