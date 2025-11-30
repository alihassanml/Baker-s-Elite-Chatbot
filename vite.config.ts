import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(),
     tailwindcss(),
  ],
  
  server: {
    host: true,          // listen on all addresses (0.0.0.0)
    strictPort: true,    // optional: ensures it uses the specified port
    port: 5173,          // your port
    // no need for allowedHosts in Vite
  },
});
