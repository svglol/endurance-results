<template>
  <aside
    class="overflow-y-auto lg:block lg:max-h-screen lg:sticky py-4 lg:px-4 lg:top-0 lg:h-screen">
    <div class="flex flex-col gap-2 justify-between w-full">
      <div class="hidden relative lg:flex flex-col gap-0 justify-between">
        <NuxtLink
          to="/"
          class="flex flex-col gap-1"
          @click="toggleMobileMenu = false">
          <span class="text-3xl text-center flex flex-row gap-1 justify-center">
            <UIcon name="twemoji:racing-car" />
            <UIcon name="twemoji:dashing-away" />
          </span>
          <span
            class="text-2xl font-light text-center dark:text-white text-black">
            Endurance Results
          </span>
        </NuxtLink>
      </div>
      <div class="flex flex-row gap-2 justify-center">
        <SearchButton />
        <DarkToggle />
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
import { promiseTimeout } from '@vueuse/core'

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

const testingResults = computed(() => {
  const substrings = ['Test', 'Session']
  const regex = new RegExp(substrings.join('|'))
  return results.value.filter(({ label }) => regex.test(label))
})

const practiceResults = computed(() => {
  const substrings = ['Practice']
  const regex = new RegExp(substrings.join('|'))
  return results.value.filter(
    ({ label }) =>
      regex.test(label) &&
      !testingResults.value.find(
        ({ label: practiceLabel }) => practiceLabel === label
      )
  )
})

const qualifyingResults = computed(() => {
  const substrings = ['Qualifying', 'Hyperpole', 'Grid']
  const regex = new RegExp(substrings.join('|'))
  // Exclude labels already matched by practiceResults
  return results.value.filter(
    ({ label }) =>
      regex.test(label) &&
      !practiceResults.value.find(
        ({ label: practiceLabel }) => practiceLabel === label
      ) &&
      !testingResults.value.find(
        ({ label: practiceLabel }) => practiceLabel === label
      )
  )
})

const warmupResults = computed(() => {
  const substrings = ['Warmup', 'Warm-Up', 'Warm up', 'Warm-up', 'Warm Up']
  const regex = new RegExp(substrings.join('|'))
  // Exclude labels already matched by practiceResults and qualifyingResults
  return results.value.filter(
    ({ label }) =>
      regex.test(label) &&
      !practiceResults.value.find(
        ({ label: practiceLabel }) => practiceLabel === label
      ) &&
      !qualifyingResults.value.find(
        ({ label: qualifyingLabel }) => qualifyingLabel === label
      ) &&
      !testingResults.value.find(
        ({ label: practiceLabel }) => practiceLabel === label
      )
  )
})

const raceResults = computed(() => {
  const substrings = ['Race']
  const regex = new RegExp(substrings.join('|'))
  // Exclude labels already matched by practiceResults, qualifyingResults, and warmupResults
  return results.value.filter(
    ({ label }) =>
      regex.test(label) &&
      !practiceResults.value.find(
        ({ label: practiceLabel }) => practiceLabel === label
      ) &&
      !qualifyingResults.value.find(
        ({ label: qualifyingLabel }) => qualifyingLabel === label
      ) &&
      !warmupResults.value.find(
        ({ label: warmupLabel }) => warmupLabel === label
      ) &&
      !testingResults.value.find(
        ({ label: practiceLabel }) => practiceLabel === label
      )
  )
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
    .filter(
      ({ label }) => !testingResults.value.some(({ label: l }) => l === label)
    )
})

const accordionItems = computed(() => {
  const items = [] as {
    label: string
    items?: { label: string; value: string }[]
  }[]
  if (testingResults.value.length > 0) {
    items.push({
      label: 'Testing',
      items: testingResults.value,
    })
  }
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
    seasons.value[seasons.value.length - 1]
)
const selectedEvent = ref(
  events.value.find(
    ({ label }) => label.toUpperCase() === deSlugify(eventParam)
  ) ?? events.value[events.value.length - 1]
)

watch(selectedSeries, () => {
  if (!updateRoute) {
    selectedSeason.value = seasons.value[seasons.value.length - 1]
  }
})

watch(selectedSeason, () => {
  if (!updateRoute) {
    selectedEvent.value = events.value[events.value.length - 1]
  }
})

watch(selectedEvent, () => {
  if (!updateRoute) {
    navigateTo(createSlug(results.value[0].label), {
      replace: true,
    })
  }
})

const route = useRoute('series-season-event-result')
let updateRoute = false
watch(
  () => route.params,
  async () => {
    updateRoute = true
    if (route.params.series) {
      selectedSeries.value =
        series.value.find(
          ({ label }) => label === deSlugify(route.params.series)
        ) ?? series.value[0]
    }
    if (route.params.season) {
      selectedSeason.value =
        seasons.value.find(
          ({ label }) => label === deSlugify(route.params.season)
        ) ?? seasons.value[seasons.value.length - 1]
    }
    if (route.params.event) {
      selectedEvent.value =
        events.value.find(
          ({ label }) => label.toUpperCase() === deSlugify(route.params.event)
        ) ?? events.value[events.value.length - 1]
    }
    await promiseTimeout(1000)
    updateRoute = false
  }
)

function createSlug(label: string) {
  return `/${slugify(selectedSeries.value.label)}/${slugify(selectedSeason.value.label)}/${slugify(selectedEvent.value.label)}/${slugify(label)}`
}
</script>
