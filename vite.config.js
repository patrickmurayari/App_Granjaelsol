import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    /*
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      includeAssets: ['logo.jpg', 'logo-192.jpg', 'logo-512.jpg', 'favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Granja El Sol',
        short_name: 'Granja El Sol',
        description: 'Carnicería y Granja El Sol',
        theme_color: '#e11d48',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'logo-192.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'logo-512.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          },
          {
            src: 'logo-512.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      }
    })
    */
  ],
})
