import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isNativeBuild = mode === "native";

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "favicon.ico",
          "lovewaylogistic.png",
          "logo.png",
          "logo-text.png",
        ],
        manifest: {
          name: "Loveway Logistics",
          short_name: "Loveway",
          description:
            "Leading logistics and cargo delivery services in Rwanda. Real-time tracking, fleet management, and reliable transportation solutions.",
          theme_color: "#1e40af",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait-primary",
          scope: "/",
          start_url: "/",
          icons: [
            {
              src: "/lovewaylogistic.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "/lovewaylogistic.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
          shortcuts: [
            {
              name: "Create Cargo",
              short_name: "New Cargo",
              description: "Create a new cargo shipment",
              url: "/create-cargo",
              icons: [{ src: "/lovewaylogistic.png", sizes: "96x96" }],
            },
            {
              name: "My Cargos",
              short_name: "Cargos",
              description: "View all your cargo shipments",
              url: "/my-cargos",
              icons: [{ src: "/lovewaylogistic.png", sizes: "96x96" }],
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "gstatic-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
              handler: "CacheFirst",
              options: {
                cacheName: "images-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
              },
            },
            {
              urlPattern: /^https:\/\/.*\/api\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 5, // 5 minutes
                },
                networkTimeoutSeconds: 10,
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: "module",
        },
      }),
    ].filter(Boolean),
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
