export async function clearStorage() {
  const storage = useStorage('cache')
  await storage.removeItem('nitro:handlers:_:seriesdata.json')
}
