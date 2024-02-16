<template>
  <UCard
    :ui="{
      body: { padding: '!p-0', base: 'max-w-full' },
      background: 'bg-white/50 dark:bg-black/20',
    }">
    <template #header>
      <div class="flex flex-row gap-2 rounded-t-lg">
        <span class="text-2xl font-bold dark:text-gray-200 text-gray-800">
          {{
            `${deSlugify(series)} - ${deSlugify(season)} - ${deSlugify(event)} - ${data?.name}`
          }}
        </span>
        <ShareButton />
        <DownloadButton :url="data?.url" />
      </div>
    </template>
    <div
      class="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-row gap-2">
      <USelectMenu
        v-model="selectedColumns"
        :options="columns"
        multiple
        :popper="{ arrow: true }">
        <UButton icon="i-heroicons-view-columns" color="primary" size="xs">
          Columns
        </UButton>
      </USelectMenu>
      <UButton
        icon="i-heroicons-funnel"
        color="primary"
        size="xs"
        :disabled="selectedColumns.length === columns.length"
        @click="selectedColumns = columns">
        Reset
      </UButton>
    </div>
    <UTable :rows="items" :columns="columnsTable" />
  </UCard>
</template>

<script lang="ts" setup>
const { series, season, event, result } = useRoute(
  'series-season-event-result'
).params

const { data } = await useFetch(
  `/api/series/${deSlugify(series)}/seasons/${deSlugify(season)}/events/${deSlugify(event)}/results/${deSlugify(result)}`
)

const items = computed(() => {
  if (data.value?.value) return csv2Array(data.value?.value)
  else return []
})

const columns = computed(() => {
  if (items.value[0]) {
    const keys = Object.keys(items.value[0])
    return keys.map(key => {
      return {
        key,
        label: key,
      }
    })
  }
  return []
})

const selectedColumns = ref(columns.value)
const columnsTable = computed(() =>
  columns.value.filter(column => selectedColumns.value.includes(column))
)

function deSlugify(str: string) {
  return str.replace(/_/g, ' ').toUpperCase()
}

useHead({
  title:
    `${deSlugify(series)} - ${deSlugify(season)} - ${deSlugify(event)} - ${data.value?.name}` ??
    '',
})

function csv2Array(input: string) {
  const csv: string = input
  const allTextLines = csv.split(/\r|\n|\r/)
  const headers = allTextLines[0].split(';')
  headers.forEach((item, index) => {
    headers[index] = item.replace('_', ' ').trim()
  })
  const lines = []

  for (let i = 1; i < allTextLines.length; i++) {
    // split content based on comma
    const data = allTextLines[i].split(';')
    if (data.length > 1) {
      const obj = {} as any
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = data[j]
      }
      lines.push(obj)
    }
  }
  // if key is empty in every object remove the key from every object
  const keys = Object.keys(lines[0])
  for (let i = 0; i < keys.length; i++) {
    let hasValue = false
    for (let j = 1; j < lines.length; j++) {
      if (lines[j][keys[i]] !== '') {
        hasValue = true
        break
      }
    }
    if (!hasValue) {
      for (let j = 0; j < lines.length; j++) {
        delete lines[j][keys[i]]
      }
    }
  }

  return lines
}
</script>

<style>
table tr:nth-child(even) td {
  @apply dark:bg-gray-900/50 bg-gray-100/50;
}
</style>
