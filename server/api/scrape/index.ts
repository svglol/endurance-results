export default defineEventHandler(async () => {
  const storage = useStorage('data')

  const [fiawec, imsa, elms, alms] = await Promise.all([
    $fetch('/api/scrape/fiawec'),
    $fetch('/api/scrape/imsa'),
    $fetch('/api/scrape/elms'),
    $fetch('/api/scrape/alms'),
  ])

  if (
    fiawec.updatedFIAWEC > 0 ||
    elms.updatedELMS > 0 ||
    alms.updatedALMS > 0 ||
    imsa.updatedIMSA > 0
  ) {
    const keys = await storage.getKeys()

    for (const key of keys) {
      if (key.startsWith('nitro:')) {
        await storage.removeItem(key)
      }
    }
  }

  return [fiawec, elms, alms, imsa]
})
