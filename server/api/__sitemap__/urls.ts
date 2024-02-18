import slugify from 'slugify'

export default defineEventHandler(async () => {
  const series = await db.query.series.findMany({
    with: {
      seasons: {
        with: {
          events: { with: { results: { columns: { id: true, name: true } } } },
        },
      },
    },
  })

  return series.flatMap(series =>
    series.seasons.flatMap(season =>
      season.events.map(event =>
        event.results.map(result => ({
          loc: `/${createSlug(series.name)}/${createSlug(season.name)}/${createSlug(event.name)}/${createSlug(result.name)}`,
          _sitemap: 'pages',
        }))
      )
    )
  )
})
function createSlug(label: string) {
  return `${slugify(label, { replacement: '_', lower: true })}`
}
