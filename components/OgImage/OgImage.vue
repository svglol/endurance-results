<template>
  <div
    v-if="title === 'Endurance Results'"
    class="h-full w-full bg-red-500 p-4">
    <div class="bg-zinc-900 h-full w-full rounded-3xl">
      <div class="flex flex-row items-center gap-4 relative mx-auto my-auto">
        <span class="text-6xl text-center flex flex-row gap-1 justify-center">
          <UIcon name="noto:racing-car" />
          <UIcon name="noto:dashing-away" />
        </span>
        <h1 class="text-6xl font-light text-white z-10 relative">
          Endurance Results
        </h1>
      </div>
    </div>
  </div>
  <div v-else class="h-full w-full bg-red-500 p-4">
    <div class="bg-zinc-900 h-full w-full rounded-3xl">
      <div
        class="flex flex-col p-12 py-24 items-center relative my-auto justify-center gap-4">
        <div>
          <h1 class="mb-4 text-5xl text-white">
            {{ title }}
          </h1>
          <div
            v-if="
              description !== 'Get all endurance racing results in one place!'
            "
            class="max-w-full text-3xl leading-tight text-white/90 mx-auto">
            {{ description }}
          </div>
        </div>
        <div class="flex flex-row items-center gap-4">
          <span class="text-4xl text-center flex flex-row gap-1 justify-center">
            <UIcon name="noto:racing-car" />
            <UIcon name="noto:dashing-away" />
          </span>
          <h1 class="text-4xl font-light text-white">Endurance Results</h1>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  inheritAttrs: false,
})

$defineProps<{
  title?: String
  description?: String
}>()
</script>
