import { parse } from 'node-html-parser'

export default upstashWrappedResponseHandler(async () => {
  // get series data from db
  const seriesData = await getSeriesData('IMSA')
  const allEventResults = await getAllEventResults(seriesData)

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
          $fetch<string>(`http://results.imsa.com/${result}`)
            .then(data => ({
              url: `http://results.imsa.com/${result}`,
              result: convertResultName(result),
              data: minifyCsv(data),
            }))
            .catch(() => ({
              url: `http://results.imsa.com/${result}`,
              result: convertResultName(result),
              data: '',
            }))
        )
      ).then(data => {
        return {
          season: season.split('_')[1],
          event: event.split('_')[1],
          results: data,
        }
      })
    })
  )

  // insert csv data into db
  await insertData(data, seriesData)

  const updated = data.flatMap(d => d.results).filter(r => r.data !== '')
  if (updated.length > 0) {
    clearStorage()
  }
  return { updatedIMSA: updated.length }
})

async function getSeasonsWithEvents() {
  const html = await $fetch<string>('http://results.imsa.com/')
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
      $fetch<string>(`http://results.imsa.com/?season=${season}`)
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

async function getAllEventResults(seriesData: SeriesData | undefined) {
  let seasonsWithEvents = await getSeasonsWithEvents()
  if (seriesData) {
    seasonsWithEvents = seasonsWithEvents.filter(
      s =>
        !seriesData.seasons.find(
          (season, i) =>
            season.name === s.season.split('_')[1] &&
            i !== seasonsWithEvents.length - 1
        )
    )
  }
  const allEventResults = []
  const data = await Promise.all(
    seasonsWithEvents.map(({ season, events }) => {
      return Promise.all(
        events.map(event =>
          $fetch<string>(
            `http://results.imsa.com/?season=${season}&evvent=${event}`
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
    if (t.text.includes('IMSA WEATHERTECH SPORTSCAR CHAMPIONSHIP')) {
      const links = t.getElementsByTagName('a').map(a => a.attributes.href)
      for (const link of links) {
        if (
          String(link).includes('Results') &&
          (String(link).includes('.csv') || String(link).includes('.CSV'))
        ) {
          const substrings = [
            'Meteo',
            'Analysis',
            'Analsysis',
            'Time_Cards',
            'Time%20Cards',
            'Points',
            'Replay',
            '99_RMon',
            'Time%20Card',
            'Combined',
          ]
          if (
            !new RegExp(substrings.join('|')).test(String(link)) &&
            !link.includes('_Weather')
          ) {
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
  let resultName = ''

  if (/_Hour/.test(input) && !/Hour%20/.test(input)) {
    const parts = input.split('/')
    const hour = decodeURI(parts[5].split('_')[1])
    const classification = decodeURIComponent(parts[6])
      .replace('.CSV', '')
      .split('_')[2]
    resultName = `${classification} ${hour}`
  } else if (
    /03_Results.CSV/.test(input) ||
    /05_Results.CSV/.test(input) ||
    /05_Results%20by%20Hour.CS/.test(input)
  ) {
    const parts = input.split('/')
    const session = decodeURI(parts[4]).split('_')[1]
    resultName = `${session}`
  } else if (/03_Provisional%20Results.CSV/.test(input)) {
    const parts = input.split('/')
    const session = decodeURI(parts[4]).split('_')[1]
    resultName = `Provisional ${session}`
  } else if (/03_Provisional%20REVISED%20Results.CSV/.test(input)) {
    const parts = input.split('/')
    const session = decodeURI(parts[4]).split('_')[1]
    resultName = `Provisional Revised ${session}`
  } else if (/03_Official%20Results.CSV/.test(input)) {
    const parts = input.split('/')
    const session = decodeURI(parts[4]).split('_')[1]
    resultName = `Official ${session}`
  } else if (/03_Unofficial%20Results.CSV/.test(input)) {
    const parts = input.split('/')
    const session = decodeURI(parts[4]).split('_')[1]
    resultName = `Unofficial ${session}`
  } else if (
    /06_Combined%20Practice%20Results.CSV/.test(input) ||
    /06_Combined%20Practice%20Results_Practice%203.CSV/.test(input) ||
    /06_CombinedClassification_Combined%20Practice.CSV/.test(input) ||
    /06_CombinedClassification_Combine%20Practice.CSV/.test(input) ||
    /06_Combined%20Practice%20Results_Practice%2.CS/.test(input) ||
    /06_Combined%20Practice%20Results_Practice%4.CSV/.test(input)
  ) {
    const parts = input.split('/')
    const session = decodeURI(parts[4]).split('_')[1]
    resultName = `Combined ${session}`
  } else if (
    /00_Grid_Race_Unofficial.CSV/.test(input) ||
    /01_Grid_Race_Unofficial.CSV/.test(input) ||
    /00_Grid_Race_Official.CSV/.test(input) ||
    /01_Grid_Race_Official.CSV/.test(input) ||
    /00_Grid_Race_Provisional.CSV/.test(input) ||
    /01_Grid_Race_Provisional.CSV/.test(input) ||
    /00_Grid_Race_Provisional_Amended.CSV/.test(input) ||
    /01_Grid_Race_Provisional_Amended.CSV/.test(input) ||
    /00_Grid_Race_Official_Amended.CSV/.test(input) ||
    /01_Grid_Race_Official_Amended.CSV/.test(input) ||
    /00_Grid_Race_Official_Revised.CSV/.test(input) ||
    /01_Grid_Race_Official_Revised.CSV/.test(input)
  ) {
    const parts = input.split('/')
    const session = decodeURI(parts[4]).split('_')[1]
    const type = input.includes('Unofficial')
      ? 'Unofficial'
      : input.includes('Official')
        ? 'Official'
        : 'Provisional'
    const amended = input.includes('Amended') ? 'Amended' : ''
    const revised = input.includes('Revised') ? 'Revised' : ''
    resultName = `Grid ${session} ${type} ${revised}${amended}`.trim()
  } else if (/Hour%20/.test(input)) {
    const parts = input.split('/')
    const session = decodeURI(parts[4]).split('_')[1]
    let hour = decodeURI(parts[5]).replace('_', '')
    if (!hour.startsWith('Hour')) {
      hour = removeBeforeSequence(hour, 'Hour')
    }
    resultName = `${session} ${hour}`
  } else {
    const parts = fileName.split('_')
    resultName = parts
      .slice(-2)
      .join(' ')
      .replace('Classification ', '')
      .replace('Results ', '')
    resultName = resultName.replace('CombinedCombined', 'Combined')
  }
  return decodeURI(resultName)
}

function removeBeforeSequence(input: string, sequence: string) {
  const index = input.indexOf(sequence)
  if (index !== -1) {
    return input.substring(index)
  }
  return input
}
