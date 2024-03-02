import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { migrate as migrateLibSQL } from 'drizzle-orm/libsql/migrator'

import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { migrate as migrateD1 } from 'drizzle-orm/d1/migrator'

export default defineNitroPlugin(async () => {
  if (process.env.TURSO_DB_URL && process.env.TURSO_DB_TOKEN) {
    await migrateLibSQL(
      useDB() as LibSQLDatabase<typeof import('~/server/database/schema')>,
      {
        migrationsFolder: './server/database/migrations',
      }
    )
  } else if (process.env.DB) {
    await migrateD1(
      useDB() as DrizzleD1Database<typeof import('~/server/database/schema')>,
      {
        migrationsFolder: './server/database/migrations',
      }
    )
  } else if (process.dev) {
    migrate(
      useDB() as BetterSQLite3Database<
        typeof import('~/server/database/schema')
      >,
      {
        migrationsFolder: './server/database/migrations',
      }
    )
  }
})
