<template>
  <div
    class="flex justify-between px-4 py-4 bg-gray-200/50 dark:bg-gray-800/50">
    <NuxtLink to="/" class="flex flex-row gap-1">
      <span class="text-3xl text-center flex flex-row gap-1 justify-center">
        <UIcon name="noto:racing-car" />
        <UIcon name="noto:dashing-away" />
      </span>
    </NuxtLink>
    <UButton
      :icon="toggleMobileMenu ? 'i-heroicons-x-mark' : 'i-heroicons:bars-3'"
      color="gray"
      variant="ghost"
      @click="toggleMobileMenu = !toggleMobileMenu" />
    <MobileMenu>
      <TheSidebar class="w-full sticky px-4 py-4" />
    </MobileMenu>
  </div>
</template>

<script lang="ts" setup>
const toggleMobileMenu = useState('mobilemenu', () => false)
</script>
