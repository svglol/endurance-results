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
    <div v-if="data?.value">
      <UTable :rows="csv2Array(data.value)" />
    </div>
    <div v-else>No data</div>
  </UCard>
</template>

<script lang="ts" setup>
const { series, season, event, result } = useRoute(
  'series-season-event-result'
).params

const { data } = await useFetch(
  `/api/series/${deSlugify(series)}/seasons/${deSlugify(season)}/events/${deSlugify(event)}/results/${deSlugify(result)}`
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
        const substrings = ['ECM', 'EXTRA', 'Extra', 'LICENSE', 'COUNTRY']
        const regex = new RegExp(substrings.join('|'))
        if (
          regex.test(headers[j]) ||
          data[j] === '' ||
          data[j] === null ||
          data[j] === undefined
        ) {
          continue
        }

        const lastnamesubstrings = [
          'DRIVER1 SECONDNAME',
          'DRIVER2 SECONDNAME',
          'DRIVER3 SECONDNAME',
          'DRIVER4 SECONDNAME',
          'DRIVER5 SECONDNAME',
        ]
        const lastnameregex = new RegExp(lastnamesubstrings.join('|'))
        if (lastnameregex.test(headers[j])) {
          continue
        }
        const firstnamesubstrings = [
          'DRIVER1 FIRSTNAME',
          'DRIVER2 FIRSTNAME',
          'DRIVER3 FIRSTNAME',
          'DRIVER4 FIRSTNAME',
          'DRIVER5 FIRSTNAME',
        ]
        const firstnameregex = new RegExp(firstnamesubstrings.join('|'))
        if (firstnameregex.test(headers[j])) {
          obj[
            headers[j].replace('FIRSTNAME', '').replace(/([A-Z])(\d)/g, '$1 $2')
          ] = data[j] + ' ' + data[j + 1]
        } else {
          obj[headers[j]] = data[j]
        }
      }
      lines.push(obj)
    }
  }
  return lines
}
</script>
