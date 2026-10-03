import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Mirrors the "@/*" path in tsconfig.app.json. "/src" is resolved by
      // Vite relative to the project root, so no Node.js APIs (and no
      // @types/node) are needed — which keeps `tsc -b` happy on Vercel.
      "@": "/src",
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
