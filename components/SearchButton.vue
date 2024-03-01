<template>
  <UTooltip text="Search" :shortcuts="[metaSymbol, 'K']">
    <UButton
      icon="i-heroicons-magnifying-glass-20-solid"
      color="gray"
      variant="ghost"
      aria-label="Search"
      @click="isOpen = true" />
  </UTooltip>
  <UModal v-model="isOpen">
    <UCommandPalette
      :autoselect="false"
      :groups="groups"
      command-attribute="title"
      :fuse="{
        fuseOptions: { keys: ['title', 'category'] },
      }"
      selected-icon=""
      @update:model-value="onSelect">
      <template #empty-state>
        <div />
      </template>
    </UCommandPalette>
  </UModal>
</template>

<script lang="ts" setup>
const { metaSymbol } = useShortcuts()
const { disableShortcut } = definePropsRefs<{
  disableShortcut?: boolean
}>()

const isOpen = ref(false)

const groups = [
  {
    key: 'pages',
    label: (q: string) => q && `Pages matching “${q}”...`,
    search: async (q: string) => {
      if (!q) {
        return []
      }

      const pages = (await $fetch('/api/search', { params: { q } })) as {
        label: string
        url: string
      }[]
      return pages.map(page => ({
        to: page.url,
        icon: 'i-heroicons-document',
        title: page.label,
      }))
    },
  },
]

defineShortcuts({
  meta_k: {
    usingInput: true,
    handler: () => {
      if (disableShortcut.value) return
      isOpen.value = !isOpen.value
    },
  },
  escape: {
    usingInput: true,
    whenever: [isOpen],
    handler: () => {
      if (disableShortcut.value) return
      isOpen.value = false
    },
  },
})

function onSelect(option: { to: string }) {
  if (option && option.to) {
    navigateTo(option.to)
    isOpen.value = false
  }
}
</script>
