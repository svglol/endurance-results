export default upstashWrappedResponseHandler(async event => {
  const { send, close } = useSSE(event, 'sse:event')

  const interval = setInterval(() => {
    send(id => ({ id, message: 'keep-alive' }))
  }, 9000)
  await Promise.all([
    $fetch('/api/scrape/fiawec'),
    $fetch('/api/scrape/imsa'),
    $fetch('/api/scrape/elms'),
    $fetch('/api/scrape/alms'),
  ])
  send(id => ({ id, message: `results updated` }))
  setTimeout(() => {
    clearInterval(interval)
    close()
  }, 1000)
})
