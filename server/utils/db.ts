import { drizzle as drizzleD1, DrizzleD1Database } from 'drizzle-orm/d1'
import { createClient as createLibSQLClient } from '@libsql/client/http'
import { drizzle as drizzleLibSQL, LibSQLDatabase } from 'drizzle-orm/libsql'
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
// @ts-ignore
import Database from 'better-sqlite3'
import { join } from 'pathe'
import * as schema from '~/server/database/schema'

export * as tables from '~/server/database/schema'

let _db:
  | DrizzleD1Database<typeof import('~/server/database/schema')>
  | BetterSQLite3Database<typeof import('~/server/database/schema')>
  | LibSQLDatabase<typeof import('~/server/database/schema')>
  | null = null

export const useDB = () => {
  if (!_db) {
    if (process.env.TURSO_DB_URL && process.env.TURSO_DB_TOKEN) {
      // Turso in production
      _db = drizzleLibSQL(
        createLibSQLClient({
          url: process.env.TURSO_DB_URL,
          authToken: process.env.TURSO_DB_TOKEN,
        }),
        { schema }
      )
    } else if (process.env.DB) {
      // d1 in production
      _db = drizzleD1(process.env.DB, { schema })
    } else if (process.dev) {
      // local sqlite in development
      const sqlite = new Database(join(process.cwd(), '.data/db.sqlite'))
      _db = drizzle(sqlite, { schema })
    } else {
      throw new Error('No database configured for production')
    }
  }
  return _db
}
