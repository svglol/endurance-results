export default defineCachedEventHandler(
  () => {
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
  },
  {
    maxAge: 60,
    getKey: () => 'seriesdata',
  },
)
