<template>
  <div class="h-full w-full bg-orange-500 p-4">
    <div class="bg-zinc-900 h-full w-full rounded-3xl">
      <div
        v-if="title === ''"
        class="flex flex-row items-center gap-4 relative mx-auto my-auto"
      >
        <span class="text-6xl text-center flex flex-row gap-1 justify-center">
          <UIcon name="twemoji:racing-car" />
          <UIcon name="twemoji:dashing-away" />
        </span>
        <h1 class="text-6xl font-light text-white z-10 relative">
          Endurance Results
        </h1>
      </div>
      <div
        v-else
        class="flex flex-col p-12 items-center justify-between relative my-auto h-full"
      >
        <div />
        <div>
          <div class="flex flex-wrap justify-center gap-x-4 gap-y-2">
            <template v-for="text in title?.split(' - ')" :key="text">
              <span class="text-5xl text-white text-center">
                {{ text }}
              </span>
            </template>
          </div>
          <div
            v-if="
              description !== 'Get all endurance racing results in one place!'
            "
            class="max-w-full text-3xl leading-tight text-white/90 mx-auto text-center"
          >
            {{ description }}
          </div>
        </div>
        <div class="flex flex-row items-center gap-4">
          <span class="text-4xl text-center flex flex-row gap-1 justify-center">
            <UIcon name="twemoji:racing-car" />
            <UIcon name="twemoji:dashing-away" />
          </span>
          <h1 class="text-4xl font-light text-white">
            Endurance Results
          </h1>
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
  title?: string
  description?: string
}>()
</script>
