import {
  series,
  season as tableSeason,
  event as tableEvent,
  result as tableResult,
} from '~/server/db/schema'
export default defineEventHandler(async () => {
  return await db.transaction(async tx => {
    // delete all
    await tx.delete(tableResult)
    await tx.delete(tableEvent)
    await tx.delete(tableSeason)
    await tx.delete(series)
    return 'deleted'
  })
})
