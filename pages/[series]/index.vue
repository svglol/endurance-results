<template>
  <div>{{ series }}</div>
</template>

<script lang="ts" setup>
const { series } = useRoute('series').params
const { data } = await useFetch('/api/series')
navigateTo(buildLink(), { replace: true })

function buildLink() {
  const season = data.value?.find(({ name }) => name === deSlugify(series))
    ?.seasons[0].name
  const event = data.value?.find(({ name }) => name === deSlugify(series))
    ?.seasons[0].events[0].name
  const result = data.value?.find(({ name }) => name === deSlugify(series))
    ?.seasons[0].events[0].results[0].name

  if (!series || !season || !event || !result) return '/'
  return `/${slugify(series)}/${slugify(season)}/${slugify(event)}/${slugify(result)}`
}
</script>
