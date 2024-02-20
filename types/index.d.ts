import { type InferSelectModel } from 'drizzle-orm'
import type { event, result, season, series } from '~/server/db/schema'

declare global {
  type Series = InferSelectModel<typeof series>
  type Season = InferSelectModel<typeof season>
  type Event = InferSelectModel<typeof event>
  type Result = InferSelectModel<typeof result>

  type ResultWithoutValue = Omit<Result, 'value', 'eventId'>

  interface SeriesWithRelations extends Series {
    seasons: (Season & {
      events: (Event & {
        results: ResultWithoutValue[]
      })[]
    })[]
  }
  interface InsertData {
    season: string
    event: string
    results: {
      url: string
      result: string
      data: string
    }[]
  }

  interface SeriesData extends Series {
    seasons: (Season & {
      events: (Event & {
        results: ResultWithoutValue[]
      })[]
    })[]
  }
  interface AllEventResults {
    season: string
    event: string
    results: string[]
  }
}

export {}
