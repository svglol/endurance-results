import defaultSlugify from 'slugify'

export function slugify(str: string) {
  return defaultSlugify(str, { replacement: '_', lower: true })
}
