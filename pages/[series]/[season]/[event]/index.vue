<template>
  <div>{{ series }} - {{ season }} - {{ event }}</div>
</template>

<script lang="ts" setup>
const { series, season, event } = useRoute('series-season-event-result').params
const { data } = await useFetch('/api/series')
navigateTo(buildLink(), { replace: true })

function buildLink() {
  const result = data.value
    ?.find(({ name }) => name === deSlugify(series))
    ?.seasons.find(({ name }) => name === deSlugify(season))
    ?.events.find(({ name }) => name === deSlugify(event))?.results[0].name

  if (!series || !season || !event || !result) return '/'
  return `/${slugify(series)}/${slugify(season)}/${slugify(event)}/${slugify(result)}`
}
</script>
