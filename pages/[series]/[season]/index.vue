<template>
  <div>{{ series }} - {{ season }}</div>
</template>

<script lang="ts" setup>
const { series, season } = useRoute('series-season').params
const { data } = await useFetch('/api/series')
navigateTo(buildLink(), { replace: true })

function buildLink() {
  const event = data.value
    ?.find(({ name }) => name === deSlugify(series))
    ?.seasons.find(({ name }) => name === deSlugify(season))?.events[0].name
  const result = data.value
    ?.find(({ name }) => name === deSlugify(series))
    ?.seasons.find(({ name }) => name === deSlugify(season))?.events[0]
    .results[0].name

  if (!series || !season || !event || !result)
    return '/'
  return `/${slugify(series)}/${slugify(season)}/${slugify(event)}/${slugify(result)}`
}
</script>
