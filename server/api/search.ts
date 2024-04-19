import slugify from 'slugify'

export default defineCachedEventHandler<{ query: { q: string } }>(
  async (event) => {
    const query = getQuery(event)

    const series = await useDB().query.series.findMany({
      with: {
        seasons: {
          with: {
            events: true,
          },
        },
      },
    })

    return series
      .flatMap(series =>
        series.seasons.flatMap(season =>
          season.events.flatMap((event) => {
            return {
              search: event.name,
              label: `${series.name} > ${season.name} > ${event.name}`,
              url: `/${createSlug(series.name)}/${createSlug(season.name)}/${createSlug(event.name)}`,
            }
          }),
        ),
      )
      .concat(
        series.map(series => ({
          search: series.name,
          label: series.name,
          url: `/${createSlug(series.name)}`,
        })),
      )
      .filter(({ search }) =>
        search.toLowerCase().includes(query.q.toLowerCase()),
      )
  },
  {
    maxAge: 60,
  },
)

function createSlug(label: string) {
  return `${slugify(label, { replacement: '_', lower: true })}`
}
