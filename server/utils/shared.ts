export async function clearStorage() {
  const storage = useStorage('data')
  await storage.removeItem('nitro:handlers:_:seriesdata.json')
}
