import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: (id) => {
        // Externalize Capacitor plugins for web builds
        if (id.startsWith("@capacitor/") && !id.includes("@capacitor/core")) {
          return true;
        }
        // Don't externalize Firebase for web builds
        return false;
      },
    },
  },
  define: {
    // Define Capacitor environment variables
    global: "globalThis",
  },
}));
