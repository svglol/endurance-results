<template>
  <USlideover
    v-model="isOpen"
    :transition="true"
    :overlay="false"
    side="left"
    :ui="{
      width: 'w-full max-w-full',
      base: 'mt-[4rem]',
      padding: 'p-0',
    }"
    class="flex lg:hidden">
    <slot />
  </USlideover>
</template>

<script lang="ts" setup>
const isOpen = useState('mobilemenu', () => false)
</script>
<style>
html {
  padding-right: 0 !important ;
}
</style>
