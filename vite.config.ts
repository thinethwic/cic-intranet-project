import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (["react", "react-dom", "react-router-dom"].some((pkg) => id.includes(`/${pkg}/`))) return "vendor-react";
            if (["lucide-react", "react-icons"].some((pkg) => id.includes(`/${pkg}/`))) return "vendor-ui";
            if (id.includes("/recharts/")) return "vendor-charts";
            if (["date-fns", "react-day-picker"].some((pkg) => id.includes(`/${pkg}/`))) return "vendor-date";
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
