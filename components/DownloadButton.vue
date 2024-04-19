<template>
  <UButton
    icon="material-symbols:download"
    variant="ghost"
    aria-label="Download"
    :to="`${url}`"
    color="primary"
  />
</template>

<script lang="ts" setup>
defineProps<{ url?: string }>()
</script>
