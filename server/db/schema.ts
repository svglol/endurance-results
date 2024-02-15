import { relations } from 'drizzle-orm'
import { text, sqliteTable, blob } from 'drizzle-orm/sqlite-core'

export const series = sqliteTable('series', {
  id: text('id').primaryKey().unique(),
  name: text('name').notNull(),
})

export const seriesRelations = relations(series, ({ many }) => ({
  seasons: many(season),
}))

export const season = sqliteTable('seasons', {
  id: text('id').primaryKey().unique(),
  name: text('name').notNull(),
  seriesId: text('series_id').references(() => series.id),
})

export const seasonRelations = relations(season, ({ many, one }) => ({
  series: one(series, {
    fields: [season.seriesId],
    references: [series.id],
  }),
  events: many(event),
}))

export const event = sqliteTable('events', {
  id: text('id').primaryKey().unique(),
  name: text('name').notNull(),
  seasonId: text('season_id').references(() => season.id),
})

export const eventRelations = relations(event, ({ many, one }) => ({
  results: many(result),
  season: one(season, {
    fields: [event.seasonId],
    references: [season.id],
  }),
}))

export const result = sqliteTable('results', {
  id: text('id').primaryKey().unique(),
  url: text('url').notNull(),
  name: text('name').notNull(),
  eventId: text('event_id').references(() => event.id),
  value: blob('value').notNull(),
})

export const resultRelation = relations(result, ({ one }) => ({
  event: one(event, {
    fields: [result.eventId],
    references: [event.id],
  }),
}))
