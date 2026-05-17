export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  if (!address.trim()) return null

  // 건물명·층수 제거 ("서울시 동작구 노량진로 100, CTS기독교TV 9층" → "서울시 동작구 노량진로 100")
  const cleanAddress = address.split(',')[0].trim()

  try {
    const url =
      `https://nominatim.openstreetmap.org/search?` +
      new URLSearchParams({
        q: cleanAddress,
        format: 'json',
        limit: '1',
        'accept-language': 'ko',
        countrycodes: 'kr',
      }).toString()

    const res = await fetch(url, {
      headers: { 'User-Agent': 'KIMA-website/1.0 (kima2019.org)' },
      next: { revalidate: 0 },
    })
    if (!res.ok) return null

    const data = (await res.json()) as Array<{ lat: string; lon: string }>
    if (!data.length) return null

    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}
