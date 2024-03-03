export default defineTask({
  meta: {
    name: 'scrape',
    description: 'Run all scraping tasks',
  },
  async run() {
    const { result: alms } = await runTask('scrape:alms')
    const { result: elms } = await runTask('scrape:elms')
    const { result: fiawec } = await runTask('scrape:fiawec')
    const { result: imsa } = await runTask('scrape:imsa')

    return {
      result: {
        alms,
        elms,
        fiawec,
        imsa,
      },
    }
  },
})
