<template>
  <aside
    class="overflow-y-auto lg:block lg:max-h-screen lg:sticky py-4 lg:px-4 lg:top-0 lg:h-screen">
    <div class="flex flex-col gap-4 justify-between w-full">
      <div class="hidden relative lg:flex flex-col gap-0">
        <div class="absolute right-0 top-0 z-20">
          <DarkToggle />
        </div>
        <NuxtLink
          to="/"
          class="flex flex-col gap-1"
          @click="toggleMobileMenu = false">
          <span class="text-3xl text-center flex flex-row gap-1 justify-center">
            <UIcon name="noto:racing-car" />
            <UIcon name="noto:dashing-away" />
          </span>
          <span
            class="text-2xl font-light text-center dark:text-white text-black">
            Endurance Results
          </span>
        </NuxtLink>
      </div>
      <div class="flex flex-col gap-1">
        <UFormGroup label="Series">
          <USelectMenu v-model="selectedSeries" :options="series" />
        </UFormGroup>
        <UFormGroup label="Season">
          <USelectMenu v-model="selectedSeason" :options="seasons" />
        </UFormGroup>
        <UFormGroup label="Event">
          <USelectMenu v-model="selectedEvent" :options="events" />
        </UFormGroup>
        <UFormGroup label="Results">
          <UAccordion
            multiple
            default-open
            color="white"
            variant="ghost"
            size="md"
            :items="accordionItems">
            <template #default="{ item, open }">
              <UButton
                color="white"
                variant="ghost"
                :ui="{
                  rounded: 'rounded-none',
                  padding: { sm: 'p-0 pl-1' },
                }">
                {{ item.label }}
                <template #trailing>
                  <UIcon
                    name="i-heroicons-chevron-right-20-solid"
                    class="w-5 h-5 ms-auto transform transition-transform duration-200"
                    :class="[open && 'rotate-90']" />
                </template>
              </UButton>
            </template>

            <template #item="{ item }">
              <div class="flex flex-col px-3">
                <ULink
                  v-for="{ label } in item.items"
                  :key="label"
                  class="pl-4 border-l py-1"
                  active-class="text-primary border-primary"
                  inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border-gray-200 dark:border-gray-800"
                  :to="createSlug(label)"
                  @click="toggleMobileMenu = false">
                  {{ label }}
                </ULink>
              </div>
            </template>
          </UAccordion>
        </UFormGroup>
      </div>
    </div>
    <TheFooter class="mt-4 pt-4 -mx-4 pb-0" />
  </aside>
</template>

<script lang="ts" setup>
import slugify from 'slugify'
const { data } = $defineProps<{
  data: SeriesWithRelations[] | null
}>()
const toggleMobileMenu = useState('mobilemenu', () => false)

const series = computed(() => {
  return (
    data?.map(({ name, id }) => {
      return { label: name, value: id }
    }) ?? []
  )
})

const seasons = computed(() => {
  return (
    data
      ?.filter(({ id }) => id === selectedSeries.value.value)
      .flatMap(({ seasons }) =>
        seasons.map(({ name, id }) => {
          return { label: name, value: id }
        })
      ) ?? []
  )
})

const events = computed(() => {
  return (
    data
      ?.filter(({ id }) => id === selectedSeries.value.value)
      .flatMap(({ seasons }) =>
        seasons.filter(({ id }) => id === selectedSeason.value.value)
      )
      .flatMap(({ events }) => events)
      .map(({ name, id }) => {
        return { label: name, value: id }
      }) ?? []
  )
})

const results = computed(() => {
  return (
    data
      ?.filter(({ id }) => id === selectedSeries.value.value)
      .flatMap(({ seasons }) =>
        seasons.filter(({ id }) => id === selectedSeason.value.value)
      )
      .flatMap(({ events }) =>
        events.filter(({ id }) => id === selectedEvent.value.value)
      )
      .flatMap(({ results }) => results)
      .map(({ name, id }) => {
        return { label: name, value: id }
      }) ?? []
  )
})

const practiceResults = computed(() => {
  const substrings = ['Practice', 'Test']
  const regex = new RegExp(substrings.join('|'))
  return results.value.filter(({ label }) => regex.test(label))
})

const qualifyingResults = computed(() => {
  const substrings = ['Qualifying', 'Hyperpole']
  const regex = new RegExp(substrings.join('|'))
  return results.value.filter(({ label }) => regex.test(label))
})

const warmupResults = computed(() => {
  const substrings = ['Warmup', 'Warm-Up']
  const regex = new RegExp(substrings.join('|'))
  return results.value.filter(({ label }) => regex.test(label))
})

const raceResults = computed(() => {
  const substrings = ['Race']
  const regex = new RegExp(substrings.join('|'))
  return results.value.filter(({ label }) => regex.test(label))
})

const otherResults = computed(() => {
  // results that arent caught
  return results.value
    .filter(
      ({ label }) => !raceResults.value.some(({ label: l }) => l === label)
    )
    .filter(
      ({ label }) =>
        !qualifyingResults.value.some(({ label: l }) => l === label)
    )
    .filter(
      ({ label }) => !warmupResults.value.some(({ label: l }) => l === label)
    )
    .filter(
      ({ label }) => !practiceResults.value.some(({ label: l }) => l === label)
    )
})

const accordionItems = computed(() => {
  const items = [] as {
    label: string
    items?: { label: string; value: string }[]
  }[]
  if (practiceResults.value.length > 0) {
    items.push({
      label: 'Practice',
      items: practiceResults.value,
    })
  }
  if (qualifyingResults.value.length > 0) {
    items.push({
      label: 'Qualifying',
      items: qualifyingResults.value,
    })
  }
  if (warmupResults.value.length > 0) {
    items.push({
      label: 'Warmup',
      items: warmupResults.value,
    })
  }
  if (raceResults.value.length > 0) {
    items.push({
      label: 'Race',
      items: raceResults.value,
    })
  }
  if (otherResults.value.length > 0) {
    items.push({
      label: 'Other',
      items: otherResults.value,
    })
  }
  return items
})

const {
  series: seriesParam,
  season: seasonParam,
  event: eventParam,
} = useRoute('series-season-event-result').params

const selectedSeries = ref(
  series.value.find(({ label }) => label === deSlugify(seriesParam)) ??
    series.value[0]
)
const selectedSeason = ref(
  seasons.value.find(({ label }) => label === deSlugify(seasonParam)) ??
    seasons.value[0]
)
const selectedEvent = ref(
  events.value.find(({ label }) => label === deSlugify(eventParam)) ??
    events.value[0]
)

watch(selectedSeries, () => {
  selectedSeason.value = seasons.value[0]
})

watch(selectedSeason, () => {
  selectedEvent.value = events.value[0]
})

watch(selectedEvent, () => {
  navigateTo(createSlug(results.value[0].label), { replace: true })
})

function createSlug(label: string) {
  return `/${slugify(selectedSeries.value.label, { replacement: '_', lower: true })}/${slugify(selectedSeason.value.label, { replacement: '_', lower: true })}/${slugify(selectedEvent.value.label, { replacement: '_', lower: true })}/${slugify(label, { replacement: '_', lower: true })}`
}

function deSlugify(str: string) {
  if (!str) return str
  return str.replace(/_/g, ' ').toUpperCase()
}
</script>
