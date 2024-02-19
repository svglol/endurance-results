export default defineEventHandler(async () => {
  const storage = useStorage('data')
  const [fiawec, elms, alms] = await Promise.all([
    $fetch('/api/scrape/fiawec'),
    $fetch('/api/scrape/elms'),
    $fetch('/api/scrape/alms'),
  ])

  if (
    fiawec.updatedFIAWEC > 0 ||
    elms.updatedELMS > 0 ||
    alms.updatedALMS > 0
  ) {
    storage.clear()
  }

  return [fiawec, elms, alms]
})
