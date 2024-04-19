import type { EventHandler, EventHandlerRequest } from 'h3'
import { Receiver } from '@upstash/qstash'

export async function getSeriesData(seriesName: string) {
  const allSeriesData = await $fetch(`/api/series/`)

  let seriesData = allSeriesData.find(series => series.name === seriesName)
  if (!seriesData) {
    const insertedSeries = await useDB()
      .insert(tables.series)
      .values({
        name: seriesName,
      })
      .returning()
    seriesData = { ...insertedSeries[0], seasons: [] }
  }
  return seriesData
}

export function sortResultsToInsert(
  seriesData: SeriesData | undefined,
  allEventResults: AllEventResults[],
  convertResultName: (name: string) => string,
) {
  const allowedResults = [] as string[]
  for (const results of allEventResults) {
    for (const result of results.results) {
      const eventNotFound = !seriesData?.seasons
        .find(s => s.name === results.season.split('_')[1])
        ?.events.find(e => e.name === results.event.split('_')[1])

      if (
        seriesData?.seasons
          .find(s => s.name === results.season.split('_')[1])
          ?.events.find(e => e.name === results.event.split('_')[1])
          ?.results.filter(r => r.name === convertResultName(result)).length
          === 0
          || eventNotFound
      )
        allowedResults.push(result)
    }
  }
  const filteredResults = allEventResults.map((eventResult) => {
    return {
      ...eventResult,
      results: eventResult.results.filter(r => allowedResults.includes(r)),
    }
  })
  return filteredResults
}

export async function insertData(
  data: InsertData[],
  seriesData: SeriesData | undefined,
) {
  // create all missing seasons
  const seasonsNotExist = data
    .filter(({ season }) => {
      return seriesData?.seasons.filter(s => s.name === season).length === 0
    })
    .map(({ season }) => {
      return {
        name: season,
        seriesId: seriesData?.id,
      }
    })
  if (seasonsNotExist.length > 0) {
    const insertedSeasons = await useDB()
      .insert(tables.season)
      .values(seasonsNotExist)
      .returning()

    insertedSeasons.forEach((season) => {
      seriesData?.seasons.push({ ...season, events: [] })
    })
  }

  // create all missing events
  const eventsNotExist = data
    .filter(({ season, event }) => {
      return (
        seriesData?.seasons
          .filter(s => s.name === season)[0]
          .events.filter(e => e.name === event).length === 0
      )
    })
    .map(({ season, event }) => {
      return {
        name: event,
        seasonId: seriesData?.seasons.filter(s => s.name === season)[0].id,
      }
    })
  if (eventsNotExist.length > 0) {
    const insertedEvents = await useDB()
      .insert(tables.event)
      .values(eventsNotExist)
      .returning()

    insertedEvents.forEach((event) => {
      seriesData?.seasons
        .filter(s => s.id === event.seasonId)[0]
        .events.push({ ...event, results: [] })
    })
  }

  // create all results
  const resultsToInsert = data.flatMap(({ season, event, results }) => {
    return results.map((result) => {
      return {
        name: result.result,
        url: result.url,
        value: result.data,
        eventId: seriesData?.seasons
          .filter(s => s.name === season)[0]
          .events.filter(e => e.name === event)[0].id,
      }
    })
  })
  if (resultsToInsert.length > 0)
    await useDB().insert(tables.result).values(resultsToInsert)
}

export function minifyCsv(csv: string) {
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
          regex.test(headers[j])
          || data[j] === ''
          || data[j] === null
          || data[j] === undefined
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
          }
          else {
            obj[headers[j].replace('FIRSTNAME', '')]
              = `${data[j]} ${data[j + 1]}`
          }
        }
        else {
          obj[headers[j]] = data[j]
        }
      }
      lines.push(obj)
    }
  }
  if (lines === undefined || lines.length === 0 || lines === null)
    return csv

  let keys = Object.keys(lines[0])
  // if a column is empty, remove it and remove it from all lines
  for (let i = 0; i < keys.length; i++) {
    if (lines[0][keys[i]] === null) {
      for (let j = 0; j < lines.length; j++)
        delete lines[j][keys[i]]
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
      for (let j = 0; j < lines.length; j++)
        delete lines[j][keys[i]]
    }
  }

  // check if all objects have the same keys
  keys = Object.keys(lines[0])
  for (let i = 0; i < lines.length; i++) {
    if (keys.length !== Object.keys(lines[i]).length)
      return csv
  }

  // turn object back into csv
  const topLine = Object.values(lines[0]).join(';')
  lines.splice(0, 1)
  const updatedLines = lines.reduce(
    (acc, val) => acc.concat(Object.values(val).join(`;`)),
    [],
  )
  const minifiedCsv = topLine.concat(`\n${updatedLines.join(`\n`)}`)
  return minifiedCsv
}

export function upstashWrappedResponseHandler<T extends EventHandlerRequest, D>(handler: EventHandler<T, D>): EventHandler<T, D> {
  return defineEventHandler<T>(async (event) => {
    if (process.env.NODE_ENV !== 'development') {
      const signature = getHeader(event, 'upstash-signature')
      if (!signature)
        return createError({ statusCode: 401, statusMessage: 'Unauthorized' })

      const r = new Receiver({
        currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY as string,
        nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY as string,
      })
      const isValid = await r.verify({ signature, body: '' })
      if (!isValid)
        return createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    try {
      const response = await handler(event)
      return { response }
    }
    catch (err) {
      // Error handling
      return { err }
    }
  })
}
