import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from '@tailwindcss/vite';
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    server: {
      host: "::",
      port: 8080,
      // Fix: Check if DISABLE_HMR is set to 'true' in the env
      hmr: env.DISABLE_HMR !== 'true',
      proxy: mode === 'development' ? {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      } : undefined,
    },
    plugins: [
      react(),
      tailwindcss(),
      // Fix: Make sure componentTagger is properly handled
      ...(mode === "development" && componentTagger ? [componentTagger()] : []),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "favicon.ico",
          "pwa-192x192.svg",
          "pwa-512x512.svg",
          "pwa-192x192.png",
          "pwa-512x512.png"
        ],
        manifest: {
          name: "Clockit - Social Media & Music",
          short_name: "Clockit",
          description: "Share stories, watch reels, chat with friends, and stream music",
          start_url: "/",
          display: "standalone",
          background_color: "#0a0a0f",
          theme_color: "#7c3aed",
          orientation: "portrait-primary",
          scope: "/",
          lang: "en",
          categories: ["social", "music", "entertainment", "lifestyle"],
          dir: "ltr",
          prefer_related_applications: false,
          iarc_rating_id: "",
          related_applications: [],
          edge_side_panel: {
            preferred_width: 400
          },
          shortcuts: [
            {
              name: "New Story",
              short_name: "Story",
              description: "Create and share a new story",
              url: "/snap",
              icons: [
                {
                  src: "pwa-192x192.svg",
                  sizes: "192x192"
                }
              ]
            },
            {
              name: "Music Player",
              short_name: "Music",
              description: "Listen to your favorite music",
              url: "/music",
              icons: [
                {
                  src: "pwa-192x192.svg",
                  sizes: "192x192"
                }
              ]
            },
            {
              name: "Chat",
              short_name: "Messages",
              description: "Chat with your friends",
              url: "/chat",
              icons: [
                {
                  src: "pwa-192x192.svg",
                  sizes: "192x192"
                }
              ]
            }
          ],
          icons: [
            {
              src: "pwa-192x192.svg",
              sizes: "192x192",
              type: "image/svg+xml",
              purpose: "any maskable"
            },
            {
              src: "pwa-512x512.svg",
              sizes: "512x512",
              type: "image/svg+xml",
              purpose: "any maskable"
            },
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable"
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable"
            },
            {
              src: "favicon.ico",
              sizes: "48x48",
              type: "image/x-icon",
              purpose: "any"
            }
          ],
          screenshots: [
            {
              src: "screenshot-mobile.png",
              sizes: "390x844",
              type: "image/png",
              form_factor: "narrow",
              label: "Clockit mobile interface"
            },
            {
              src: "screenshot-desktop.png",
              sizes: "1280x720",
              type: "image/png",
              form_factor: "wide",
              label: "Clockit desktop interface"
            }
          ]
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,webp,jpg,jpeg,gif}"],
          navigateFallback: '/',
          navigateFallbackAllowlist: [
            /^\/$/,
            /^\/auth$/,
            /^\/profile$/,
            /^\/stories$/,
            /^\/music$/,
            /^\/groups$/,
            /^\/reels$/,
            /^\/live$/,
            /^\/chat$/,
            /^\/settings$/,
            /^\/snap$/,
            /^\/camera-test$/,
            /^\/onboarding$/,
            /^\/offline-reels$/,
            /^\/search$/,
            /^\/downloads$/,
            /^\/podcasts$/,
            /^\/settings\/appearance$/
          ],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/clockit-gvm2\.onrender\.com\/api\//,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 // 24 hours
                }
              }
            },
            {
              urlPattern: /^https:\/\/ws\.audioscrobbler\.com\/2\.0\//,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'lastfm-api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 6 // 6 hours
                }
              }
            },
            {
              urlPattern: /^https:\/\/api\.spotify\.com\/v1\//,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'spotify-api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 30 // 30 minutes
                }
              }
            },
            {
              urlPattern: /\.(?:mp3|wav|m4a|aac|ogg)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'music-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
                }
              }
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts-stylesheets'
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                }
              }
            }
          ],
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          sourcemap: false
        },
        devOptions: {
          enabled: true
        }
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});