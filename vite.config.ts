import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Listen on all interfaces so phones on the same Wi‑Fi can open http://<your-lan-ip>:5173
    host: true,
    port: 5173,
    strictPort: true,
  },
})
