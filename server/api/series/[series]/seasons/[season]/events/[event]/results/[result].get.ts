export default defineCachedEventHandler(
  async event => {
    const seriesParam = decodeURI(getRouterParam(event, 'series') ?? '')
    const seasonParam = decodeURI(getRouterParam(event, 'season') ?? '')
    const eventParam = decodeURI(getRouterParam(event, 'event') ?? '')
    const resultParam = decodeURI(getRouterParam(event, 'result') ?? '')

    if (!seriesParam || !seasonParam || !eventParam || !resultParam) {
      return new Error('Invalid parameters')
    }
    const test = await useDB().query.series.findFirst({
      where: (series, { like }) => like(series.name, seriesParam),
      with: {
        seasons: {
          where: (seasons, { like }) => like(seasons.name, seasonParam),
          with: {
            events: {
              where: (events, { like }) => like(events.name, eventParam),
              with: {
                results: {
                  where: (results, { like }) => like(results.name, resultParam),
                },
              },
            },
          },
        },
      },
    })
    return test?.seasons[0].events[0].results[0] ?? null
  },
  { maxAge: 60 }
)
