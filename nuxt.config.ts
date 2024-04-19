// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/test-utils/module',
    '@nuxt/devtools',
    '@nuxt/ui',
    '@vue-macros/nuxt',
    '@vueuse/nuxt',
    '@vite-pwa/nuxt',
    '@nuxtjs/seo',
    '@nuxt/fonts',
    '@nuxthub/core',
    '@nuxt/eslint',
  ],
  hub: {
    database: true,
    cache: true,
  },
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
  pwa: {
    strategies: 'generateSW',
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
  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    cacheMaxAgeSeconds: 3600,
    runtimeCacheStorage: {
      driver: 'cloudflareKVBinding',
      binding: 'CACHE',
    },
  },
  ogImage: {
    fonts: ['Noto+Sans:400', 'Noto+Sans:700'],
    runtimeCacheStorage: {
      driver: 'cloudflareKVBinding',
      binding: 'CACHE',
    },
    defaults: {
      cacheMaxAgeSeconds: 60 * 60 * 24 * 7 * 1000, // 7 days
    },
  },
  nitro: {
    experimental: {
      openAPI: true,
    },
  },
})
