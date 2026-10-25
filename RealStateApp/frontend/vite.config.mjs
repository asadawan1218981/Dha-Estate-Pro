import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite + React frontend for DHA Estate Pro.
// API base stays http://localhost:5000 (see pages/stores).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  preview: {
    port: 4173
  }
});
