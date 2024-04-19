/* eslint-disable ts/no-use-before-define */
import { relations } from 'drizzle-orm'
import {
  blob,
  index,
  integer,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core'

export const series = sqliteTable(
  'series',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
  },
  (table) => {
    return {
      nameIdx: index('series_name_idx').on(table.name),
    }
  },
)

export const seriesRelations = relations(series, ({ many }) => ({
  seasons: many(season),
}))

export const season = sqliteTable(
  'seasons',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    seriesId: integer('series_id').references(() => series.id, {
      onDelete: 'cascade',
    }),
  },
  (table) => {
    return {
      seriesIdIdx: index('seasons_series_id_idx').on(table.seriesId),
      nameIdx: index('seasons_name_idx').on(table.name),
    }
  },
)

export const seasonRelations = relations(season, ({ many, one }) => ({
  series: one(series, {
    fields: [season.seriesId],
    references: [series.id],
  }),
  events: many(event),
}))

export const event = sqliteTable(
  'events',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    seasonId: integer('season_id').references(() => season.id, {
      onDelete: 'cascade',
    }),
  },
  (table) => {
    return {
      seasonIdIdx: index('events_season_id_idx').on(table.seasonId),
      nameIdx: index('events_name_idx').on(table.name),
    }
  },
)

export const eventRelations = relations(event, ({ many, one }) => ({
  results: many(result),
  season: one(season, {
    fields: [event.seasonId],
    references: [season.id],
  }),
}))

export const result = sqliteTable(
  'results',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    url: text('url').notNull(),
    name: text('name').notNull(),
    eventId: integer('event_id').references(() => event.id, {
      onDelete: 'cascade',
    }),
    value: blob('value').notNull(),
  },
  (table) => {
    return {
      eventIdIdx: index('results_event_id_idx').on(table.eventId),
      nameIdx: index('results_name_idx').on(table.name),
    }
  },
)

export const resultRelation = relations(result, ({ one }) => ({
  event: one(event, {
    fields: [result.eventId],
    references: [event.id],
  }),
}))
