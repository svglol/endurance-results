import type { Config } from 'drizzle-kit'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing')
}
if (!process.env.DATABASE_AUTH_TOKEN) {
  throw new Error('DATABASE_AUTH_TOKEN is missing')
}

export default {
  schema: './server/db/schema.ts',
  out: './server/db',
  driver: 'turso',
  dbCredentials: {
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
} satisfies Config
