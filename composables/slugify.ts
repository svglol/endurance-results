import defaultSlugify from 'slugify'
export const slugify = (str: string) => {
  return defaultSlugify(str, { replacement: '_', lower: true })
}
