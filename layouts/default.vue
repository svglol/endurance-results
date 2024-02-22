<template>
  <main class="main">
    <div
      class="flex flex-col lg:flex-row divide-x dark:divide-gray-800 divide-gray-200 min-h-screen">
      <MobileHeader class="lg:hidden" />
      <MobileMenu>
        <TheSidebar :data="data" class="w-full sticky px-4 py-4 h-full" />
      </MobileMenu>
      <div class="hidden lg:block basis-2/12 flex-none">
        <TheSidebar :data="data" />
      </div>
      <div class="grow p-4 overflow-x-scroll"><slot /></div>
    </div>
  </main>
</template>

<script setup lang="ts">
const { data } = await useFetch('/api/series')
</script>
