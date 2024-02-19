import process from 'node:process'
const sw = process.env.SW === 'true'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/test-utils/module',
    '@nuxt/devtools',
    '@nuxt/ui',
    '@vue-macros/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/google-fonts',
    '@vite-pwa/nuxt',
    '@nuxtjs/seo',
  ],
  devtools: { enabled: true },
  experimental: {
    componentIslands: true,
    typedPages: true,
    payloadExtraction: true,
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'page', mode: 'out-in' },
  },
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
  },
  tailwindcss: {
    cssPath: '~/assets/global.css',
  },
  runtimeConfig: {
    database: {
      url: process.env.DATABASE_URL,
      token: process.env.DATABASE_AUTH_TOKEN,
    },
  },
  googleFonts: {
    families: {
      Inter: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    },
  },
  pwa: {
    strategies: sw ? 'injectManifest' : 'generateSW',
    srcDir: sw ? 'service-worker' : undefined,
    filename: sw ? 'sw.ts' : undefined,
    registerType: 'autoUpdate',
    manifest: {
      name: 'Endurance Results',
      short_name: 'Endurance Results',
      theme_color: '#18181b',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
      // you don't need to include this: only for testing purposes
      // if enabling periodic sync for update use 1 hour or so (periodicSyncForUpdates: 3600)
      periodicSyncForUpdates: 20,
    },
    devOptions: {
      enabled: false,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL,
    name: 'Endurance Results',
    description: 'Get all endurance racing results in one place!',
    defaultLocale: 'en',
  },
  routeRules: {
    '/': { isr: 60 },
    '/api/*': {
      isr: 60 * 60,
      cache: {
        base: 'vercelKV',
      },
    },
  },
  ogImage: {
    runtimeCacheStorage: {
      driver: 'vercelKV',
      binding: 'OG_IMAGE_CACHE',
    },
    defaults: {
      cacheMaxAgeSeconds: 60 * 60 * 24 * 7 * 1000, // 7 days
    },
  },
  nitro: {
    storage: {
      cache: { driver: 'vercelKV' },
      data: { driver: 'vercelKV' },
    },
  },
})
