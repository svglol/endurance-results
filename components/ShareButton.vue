<template>
  <UButton
    icon="i-heroicons-share"
    variant="ghost"
    aria-label="Share"
    color="primary"
    @click="startShare" />
</template>

<script lang="ts" setup>
const { share } = useShare()

function startShare() {
  share({
    title: document.title,
    url: location.href,
  })
}
</script>
