import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

export default defineNitroPlugin(() => {
  if (process.dev) {
    migrate(
      useDB() as BetterSQLite3Database<
        typeof import('~/server/database/schema')
      >,
      {
        migrationsFolder: 'server/database/migrations',
      }
    )
  }
})
