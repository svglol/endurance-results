export default defineEventHandler(() => {
  return useDB().query.series.findMany({
    with: {
      seasons: {
        with: {
          events: {
            with: { results: { columns: { id: true, name: true } } },
          },
        },
      },
    },
  })
})
