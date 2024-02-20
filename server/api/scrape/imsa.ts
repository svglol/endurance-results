import { parse } from 'node-html-parser'
import {
  series,
  season as tableSeason,
  event as tableEvent,
  result as tableResult,
} from '~/server/db/schema'

export default defineEventHandler(async () => {
  const allEventResults = await getAllEventResults()

  // get series data from db
  let seriesData = await db.query.series.findFirst({
    where: (series, { like }) => like(series.name, 'IMSA'),
    with: { seasons: { with: { events: { with: { results: true } } } } },
  })
  if (!seriesData) {
    const id = crypto.randomUUID()
    await db.insert(series).values({
      id,
      name: 'IMSA',
    })
    seriesData = await db.query.series.findFirst({
      where: (series, { like }) => like(series.name, 'IMSA'),
      with: { seasons: { with: { events: { with: { results: true } } } } },
    })
  }
  if (!seriesData) return

  const allowedResults = [] as string[]
  for (const results of allEventResults) {
    for (const result of results.results) {
      const eventNotFound = !seriesData?.seasons
        .find(s => s.name.includes(results.season.split('_')[1]))
        ?.events.find(e => e.name.includes(results.event.split('_')[1]))

      if (
        seriesData?.seasons
          .find(s => s.name.includes(results.season.split('_')[1]))
          ?.events.find(e => e.name.includes(results.event.split('_')[1]))
          ?.results.filter(r => r.name.includes(convertResultName(result)))
          .length === 0 ||
        eventNotFound
      ) {
        allowedResults.push(result)
      }
    }
  }
  const filteredResults = allEventResults.map(eventResult => {
    return {
      ...eventResult,
      results: eventResult.results.filter(r => allowedResults.includes(r)),
    }
  })
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

  // // insert csv data into db
  for (const { season, event, results } of data) {
    await db.transaction(async tx => {
      // check if season exists
      let seasonId = ''
      if (
        seriesData?.seasons.filter(s => s.name.includes(season)).length === 0
      ) {
        seasonId = crypto.randomUUID()
        await tx.insert(tableSeason).values({
          id: seasonId,
          name: season,
          seriesId: seriesData.id,
        })
        seriesData.seasons.push({
          id: seasonId,
          name: season,
          seriesId: seriesData.id,
          events: [],
        })
      } else {
        seasonId = seriesData?.seasons.filter(s => s.name.includes(season))[0]
          .id as string
      }
      // check if event exists
      let eventId = ''
      if (
        seriesData?.seasons
          .filter(s => s.name.includes(season))[0]
          .events.filter(e => e.name.includes(event)).length === 0
      ) {
        eventId = crypto.randomUUID()
        await tx.insert(tableEvent).values({
          id: eventId,
          name: event,
          seasonId,
        })
        seriesData.seasons
          .filter(s => s.name.includes(season))[0]
          .events.push({
            id: eventId,
            name: event,
            seasonId,
            results: [],
          })
      } else {
        eventId = seriesData?.seasons
          .filter(s => s.name.includes(season))[0]
          .events.filter(e => e.name.includes(event))[0].id as string
      }
      // check if result exists
      for (const result of results) {
        if (result.data !== '') {
          if (
            seriesData?.seasons
              .filter(s => s.name.includes(season))[0]
              .events.filter(e => e.name.includes(event))[0]
              .results.filter(r => r.name.includes(result.result)).length === 0
          ) {
            const resultId = crypto.randomUUID()
            await tx.insert(tableResult).values({
              id: resultId,
              name: result.result,
              value: result.data,
              url: result.url,
              eventId,
            })
            seriesData.seasons
              .filter(s => s.name.includes(season))[0]
              .events.filter(e => e.name.includes(event))[0]
              .results.push({
                id: resultId,
                name: result.result,
                value: result.data,
                url: result.url,
                eventId,
              })
          }
        }
      }
    })
  }
  return {
    updatedIMSA: data.flatMap(d => d.results).filter(r => r.data !== '').length,
  }
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

async function getAllEventResults() {
  const seasonsWithEvents = await getSeasonsWithEvents()
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
  const parts = fileName.split('_')
  let resultName = parts
    .slice(-2)
    .join(' ')
    .replace('Classification ', '')
    .replace('Results ', '')
  resultName = resultName.replace('CombinedCombined', 'Combined')

  if (/_Hour/.test(input)) {
    const parts = input.split('/')
    const hour = decodeURI(parts[5].split('_')[1])
    const classification = decodeURIComponent(parts[6])
      .replace('.CSV', '')
      .split('_')[2]
    const title = `${classification} ${hour}`
    resultName = title
  }
  if (
    /03_Results.CSV/.test(input) ||
    /05_Results.CSV/.test(input) ||
    /05_Results%20by%20Hour.CS/.test(input)
  ) {
    const parts = input.split('/')
    const session = decodeURI(parts[4]).split('_')[1]
    resultName = `${session}`
  }
  if (/03_Provisional%20Results.CSV/.test(input)) {
    const parts = input.split('/')
    const session = decodeURI(parts[4]).split('_')[1]
    resultName = `Provisional ${session}`
  }
  if (/03_Provisional%20REVISED%20Results.CSV/.test(input)) {
    const parts = input.split('/')
    const session = decodeURI(parts[4]).split('_')[1]
    resultName = `Provisional Revised ${session}`
  }
  if (/03_Official%20Results.CSV/.test(input)) {
    const parts = input.split('/')
    const session = decodeURI(parts[4]).split('_')[1]
    resultName = `Official ${session}`
  }
  if (/03_Unofficial%20Results.CSV/.test(input)) {
    const parts = input.split('/')
    const session = decodeURI(parts[4]).split('_')[1]
    resultName = `Unofficial ${session}`
  }
  if (
    /06_Combined%20Practice%20Results.CSV/.test(input) ||
    /06_Combined%20Practice%20Results_Practice%203.CSV/.test(input) ||
    /06_CombinedClassification_Combined%20Practice.CSV/.test(input) ||
    /06_CombinedClassification_Combine%20Practice.CSV/.test(input) ||
    /06_Combined%20Practice%20Results_Practice%202.CS/.test(input) ||
    /06_Combined%20Practice%20Results_Practice%204.CSV/.test(input)
  ) {
    const parts = input.split('/')
    const session = decodeURI(parts[4]).split('_')[1]
    resultName = `Combined ${session}`
  }
  if (
    /00_Grid_Race_Official.CSV/.test(input) ||
    /01_Grid_Race_Official.CSV/.test(input)
  ) {
    const parts = input.split('/')
    const session = decodeURI(parts[4]).split('_')[1]
    resultName = `Grid ${session} Official`
  }
  if (
    /00_Grid_Race_Provisional.CSV/.test(input) ||
    /01_Grid_Race_Provisional.CSV/.test(input)
  ) {
    const parts = input.split('/')
    const session = decodeURI(parts[4]).split('_')[1]
    resultName = `Grid ${session} Provisional`
  }
  if (
    /00_Grid_Race_Provisional_Amended.CSV/.test(input) ||
    /01_Grid_Race_Provisional_Amended.CSV/.test(input)
  ) {
    const parts = input.split('/')
    const session = decodeURI(parts[4]).split('_')[1]
    resultName = `Grid ${session} Provisional Amended`
  }
  if (/Hour%20/.test(input)) {
    const parts = input.split('/')
    const session = decodeURI(parts[4]).split('_')[1]
    let hour = decodeURI(parts[5]).replace('_', '')
    if (!hour.startsWith('Hour')) {
      hour = removeBeforeSequence(hour, 'Hour')
    }
    resultName = `${session} ${hour}`
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

function minifyCsv(csv: string) {
  // turn csv into object and remove unnecessary columns
  const allTextLines = csv.split(/\r|\n|\r/)
  const headers = allTextLines[0].split(';')
  headers.forEach((item, index) => {
    headers[index] = item.replace('_', ' ').trim()
  })
  const lines = []

  for (let i = 0; i < allTextLines.length; i++) {
    // split content based on comma
    const data = allTextLines[i].split(';')
    if (data.length > 1) {
      const obj = {} as any
      for (let j = 0; j < headers.length; j++) {
        const substrings = [
          'ECM',
          'EXTRA',
          'Extra',
          'LICENSE',
          'COUNTRY',
          'HOMETOWN',
          'Sort Key',
          'SHORTNAME',
          'CarId',
          'TeamId',
          'CarClassId',
          'ClassId',
          'CarTypeId',
          'ManufacturerId',
          'TiresId',
          'TireId',
          'EventEntryId',
          'DriverId',
          'DriverPlugId',
          'DriverRatingLong',
        ]
        const regex = new RegExp(substrings.join('|'))
        if (
          regex.test(headers[j]) ||
          data[j] === '' ||
          data[j] === null ||
          data[j] === undefined
        ) {
          obj[headers[j]] = null
          continue
        }

        const lastnamesubstrings = [
          'DRIVER1 SECONDNAME',
          'DRIVER2 SECONDNAME',
          'DRIVER3 SECONDNAME',
          'DRIVER4 SECONDNAME',
          'DRIVER5 SECONDNAME',
          'DRIVER6 SECONDNAME',
        ]
        const lastnameregex = new RegExp(lastnamesubstrings.join('|'))
        if (lastnameregex.test(headers[j])) {
          obj[headers[j]] = null
          continue
        }
        const firstnamesubstrings = [
          'DRIVER1 FIRSTNAME',
          'DRIVER2 FIRSTNAME',
          'DRIVER3 FIRSTNAME',
          'DRIVER4 FIRSTNAME',
          'DRIVER5 FIRSTNAME',
          'DRIVER6 FIRSTNAME',
        ]
        const firstnameregex = new RegExp(firstnamesubstrings.join('|'))
        if (firstnameregex.test(headers[j])) {
          if (i === 0) {
            obj[headers[j].replace('FIRSTNAME', '')] = data[j]
              .replace('FIRSTNAME', '')
              .replace(/([A-Z])(\d)/g, '$1 $2')
          } else {
            obj[headers[j].replace('FIRSTNAME', '')] =
              data[j] + ' ' + data[j + 1]
          }
        } else {
          obj[headers[j]] = data[j]
        }
      }
      lines.push(obj)
    }
  }
  if (lines === undefined || lines.length === 0 || lines === null) {
    return csv
  }

  let keys = Object.keys(lines[0])
  // if a column is empty, remove it and remove it from all lines
  for (let i = 0; i < keys.length; i++) {
    if (lines[0][keys[i]] === null) {
      for (let j = 0; j < lines.length; j++) {
        delete lines[j][keys[i]]
      }
    }
  }

  // check if key has a value in all objects if not delete it
  keys = Object.keys(lines[0])
  for (let i = 0; i < keys.length; i++) {
    let hasValue = false
    for (let j = 1; j < lines.length; j++) {
      if (lines[j][keys[i]] !== null) {
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

  // check if all objects have the same keys
  keys = Object.keys(lines[0])
  for (let i = 0; i < lines.length; i++) {
    if (keys.length !== Object.keys(lines[i]).length) {
      return csv
    }
  }

  // turn object back into csv
  const topLine = Object.values(lines[0]).join(';')
  lines.splice(0, 1)
  const updatedLines = lines.reduce(
    (acc, val) => acc.concat(Object.values(val).join(`;`)),
    []
  )
  const minifiedCsv = topLine.concat(`\n${updatedLines.join(`\n`)}`)
  return minifiedCsv
}
