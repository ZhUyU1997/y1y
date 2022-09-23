import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import dayjs from "dayjs"

// https://vitejs.dev/config/
export default defineConfig({
  base: '/y1y/',
  define: {
    __APP_VERSION__: JSON.stringify("v0.0.6"),
    __APP_BUILD_TIME: Date.now()
  },
  plugins: [react(), VitePWA({
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}']
    },
    manifest: {
      name: '狼了个狼',
      short_name: '狼了个狼',
      description: '狼了个狼',
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
      icons: [
        {
          src: 'android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: 'android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: "any maskable"
        }
      ]
    }
  })]
})
