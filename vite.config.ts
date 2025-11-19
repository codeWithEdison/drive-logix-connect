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
