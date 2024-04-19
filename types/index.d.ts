import type { InferSelectModel } from 'drizzle-orm'

declare global {
  type Series = InferSelectModel<typeof tables.series>
  type Season = InferSelectModel<typeof tables.season>
  type Event = InferSelectModel<typeof tables.event>
  type Result = InferSelectModel<typeof tables.result>

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
