
import { type InferSelectModel } from 'drizzle-orm'
import type { event, result, season, series } from '~/server/db/schema'

declare global {
  type Series = InferSelectModel<typeof series>
  type Season = InferSelectModel<typeof season>
  type Event = InferSelectModel<typeof event>
  type Result = InferSelectModel<typeof result> 

  type ResultWithoutValue =  Omit<Result, 'value','eventId'>

  interface SeriesWithRelations extends Series {
    seasons: (Season & {
        events: (Event & {
            results: ResultWithoutValue[];
        })[];
    })[]
  }
}

export {}
