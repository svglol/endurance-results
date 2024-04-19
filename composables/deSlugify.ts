export function deSlugify(str: string) {
  if (!str)
    return str
  return str.replace(/_/g, ' ').toUpperCase()
}
