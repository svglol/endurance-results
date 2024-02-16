export default defineEventHandler(async () => {
  return await Promise.all([
    $fetch('/api/scrape/fiawec'),
    $fetch('/api/scrape/elms'),
    $fetch('/api/scrape/alms'),
  ])
})
