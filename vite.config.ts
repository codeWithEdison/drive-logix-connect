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
      rollupOptions: isNativeBuild
        ? {
            external: (id) =>
              id.startsWith("@capacitor/") && !id.includes("@capacitor/core"),
          }
        : {
            output: {
              manualChunks: (id) => {
                // Split vendor chunks
                if (id.includes('node_modules')) {
                  if (id.includes('react') || id.includes('react-dom')) {
                    return 'react-vendor';
                  }
                  if (id.includes('@tanstack/react-query')) {
                    return 'query-vendor';
                  }
                  if (id.includes('@radix-ui')) {
                    return 'radix-vendor';
                  }
                  if (id.includes('framer-motion')) {
                    return 'motion-vendor';
                  }
                  if (id.includes('socket.io')) {
                    return 'socket-vendor';
                  }
                  // Other node_modules
                  return 'vendor';
                }
              },
            },
          },
    },
    define: {
      // Define Capacitor environment variables
      global: "globalThis",
    },
  };
});
