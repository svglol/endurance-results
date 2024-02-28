import { db as database } from '~/server/db/db'

export const db = database

export async function clearStorage() {
  const storage = useStorage('data')
  await storage.removeItem('nitro:handlers:_:seriesdata.json')
}
