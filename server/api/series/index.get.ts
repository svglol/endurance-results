export default defineEventHandler(() => {
  return db.query.series.findMany({
    with: {
      seasons: {
        with: {
          events: { with: { results: { columns: { id: true, name: true } } } },
        },
      },
    },
  })
})
