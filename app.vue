<template>
  <div>
    <NuxtPwaManifest />
    <NuxtLoadingIndicator :duration="1000" :color="false" class="bg-red-500" />
    <NuxtLayout
      class="bg-gray-100 font-sans text-gray-500 antialiased dark:bg-gray-900 dark:text-gray-400">
      <NuxtPage />
      <UNotifications />
    </NuxtLayout>
  </div>
</template>
<script setup lang="ts">
const colorMode = useColorMode()
useHead({
  titleTemplate: titleChunk => {
    return titleChunk
      ? `${titleChunk} - Endurance Results`
      : ' Endurance Results'
  },
  htmlAttrs: {
    lang: 'en',
  },
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      href: '/favicon.ico',
    },
  ],
  meta: [
    {
      name: 'theme-color',
      content: colorMode.value === 'dark' ? '#18181b' : '#ffffff',
    },
    {
      name: 'background-color',
      content: colorMode.value === 'dark' ? '#18181b' : '#ffffff',
    },
    {
      name: 'description',
      content: 'Get all endurance racing results in one place!',
    },
  ],
})

useSeoMeta({
  title: 'Endurance Results',
  ogTitle: 'Endurance Results',
  description: 'Get all endurance racing results in one place!',
  ogDescription: 'Get all endurance racing results in one place! ',
  ogType: 'website',
  ogUrl: useSiteConfig().siteUrl + useRoute().path,
  ogSiteName: 'Endurance Results',
  twitterTitle: 'Endurance Results',
  twitterDescription: 'Get all endurance racing results in one place!',
  twitterCard: 'summary_large_image',
})

defineOgImage({ component: 'OgImage' })
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

.layout-enter-active,
.layout-leave-active {
  transition: all 0.4s;
}

.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
