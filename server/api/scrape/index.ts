export default upstashWrappedResponseHandler(async event => {
  const { send, close } = useSSE(event, 'sse:event')

  const interval = setInterval(() => {
    send(id => ({ id, message: 'keep-alive' }))
  }, 5000)
  event.node.req.on('close', () => clearInterval(interval))
  await Promise.all([
    $fetch('/api/scrape/fiawec'),
    $fetch('/api/scrape/imsa'),
    $fetch('/api/scrape/elms'),
    $fetch('/api/scrape/alms'),
  ])
  send(id => ({ id, message: `results updated` }))
  setTimeout(() => {
    close()
  }, 1000)
})
