import { parse } from 'node-html-parser'

export default upstashWrappedResponseHandler(async () => {
  // get series data from db
  const seriesData = await getSeriesData('ALMS')
  const allEventResults = await getAllEventResults()
  // only get results that don't exist
  const filteredResults = sortResultsToInsert(
    seriesData,
    allEventResults,
    convertResultName
  )

  // get csv data from fiawec
  const data = await Promise.all(
    filteredResults.map(({ season, event, results }) => {
      return Promise.all(
        results.map(result =>
          $fetch<string>(`http://alms.alkamelsystems.com/${result}`)
            .then(data => ({
              url: `http://alms.alkamelsystems.com/${result}`,
              result: convertResultName(result),
              data: minifyCsv(data),
            }))
            .catch(() => ({
              url: `http://alms.alkamelsystems.com/${result}`,
              result: convertResultName(result),
              data: '',
            }))
        )
      ).then(data => ({
        season: season.split('_')[1],
        event: event.split('_')[1],
        results: data,
      }))
    })
  )

  // insert csv data into db
  await insertData(data, seriesData)

  const updated = data.flatMap(d => d.results).filter(r => r.data !== '')
  if (updated.length > 0) {
    await clearStorage()
  }

  return { updatedALMS: updated.length }
})

async function getSeasonsWithEvents() {
  const html = await $fetch<string>('http://alms.alkamelsystems.com/')
  const page = parse(html)
  let select = page.getElementsByTagName('select')
  select = select.filter(s => s.attributes.name === 'season')
  const seasonsSelect = select[0]
  const seasons = seasonsSelect
    .getElementsByTagName('option')
    .map(option => option.attributes.Value)

  const seasonsWithEvents = []
  const seasonsData = Promise.all(
    seasons.map(season =>
      $fetch<string>(`http://alms.alkamelsystems.com/?season=${season}`)
        .then(data => {
          return {
            data,
            season,
          }
        })
        .catch(() => {
          return {
            data: '',
            season,
          }
        })
    )
  )
  for (const { data, season } of await seasonsData) {
    const page = parse(data)
    let select = page.getElementsByTagName('select')
    select = select.filter(s => s.attributes.name === 'evvent')
    const eventsSelect = select[0]
    const events = eventsSelect
      .getElementsByTagName('option')
      .map(option => option.attributes.Value)
    seasonsWithEvents.push({ season, events })
  }
  return seasonsWithEvents
}

async function getAllEventResults() {
  const seasonsWithEvents = await getSeasonsWithEvents()
  const allEventResults = []
  const data = await Promise.all(
    seasonsWithEvents.map(({ season, events }) => {
      return Promise.all(
        events.map(event =>
          $fetch<string>(
            `http://alms.alkamelsystems.com/?season=${season}&evvent=${event}`
          )
            .then(data => ({ event, data }))
            .catch(() => ({ event, data: '' }))
        )
      ).then(data => ({ season, events: data }))
    })
  )
  for (const { season, events } of data) {
    for (const event of events) {
      const eventResults = parseEventResults(season, event)
      if (eventResults) allEventResults.push(eventResults)
    }
  }

  return allEventResults
}

function parseEventResults(
  season: string,
  event: { event: string; data: string }
) {
  const page = parse(event.data)
  let td = page.getElementsByTagName('table')
  td = td.filter(t => t.getElementsByTagName('a').length > 0)
  const results = []
  for (const t of td) {
    if (t.text.includes('ASIAN LE MANS SERIES')) {
      const links = t.getElementsByTagName('a').map(a => a.attributes.href)
      for (const link of links) {
        if (
          String(link).includes('Results') &&
          (String(link).includes('.csv') || String(link).includes('.CSV'))
        ) {
          const substrings = ['Meteo', 'Analysis', 'Analsysis', 'Weather']
          if (!new RegExp(substrings.join('|')).test(String(link))) {
            results.push(link)
          }
        }
      }
    }
  }
  if (results.length === 0) {
    return null
  }
  return {
    season,
    event: event.event,
    results,
  }
}

function convertResultName(input: string) {
  const fileName = input.replace('.CSV', '').split('/').pop() || ''
  const parts = fileName.split('_')
  const resultName = parts.slice(-2).join(' ').replace('Classification ', '')
  if (input.includes('/Hour')) {
    const parts = input.split('/')
    const hour = decodeURI(parts[5])
    const classification = decodeURIComponent(parts[6])
      .replace('.CSV', '')
      .split('_')[2]
    const title = `${classification} ${hour}`
    return title
  }
  return decodeURI(resultName)
}
