export default upstashWrappedResponseHandler(async () => {
  return await Promise.all([
    $fetch('/api/scrape/fiawec'),
    $fetch('/api/scrape/imsa'),
    $fetch('/api/scrape/elms'),
    $fetch('/api/scrape/alms'),
  ])
})
