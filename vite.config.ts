import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  server: {
    // Listen on all interfaces so phones on the same Wi‑Fi can open http://<your-lan-ip>:5173
    host: true,
    port: 5173,
    strictPort: true,
  },
})
