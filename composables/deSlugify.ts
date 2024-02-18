export const deSlugify = (str: string) => {
  if (!str) return str
  return str.replace(/_/g, ' ').toUpperCase()
}
