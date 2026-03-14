import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/kurventrainer/',
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Kurventrainer',
        short_name: 'Kurventrainer',
        description: 'Interaktiver Trainer für Extremstellen, Wendestellen & Ableitungen',
        theme_color: '#0d7377',
        background_color: '#faf8f5',
        display: 'standalone',
        start_url: '/kurventrainer/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
      },
    }),
  ],
});
