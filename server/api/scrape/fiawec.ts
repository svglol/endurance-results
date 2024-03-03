export default upstashWrappedResponseHandler(async () => {
  return await runTask('scrape:fiawec')
})
