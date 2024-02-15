import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from '~/server/db/schema'
const runtimeConfig = useRuntimeConfig()
const client = createClient({
  url: runtimeConfig.database.url,
  authToken: runtimeConfig.database.token,
})
export const db = drizzle(client, { schema })
