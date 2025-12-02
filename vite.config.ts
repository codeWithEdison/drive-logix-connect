import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isNativeBuild = mode === "native";

  return {
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
      chunkSizeWarningLimit: 1000,
      // Use Vite's default chunking strategy for both web and native builds.
      // Custom manualChunks can sometimes introduce circular evaluation order
      // issues in complex apps, leading to runtime errors like
      // "Cannot access 'X' before initialization" in vendor bundles.
      rollupOptions: isNativeBuild
        ? {
            external: (id) =>
              id.startsWith("@capacitor/") && !id.includes("@capacitor/core"),
          }
        : {},
    },
    define: {
      // Define Capacitor environment variables
      global: "globalThis",
    },
  };
});
