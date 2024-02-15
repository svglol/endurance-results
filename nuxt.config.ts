// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/test-utils/module',
    '@nuxt/devtools',
    '@nuxt/ui',
    '@vue-macros/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/google-fonts',
  ],
  devtools: { enabled: true },
  experimental: {
    componentIslands: true,
    typedPages: true,
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
  routeRules: {
    '/**': { isr: 60 },
    '/': { prerender: true },
  },
})
