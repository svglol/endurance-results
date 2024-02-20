import { db as database } from '~/server/db/db'

export const db = database

export async function clearStorage() {
  const storage = useStorage('data')
  const keys = await storage.getKeys()
  for (const key of keys) {
    if (key.startsWith('nitro:')) {
      await storage.removeItem(key)
    }
  }
}
